import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { askCopilotChat } from '../../services/geminiService';
import { ValidationIssue } from '../../types';

interface MigrationCopilotViewProps {
  sourceCount: number;
  targetCount: number;
  qualityScore: number;
  readiness: string;
  issues: ValidationIssue[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  source?: string;
  timestamp: string;
}

export const MigrationCopilotView: React.FC<MigrationCopilotViewProps> = ({
  sourceCount,
  targetCount,
  qualityScore,
  readiness,
  issues,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: `Hello! I am your **HR Migration Copilot** (Gemini 3.8 Flash). I have analyzed your **PeopleSoft (${sourceCount} records)** and **Workday (${targetCount} staged)** migration datasets.\n\n- **Overall Quality Index**: ${qualityScore}%\n- **Migration Readiness**: **${readiness}**\n- **Active Exceptions**: ${issues.filter(i => i.severity === 'Critical').length} Critical, ${issues.filter(i => i.severity === 'High').length} High.\n\nAsk me anything about specific employees, high-risk departments, root causes, SQL validations, or UAT checklists!`,
      source: 'gemini_3.8_flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    'Why is the migration currently not ready?',
    'Show me the top 10 critical issues.',
    'Which departments have the highest data-quality risk?',
    'Why are 5 employees unmatched in target staging?',
    'Which issues can potentially be auto-remediated?',
    'Show all employees with invalid manager relationships.',
    'What fields have the highest failure rate?',
    'Generate SQL checks for email duplicates.',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const context = {
      sourceCount,
      targetCount,
      qualityScore,
      readiness,
      criticalCount: issues.filter((i) => i.severity === 'Critical').length,
      highCount: issues.filter((i) => i.severity === 'High').length,
      mediumCount: issues.filter((i) => i.severity === 'Medium').length,
      lowCount: issues.filter((i) => i.severity === 'Low').length,
      unmatchedCount: 5,
      duplicateCount: 7,
      sampleIssues: issues.slice(0, 10).map((i) => ({
        id: i.id,
        recordId: i.recordId,
        field: i.field,
        severity: i.severity,
        message: i.message,
      })),
    };

    const history = messages.slice(-6).map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await askCopilotChat(userMsg.text, context, history);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: res.reply,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Copilot Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                HR Migration Copilot AI
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded in current active PeopleSoft & Workday datasets with live exception lookup.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          title="Reset conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white font-bold text-xs'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-1">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="prose prose-xs max-w-none text-inherit space-y-2 whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>

              <div
                className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                  m.role === 'user' ? 'justify-end' : ''
                }`}
              >
                <span>{m.timestamp}</span>
                {m.source && <span>• {m.source}</span>}
                {m.role === 'model' && (
                  <button
                    onClick={() => handleCopy(m.text, m.id)}
                    className="hover:text-slate-600 flex items-center gap-0.5 ml-1"
                  >
                    {copiedMsgId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedMsgId === m.id ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-500 shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200" />
              <span className="ml-1 text-[11px] text-slate-400">Analyzing dataset & exceptions...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 overflow-x-auto flex gap-2 shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-indigo-500" /> Suggested:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 text-[11px] font-medium rounded-full border border-slate-200 whitespace-nowrap transition shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-white border-t border-slate-200 flex gap-2 items-center"
      >
        <input
          type="text"
          placeholder="Ask Copilot about any worker, department, exception, or SQL check..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
