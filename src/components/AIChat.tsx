import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Copy, Trash2, Check } from 'lucide-react';
import { generateAIResponse } from '../utils/aiService';
import type { BusinessInsight, StorePerformance } from '../types';

interface AIChatProps {
  insight: BusinessInsight | null;
  storePerformance: StorePerformance[];
  monthlyData: any[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  '🔍 Why are stores underperforming?',
  '⚠️ What are my top high-priority risks?',
  '📦 Which items are out of stock right now?',
  '📢 What do you mean by local store promotions?',
  '💰 Show my store profit margins',
  '🚀 What growth opportunities exist?',
];

export default function AIChat({ insight, storePerformance, monthlyData }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        `Hello! I'm your **InsightOS AI Business Intelligence Assistant** (powered by IBM Granite).\n\n` +
        `Ask me anything about your POS sales, multi-store margins, root cause of underperforming stores, or local store promotion strategies. Try clicking one of the quick prompts below!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!promptText) setInput('');
    setIsLoading(true);

    try {
      const context = {
        summary: insight?.summary || 'No active data loaded',
        totalRevenue: insight?.totalRevenue || 0,
        totalProfit: insight?.totalProfit || 0,
        profitMargin: insight?.profitMargin || 0,
        totalUnitsSold: insight?.totalUnitsSold || 0,
        outOfStockCount: insight?.outOfStockCount || 0,
        lowStockCount: insight?.lowStockCount || 0,
        problems: insight?.problems || [],
        opportunities: insight?.opportunities || [],
        trends: insight?.trends || [],
        categoryBreakdown: insight?.categoryBreakdown || [],
        topProducts: insight?.topProducts || [],
        storePerformance,
        monthlyData,
      };

      const response = await generateAIResponse(textToSend, context, messages);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ I encountered an error processing your query. Please check your data connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat history cleared. How can I help you analyze your retail business today?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="webstacked-card rounded-3xl h-[620px] flex flex-col overflow-hidden text-slate-100 shadow-2xl border border-white/10">
      {/* Chat Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#08090c]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8cff2e] flex items-center justify-center shadow-lg shadow-[#8cff2e]/20 text-black">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white flex items-center gap-2 text-sm font-['Geist']">
              IBM Granite AI Business Copilot
              <span className="w-2 h-2 rounded-full bg-[#8cff2e] animate-ping" />
            </h3>
            <p className="text-xs text-slate-400">Context-Aware Data Analytics & Strategy Engine</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 pr-2">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] relative group">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                  message.role === 'user'
                    ? 'bg-[#8cff2e] text-black border-[#8cff2e] font-medium shadow-lg shadow-[#8cff2e]/15 rounded-tr-none'
                    : 'bg-[#12141a] border-white/10 text-slate-200 shadow-md rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-black/10 dark:border-white/10 opacity-80">
                  {message.role === 'user' ? (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">Executive Query</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#8cff2e]" />
                      <span className="font-bold text-[11px] text-[#8cff2e]">Granite Business Insights</span>
                    </>
                  )}
                  <span className="ml-auto text-[10px] opacity-60">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="whitespace-pre-wrap font-sans">
                  {message.content}
                </div>

                {message.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(message.content, index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-black/60 hover:bg-black text-slate-400 hover:text-white transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === index ? <Check className="w-3 h-3 text-[#8cff2e]" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-xs text-[#8cff2e] bg-[#8cff2e]/10 border border-[#8cff2e]/20 p-3 rounded-2xl max-w-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analyzing dataset metrics & generating strategy...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="p-3 bg-[#08090c] border-t border-white/10 overflow-x-auto flex gap-2 text-xs">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={isLoading || !insight}
            className="px-3.5 py-1.5 rounded-xl bg-[#12141a] hover:bg-[#1a1d26] text-slate-200 border border-white/10 hover:border-[#8cff2e]/40 whitespace-nowrap font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#08090c] border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={insight ? 'Ask "What do you mean by local store promotions?", "Which items are out of stock?", etc...' : 'Please load dataset first to chat...'}
          className="flex-1 bg-[#12141a] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8cff2e] transition-colors"
          disabled={!insight || isLoading}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading || !insight}
          className="webstacked-button-primary px-5 py-3 rounded-2xl font-bold text-xs shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer text-black"
        >
          <Send className="w-4 h-4" />
          Ask AI
        </button>
      </div>
    </div>
  );
}
