import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini36() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Hello, respond with a short confirmation message: "MedLens Gemini 3.6 Flash Online".'
    });
    console.log('SUCCESS! Response from gemini-3.6-flash:');
    console.log(response.text);
  } catch (err) {
    console.error('Error with gemini-3.6-flash:', err.message);
  }
}

testGemini36();
