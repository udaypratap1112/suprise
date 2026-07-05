import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Zap, Volume2, VolumeX, RotateCcw, PartyPopper, Gift, Settings, X, Plus, Trash2, Check, Code } from 'lucide-react';

/**
 * ============================================================================
 * 🎁 EASY EDIT CONFIGURATION 🎁
 * Edit your friend's name, compliments, birthday note, and GIFs right here!
 * Everything is contained in this single easy-to-edit file.
 * ============================================================================
 */
const FRIEND_NAME = "Satakshi";
const CLICKS_TO_REVEAL = 6;
const INITIAL_MESSAGE = "Need a mood boost? Press the button.";

const COMPLIMENTS = [
  "You have excellent taste in friends (specifically me), chalo aapko bura na lage (dusre no. pr Astha).",
  "Statistically speaking, you are the best person born on this exact day.",
  "You're the kind of friend I'd share my favorite 🍔 snacks with. That's huge.",
  "Your energy is immaculate. 10/10.",
  "You make the world at least 400% brighter just by walking into the room.",
  "Out of all 8 billion people on Earth, you're easily in the VIP hall of fame."
];

const BIRTHDAY_TITLE = "HAPPY BIRTHDAY, {NAME}! 🎉";

const BIRTHDAY_MESSAGE = 
  "Happy birthday! Honestly, you're one of the few people i can tolerate for more than two hours at a time, which is a big compliment. Hope you're spending today doing exactly what u want(even if that's literally sleeping all day), bss isse jada/accha nhi likh sakta, Happy Birthday again☺️. please dont sleep all day. i have never thought that we would become good friends or abb dikhiye ye chutiya cheeze kr raha aapke liye";

const CELEBRATION_GIFS = [
  {
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1a3BqOG1jNG04ZHN1bzQ5dzNyZDJvNnlkYWc1MmVydnkyOHRneCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/g5R9dok94mrIvplmZd/giphy.gif",
    caption: "PARTY TIME! 🥳"
  },
  {
    url: "https://i.ibb.co/q39N1Fdm/IMG-20260417-WA0016.jpg",
    caption: "IMMACULATE VIBES! 💃"
  },
  {
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGoyMnl3MGszOXN4NW5tM3RocTNscnl4dzllZ3gwcHJveXk4dG5heSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oriO0OEd9QIDdllqo/giphy.gif",
    caption: "BEST FRIEND EVER! 🎂"
  }
];

// ============================================================================
// 🔊 AUDIO SYNTHESIZER (No external sound files required)
// ============================================================================
class SoundEffects {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  playPop(step: number = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const frequencies = [329.63, 392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00];
      const freq = frequencies[step % frequencies.length];

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn(e);
    }
  }

  playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 987.77, 1046.50];
      chord.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = index * 0.08;

        osc.type = index % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 1.2);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playBurst() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn(e);
    }
  }
}

const sound = new SoundEffects();

// ============================================================================
// 🌟 MAIN APPLICATION COMPONENT
// Designed to fit 100% inside laptop viewport without scrolling!
// ============================================================================
export default function App() {
  const [friendName, setFriendName] = useState(FRIEND_NAME);
  const [complimentsList, setComplimentsList] = useState(COMPLIMENTS);
  const [clickCount, setClickCount] = useState(0);
  const [currentText, setCurrentText] = useState(INITIAL_MESSAGE);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newComplimentInput, setNewComplimentInput] = useState('');
  const [copied, setCopied] = useState(false);

  const isRevealPhase = clickCount >= CLICKS_TO_REVEAL;

  // Handle Dopamine Button Click
  const handleDopamineClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    sound.playPop(nextCount);

    if (nextCount < CLICKS_TO_REVEAL) {
      let nextIdx = Math.floor(Math.random() * complimentsList.length);
      if (complimentsList.length > 1 && nextIdx === lastIndex) {
        nextIdx = (nextIdx + 1) % complimentsList.length;
      }
      setLastIndex(nextIdx);
      setCurrentText(complimentsList[nextIdx]);
    }
  };

  // Trigger Confetti Explosion
  const triggerConfetti = () => {
    sound.playBurst();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF00E4', '#00FF00', '#00E0FF', '#FF5C00', '#FFD200', '#FFFFFF']
    });
  };

  // Run Fanfare & Confetti when Birthday Reveal unlocks
  useEffect(() => {
    if (isRevealPhase) {
      sound.playFanfare();
      triggerConfetti();
      const interval = setInterval(() => {
        confetti({
          particleCount: 35,
          angle: Math.random() * 60 + 60,
          spread: 55,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#FF00E4', '#FFFFFF', '#00E0FF', '#FFD200']
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRevealPhase]);

  const toggleAudio = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sound.isMuted = nextState;
  };

  const formattedTitle = BIRTHDAY_TITLE.replace('{NAME}', friendName || 'FRIEND');

  return (
    <div className={`h-screen w-screen ${isRevealPhase ? 'bg-[#00FF00]' : 'bg-[#FFD200]'} transition-colors duration-500 text-black flex flex-col justify-between selection:bg-black selection:text-white p-3 sm:p-4 md:p-6`}>
      
      {/* 🔹 TOP BAR: Compact & Fitted */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 bg-white border-4 border-black px-3 py-1.5 neobrutal-shadow-sm">
          <span className={`w-2.5 h-2.5 border-2 border-black animate-pulse ${isRevealPhase ? 'bg-[#FF00E4]' : 'bg-[#00FF00]'}`} />
          <span className="font-display font-black text-xs sm:text-sm text-black uppercase tracking-wide">
            {isRevealPhase ? '🎉 BIRTHDAY REVEAL UNLOCKED' : `🎈 FOR: ${friendName.toUpperCase()}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className="px-3 py-1.5 bg-white border-4 border-black font-black text-xs uppercase neobrutal-shadow-sm neobrutal-btn-hover flex items-center gap-1.5 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound On'}</span>
          </button>

        </div>
      </header>

      {/* 🔹 MAIN CONTENT VIEWPORT: Centered & Fitted without Scroll */}
      <main className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center my-2">
        <AnimatePresence mode="wait">
          {!isRevealPhase ? (
            /* ================================================================
               PHASE 1: THE DOPAMINE HIT MACHINE
               ================================================================ */
            <motion.div
              key="phase-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-5 sm:space-y-6"
            >
              {/* Clicks Counter Badge */}
              <div className="bg-white border-4 border-black px-4 py-1.5 neobrutal-shadow-sm flex items-center gap-2 text-xs sm:text-sm font-black uppercase">
                <Zap className="w-4 h-4 text-[#FF00E4] fill-[#FF00E4] animate-pulse" />
                <span>Dopamine Level: {clickCount} / {CLICKS_TO_REVEAL} Hits</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md h-5 bg-white border-4 border-black p-0.5 neobrutal-shadow-sm overflow-hidden">
                <motion.div
                  className="h-full bg-[#FF00E4] border-r-2 border-black"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((clickCount / CLICKS_TO_REVEAL) * 100))}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                />
              </div>

              {/* Compliment / Display Card */}
              <div className="w-full min-h-[120px] sm:min-h-[140px] flex items-center justify-center bg-white border-4 sm:border-[6px] border-black neobrutal-shadow p-6 relative">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-display font-black text-sm sm:text-lg md:text-2xl uppercase leading-tight text-black"
                  >
                    "{currentText}"
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Prominent Neobrutalist Button */}
              <button
                onClick={handleDopamineClick}
                className="bg-white border-[6px] border-black text-black px-8 sm:px-12 py-5 text-sm sm:text-lg md:text-2xl font-black neobrutal-shadow neobrutal-btn-hover uppercase flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF00E4] animate-bounce shrink-0" />
                <span>Click for a Dopamine Hit</span>
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 fill-[#FF00E4] shrink-0 group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          ) : (
            /* ================================================================
               PHASE 2: THE CELEBRATORY BIRTHDAY REVEAL
               ================================================================ */
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
              className="flex flex-col items-center justify-center w-full max-w-4xl text-center space-y-3 sm:space-y-4 md:space-y-5"
            >


              {/* Huge Birthday Title (Fluid size to prevent laptop scrolling) */}
              <h1 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-black leading-none uppercase tracking-tight">
                {formattedTitle}
              </h1>

              {/* Birthday Message Box */}
              <div className="w-full max-w-2xl bg-white border-4 border-black p-3 sm:p-5 neobrutal-shadow text-left sm:text-center">
                <p className="text-sm sm:text-lg md:text-xl font-bold text-black leading-snug">
                  {BIRTHDAY_MESSAGE}
                </p>
              </div>

              {/* 3 Compact GIF Cards Grid fitting side-by-side */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-2xl">
                {CELEBRATION_GIFS.map((gif, idx) => (
                  <div key={idx} className="bg-white border-4 border-black neobrutal-shadow overflow-hidden flex flex-col group">
                    <div className="aspect-video sm:aspect-[4/3] w-full bg-black border-b-4 border-black overflow-hidden">
                      <img
                        src={gif.url}
                        alt={gif.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="py-1 px-1.5 bg-white text-center font-display font-black text-[10px] sm:text-xs text-black uppercase truncate">
                      {gif.caption}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={triggerConfetti}
                  className="bg-white border-4 border-black text-black font-black px-5 py-2.5 text-xs sm:text-sm uppercase neobrutal-shadow neobrutal-btn-hover flex items-center gap-1.5 cursor-pointer"
                >
                  <PartyPopper className="w-4 h-4 text-[#FF00E4]" /> Shoot Confetti! 🎊
                </button>

                <button
                  onClick={() => setClickCount(0)}
                  className="bg-white border-4 border-black text-black font-black px-4 py-2.5 text-xs sm:text-sm uppercase neobrutal-shadow neobrutal-btn-hover flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Replay
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>




    </div>
  );
}
