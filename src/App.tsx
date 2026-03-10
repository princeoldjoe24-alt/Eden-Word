import React, { useState, useEffect } from 'react';
import { UserProfile, StudyTrack } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import StudyView from './components/StudyView';
import SpiritualGuide from './components/SpiritualGuide';
import PrayerView from './components/PrayerView';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Users, Trophy, Settings, Search, Sparkles, BookOpen, HandHeart } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTrack, setActiveTrack] = useState<StudyTrack | null>(null);
  const [view, setView] = useState<'dashboard' | 'guide' | 'prayer' | 'community' | 'progress' | 'settings'>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('eden_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('eden_profile', JSON.stringify(newProfile));
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('eden_profile', JSON.stringify(updatedProfile));
  };

  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (activeTrack) {
    return (
      <StudyView 
        profile={profile} 
        track={activeTrack} 
        onBack={() => setActiveTrack(null)} 
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-eden-dark flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 border-r border-eden-light-green/10 flex-col p-6 space-y-8 bg-eden-dark text-eden-light-green">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-eden-light-green rounded-lg flex items-center justify-center text-eden-dark font-serif text-xl shadow-lg shadow-black/10">W</div>
          <span className="font-serif text-xl tracking-tight text-eden-light-green leading-tight">Daily Word</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem 
            icon={<Book size={20} />} 
            label="Study" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="Spiritual Guide" 
            active={view === 'guide'} 
            onClick={() => setView('guide')} 
          />
          <NavItem 
            icon={<HandHeart size={20} />} 
            label="Prayer Sanctuary" 
            active={view === 'prayer'} 
            onClick={() => setView('prayer')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Community" 
            active={view === 'community'} 
            onClick={() => setView('community')} 
          />
          <NavItem 
            icon={<Trophy size={20} />} 
            label="Progress" 
            active={view === 'progress'} 
            onClick={() => setView('progress')} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={view === 'settings'} 
            onClick={() => setView('settings')} 
          />
        </nav>

        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-eden-gold" />
            <span className="text-xs font-medium text-white/80">Golden Stars</span>
          </div>
          <span className="text-lg font-serif text-eden-gold">{profile.stars || 0}</span>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Daily Goal</p>
          <div className="flex justify-between items-end mb-1">
            <span className="text-lg font-serif text-white">15m / 20m</span>
            <span className="text-xs text-white/60">75%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-eden-gold w-[75%]" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex justify-between items-center p-4 border-b border-white/10 bg-eden-dark">
          <span className="font-serif text-lg text-eden-light-green">Daily Word</span>
          <button className="p-2 rounded-full bg-white/5 text-eden-light-green"><Search size={20} /></button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'dashboard' && <Dashboard profile={profile} onSelectTrack={setActiveTrack} onViewChange={setView} />}
            {view === 'guide' && <SpiritualGuide profile={profile} />}
            {view === 'prayer' && <PrayerView profile={profile} />}
            {view === 'community' && (
              <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
                <Users size={48} className="mx-auto text-eden-light-green/20" />
                <h2 className="text-3xl font-serif text-eden-light-green">Community Hub</h2>
                <p className="text-eden-light-green/60">Connect with others in the {profile.denomination} community.</p>
                <div className="grid grid-cols-1 gap-4 mt-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass p-6 rounded-2xl text-left flex gap-4 border-eden-gold/10">
                      <div className="w-12 h-12 rounded-full bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-white/10 rounded" />
                        <div className="h-3 w-full bg-white/5 rounded" />
                        <div className="h-3 w-2/3 bg-white/5 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {view === 'progress' && (
              <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
                <Trophy size={48} className="mx-auto text-eden-gold/40" />
                <h2 className="text-3xl font-serif text-eden-light-green">Your Kingdom Impact</h2>
                <p className="text-eden-light-green/60">Tracking your growth across disciplines.</p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <StatCard label="Golden Stars" value={(profile.stars || 0).toString()} highlight />
                  <StatCard label="Studies Completed" value="24" />
                  <StatCard label="Prayer Minutes" value="450" />
                  <StatCard label="Badges Earned" value="8" />
                </div>
              </div>
            )}
            {view === 'settings' && (
              <div className="max-w-xl mx-auto p-12 space-y-8">
                <h2 className="text-3xl font-serif text-eden-light-green">Settings</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-eden-light-green/60 text-xs uppercase tracking-widest">Name</span>
                      <span className="text-eden-light-green font-medium">{profile.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-eden-light-green/60 text-xs uppercase tracking-widest">Country</span>
                      <span className="text-eden-light-green font-medium">{profile.country}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-eden-light-green/60 text-xs uppercase tracking-widest">Language</span>
                      <span className="text-eden-light-green font-medium">{profile.language}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-eden-light-green/60 text-xs uppercase tracking-widest">Season</span>
                      <span className="text-eden-light-green font-medium capitalize">{profile.ageGroup.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-eden-light-green font-medium">Daily Notifications</span>
                    <div className="w-10 h-6 bg-eden-light-green rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-eden-dark rounded-full" />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('eden_profile');
                      setProfile(null);
                    }}
                    className="w-full p-4 text-red-500 font-medium hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20"
                  >
                    Reset Profile
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-eden-dark border-t border-white/10 flex justify-around p-3 z-50">
        <MobileNavItem icon={<Book size={20} />} active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <MobileNavItem icon={<BookOpen size={20} />} active={view === 'guide'} onClick={() => setView('guide')} />
        <MobileNavItem icon={<HandHeart size={20} />} active={view === 'prayer'} onClick={() => setView('prayer')} />
        <MobileNavItem icon={<Users size={20} />} active={view === 'community'} onClick={() => setView('community')} />
        <MobileNavItem icon={<Trophy size={20} />} active={view === 'progress'} onClick={() => setView('progress')} />
        <MobileNavItem icon={<Settings size={20} />} active={view === 'settings'} onClick={() => setView('settings')} />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
        active ? "bg-eden-light-green text-eden-dark shadow-lg shadow-black/10" : "text-eden-light-green/60 hover:bg-white/10 hover:text-eden-light-green"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl transition-all",
        active ? "text-eden-light-green bg-eden-light-green/10" : "text-eden-light-green/40"
      )}
    >
      {icon}
    </button>
  );
}

function StatCard({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border text-center transition-all",
      highlight ? "bg-eden-gold/10 border-eden-gold/30 shadow-lg shadow-eden-gold/5" : "bg-white/5 border-white/10"
    )}>
      <p className={cn(
        "text-[10px] uppercase tracking-widest mb-1",
        highlight ? "text-eden-gold" : "text-eden-leaf/60"
      )}>{label}</p>
      <p className={cn(
        "text-3xl font-serif",
        highlight ? "text-eden-gold" : "text-white"
      )}>{value}</p>
    </div>
  );
}
