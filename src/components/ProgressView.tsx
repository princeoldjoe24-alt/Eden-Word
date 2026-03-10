import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Star, Target, Calendar, ChevronRight, Sparkles, Heart, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const MOCK_DATA = [
  { day: 'Mon', minutes: 15, stars: 5 },
  { day: 'Tue', minutes: 25, stars: 10 },
  { day: 'Wed', minutes: 20, stars: 8 },
  { day: 'Thu', minutes: 35, stars: 15 },
  { day: 'Fri', minutes: 30, stars: 12 },
  { day: 'Sat', minutes: 45, stars: 20 },
  { day: 'Sun', minutes: 40, stars: 18 },
];

interface ProgressViewProps {
  profile: UserProfile;
}

export default function ProgressView({ profile }: ProgressViewProps) {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
      <header className="space-y-2">
        <h1 className="text-5xl font-serif text-white">Your Kingdom Impact</h1>
        <p className="text-eden-leaf/60 font-serif italic">Tracking your growth across disciplines.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Star className="text-eden-gold" size={24} />} 
          label="Golden Stars" 
          value={(profile.stars || 0).toString()} 
          highlight 
        />
        <StatCard 
          icon={<Flame className="text-orange-500" size={24} />} 
          label="Current Streak" 
          value="12 Days" 
        />
        <StatCard 
          icon={<BookOpen className="text-eden-leaf" size={24} />} 
          label="Studies Completed" 
          value="24" 
        />
        <StatCard 
          icon={<Heart className="text-red-500" size={24} />} 
          label="Prayer Minutes" 
          value="450" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl space-y-6 border-eden-gold/10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-serif text-white">Study Activity</h3>
            <div className="flex gap-2 text-[10px] uppercase tracking-widest font-bold text-white/40">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-eden-leaf" /> Minutes</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-eden-gold" /> Stars</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8BC34A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8BC34A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F0F0F', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  stroke="#8BC34A" 
                  fillOpacity={1} 
                  fill="url(#colorMinutes)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="stars" 
                  stroke="#D4AF37" 
                  fillOpacity={1} 
                  fill="url(#colorStars)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Badges */}
        <div className="glass p-8 rounded-3xl space-y-6">
          <h3 className="text-xl font-serif text-white">Kingdom Badges</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Early Bird', icon: <Sparkles size={24} />, color: 'text-eden-gold' },
              { name: 'Prayer Warrior', icon: <Heart size={24} />, color: 'text-red-500' },
              { name: 'Word Scholar', icon: <BookOpen size={24} />, color: 'text-eden-leaf' },
              { name: 'Faithful Servant', icon: <Target size={24} />, color: 'text-blue-500' }
            ].map(badge => (
              <div key={badge.name} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                <div className={cn("p-3 rounded-full bg-white/5", badge.color)}>
                  {badge.icon}
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/60">{badge.name}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white hover:border-eden-leaf transition-all">
            View All Badges
          </button>
        </div>
      </div>

      {/* Recent Milestones */}
      <section className="space-y-6">
        <h3 className="text-2xl font-serif text-white">Recent Milestones</h3>
        <div className="space-y-4">
          {[
            { title: '10 Day Streak Reached', date: 'Yesterday', icon: <Flame size={18} />, color: 'text-orange-500' },
            { title: 'Completed "Grace Abounds" Study', date: '3 days ago', icon: <Trophy size={18} />, color: 'text-eden-gold' },
            { title: 'Answered 5th Prayer Request', date: 'Last week', icon: <Sparkles size={18} />, color: 'text-eden-leaf' }
          ].map((milestone, idx) => (
            <div key={idx} className="glass p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl bg-white/5", milestone.color)}>
                  {milestone.icon}
                </div>
                <div>
                  <h4 className="text-white font-medium">{milestone.title}</h4>
                  <p className="text-xs text-white/40">{milestone.date}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-all" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode, label: string, value: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-8 rounded-3xl border text-center space-y-4 transition-all hover:scale-[1.02]",
      highlight ? "bg-eden-gold/10 border-eden-gold/30 shadow-2xl shadow-eden-gold/5" : "bg-white/5 border-white/10"
    )}>
      <div className="flex justify-center">{icon}</div>
      <div>
        <p className={cn(
          "text-[10px] uppercase tracking-widest font-bold mb-1",
          highlight ? "text-eden-gold" : "text-eden-leaf/60"
        )}>{label}</p>
        <p className={cn(
          "text-4xl font-serif",
          highlight ? "text-eden-gold" : "text-white"
        )}>{value}</p>
      </div>
    </div>
  );
}
