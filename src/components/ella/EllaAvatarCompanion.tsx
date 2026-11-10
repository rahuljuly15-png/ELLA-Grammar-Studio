import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp, Mic, MicOff, Send } from 'lucide-react';
import type { StepKey } from './PracticeCycleView';
import type { RuleCheckResult } from '../../engines/offlineRuleEngine';
import type { FullTopicData } from '../../data/topicLoader';
import { getProactiveTeachingDialogue, generateTutorResponse } from '../../engines/ellaTutorEngine';

export type EllaMood = 'waving' | 'thinking' | 'cheering' | 'guiding' | 'celebrating';

export type BubblePlacement = 'left' | 'right' | 'top' | 'bottom';

interface EllaAvatarCompanionProps {
  currentStep: StepKey;
  studentName: string;
  selectedHypothesis: number | null;
  isHypothesisCorrect: boolean | null;
  liveCheckResult: RuleCheckResult;
  studentSentence: string;
  isSavedToDb: boolean;
  speakText: (text: string) => void;
  flightIntervalSeconds?: number;
  activeTopic: FullTopicData;
}

interface SpotConfig {
  id: string;
  getGenieCoords: (w: number, h: number) => { x: number; y: number };
  validPlacements: BubblePlacement[];
}

// 6 Strategic, screen-safe anchors across the screen
const SPOTS: SpotConfig[] = [
  {
    id: 'bottom-right',
    getGenieCoords: (w, h) => ({ x: Math.max(16, w - 105), y: Math.max(80, h - 120) }),
    validPlacements: ['left', 'top'],
  },
  {
    id: 'mid-left',
    getGenieCoords: (w, h) => ({ x: 24, y: Math.max(130, Math.min(h * 0.44, h - 180)) }),
    validPlacements: ['right', 'top', 'bottom'],
  },
  {
    id: 'bottom-left',
    getGenieCoords: (w, h) => ({ x: 24, y: Math.max(80, h - 120) }),
    validPlacements: ['right', 'top'],
  },
  {
    id: 'mid-right',
    getGenieCoords: (w, h) => ({ x: Math.max(16, w - 105), y: Math.max(130, Math.min(h * 0.44, h - 180)) }),
    validPlacements: ['left', 'top', 'bottom'],
  },
  {
    id: 'top-right',
    getGenieCoords: (w) => ({ x: Math.max(16, w - 105), y: 88 }),
    validPlacements: ['left', 'bottom'],
  },
  {
    id: 'top-left',
    getGenieCoords: () => ({ x: 24, y: 88 }),
    validPlacements: ['right', 'bottom'],
  },
];

export const EllaAvatarCompanion: React.FC<EllaAvatarCompanionProps> = ({
  currentStep,
  studentName,
  selectedHypothesis,
  isHypothesisCorrect,
  liveCheckResult,
  studentSentence,
  isSavedToDb,
  speakText,
  flightIntervalSeconds = 90,
  activeTopic,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [mood, setMood] = useState<EllaMood>('waving');
  const [dialogue, setDialogue] = useState<string>('');
  const [autoVoice, setAutoVoice] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Flight spot & shifting bubble placement
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
  const [bubblePlacement, setBubblePlacement] = useState<BubblePlacement>('left');
  const [isFlying, setIsFlying] = useState(false);
  const [flightTilt, setFlightTilt] = useState(0);

  // Screen size tracking
  const [screenSize, setScreenSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Eye Tracking State
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const avatarRef = useRef<HTMLDivElement>(null);

  const displayName = studentName?.trim() || 'Ishu';

  // Current spot configuration
  const currentSpot = SPOTS[currentSpotIndex % SPOTS.length];

  // Dynamic calculations for Group Container (clamp strictly to viewport boundaries)
  const layout = useMemo(() => {
    const w = screenSize.w;
    const h = screenSize.h;
    const isSmall = w < 640;

    const genieW = isSmall ? 68 : 76;
    const genieH = isSmall ? 82 : 90;
    const bubbleW = isSmall ? 280 : 330;
    const bubbleH = 110;

    const geniePos = currentSpot.getGenieCoords(w, h);

    let containerX = geniePos.x;
    let containerY = geniePos.y;

    if (bubblePlacement === 'left') {
      containerX = Math.max(16, geniePos.x - bubbleW - 14);
      containerY = Math.max(75, Math.min(geniePos.y, h - Math.max(genieH, bubbleH) - 16));
    } else if (bubblePlacement === 'right') {
      containerX = Math.max(16, Math.min(geniePos.x, w - bubbleW - genieW - 24));
      containerY = Math.max(75, Math.min(geniePos.y, h - Math.max(genieH, bubbleH) - 16));
    } else if (bubblePlacement === 'top') {
      containerX = Math.max(16, Math.min(geniePos.x - bubbleW * 0.4, w - bubbleW - 16));
      containerY = Math.max(75, geniePos.y - bubbleH - 14);
    } else if (bubblePlacement === 'bottom') {
      containerX = Math.max(16, Math.min(geniePos.x - bubbleW * 0.4, w - bubbleW - 16));
      containerY = Math.max(75, Math.min(geniePos.y, h - bubbleH - genieH - 24));
    }

    return {
      containerX,
      containerY,
      bubbleW,
      bubbleH,
      genieW,
      genieH,
    };
  }, [currentSpot, bubblePlacement, screenSize]);

  // Real-time Mouse / Touch Eye Tracking
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!avatarRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = avatarRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width * 0.5;
      const eyeCenterY = rect.top + rect.height * 0.42;

      const deltaX = clientX - eyeCenterX;
      const deltaY = clientY - eyeCenterY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > 0) {
        const maxRadius = 4.8;
        const scale = Math.min(distance / 80, 1);
        const pupilX = (deltaX / distance) * maxRadius * scale;
        const pupilY = (deltaY / distance) * maxRadius * scale;
        setEyeOffset({ x: pupilX, y: pupilY });
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  // Autonomous Flight: Change spot every configured seconds (default: 90s)
  const flyToNextSpot = () => {
    setIsFlying(true);

    const nextIndex = (currentSpotIndex + 1) % SPOTS.length;
    const nextSpot = SPOTS[nextIndex];

    const currentCoords = currentSpot.getGenieCoords(screenSize.w, screenSize.h);
    const nextCoords = nextSpot.getGenieCoords(screenSize.w, screenSize.h);

    const tilt = nextCoords.x > currentCoords.x ? 8 : -8;
    setFlightTilt(tilt);

    // Pick a safe relative bubble placement for the new spot (Right, Left, Top, or Bottom)
    const placements = nextSpot.validPlacements;
    const nextPlacement = placements[Math.floor(Math.random() * placements.length)];

    setCurrentSpotIndex(nextIndex);
    setBubblePlacement(nextPlacement);

    setTimeout(() => {
      setIsFlying(false);
      setFlightTilt(0);
    }, 3200);
  };

  useEffect(() => {
    if (flightIntervalSeconds === 0) return;

    const intervalMs = Math.max(30, flightIntervalSeconds) * 1000;
    const timer = setTimeout(() => {
      flyToNextSpot();
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [currentSpotIndex, flightIntervalSeconds, screenSize]);

  // Proactive Teaching Engine: Ella is ready & active by default on student actions!
  useEffect(() => {
    const tutorState = getProactiveTeachingDialogue({
      studentName: displayName,
      currentStep,
      activeTopic,
      selectedHypothesis,
      isHypothesisCorrect,
      liveCheckResult,
      studentSentence,
      isSavedToDb,
    });

    setDialogue(tutorState.reply);
    setMood(tutorState.mood);

    // Proactive Auto-Voice: Speaks automatically without requiring button click!
    if (autoVoice && tutorState.reply) {
      const timer = setTimeout(() => {
        speakText(tutorState.reply);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [
    currentStep,
    selectedHypothesis,
    isHypothesisCorrect,
    liveCheckResult.errors.length,
    studentSentence,
    isSavedToDb,
    displayName,
    autoVoice,
    activeTopic,
  ]);

  // Two-Way Interactive Dialogue Handler (Student asks question or sends response)
  const handleSendMessage = (textToSend?: string) => {
    const q = (textToSend || userInput).trim();
    if (!q) return;

    setUserInput('');
    const res = generateTutorResponse(q, {
      studentName: displayName,
      currentStep,
      activeTopic,
      selectedHypothesis,
      isHypothesisCorrect,
      liveCheckResult,
      studentSentence,
    });

    setDialogue(res.reply);
    setMood(res.mood);

    if (autoVoice) {
      speakText(res.reply);
    }
  };

  // Web Speech Recognition Microphone (Speak to Ella in Hindi/English)
  const handleToggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (typeof window === 'undefined') return;
    const win = window as any;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      const inputEl = document.getElementById('ella-user-input');
      inputEl?.focus();
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        setIsListening(false);
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start error:', e);
      setIsListening(false);
    }
  };

  // Step-specific Interactive Quick Reply Chips (1-tap socratic interaction)
  const quickChips = useMemo(() => {
    switch (currentStep) {
      case 'notice':
        return ['👂 उच्चारण में क्या फर्क है?', '💡 सरल शब्दों में समझाओ', '🔍 एक और उदाहरण दो'];
      case 'hypothesize':
        return ['🔍 एक हिंट दो', '🤔 स्पेलिंग vs आवाज़?', '💡 मुझे समझाओ'];
      case 'clarify':
        return ['👑 एक और उदाहरण दो', '📖 नियम दोहराओ', '🔍 समझ नहीं आया'];
      case 'use':
        return ['🔍 मेरी गलती बताओ', '💡 सही वाक्य दिखाओ', '✍️ वाक्य कैसे बनाऊँ?'];
      case 'schedule':
        return ['🧠 रिवीजन क्यों ज़रूरी है?', '🏆 मेरा स्कोर क्या है?'];
    }
  }, [currentStep]);

  // Render cartoon speech bubble graduated comic dots
  const renderComicDots = () => {
    if (bubblePlacement === 'left') {
      return (
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-200 shadow-2xs" />
          <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-200" />
          <span className="w-1.5 h-1.5 rounded-full bg-white border-2 border-indigo-200" />
        </div>
      );
    }
    if (bubblePlacement === 'right') {
      return (
        <div className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-white border-2 border-indigo-200" />
          <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-200 shadow-2xs" />
        </div>
      );
    }
    if (bubblePlacement === 'top') {
      return (
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-200 shadow-2xs" />
          <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-200" />
          <span className="w-1.5 h-1.5 rounded-full bg-white border-2 border-indigo-200" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-0.5 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-white border-2 border-indigo-200" />
        <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-200 shadow-2xs" />
      </div>
    );
  };

  const getFlexClass = () => {
    if (bubblePlacement === 'left') return 'flex-row items-center';
    if (bubblePlacement === 'right') return 'flex-row-reverse items-center';
    if (bubblePlacement === 'top') return 'flex-col items-center';
    return 'flex-col-reverse items-center';
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {/* Gliding Genie Container: shifts around screen every 90s */}
      <motion.div
        animate={{
          x: layout.containerX,
          y: layout.containerY,
        }}
        transition={{
          duration: 3.2,
          ease: [0.34, 1.15, 0.64, 1],
        }}
        className={`absolute pointer-events-auto flex ${getFlexClass()} gap-2`}
      >
        {/* Cartoon Oval Speech Bubble with 2-Way Interactive AI Tutoring */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-1.5"
            >
              {bubblePlacement === 'right' && renderComicDots()}

              {/* Bubbly Cartoon Oval Container */}
              <div
                style={{ width: layout.bubbleW }}
                className="relative px-4 sm:px-5 py-3 sm:py-3.5 bg-white/95 backdrop-blur-md border-2 border-indigo-200/90 rounded-[30px] sm:rounded-[36px] shadow-xl shadow-indigo-100/70 space-y-2"
              >
                {/* Header: Name + Pause/Mute + Minimize */}
                <div className="flex items-center justify-between gap-2 border-b border-indigo-50 pb-1">
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700">
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>एला जिनी (AI टीचर)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Proactive Auto-Voice Toggle / Pause */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !autoVoice;
                        setAutoVoice(next);
                        if (next) speakText(dialogue);
                      }}
                      className={`p-1 rounded-full transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-0.5 ${
                        autoVoice ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={autoVoice ? "टीचिंग पॉज़ / म्यूट करें" : "टीचिंग आवाज़ चालू करें"}
                    >
                      {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMinimized(true)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                      title="मिनीमाइज़ करें"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Analytical, concise teaching reply (2-3 sentences max) */}
                <p className="text-xs sm:text-[13px] text-slate-800 font-semibold leading-snug">
                  {dialogue}
                </p>

                {/* 1-Tap Socratic Quick Reply Chips: Student interacts with Ella */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="px-2 py-0.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200/60 rounded-full text-[10.5px] font-medium transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Two-Way Input: Speak (Mic) or Type to Ella directly! */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5 pt-1 border-t border-slate-100"
                >
                  <input
                    id="ella-user-input"
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="एला से पूछें (उदा. an क्यों?)..."
                    className="flex-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                  />

                  {/* Speech Recognition Mic */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title={isListening ? "सुन रही हूँ... (रोकने के लिए क्लिक करें)" : "बोलकर पूछें (माइक दबाएँ)"}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-full transition-all cursor-pointer shrink-0"
                    title="भेजें"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>

              {bubblePlacement === 'left' && renderComicDots()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical Comic Dots if placed Top or Bottom */}
        {!isMinimized && (bubblePlacement === 'top' || bubblePlacement === 'bottom') && renderComicDots()}

        {/* The Animated Magical Girl Genie Avatar with Real-Time Eye Tracking */}
        <motion.div
          ref={avatarRef}
          animate={{
            rotate: flightTilt,
          }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            if (isMinimized) {
              setIsMinimized(false);
            } else {
              handleSendMessage('मुझे एक जादुई टिप दो');
            }
          }}
          className="pointer-events-auto cursor-pointer relative group flex items-center shrink-0"
          title={isMinimized ? "एला जिनी से बात करें (क्लिक करें)" : "टैप करें और जादुई टिप पाएँ!"}
        >
          {isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-white border border-indigo-200 shadow-md rounded-full text-xs font-bold text-indigo-700 flex items-center gap-1 mr-2"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>एला</span>
              <ChevronUp className="w-3 h-3 text-slate-400" />
            </motion.div>
          )}

          {/* Floating Genie Glow Container with Sinusoidal Hover */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'easeInOut',
            }}
            className="relative w-16 h-18 sm:w-18 sm:h-20 drop-shadow-xl overflow-visible shrink-0"
          >
            {/* Animated SVG Girl Genie (100% visible, never disappears) */}
            <svg viewBox="0 0 100 115" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="genieHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="50%" stopColor="#9333EA" />
                  <stop offset="100%" stopColor="#6B21A8" />
                </linearGradient>

                <linearGradient id="genieSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF1F2" />
                  <stop offset="100%" stopColor="#FFE4E6" />
                </linearGradient>

                <linearGradient id="genieTailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#A855F7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
                </linearGradient>

                <linearGradient id="genieGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>

              {/* Floating Magical Cloud/Smoke Tail with dynamic wave */}
              <motion.path
                d="M 50 78 C 42 85 36 94 44 102 C 52 110 66 108 58 114 C 52 118 42 116 38 120"
                fill="none"
                stroke="url(#genieTailGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M 50 78 C 42 85 36 94 44 102 C 52 110 66 108 58 114 C 52 118 42 116 38 120",
                    "M 50 78 C 58 85 64 94 56 102 C 48 110 34 108 42 114 C 48 118 58 116 62 120",
                    "M 50 78 C 42 85 36 94 44 102 C 52 110 66 108 58 114 C 52 118 42 116 38 120",
                  ],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isFlying ? 1.0 : 2.2,
                  ease: 'easeInOut',
                }}
              />

              {/* Long Flowing Magical Back Hair */}
              <motion.path
                d="M 28 32 C 14 45 10 70 20 85 C 28 75 32 60 30 45 Z"
                fill="url(#genieHairGrad)"
                animate={{ rotate: isFlying ? [-6, 8, -6] : [-2, 3, -2] }}
                transition={{ repeat: Infinity, duration: isFlying ? 1.2 : 2.5, ease: 'easeInOut' }}
              />
              <motion.path
                d="M 72 32 C 86 45 90 70 80 85 C 72 75 68 60 70 45 Z"
                fill="url(#genieHairGrad)"
                animate={{ rotate: isFlying ? [6, -8, 6] : [2, -3, 2] }}
                transition={{ repeat: Infinity, duration: isFlying ? 1.2 : 2.5, ease: 'easeInOut' }}
              />

              {/* Genie Vest & Torso */}
              <path d="M 40 60 L 60 60 L 56 78 L 44 78 Z" fill="#6366F1" />
              {/* Golden Belt */}
              <rect x="42" y="74" width="16" height="4" rx="2" fill="url(#genieGoldGrad)" />

              {/* Arms / Hand Gestures */}
              {mood === 'waving' ? (
                <motion.path
                  d="M 38 64 C 28 60 20 48 24 38 C 28 36 32 46 36 58 Z"
                  fill="url(#genieSkinGrad)"
                  animate={{ rotate: [-10, 15, -10] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                />
              ) : mood === 'cheering' || mood === 'celebrating' ? (
                <>
                  <motion.path
                    d="M 38 64 C 28 50 20 34 26 28 C 30 32 34 48 38 58 Z"
                    fill="url(#genieSkinGrad)"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                  />
                  <motion.path
                    d="M 62 64 C 72 50 80 34 74 28 C 70 32 66 48 62 58 Z"
                    fill="url(#genieSkinGrad)"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                  />
                </>
              ) : (
                <path d="M 38 64 C 30 68 32 76 40 74 Z" fill="url(#genieSkinGrad)" />
              )}

              {/* Cute Head & Face */}
              <circle cx="50" cy="42" r="22" fill="url(#genieSkinGrad)" />

              {/* Cute Rosy Cheeks */}
              <ellipse cx="37" cy="48" rx="4" ry="2.5" fill="#FB7185" opacity="0.65" />
              <ellipse cx="63" cy="48" rx="4" ry="2.5" fill="#FB7185" opacity="0.65" />

              {/* Front Bangs / Hair Style */}
              <path
                d="M 28 34 C 32 20 45 16 50 16 C 55 16 68 20 72 34 C 68 28 60 26 50 28 C 40 26 32 28 28 34 Z"
                fill="url(#genieHairGrad)"
              />
              <path d="M 29 32 C 26 40 28 50 30 52 C 32 46 31 38 31 32 Z" fill="url(#genieHairGrad)" />
              <path d="M 71 32 C 74 40 72 50 70 52 C 68 46 69 38 69 32 Z" fill="url(#genieHairGrad)" />

              {/* Golden Tiara with Ruby Gem */}
              <polygon points="50,11 44,18 56,18" fill="url(#genieGoldGrad)" />
              <circle cx="50" cy="16" r="2.5" fill="#EF4444" />

              {/* Cursor Eye Tracking */}
              <ellipse cx="40" cy="42" rx="7.5" ry="9" fill="#FFFFFF" stroke="#312E81" strokeWidth="1.2" />
              <ellipse cx="60" cy="42" rx="7.5" ry="9" fill="#FFFFFF" stroke="#312E81" strokeWidth="1.2" />

              {mood === 'cheering' || mood === 'celebrating' ? (
                <>
                  <path d="M 34 43 Q 40 37 46 43" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 54 43 Q 60 37 66 43" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Pupil (Tracks Cursor) */}
                  <g style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`, transition: 'transform 0.05s ease-out' }}>
                    <ellipse cx="40" cy="42" rx="4.8" ry="6.2" fill="#4C1D95" />
                    <ellipse cx="40" cy="43" rx="3.5" ry="4.5" fill="#7C3AED" />
                    <circle cx="41.5" cy="39.5" r="1.8" fill="#FFFFFF" />
                    <circle cx="38.5" cy="44.5" r="0.9" fill="#FFFFFF" />
                  </g>

                  {/* Right Pupil (Tracks Cursor) */}
                  <g style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`, transition: 'transform 0.05s ease-out' }}>
                    <ellipse cx="60" cy="42" rx="4.8" ry="6.2" fill="#4C1D95" />
                    <ellipse cx="60" cy="43" rx="3.5" ry="4.5" fill="#7C3AED" />
                    <circle cx="61.5" cy="39.5" r="1.8" fill="#FFFFFF" />
                    <circle cx="58.5" cy="44.5" r="0.9" fill="#FFFFFF" />
                  </g>
                </>
              )}

              {/* Eyelashes */}
              <path d="M 33 36 Q 40 33 47 36" stroke="#312E81" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 53 36 Q 60 33 67 36" stroke="#312E81" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Smiling Mouth */}
              <path d="M 46 51 Q 50 54 54 51" stroke="#E11D48" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* Sparkles */}
              <motion.circle
                cx="22"
                cy="25"
                r="2.5"
                fill="#FDE047"
                animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              />
              <motion.circle
                cx="78"
                cy="28"
                r="2"
                fill="#F43F5E"
                animate={{ scale: [1.2, 0.5, 1.2], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </svg>

            {/* Pulse ring indicator */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border-2 border-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-white rounded-full shadow-xs" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
