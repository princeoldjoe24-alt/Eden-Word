import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, DailyContent, StudyTrack } from '../types';
import { generatePersonalizedStudy, getStudyInsight, generateSpeech, generateScriptureImage } from '../services/gemini';
import { ArrowLeft, BookOpen, Sparkles, Heart, Target, Share2, Bookmark, CheckCircle2, Brain, X, Volume2, VolumeX, Loader2, Image as ImageIcon, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface StudyViewProps {
  profile: UserProfile;
  track: StudyTrack;
  onBack: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export default function StudyView({ profile, track, onBack, onUpdateProfile }: StudyViewProps) {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showStar, setShowStar] = useState(false);
  const [liked, setLiked] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [scriptureImage, setScriptureImage] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  const loadingMessages = [
    "Gathering spiritual insights for you...",
    "Connecting with the wisdom of the Word...",
    "Did you know? The Bible was written by over 40 authors over 1,500 years.",
    "Personalizing your experience...",
    "Did you know? The shortest verse in the Bible is 'Jesus wept' (John 11:35).",
    "Preparing a word in season for your soul...",
    "Did you know? The word 'Selah' appears 74 times in the Bible, meaning 'to pause and reflect'.",
    "Aligning the study with your Kingdom goals...",
    "Seeking inspiration for your daily walk..."
  ];
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleComplete = () => {
    if (!completed) {
      setCompleted(true);
      setShowStar(true);
      const newProfile = { ...profile, stars: (profile.stars || 0) + 1 };
      onUpdateProfile(newProfile);
      setTimeout(() => setShowStar(false), 3000);
    } else {
      setCompleted(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Your Word for today Bible Study: ${content?.reference}`,
          text: `Check out this Bible study on ${track.title}: "${content?.verse}"`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Sharing is not supported on this browser. You can copy the URL.");
    }
  };

  const handleGetInsight = async () => {
    if (!content || loadingInsight) return;
    setLoadingInsight(true);
    setShowInsightModal(true);
    try {
      const data = await getStudyInsight(profile, content);
      setInsight(data);
    } catch (err) {
      console.error("Error getting insight:", err);
      setInsight("I'm sorry, I couldn't find a deeper insight at this time.");
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleListen = async () => {
    if (isSpeaking) {
      audio?.pause();
      setIsSpeaking(false);
      return;
    }

    if (!content) return;

    setIsSpeaking(true);
    try {
      // Concatenate parts of the study for a full listening experience
      const textToSpeak = `
        Today's scripture is from ${content.reference}.
        ${content.verse}.
        Your Word for today:
        ${content.reflection.replace(/[*#]/g, '')}
      `;
      
      const base64Audio = await generateSpeech(textToSpeak);
      if (base64Audio) {
        const audioBlob = await fetch(`data:audio/wav;base64,${base64Audio}`).then(res => res.blob());
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio = new Audio(audioUrl);
        setAudio(newAudio);
        newAudio.play();
        newAudio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (err) {
      console.error("Error playing audio:", err);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

  const handleGenerateImage = async () => {
    if (!content || generatingImage) return;
    setGeneratingImage(true);
    try {
      const imageUrl = await generateScriptureImage(content.verse, content.reference);
      setScriptureImage(imageUrl);
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setGeneratingImage(false);
    }
  };

  const loadStudy = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generatePersonalizedStudy(profile, track.title);
      setContent(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load your study. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudy();
  }, [profile, track]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 bg-eden-dark">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 border-4 border-white/5 border-t-eden-gold rounded-full" 
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-eden-leaf flex flex-col items-center">
            <BookOpen size={40} className="animate-bounce mb-2" />
            <Sparkles size={16} className="text-eden-gold animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-4 max-w-xs">
          <h2 className="text-3xl font-serif text-white">Crafting Your Word for today</h2>
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.p 
                key={loadingMessageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-eden-leaf/60 text-sm italic"
              >
                {loadingMessages[loadingMessageIndex]}
              </motion.p>
            </AnimatePresence>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-eden-gold"
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-eden-leaf/40">
            Personalizing for your {profile.maturity} walk in {profile.country}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-eden-dark">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
          <ArrowLeft size={32} />
        </div>
        <div className="text-center space-y-4 max-w-xs">
          <h2 className="text-2xl font-serif text-white">Something went wrong</h2>
          <p className="text-eden-leaf/60 text-sm">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={onBack}
              className="px-6 py-2 rounded-full border border-eden-leaf/20 text-eden-leaf hover:bg-eden-leaf/5 transition-all text-sm font-medium"
            >
              Go Back
            </button>
            <button 
              onClick={loadStudy}
              className="px-6 py-2 rounded-full bg-eden-gold text-white hover:bg-eden-gold/90 transition-all text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eden-dark p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-eden-leaf mb-8 hover:text-eden-gold transition-colors font-medium">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <header className="mb-12 text-center relative">
          <div className="absolute top-0 right-0 flex items-center gap-1 bg-eden-gold/10 px-3 py-1 rounded-full border border-eden-gold/20">
            <Sparkles size={14} className="text-eden-gold" />
            <span className="text-xs font-bold text-eden-gold">{profile.stars || 0}</span>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-eden-leaf/60 mb-4 block">{track.title} • {track.levels.join(' • ')}</span>
          <h1 className="text-5xl font-serif mb-2 text-white">{content?.reference}</h1>
          <p className="text-sm font-medium text-eden-gold uppercase tracking-widest mb-6">{content?.bibleVersion}</p>
          <div className="h-px w-24 bg-eden-gold mx-auto" />
        </header>

        <div className="space-y-12">
          {/* Deep Insight Trigger */}
          <div className="flex justify-center -mt-8 mb-8">
            <button 
              onClick={handleGetInsight}
              className="flex items-center gap-2 px-6 py-3 bg-eden-gold text-white rounded-full shadow-lg shadow-eden-gold/20 hover:scale-105 transition-all font-medium group"
            >
              <Brain size={20} className="group-hover:animate-pulse" />
              Get Deep Spiritual Insight
            </button>
          </div>

          {/* Scripture Section */}
          <section className="bg-white/5 rounded-3xl p-10 shadow-sm border border-white/10 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-eden-gold">
                <BookOpen size={20} />
                <span className="text-xs uppercase tracking-widest font-bold">The Word ({content?.bibleVersion})</span>
              </div>
              <button 
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-eden-gold/10 text-eden-gold hover:bg-eden-gold hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
              >
                {generatingImage ? <Loader2 size={12} className="animate-spin" /> : <ImageIcon size={12} />}
                {generatingImage ? 'Creating...' : 'Visual Word'}
              </button>
            </div>

            {scriptureImage ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-video rounded-2xl overflow-hidden mb-6 group/image"
              >
                <img src={scriptureImage} alt="Scripture Visual" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-center">
                  <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed text-white mb-2">
                    "{content?.verse}"
                  </blockquote>
                  <cite className="text-sm font-medium text-white/70">— {content?.reference}</cite>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setScriptureImage(null)}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <a 
                    href={scriptureImage} 
                    download={`scripture-${content?.reference}.png`}
                    className="p-2 bg-eden-gold text-white rounded-full hover:bg-eden-gold/90 transition-colors"
                  >
                    <Download size={16} />
                  </a>
                </div>
              </motion.div>
            ) : (
              <blockquote className="text-3xl font-serif italic leading-relaxed text-white">
                "{content?.verse}"
              </blockquote>
            )}
          </section>

          {/* Reflection Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-eden-leaf">
                <Sparkles size={20} />
                <span className="text-xs uppercase tracking-widest font-bold">Your Word for today</span>
              </div>
              <button 
                onClick={handleListen}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-widest",
                  isSpeaking 
                    ? "bg-eden-gold text-white animate-pulse" 
                    : "bg-white/5 text-eden-leaf hover:bg-white/10"
                )}
              >
                {isSpeaking ? (
                  <><VolumeX size={16} /> Stop Listening</>
                ) : (
                  <><Volume2 size={16} /> Listen to Word</>
                )}
              </button>
            </div>
            <div className="prose prose-eden max-w-none text-lg leading-relaxed text-white/80 font-serif">
              <ReactMarkdown>{content?.reflection || ""}</ReactMarkdown>
            </div>
          </section>

          {/* Practical Application */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-eden-leaf/5 rounded-2xl p-8 border border-eden-leaf/10">
              <div className="flex items-center gap-3 mb-4 text-eden-leaf">
                <Target size={20} />
                <span className="text-xs uppercase tracking-widest font-bold">Application</span>
              </div>
              <p className="text-white/80 leading-relaxed">
                {content?.application}
              </p>
            </section>

            <section className="bg-eden-gold/5 rounded-2xl p-8 border border-eden-gold/10">
              <div className="flex items-center gap-3 mb-4 text-eden-gold">
                <Heart size={20} />
                <span className="text-xs uppercase tracking-widest font-bold">Prayer</span>
              </div>
              <p className="text-white/80 italic leading-relaxed">
                {content?.prayer}
              </p>
            </section>
          </div>

          {/* Daily Challenge */}
          <section className="bg-eden-dark text-white rounded-3xl p-10 text-center space-y-6 shadow-xl border border-eden-gold/20 relative overflow-hidden">
            <AnimatePresence>
              {showStar && (
                <motion.div 
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-eden-gold/20 backdrop-blur-sm z-10"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 10, 0] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                    >
                      <Sparkles size={80} className="text-eden-gold mx-auto mb-4" />
                    </motion.div>
                    <h4 className="text-4xl font-serif text-eden-gold">Golden Star Awarded!</h4>
                    <p className="text-white/80">Well done, good and faithful servant.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs uppercase tracking-widest text-eden-gold">
              Today's Challenge
            </div>
            <h3 className="text-3xl font-serif">{content?.challenge}</h3>
            <button 
              onClick={handleComplete}
              className={cn(
                "px-8 py-3 rounded-full font-medium transition-all flex items-center gap-2 mx-auto",
                completed ? "bg-eden-gold text-white" : "bg-white/10 text-white hover:bg-eden-gold hover:text-white"
              )}
            >
              {completed ? <><CheckCircle2 size={20} /> Challenge Completed</> : "Mark as Complete"}
            </button>
          </section>

          {/* Interaction Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button 
              onClick={() => setLiked(!liked)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full transition-all border",
                liked 
                  ? "bg-red-500/10 border-red-500/20 text-red-500" 
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
              <span className="font-medium">{liked ? "Liked" : "Like Word"}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
            >
              <Share2 size={20} />
              <span className="font-medium">Share Study</span>
            </button>
          </div>
        </div>

        {/* Floating Actions */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-full px-6 py-3 flex items-center gap-8 shadow-xl border-eden-gold/20">
          <button className="text-eden-leaf hover:text-eden-gold transition-colors">
            <Share2 size={20} />
          </button>
          <button className="text-eden-leaf hover:text-eden-gold transition-colors">
            <Bookmark size={20} />
          </button>
          <div className="w-px h-6 bg-eden-leaf/20" />
          <button className="text-eden-leaf hover:text-eden-gold transition-colors font-medium text-sm">
            Notes
          </button>
        </div>
      </div>

      {/* Deep Insight Modal */}
      <AnimatePresence>
        {showInsightModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsightModal(false)}
              className="absolute inset-0 bg-eden-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-eden-dark rounded-3xl overflow-hidden shadow-2xl border border-eden-gold/30"
            >
              <div className="p-6 md:p-10 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-eden-gold">
                    <Brain size={24} />
                    <h3 className="text-2xl font-serif">Deep Spiritual Insight</h3>
                  </div>
                  <button 
                    onClick={() => setShowInsightModal(false)}
                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="h-px w-full bg-eden-gold/20" />

                {loadingInsight ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
                    <div className="flex gap-2">
                      {[0, 1, 2].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-3 h-3 rounded-full bg-eden-gold"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-serif text-xl italic">Reflecting deeply...</p>
                      <p className="text-eden-leaf/60 text-sm">Using Flash Mode for fast theological analysis.</p>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-eden max-w-none text-white/90 font-serif text-lg leading-relaxed"
                  >
                    <ReactMarkdown>{insight || ""}</ReactMarkdown>
                  </motion.div>
                )}

                {!loadingInsight && (
                  <div className="pt-6 flex justify-center">
                    <button 
                      onClick={() => setShowInsightModal(false)}
                      className="px-8 py-3 bg-eden-leaf text-white rounded-full font-medium shadow-lg shadow-eden-leaf/20 hover:bg-eden-leaf/90 transition-all"
                    >
                      Amen
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
