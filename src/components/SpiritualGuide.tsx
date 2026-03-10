import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Zap, Brain, Send, Sparkles, History, Trash2, ArrowLeft } from 'lucide-react';
import Markdown from 'react-markdown';
import { UserProfile } from '../types';
import { getQuickWisdom, getTheologicalDeepDive } from '../services/gemini';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: 'quick' | 'deep';
  timestamp: number;
}

interface SpiritualGuideProps {
  profile: UserProfile;
}

export default function SpiritualGuide({ profile }: SpiritualGuideProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'quick' | 'deep'>('quick');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      mode,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let responseText = '';
      if (mode === 'quick') {
        responseText = await getQuickWisdom(profile, input);
      } else {
        responseText = await getTheologicalDeepDive(profile, input);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        mode,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting wisdom:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the source of wisdom right now. Please try again in a moment.",
        mode,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your conversation history?')) {
      setMessages([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-eden-light-green">Spiritual Guide</h1>
            <p className="text-eden-light-green/60 font-serif italic">Seek wisdom, find peace, grow in Christ.</p>
          </div>
          <button 
            onClick={clearHistory}
            className="p-2 text-eden-leaf/40 hover:text-red-500 transition-colors"
            title="Clear History"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 p-1 bg-eden-leaf/5 rounded-xl w-fit mt-4">
          <button
            onClick={() => setMode('quick')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === 'quick' 
                ? "bg-white text-eden-leaf shadow-sm" 
                : "text-white/40 hover:text-white"
            )}
          >
            <Zap size={16} />
            Quick Wisdom
          </button>
          <button
            onClick={() => setMode('deep')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              mode === 'deep' 
                ? "bg-eden-leaf text-white shadow-lg shadow-eden-leaf/20" 
                : "text-white/40 hover:text-white"
            )}
          >
            <Brain size={16} />
            Theological Deep Dive
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-thin scrollbar-thumb-eden-leaf/10 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
            <div className="w-20 h-20 bg-eden-light-green/10 rounded-full flex items-center justify-center">
              <BookOpen size={40} className="text-eden-light-green" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-xl font-serif text-eden-light-green">How can I guide you today?</h3>
              <p className="text-sm text-eden-light-green/60">Ask about scripture, prayer, or your spiritual journey.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
              {[
                "How do I start a daily prayer habit?",
                "What does the Bible say about anxiety?",
                "Explain the concept of Grace.",
                "How can I serve my community better?"
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="p-3 text-xs text-left bg-white/5 border border-white/10 rounded-xl hover:border-eden-gold/30 transition-colors text-white/80"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl",
                msg.role === 'user' 
                  ? "bg-eden-leaf text-white rounded-tr-none" 
                  : "bg-white/10 border border-white/10 text-white rounded-tl-none shadow-sm"
              )}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-eden-leaf/5">
                    {msg.mode === 'quick' ? <Zap size={12} className="text-eden-gold" /> : <Brain size={12} className="text-eden-leaf" />}
                    <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                      {msg.mode === 'quick' ? 'Quick Wisdom' : 'Theological Deep Dive'}
                    </span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none prose-eden">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
              <span className="text-[10px] text-eden-leaf/40 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 items-center text-eden-leaf/40 italic text-sm"
          >
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-eden-leaf/40 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-eden-leaf/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-eden-leaf/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>Reflecting...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
          <AnimatePresence>
            {input.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-eden-gold text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-lg"
              >
                {mode === 'quick' ? 'Flash Mode Active' : 'Thinking Mode Active'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="glass p-2 rounded-2xl flex items-end gap-2 shadow-xl shadow-eden-leaf/5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={mode === 'quick' ? "Ask for quick wisdom..." : "Ask for a deep theological dive..."}
            className="flex-1 bg-transparent border-none focus:ring-0 p-3 text-white placeholder:text-white/20 resize-none max-h-32 min-h-[52px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "p-3 rounded-xl transition-all flex items-center justify-center",
              input.trim() && !isLoading
                ? "bg-eden-leaf text-white shadow-lg shadow-eden-leaf/20 scale-100"
                : "bg-eden-leaf/10 text-eden-leaf/30 scale-95 cursor-not-allowed"
            )}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-eden-leaf/30 mt-3 uppercase tracking-widest">
          Powered by Gemini Intelligence
        </p>
      </div>
    </div>
  );
}
