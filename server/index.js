// MedLens Backend Application Server
// Express API serving the MedLens AI pipeline, preset scenarios, and report processing

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { extractParameters, extractReportMetadata, extractObservations } from './pipeline/extractor.js';
import { detectConflicts } from './pipeline/conflictDetector.js';
import { compareReports } from './pipeline/longitudinalComparator.js';
import { generateClarificationQuestions } from './pipeline/clarificationGenerator.js';
import { generateStructuredSummary, MEDICAL_DISCLAIMER } from './pipeline/summaryGenerator.js';
import { enhanceWithGemini } from './pipeline/geminiEnhancer.js';
import { processChatMessage } from './pipeline/chatAssistant.js';
import { SAMPLE_CASES } from './presets/sampleCases.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3001;

// Constants for input safety & rate protection
const MAX_REPORT_LENGTH = 500000; // 500 KB character limit
const MAX_CHAT_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 30;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Utility for HTML escaping to prevent XSS in export generation
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Health and environment status
app.get('/api/health', (req, res) => {
  const hasGeminiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({
    status: 'online',
    system: 'MedLens Clinical Information Intelligence System',
    version: '1.0.0',
    geminiKeyConfigured: hasGeminiKey,
    timestamp: new Date().toISOString()
  });
});

// Presets list
app.get('/api/presets', (req, res) => {
  res.json({
    presets: SAMPLE_CASES.map(c => ({
      id: c.id,
      name: c.name,
      badge: c.badge,
      description: c.description,
      intake: c.intake,
      currentReport: c.currentReport,
      previousReport: c.previousReport
    }))
  });
});

// Interactive AI Chat Assistant Endpoint: /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], record = null, apiKey = null } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
      return res.status(400).json({ 
        error: `Message exceeds maximum allowed length of ${MAX_CHAT_MESSAGE_LENGTH} characters.` 
      });
    }

    const safeHistory = Array.isArray(conversationHistory) 
      ? conversationHistory.slice(-MAX_HISTORY_ITEMS) 
      : [];

    const response = await processChatMessage({
      apiKey,
      message: message.trim(),
      conversationHistory: safeHistory,
      record
    });

    res.json({
      success: true,
      reply: response.reply,
      suggestedQuestions: response.suggestedQuestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Failed to process chat message.',
      details: error.message
    });
  }
});

// Main Pipeline Endpoint: /api/process
app.post('/api/process', async (req, res) => {
  const startTime = Date.now();
  const stages = [];

  try {
    const { intake = {}, currentReport = '', previousReport = '', apiKey = null } = req.body;

    if (!currentReport || typeof currentReport !== 'string' || currentReport.trim().length === 0) {
      return res.status(400).json({
        error: 'Current medical report text is required.'
      });
    }

    if (currentReport.length > MAX_REPORT_LENGTH || (previousReport && previousReport.length > MAX_REPORT_LENGTH)) {
      return res.status(400).json({
        error: `Report text exceeds maximum allowed limit of ${MAX_REPORT_LENGTH} characters.`
      });
    }

    // STAGE 1: INPUT INGESTION & SANITIZATION
    const s1Start = Date.now();
    const sanitizedCurrent = currentReport.trim();
    const sanitizedPrevious = (previousReport || '').trim();
    stages.push({
      stage: 'INPUT',
      label: 'Input Ingestion & Document Sanitization',
      durationMs: Date.now() - s1Start,
      status: 'completed',
      details: `Processed current document (${sanitizedCurrent.length} chars)${sanitizedPrevious ? ` and prior document (${sanitizedPrevious.length} chars)` : ''}`
    });

    // STAGE 2: EXTRACTION
    const s2Start = Date.now();
    const currentMetadata = extractReportMetadata(sanitizedCurrent);
    const currentParameters = extractParameters(sanitizedCurrent, 'current_report');
    const currentObservations = extractObservations(sanitizedCurrent);

    const previousMetadata = sanitizedPrevious ? extractReportMetadata(sanitizedPrevious) : null;
    const previousParameters = sanitizedPrevious ? extractParameters(sanitizedPrevious, 'previous_report') : [];
    const previousObservations = sanitizedPrevious ? extractObservations(sanitizedPrevious) : [];

    stages.push({
      stage: 'EXTRACTION',
      label: 'Clinical Entity & Provenance Extraction',
      durationMs: Date.now() - s2Start,
      status: 'completed',
      details: `Extracted ${currentParameters.length} parameters from current report, ${previousParameters.length} from prior report`
    });

    // STAGE 3: VALIDATION & NORMALIZATION
    const s3Start = Date.now();
    // Parameters are normalized during extraction with LOINC and panels assigned
    const panelGroups = {};
    for (const p of currentParameters) {
      if (!panelGroups[p.panel]) {
        panelGroups[p.panel] = [];
      }
      panelGroups[p.panel].push(p);
    }
    stages.push({
      stage: 'NORMALIZATION',
      label: 'Terminology & LOINC Panel Normalization',
      durationMs: Date.now() - s3Start,
      status: 'completed',
      details: `Mapped to ${Object.keys(panelGroups).length} clinical panels (Hematology, Metabolic, Lipids, etc.)`
    });

    // STAGE 4: REFERENCE RANGE AWARENESS & STATUS ANALYSIS
    const s4Start = Date.now();
    const outOfRange = currentParameters.filter(p => p.isOutOfRange);
    const missingRange = currentParameters.filter(p => p.status === 'NO_RANGE_REPORTED');
    stages.push({
      stage: 'VALIDATION',
      label: 'Reported Reference Range Interpretation',
      durationMs: Date.now() - s4Start,
      status: 'completed',
      details: `Evaluated against reported ranges: ${outOfRange.length} out-of-range, ${missingRange.length} without reported ranges (none invented)`
    });

    // STAGE 5: CONFLICT & INCONSISTENCY DETECTION
    const s5Start = Date.now();
    const conflicts = detectConflicts({
      intake,
      currentReportData: { metadata: currentMetadata, parameters: currentParameters },
      previousReportData: { metadata: previousMetadata, parameters: previousParameters },
      currentReportText: sanitizedCurrent,
      previousReportText: sanitizedPrevious
    });
    stages.push({
      stage: 'ANALYSIS',
      label: 'Cross-Source Inconsistency & Conflict Detection',
      durationMs: Date.now() - s5Start,
      status: 'completed',
      details: `Identified ${conflicts.length} potential conflict(s) across intake, current, and historical records`
    });

    // STAGE 6: LONGITUDINAL COMPARISON
    const s6Start = Date.now();
    const longitudinal = compareReports(currentParameters, previousParameters);
    stages.push({
      stage: 'LONGITUDINAL',
      label: 'Longitudinal Parameter Trend & Delta Analysis',
      durationMs: Date.now() - s6Start,
      status: 'completed',
      details: longitudinal.hasComparison
        ? `Tracked ${longitudinal.stats.totalCompared} parameters: ${longitudinal.stats.increased} increased, ${longitudinal.stats.decreased} decreased, ${longitudinal.stats.stable} stable`
        : 'Single report mode (no prior baseline report provided)'
    });

    // STAGE 7: CLARIFICATION QUESTIONS
    const s7Start = Date.now();
    const questions = generateClarificationQuestions({
      intake,
      parameters: currentParameters,
      conflicts,
      longitudinalData: longitudinal
    });
    stages.push({
      stage: 'QUESTIONS',
      label: 'Targeted Clarification Question Formulation',
      durationMs: Date.now() - s7Start,
      status: 'completed',
      details: `Formulated ${questions.length} focused clinical clarification questions for patient or physician consultation`
    });

    // STAGE 8: NON-DIAGNOSTIC SUMMARY & GEMINI ENHANCEMENT
    const s8Start = Date.now();
    let summary = generateStructuredSummary({
      intake,
      currentParameters,
      previousParameters,
      conflicts,
      questions,
      observations: currentObservations
    });

    // Optional Gemini enhancement pass
    let geminiEnhancement = { enhanced: false, reason: 'Local pipeline active' };
    const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (activeKey) {
      geminiEnhancement = await enhanceWithGemini({
        apiKey: activeKey,
        intake,
        currentReportText: sanitizedCurrent,
        previousReportText: sanitizedPrevious,
        baseData: { currentParameters, conflicts, questions }
      });

      if (geminiEnhancement.enhanced && geminiEnhancement.geminiData?.narrative) {
        summary.narrative = geminiEnhancement.geminiData.narrative;
        if (Array.isArray(geminiEnhancement.geminiData.additionalObservations)) {
          summary.observations = [
            ...summary.observations,
            ...geminiEnhancement.geminiData.additionalObservations
          ];
        }
      }
    }

    stages.push({
      stage: 'INSIGHT',
      label: 'Patient Summary & Provenance Synthesis',
      durationMs: Date.now() - s8Start,
      status: 'completed',
      details: geminiEnhancement.enhanced
        ? 'Synthesized with Gemini 2.5 Flash enhancement layer and strict safety guards'
        : 'Synthesized with MedLens Clinical Intelligence Rule Engine'
    });

    const totalDurationMs = Date.now() - startTime;

    // Assemble final response
    res.json({
      success: true,
      executionTimeMs: totalDurationMs,
      stages,
      record: {
        intake: {
          ...intake,
          sourceType: 'user_intake',
          sourceLabel: 'Direct User Entry'
        },
        metadata: {
          current: currentMetadata,
          previous: previousMetadata
        },
        rawSources: {
          currentReport: sanitizedCurrent,
          previousReport: sanitizedPrevious
        },
        parameters: currentParameters,
        previousParameters,
        panelGroups,
        longitudinal,
        conflicts,
        clarificationQuestions: questions,
        summary,
        disclaimer: MEDICAL_DISCLAIMER,
        geminiEnhancement,
        auditLog: [
          {
            timestamp: new Date().toISOString(),
            action: 'INITIAL_EXTRACTION',
            description: `System extracted ${currentParameters.length} parameters from current report.`,
            actor: 'MedLens Engine'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Pipeline processing error:', error);
    res.status(500).json({
      error: 'Failed to process medical report.',
      details: error.message
    });
  }
});

// Printable / Export Report Generator
app.post('/api/export-summary', (req, res) => {
  try {
    const { record } = req.body;
    if (!record || typeof record !== 'object') {
      return res.status(400).json({ error: 'Record is required' });
    }

    const { intake = {}, parameters = [], conflicts = [], summary = {}, disclaimer = MEDICAL_DISCLAIMER } = record;

    res.json({
      success: true,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.5;">
          <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #0f766e; font-size: 24px;">MedLens Patient Information Summary</h1>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Structured Clinical Record & Traceable Laboratory Findings</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="font-size: 16px; margin-top: 0; color: #0f172a;">Patient Profile</h2>
            <p><strong>Name:</strong> ${escapeHtml(intake.name || 'N/A')} | <strong>Age:</strong> ${escapeHtml(intake.age || 'N/A')} | <strong>Sex:</strong> ${escapeHtml(intake.sex || 'N/A')}</p>
            <p><strong>Reported Symptoms:</strong> ${escapeHtml(intake.symptoms || 'None')}</p>
            <p><strong>Known Conditions:</strong> ${escapeHtml(intake.conditions || 'None')}</p>
            <p><strong>Known Allergies:</strong> ${escapeHtml(intake.allergies || 'None')}</p>
            <p><strong>Current Medications:</strong> ${escapeHtml(intake.medications || 'None')}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Patient-Friendly Summary</h2>
            <p style="color: #334155;">${escapeHtml(summary.narrative || '')}</p>
          </div>

          <div style="margin-bottom: 24px;">
            <h2 style="font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Laboratory Parameters</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left;">
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Test Name</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Value</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Reported Range</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${parameters.map(p => `
                  <tr style="${p.isOutOfRange ? 'background: #fff1f2;' : ''}">
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(p.canonicalName)}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>${escapeHtml(p.observedValue)}</strong> ${escapeHtml(p.unit || '')}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(p.rawRangeText || 'None reported')}</td>
                    <td style="padding: 8px; border: 1px solid #e2e8f0;">${escapeHtml(p.statusLabel)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          ${conflicts.length > 0 ? `
            <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <h3 style="color: #b45309; margin-top: 0; font-size: 15px;">Flagged Inconsistencies for Doctor Discussion</h3>
              <ul>
                ${conflicts.map(c => `<li><strong>${escapeHtml(c.title)}:</strong> ${escapeHtml(c.description)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding: 12px; background: #f8fafc; border-left: 4px solid #0f766e; font-size: 11px; color: #64748b;">
            <strong>Medical Disclaimer:</strong> ${escapeHtml(disclaimer)}
          </div>
        </div>
      `
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate export summary.' });
  }
});

// Static serving of production frontend bundle if built
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`MedLens Single-Service Web Application running on port ${PORT}`);
  });
}

export default app;


