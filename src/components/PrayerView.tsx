import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Plus, Trash2, CheckCircle2, Flame, Sparkles, Send, Wand2, Loader2, X } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { generatePrayerFromRequest, generateIntercessoryFocus } from '../services/gemini';
import Markdown from 'react-markdown';

interface PrayerRequest {
  id: string;
  text: string;
  category: 'personal' | 'intercession' | 'gratitude';
  timestamp: number;
  answered: boolean;
}

interface PrayerViewProps {
  profile: UserProfile;
}

export default function PrayerView({ profile }: PrayerViewProps) {
  const [prayers, setPrayers] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('eden_prayers');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [category, setCategory] = useState<'personal' | 'intercession' | 'gratitude'>('personal');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generatedPrayer, setGeneratedPrayer] = useState<{ id: string; text: string } | null>(null);
  const [intercessoryFocus, setIntercessoryFocus] = useState<{ title: string; description: string; scripture: string } | null>(null);
  const [isLoadingFocus, setIsLoadingFocus] = useState(true);

  useEffect(() => {
    generateIntercessoryFocus(profile)
      .then(setIntercessoryFocus)
      .finally(() => setIsLoadingFocus(false));
  }, [profile]);

  const savePrayers = (newPrayers: PrayerRequest[]) => {
    setPrayers(newPrayers);
    localStorage.setItem('eden_prayers', JSON.stringify(newPrayers));
  };

  const addPrayer = () => {
    if (!input.trim()) return;
    const newPrayer: PrayerRequest = {
      id: Date.now().toString(),
      text: input,
      category,
      timestamp: Date.now(),
      answered: false
    };
    savePrayers([newPrayer, ...prayers]);
    setInput('');
  };

  const toggleAnswered = (id: string) => {
    savePrayers(prayers.map(p => p.id === id ? { ...p, answered: !p.answered } : p));
  };

  const deletePrayer = (id: string) => {
    savePrayers(prayers.filter(p => p.id !== id));
  };

  const handleGeneratePrayer = async (prayer: PrayerRequest) => {
    setIsGenerating(prayer.id);
    try {
      const result = await generatePrayerFromRequest(profile, prayer.text);
      setGeneratedPrayer({ id: prayer.id, text: result });
    } catch (error) {
      console.error('Error generating prayer:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
      <header className="space-y-2">
        <h1 className="text-5xl font-serif text-white">Prayer Sanctuary</h1>
        <p className="text-eden-leaf/60 font-serif italic">"Pray without ceasing." — 1 Thessalonians 5:17</p>
      </header>

      {/* Add Prayer Card */}
      <section className="glass rounded-3xl p-8 border-eden-gold/20 shadow-2xl">
        <div className="space-y-6">
          <div className="flex gap-2">
            {(['personal', 'intercession', 'gratitude'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all",
                  category === cat 
                    ? "bg-eden-gold text-white shadow-lg shadow-eden-gold/20" 
                    : "bg-white/5 text-white/40 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                category === 'intercession' 
                  ? "Who are you standing in the gap for today?" 
                  : category === 'gratitude' 
                  ? "What are you thankful for?" 
                  : "What is on your heart?"
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:border-eden-gold outline-none min-h-[120px] resize-none text-lg font-serif"
            />
            <button
              onClick={addPrayer}
              disabled={!input.trim()}
              className={cn(
                "absolute bottom-4 right-4 p-4 rounded-xl transition-all",
                input.trim() 
                  ? "bg-eden-leaf text-white shadow-lg shadow-eden-leaf/20 scale-100" 
                  : "bg-white/5 text-white/10 scale-95 cursor-not-allowed"
              )}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Prayer List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif text-white">Your Petitions</h3>
          <div className="flex items-center gap-2 text-eden-gold">
            <Flame size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">{prayers.length} Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {prayers.map((prayer) => (
              <motion.div
                key={prayer.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group relative p-6 rounded-2xl border transition-all flex items-start gap-4",
                  prayer.answered 
                    ? "bg-eden-leaf/10 border-eden-leaf/20 opacity-60" 
                    : "bg-white/5 border-white/10 hover:border-eden-gold/30"
                )}
              >
                <button 
                  onClick={() => toggleAnswered(prayer.id)}
                  className={cn(
                    "mt-1 p-1 rounded-full border transition-all",
                    prayer.answered 
                      ? "bg-eden-leaf border-eden-leaf text-white" 
                      : "border-white/20 text-transparent hover:border-eden-gold"
                  )}
                >
                  <CheckCircle2 size={18} />
                </button>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
                      prayer.category === 'intercession' ? "bg-purple-500/20 text-purple-400" :
                      prayer.category === 'gratitude' ? "bg-eden-gold/20 text-eden-gold" : "bg-eden-leaf/20 text-eden-leaf"
                    )}>
                      {prayer.category}
                    </span>
                    <span className="text-[10px] text-white/20">
                      {new Date(prayer.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={cn(
                    "text-lg font-serif leading-relaxed",
                    prayer.answered ? "line-through text-white/40" : "text-white"
                  )}>
                    {prayer.text}
                  </p>
                  
                  {!prayer.answered && (
                    <div className="pt-2">
                      <button
                        onClick={() => handleGeneratePrayer(prayer)}
                        disabled={isGenerating === prayer.id}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-eden-gold hover:text-eden-gold/80 transition-colors disabled:opacity-50"
                      >
                        {isGenerating === prayer.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Wand2 size={12} />
                        )}
                        {isGenerating === prayer.id ? 'Reflecting...' : 'Generate Prayer'}
                      </button>
                    </div>
                  )}

                  {generatedPrayer?.id === prayer.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-eden-gold/5 border border-eden-gold/20 rounded-xl relative group/prayer"
                    >
                      <button 
                        onClick={() => setGeneratedPrayer(null)}
                        className="absolute top-2 right-2 p-1 text-eden-gold/40 hover:text-eden-gold transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <div className="prose prose-sm prose-eden max-w-none text-eden-gold/90 italic font-serif leading-relaxed">
                        <Markdown>{generatedPrayer.text}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={() => deletePrayer(prayer.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-500 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {prayers.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-20">
              <Heart size={48} className="mx-auto" />
              <p className="font-serif italic text-xl">Your altar is ready for your petitions.</p>
            </div>
          )}
        </div>
      </section>

      {/* Guided Prayer Section */}
      <section className="bg-eden-gold/5 rounded-3xl p-10 border border-eden-gold/20 text-center space-y-6">
        <Sparkles size={32} className="text-eden-gold mx-auto" />
        <h3 className="text-3xl font-serif text-white">Daily Intercessory Focus</h3>
        
        {isLoadingFocus ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-white/5 rounded-lg w-1/2 mx-auto" />
            <div className="h-4 bg-white/5 rounded-lg w-3/4 mx-auto" />
            <div className="h-4 bg-white/5 rounded-lg w-1/4 mx-auto" />
          </div>
        ) : intercessoryFocus ? (
          <div className="space-y-4">
            <h4 className="text-xl font-serif text-eden-gold">{intercessoryFocus.title}</h4>
            <p className="text-white/60 max-w-lg mx-auto italic">
              {intercessoryFocus.description}
            </p>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 inline-block">
              <p className="text-sm text-white/80 font-serif italic">"{intercessoryFocus.scripture}"</p>
            </div>
          </div>
        ) : (
          <p className="text-white/60 max-w-lg mx-auto italic">
            "I urge, then, first of all, that petitions, prayers, intercession and thanksgiving be made for all people."
          </p>
        )}

        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={() => {
              if (intercessoryFocus) {
                setCategory('intercession');
                setInput(`Praying for: ${intercessoryFocus.title}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="px-6 py-2 rounded-full bg-eden-gold text-white hover:bg-eden-gold/80 transition-all text-sm font-medium shadow-lg shadow-eden-gold/20"
          >
            Join in Prayer
          </button>
        </div>
      </section>
    </div>
  );
}
