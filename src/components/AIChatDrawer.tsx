import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Trash2, 
  Shield, 
  ArrowRight,
  CornerDownLeft,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { ProcessedRecord } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

interface AIChatDrawerProps {
  record: ProcessedRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  apiKey: string;
}

// Safe HTML escape helper for message rendering to prevent XSS
const escapeHtmlClient = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  record,
  isOpen,
  onClose,
  onOpen,
  apiKey
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize welcome message when record changes
  useEffect(() => {
    const patientName = record?.intake?.name ? record.intake.name.split(' ')[0] : 'there';
    const welcomeText = record
      ? `Hello! I am MedLens AI, your clinical information intelligence assistant powered by **Gemini 2.5 Flash**.\n\nI have indexed the clinical record for **${record.intake?.name || 'the patient'}** (${record.parameters.length} parameters, ${record.summary?.outOfRangeCount || 0} out-of-range findings, ${record.conflicts?.length || 0} flagged inconsistencies).\n\nHow can I help you understand these findings or prepare for your next consultation?`
      : `Hello! I am MedLens AI. You can ask me questions about medical laboratory terminology, reference ranges, or process a medical report above to get personalized grounded explanations.`;

    setMessages([
      {
        id: 'welcome_1',
        role: 'model',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: record ? [
          "Explain my abnormal results",
          "Compare with my previous test",
          "What should I ask my doctor?",
          "Explain what reference ranges mean"
        ] : [
          "What does Fasting Blood Sugar measure?",
          "How do reference ranges work?",
          "What is a CBC blood test?"
        ]
      }
    ]);
  }, [record?.intake?.name, record?.parameters?.length]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isTyping) return;

    if (messageText.length > 4000) {
      alert('Message is too long. Please shorten it to under 4,000 characters.');
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build conversation history for context (exclude system messages)
      const historyForApi = messages
        .filter(m => m.id !== 'welcome_1')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: messageText,
          conversationHistory: historyForApi,
          record,
          apiKey
        })
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const botMessage: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: data.suggestedQuestions || []
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        setMessages(prev => [...prev, {
          id: `msg_err_${Date.now()}`,
          role: 'model',
          text: `I encountered an issue: ${data.error || 'Please try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled by user
      }
      setMessages(prev => [...prev, {
        id: `msg_err_${Date.now()}`,
        role: 'model',
        text: `Communication error with MedLens AI backend: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'model',
        text: "Conversation cleared. Feel free to ask any question about your medical findings!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: [
          "Explain my abnormal results",
          "What should I ask my doctor?",
          "Explain reference ranges"
        ]
      }
    ]);
  };

  // Render markdown bold and bullet points safely without XSS
  const renderMessageContent = (text: string) => {
    const lines = text.split(/\r?\n/);
    return lines.map((line, idx) => {
      // Escape HTML first to prevent XSS
      const safeLine = escapeHtmlClient(line);

      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-500)', margin: '10px 0 4px 0' }}>
            {safeLine.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-highlight)', margin: '12px 0 6px 0' }}>
            {safeLine.replace('## ', '')}
          </h3>
        );
      }
      // Bullets
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = safeLine.trim().substring(2);
        return (
          <li key={idx} style={{ marginLeft: 18, marginBottom: 4, lineHeight: 1.5 }}>
            <span dangerouslySetInnerHTML={{
              __html: bulletText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
            }} />
          </li>
        );
      }
      // Blank lines
      if (!line.trim()) {
        return <div key={idx} style={{ height: 6 }} />;
      }
      // Normal paragraph
      return (
        <p key={idx} style={{ margin: '0 0 6px 0', lineHeight: 1.5 }} dangerouslySetInnerHTML={{
          __html: safeLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
        }} />
      );
    });
  };

  return (
    <>
      {/* Floating Action Button (Visible when drawer is closed) */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="no-print"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 90,
            background: 'linear-gradient(135deg, var(--teal-600), var(--cyan-500))',
            color: '#ffffff',
            border: 'none',
            borderRadius: 50,
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 25px rgba(13, 148, 136, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 14
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
          aria-label="Open MedLens AI Assistant"
        >
          <div style={{ position: 'relative' }}>
            <Bot size={22} />
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #ffffff'
            }} />
          </div>
          <span>Ask MedLens AI</span>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', fontSize: 10, padding: '2px 6px' }}>
            Gemini 3.6 Flash
          </span>
        </button>
      )}

      {/* Slide-in Chat Drawer */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: isExpanded ? 'min(720px, 94vw)' : 'min(460px, 94vw)',
            height: isExpanded ? 'min(860px, 92vh)' : 'min(640px, 86vh)',
            zIndex: 95,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-hover)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(13, 148, 136, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.3s ease, height 0.3s ease'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--teal-600), var(--cyan-500))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-highlight)' }}>
                    MedLens AI Assistant
                  </span>
                  <span className="badge badge-normal" style={{ fontSize: 9, padding: '1px 5px' }}>
                    Gemini 3.6 Flash
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  {record?.intake?.name ? `Grounded in ${record.intake.name}'s record` : 'Ready to analyze'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 8px' }}
                title={isExpanded ? 'Restore size' : 'Expand window'}
                aria-label="Toggle Expand Window"
              >
                {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
              <button
                onClick={clearChat}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 8px' }}
                title="Clear conversation"
                aria-label="Clear Conversation"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 8px' }}
                title="Close chat"
                aria-label="Close Chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: msg.role === 'user' ? '85%' : '95%'
                }}
              >
                {msg.role === 'model' && (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--teal-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <Bot size={15} />
                  </div>
                )}

                <div>
                  <div style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, var(--teal-600), var(--teal-700))'
                      : 'var(--bg-secondary)',
                    color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                    borderRadius: msg.role === 'user'
                      ? '14px 14px 2px 14px'
                      : '14px 14px 14px 2px',
                    padding: '12px 16px',
                    fontSize: 13,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {renderMessageContent(msg.text)}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    marginTop: 3,
                    textAlign: msg.role === 'user' ? 'right' : 'left',
                    padding: '0 4px'
                  }}>
                    {msg.timestamp}
                  </div>

                  {/* Contextual Suggested Prompt Chips */}
                  {msg.role === 'model' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: 8
                    }}>
                      {msg.suggestedQuestions.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: 11,
                            padding: '4px 10px',
                            background: 'rgba(13, 148, 136, 0.1)',
                            borderColor: 'rgba(13, 148, 136, 0.3)',
                            color: 'var(--teal-500)',
                            borderRadius: 'var(--radius-full)'
                          }}
                        >
                          <Sparkles size={11} /> {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--prov-user)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--teal-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <Bot size={15} />
                </div>
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px 14px 14px 2px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal-500)', animation: 'pulse-border 1s infinite' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    MedLens AI is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px'
            }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about this medical record, abnormal tests, trends..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  resize: 'none',
                  maxHeight: 100,
                  minHeight: 38,
                  lineHeight: 1.4,
                  padding: '4px 0'
                }}
                rows={1}
                aria-label="Type message for MedLens AI"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="btn btn-primary btn-sm"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  flexShrink: 0
                }}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 6,
              fontSize: 10,
              color: 'var(--text-dim)'
            }}>
              <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new line</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Shield size={10} style={{ color: 'var(--teal-500)' }} /> Non-Diagnostic Safety Guard Active
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
