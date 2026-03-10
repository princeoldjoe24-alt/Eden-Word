import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, DailyContent, StudyTrack } from '../types';
import { generateDailyVerse, generatePersonalizedStudy } from '../services/gemini';
import { STUDY_TRACKS } from '../data/tracks';
import { Sprout, Crown, Heart, Compass, Shield, Coins, BookOpen, Flame, Users, Calendar, Trophy, ChevronRight, Share2, HandHeart } from 'lucide-react';
import { cn } from '../lib/utils';

const ICON_MAP: Record<string, any> = {
  Sprout, Crown, Heart, Compass, Shield, Coins
};

interface DashboardProps {
  profile: UserProfile;
  onSelectTrack: (track: StudyTrack) => void;
  onViewChange: (view: 'dashboard' | 'guide' | 'prayer' | 'community' | 'progress' | 'settings') => void;
}

export default function Dashboard({ profile, onSelectTrack, onViewChange }: DashboardProps) {
  const [dailyVerse, setDailyVerse] = useState<{ verse: string; reference: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>(
    profile.maturity === 'new' ? 'basic' : 
    profile.maturity === 'growing' ? 'intermediate' : 'advanced'
  );
  const [reminders, setReminders] = useState({ morning: true, evening: true });

  useEffect(() => {
    generateDailyVerse(profile)
      .then(data => {
        setDailyVerse(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDailyVerse({
          verse: "This Book of the Law shall not depart from your mouth, but you shall meditate in it day and night, that you may observe to do according to all that is written in it. For then you will make your way prosperous, and then you will have good success.",
          reference: "Joshua 1:8"
        });
        setLoading(false);
      });
  }, []);

  const levels = ['basic', 'intermediate', 'advanced'];

  const filteredTracks = STUDY_TRACKS.filter(track => {
    return track.levels.includes(filterLevel as any);
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm uppercase tracking-[0.2em] text-eden-light-green/60 font-medium mb-1">
            Welcome back, {profile.name}
          </h2>
          <h1 className="text-5xl font-serif text-eden-light-green leading-tight">Welcome to Eden Word</h1>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-eden-leaf/40">Current Streak</p>
            <p className="text-2xl font-serif flex items-center gap-2 justify-end text-white">
              <Flame className="text-eden-gold" size={20} /> 12 Days
            </p>
          </div>
        </div>
      </header>

      {/* Daily Verse Card */}
      <section className="relative overflow-hidden rounded-3xl bg-eden-dark text-white p-10 shadow-2xl border border-eden-gold/20">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-eden-gold mb-6">Daily Word</p>
          {loading ? (
            <div className="space-y-4">
              <div className="h-8 animate-pulse bg-white/10 rounded-lg w-3/4" />
              <div className="h-4 animate-pulse bg-white/10 rounded-lg w-1/4" />
            </div>
          ) : (
            <>
              <blockquote className="text-3xl font-serif italic mb-4 leading-relaxed">
                "{dailyVerse?.verse}"
              </blockquote>
              <cite className="text-sm font-medium opacity-70">— {dailyVerse?.reference} (NKJV)</cite>
            </>
          )}
        </div>
        <div className="absolute top-[-20%] right-[-10%] opacity-10">
          <BookOpen size={400} />
        </div>
      </section>

      {/* Study Tracks */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-2xl font-serif text-eden-light-green">Outline of Study Areas</h3>
          <div className="flex gap-2">
            <div className="flex bg-eden-leaf/5 p-1 rounded-xl border border-eden-leaf/10">
              {levels.map(l => (
                <button
                  key={l}
                  onClick={() => setFilterLevel(l)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold transition-all",
                    filterLevel === l 
                      ? "bg-eden-leaf text-white shadow-md" 
                      : "text-eden-leaf/40 hover:text-eden-leaf"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTracks.map((track) => {
            const Icon = ICON_MAP[track.icon] || Sprout;
            return (
              <motion.div
                key={track.id}
                whileHover={{ y: -4 }}
                onClick={() => onSelectTrack(track)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTrack(track);
                  }
                }}
                className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-eden-gold/30 text-left transition-all shadow-sm hover:shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-eden-gold/50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-white/5 group-hover:bg-eden-leaf group-hover:text-white transition-colors">
                    <Icon size={24} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] uppercase tracking-tighter text-eden-leaf/40">{track.duration}</span>
                  </div>
                </div>
                <div className="mb-1">
                  <h4 className="text-xl font-serif text-white">{track.title}</h4>
                </div>
                <p className="text-sm text-eden-leaf/60 line-clamp-2 mb-4">{track.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs font-medium text-eden-leaf group-hover:text-eden-gold transition-all">
                    Start Study <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quick Access to other areas */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => onViewChange('guide')}
          className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-eden-light-green/30 transition-all text-left flex items-center gap-6"
        >
          <div className="p-4 rounded-2xl bg-eden-light-green/10 text-eden-light-green group-hover:bg-eden-light-green group-hover:text-white transition-all">
            <BookOpen size={32} />
          </div>
          <div>
            <h4 className="text-2xl font-serif text-eden-light-green mb-1">Spiritual Guide</h4>
            <p className="text-eden-light-green/60 text-sm">Ask questions and seek biblically sound wisdom.</p>
          </div>
        </button>

        <button 
          onClick={() => onViewChange('prayer')}
          className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-eden-gold/30 transition-all text-left flex items-center gap-6"
        >
          <div className="p-4 rounded-2xl bg-eden-gold/10 text-eden-gold group-hover:bg-eden-gold group-hover:text-white transition-all">
            <HandHeart size={32} />
          </div>
          <div>
            <h4 className="text-2xl font-serif text-eden-light-green mb-1">Prayer Sanctuary</h4>
            <p className="text-eden-light-green/60 text-sm">A dedicated space for your petitions and intercessions.</p>
          </div>
        </button>
      </section>
    </div>
  );
}
