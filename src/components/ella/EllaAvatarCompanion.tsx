import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp, Heart, Wand2, Wind } from 'lucide-react';
import type { StepKey } from './PracticeCycleView';
import type { RuleCheckResult } from '../../engines/offlineRuleEngine';

export type EllaMood = 'waving' | 'thinking' | 'cheering' | 'guiding' | 'celebrating';

export type FlightZone = 'bottom-right' | 'mid-left' | 'bottom-left' | 'mid-right' | 'top-right' | 'top-left';

interface ZoneCoordinates {
  x: number;
  y: number;
  side: 'left' | 'right';
  isTop: boolean;
  nameHi: string;
}

interface EllaAvatarCompanionProps {
  currentStep: StepKey;
  studentName: string;
  selectedHypothesis: number | null;
  isHypothesisCorrect: boolean | null;
  liveCheckResult: RuleCheckResult;
  studentSentence: string;
  isSavedToDb: boolean;
  speakText: (text: string) => void;
}

// Compute safe screen coordinates for each zone
const getZoneCoordinates = (zone: FlightZone, width: number, height: number): ZoneCoordinates => {
  const isSmallScreen = width < 640;
  const marginX = isSmallScreen ? 12 : 28;
  const marginY = isSmallScreen ? 16 : 24;
  const avatarWidth = isSmallScreen ? 72 : 84;
  const avatarHeight = isSmallScreen ? 88 : 96;

  switch (zone) {
    case 'bottom-right':
      return {
        x: Math.max(16, width - avatarWidth - marginX),
        y: Math.max(16, height - avatarHeight - marginY - 12),
        side: 'right',
        isTop: false,
        nameHi: 'दाएं नीचे',
      };
    case 'mid-left':
      return {
        x: marginX,
        y: Math.max(90, Math.min(height * 0.45, height - avatarHeight - 80)),
        side: 'left',
        isTop: false,
        nameHi: 'बाएं बीच में',
      };
    case 'bottom-left':
      return {
        x: marginX,
        y: Math.max(16, height - avatarHeight - marginY - 12),
        side: 'left',
        isTop: false,
        nameHi: 'बाएं नीचे',
      };
    case 'mid-right':
      return {
        x: Math.max(16, width - avatarWidth - marginX),
        y: Math.max(90, Math.min(height * 0.45, height - avatarHeight - 80)),
        side: 'right',
        isTop: false,
        nameHi: 'दाएं बीच में',
      };
    case 'top-right':
      return {
        x: Math.max(16, width - avatarWidth - marginX),
        y: isSmallScreen ? 80 : 96,
        side: 'right',
        isTop: true,
        nameHi: 'दाएं ऊपर',
      };
    case 'top-left':
      return {
        x: marginX,
        y: isSmallScreen ? 80 : 96,
        side: 'left',
        isTop: true,
        nameHi: 'बाएं ऊपर',
      };
  }
};

export const EllaAvatarCompanion: React.FC<EllaAvatarCompanionProps> = ({
  currentStep,
  studentName,
  selectedHypothesis,
  isHypothesisCorrect,
  liveCheckResult,
  studentSentence,
  isSavedToDb,
  speakText,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [mood, setMood] = useState<EllaMood>('waving');
  const [dialogue, setDialogue] = useState<string>('');
  const [autoVoice, setAutoVoice] = useState(true);
  const [autoFlight, setAutoFlight] = useState(true);
  const [clickCount, setClickCount] = useState(0);

  // Flying Position State (Autonomous Flight every 20-30 seconds)
  const [currentZone, setCurrentZone] = useState<FlightZone>('bottom-right');
  const [isFlying, setIsFlying] = useState(false);
  const [flightTilt, setFlightTilt] = useState(0);

  // Screen size tracking for responsive flight anchors
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

  // Eye Tracking State: (dx, dy) offset for pupils
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const avatarRef = useRef<HTMLDivElement>(null);

  const displayName = studentName?.trim() || 'Ishu';

  // Compute live coordinates based on currentZone and viewport
  const coords = useMemo(() => {
    return getZoneCoordinates(currentZone, screenSize.w, screenSize.h);
  }, [currentZone, screenSize.w, screenSize.h]);

  // Real-time Mouse / Touch Eye Tracking (dynamically follows cursor from current flying spot)
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
        // Maximum pupil displacement in pixels
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

  // Autonomous Flight: Change spot smoothly every 20-30 seconds!
  const flyToNextZone = (targetZone?: FlightZone) => {
    const allZones: FlightZone[] = ['bottom-right', 'mid-left', 'bottom-left', 'mid-right', 'top-right', 'top-left'];
    const available = allZones.filter((z) => z !== currentZone);
    const next = targetZone || available[Math.floor(Math.random() * available.length)];

    setIsFlying(true);
    const curr = getZoneCoordinates(currentZone, screenSize.w, screenSize.h);
    const target = getZoneCoordinates(next, screenSize.w, screenSize.h);

    // Gently tilt towards direction of flight
    const tilt = target.x > curr.x ? 9 : -9;
    setFlightTilt(tilt);
    setCurrentZone(next);

    // Flight animation duration (3.2s of leisurely magical glide)
    setTimeout(() => {
      setIsFlying(false);
      setFlightTilt(0);
    }, 3200);
  };

  useEffect(() => {
    if (!autoFlight) return;

    // Pick random delay between 20 and 30 seconds
    const delay = 20000 + Math.random() * 10000;
    const timer = setTimeout(() => {
      flyToNextZone();
    }, delay);

    return () => clearTimeout(timer);
  }, [currentZone, autoFlight, screenSize]);

  // Random fun motivational tips when Ishu taps on Ella Genie
  const funTips = [
    `शानदार जा रहे हो ${displayName}! हर गलती से हम एक नया नियम सीखते हैं! 🚀`,
    `पता है ${displayName}? इंग्लिश का असली सीक्रेट है: स्पेलिंग मत रटो, बस आवाज़ (Sound) सुनो! ✨`,
    `तुम्हारा फोकस बहुत कमाल का है ${displayName}! You're a rockstar! 🎸`,
    `जब भी कोई डाउट हो, बस मुझे याद करना! मैं तुम्हारी जादुई इंग्लिश जिनी हूँ! 🧞‍♀️`,
    `तुम बहुत तेजी से सीख रहे हो ${displayName}! Keep shining bright! 🌟`,
    `देखा ${displayName}! मैं अब स्क्रीन पर इधर-उधर उड़कर तुम्हारी मदद कर रही हूँ! 🎈`,
  ];

  // Dynamic dialogue & mood engine based on real-time learner state
  useEffect(() => {
    let newDialogue = '';
    let newMood: EllaMood = 'waving';

    // Priority 1: Step 4 (Sentence Builder - Use)
    if (currentStep === 'use') {
      if (isSavedToDb) {
        newMood = 'celebrating';
        newDialogue = `वाह ${displayName}! आपकी आज की मेहनत सुरक्षित सेव हो गई! 💾✨`;
      } else if (studentSentence.trim().length > 0 && liveCheckResult.errors.length === 0) {
        newMood = 'cheering';
        newDialogue = `सुपरस्टार ${displayName}! 🎉 आपका वाक्य 100% सही और परफेक्ट है! अब 'प्रगति सेव करें' पर क्लिक करो!`;
      } else if (liveCheckResult.errors.length > 0) {
        newMood = 'guiding';
        newDialogue = `अरे ${displayName}, एक छोटा सा सुधार बाकी है! 💡 नीचे 'सुधारें (Apply Fix)' पर क्लिक करो!`;
      } else {
        newMood = 'guiding';
        newDialogue = `चलो ${displayName}, अब अपनी बारी है! ऊपर दिए बॉक्स में अपना एक प्यारा सा वाक्य लिखो ✍️`;
      }
    } else if (currentStep === 'hypothesize') {
      // Priority 2: Step 2 (Hypothesize)
      if (selectedHypothesis !== null) {
        if (isHypothesisCorrect) {
          newMood = 'celebrating';
          newDialogue = `कमाल कर दिया ${displayName}! 🎯 आपका अंदाज़ा 100% सही निकला! अब चलो सीक्रेट फॉर्मूला अनलॉक करें!`;
        } else {
          newMood = 'thinking';
          newDialogue = `कोई बात नहीं ${displayName}! एक बार शब्द को बोलकर देखो, फिर सोचो पहली आवाज़ क्या है? 💪`;
        }
      } else {
        newMood = 'thinking';
        newDialogue = `सोचो-सोचो ${displayName}! 💡 क्या स्पेलिंग से नियम बनता है या बोलने की आवाज़ (Sound) से?`;
      }
    } else if (currentStep === 'notice') {
      // Priority 3: Step 1 (Notice)
      newMood = 'waving';
      newDialogue = `हाय ${displayName}! मैं हूँ एला, आपकी जादुई जिनी 🧞‍♀️! इन उदाहरणों को सुनो, तुम्हें क्या फर्क दिखा?`;
    } else if (currentStep === 'clarify') {
      // Priority 4: Step 3 (Clarify)
      newMood = 'guiding';
      newDialogue = `ये रहा आज का असली सीक्रेट फॉर्मूला, ${displayName}! 👑 इसे याद रखो, कभी गलती नहीं होगी!`;
    } else if (currentStep === 'schedule') {
      // Priority 5: Step 5 (Schedule & FSRS)
      newMood = 'celebrating';
      newDialogue = `मिशन पूरा हुआ ${displayName}! 🏆 खुद को स्टार रेटिंग दो ताकि मैं सही समय पर रिवीजन याद दिला सकूँ!`;
    }

    setMood(newMood);
    setDialogue(newDialogue);

    // Auto-Speak feature: speak automatically on context change without requiring button press!
    if (autoVoice && newDialogue) {
      const timer = setTimeout(() => {
        speakText(newDialogue);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentStep, selectedHypothesis, isHypothesisCorrect, liveCheckResult.errors.length, liveCheckResult.isValid, isSavedToDb, displayName, autoVoice]);

  const handleAvatarClick = () => {
    setMood('cheering');
    const nextIndex = (clickCount + 1) % funTips.length;
    setClickCount(nextIndex);
    const tip = funTips[nextIndex];
    setDialogue(tip);
    speakText(tip);
  };

  const isLeft = coords.side === 'left';
  const isTop = coords.isTop;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {/* Gliding Genie Container: smoothly swoops to new coordinates across the screen */}
      <motion.div
        animate={{
          x: coords.x,
          y: coords.y,
        }}
        transition={{
          duration: 3.2,
          ease: [0.34, 1.25, 0.64, 1], // Gentle magical swoop curve
        }}
        className={`absolute pointer-events-auto flex ${
          isTop ? 'flex-col-reverse justify-end' : 'flex-col justify-end'
        } ${isLeft ? 'items-start' : 'items-end'}`}
        style={{ width: isMinimized ? 'auto' : 320 }}
      >
        {/* Friendly Speech Bubble */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: isFlying ? 0.2 : 1,
                scale: isFlying ? 0.85 : 1,
              }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25 }}
              className={`max-w-xs sm:max-w-sm pointer-events-auto ${isTop ? 'mt-2' : 'mb-2'}`}
            >
              <div className="relative p-4 bg-white/95 backdrop-blur-md border-2 border-indigo-200/90 rounded-3xl shadow-2xl shadow-indigo-200/60 space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-indigo-50 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>एला जिनी 🧞‍♀️</span>
                    <span className="text-[10px] font-medium text-purple-700 bg-purple-50 border border-purple-200/60 px-1.5 py-0.2 rounded-full">
                      {coords.nameHi}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Manual Fly Button */}
                    <button
                      type="button"
                      onClick={() => flyToNextZone()}
                      className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5 text-[11px] font-bold"
                      title="जादुई उड़ान भरें (Fly to next corner)"
                    >
                      <Wind className="w-3.5 h-3.5" />
                    </button>

                    {/* Auto-Flight Toggle */}
                    <button
                      type="button"
                      onClick={() => setAutoFlight(!autoFlight)}
                      className={`px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer text-[10px] font-bold ${
                        autoFlight ? 'text-purple-700 bg-purple-100/70' : 'text-slate-400 bg-slate-100'
                      }`}
                      title={autoFlight ? "ऑटो-फ़्लाई चालू है (हर 20-30s में नई जगह उड़ना)" : "ऑटो-फ़्लाई बंद है (क्लिक करके चालू करें)"}
                    >
                      {autoFlight ? 'उड़ती' : 'स्थिर'}
                    </button>

                    {/* Auto Voice Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !autoVoice;
                        setAutoVoice(next);
                        if (next) speakText("ऑटो-वॉइस चालू है!");
                      }}
                      className={`p-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                        autoVoice ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={autoVoice ? "ऑटो-वॉइस चालू है (क्लिक करके म्यूट करें)" : "ऑटो-वॉइस बंद है (क्लिक करके चालू करें)"}
                    >
                      {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => speakText(dialogue)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="दोबारा सुनें"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMinimized(true)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="मिनीमाइज़ करें"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {dialogue}
                </p>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="hover:text-indigo-600 cursor-pointer flex items-center gap-1" onClick={handleAvatarClick}>
                    <Wand2 className="w-3 h-3 text-amber-500" />
                    <span>टैप करें जादुई टिप के लिए!</span>
                  </span>
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-300" />
                </div>

                {/* Dynamic Tail pointing towards avatar */}
                {!isTop ? (
                  <div
                    className={`absolute -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-200 rotate-45 transform ${
                      isLeft ? 'left-9' : 'right-9'
                    }`}
                  />
                ) : (
                  <div
                    className={`absolute -top-2 w-4 h-4 bg-white border-l-2 border-t-2 border-indigo-200 rotate-45 transform ${
                      isLeft ? 'left-9' : 'right-9'
                    }`}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Animated Magical Girl Genie Avatar with Real-Time Eye Tracking */}
        <motion.div
          ref={avatarRef}
          animate={{
            rotate: flightTilt,
            scale: isFlying ? 1.05 : 1,
          }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.94 }}
          onClick={isMinimized ? () => setIsMinimized(false) : handleAvatarClick}
          className="pointer-events-auto cursor-pointer relative group flex items-center gap-2"
          title={isMinimized ? "एला जिनी से बात करें (Open)" : "टैप करें और जादुई प्रेरणा पाएँ!"}
        >
          {isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1.5 bg-white border border-indigo-200 shadow-md rounded-full text-xs font-bold text-indigo-700 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>एला जिनी 🧞‍♀️</span>
              <ChevronUp className="w-3 h-3 text-slate-400" />
            </motion.div>
          )}

          {/* Floating Genie Glow Container with sinusoidal hover bobbing */}
          <motion.div
            animate={{ y: isFlying ? [0, -12, 0] : [0, -6, 0] }}
            transition={{
              repeat: Infinity,
              duration: isFlying ? 1.2 : 2.8,
              ease: 'easeInOut',
            }}
            className="relative w-16 h-18 sm:w-18 sm:h-20 drop-shadow-xl overflow-visible"
          >
            {/* Animated SVG Girl Genie */}
            <svg viewBox="0 0 100 115" className="w-full h-full overflow-visible">
              <defs>
                {/* Hair Gradient */}
                <linearGradient id="genieHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="50%" stopColor="#9333EA" />
                  <stop offset="100%" stopColor="#6B21A8" />
                </linearGradient>

                {/* Magical Skin Tone */}
                <linearGradient id="genieSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF1F2" />
                  <stop offset="100%" stopColor="#FFE4E6" />
                </linearGradient>

                {/* Magical Swirling Genie Smoke Tail */}
                <linearGradient id="genieTailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity="0.95" />
                  <stop offset="40%" stopColor="#A855F7" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
                </linearGradient>

                {/* Golden Accents */}
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
              {/* Side Tendrils */}
              <path d="M 29 32 C 26 40 28 50 30 52 C 32 46 31 38 31 32 Z" fill="url(#genieHairGrad)" />
              <path d="M 71 32 C 74 40 72 50 70 52 C 68 46 69 38 69 32 Z" fill="url(#genieHairGrad)" />

              {/* Golden Tiara with Ruby Gem */}
              <polygon points="50,11 44,18 56,18" fill="url(#genieGoldGrad)" />
              <circle cx="50" cy="16" r="2.5" fill="#EF4444" />

              {/* ======================================================== */}
              {/* INTERACTIVE CURSOR-TRACKING EYES                         */}
              {/* ======================================================== */}
              {/* Left Eye White */}
              <ellipse cx="40" cy="42" rx="7.5" ry="9" fill="#FFFFFF" stroke="#312E81" strokeWidth="1.2" />
              {/* Right Eye White */}
              <ellipse cx="60" cy="42" rx="7.5" ry="9" fill="#FFFFFF" stroke="#312E81" strokeWidth="1.2" />

              {/* Pupils tracking mouse cursor smoothly */}
              {mood === 'cheering' || mood === 'celebrating' ? (
                // Happy smiling closed eyes ^ ^
                <>
                  <path d="M 34 43 Q 40 37 46 43" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 54 43 Q 60 37 66 43" stroke="#4C1D95" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </>
              ) : (
                <>
                  {/* Left Pupil (Tracks Cursor from Live Flight Coordinates) */}
                  <g style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`, transition: 'transform 0.05s ease-out' }}>
                    <ellipse cx="40" cy="42" rx="4.8" ry="6.2" fill="#4C1D95" />
                    <ellipse cx="40" cy="43" rx="3.5" ry="4.5" fill="#7C3AED" />
                    {/* Catchlight sparkles in eyes */}
                    <circle cx="41.5" cy="39.5" r="1.8" fill="#FFFFFF" />
                    <circle cx="38.5" cy="44.5" r="0.9" fill="#FFFFFF" />
                  </g>

                  {/* Right Pupil (Tracks Cursor from Live Flight Coordinates) */}
                  <g style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`, transition: 'transform 0.05s ease-out' }}>
                    <ellipse cx="60" cy="42" rx="4.8" ry="6.2" fill="#4C1D95" />
                    <ellipse cx="60" cy="43" rx="3.5" ry="4.5" fill="#7C3AED" />
                    {/* Catchlight sparkles in eyes */}
                    <circle cx="61.5" cy="39.5" r="1.8" fill="#FFFFFF" />
                    <circle cx="58.5" cy="44.5" r="0.9" fill="#FFFFFF" />
                  </g>
                </>
              )}

              {/* Eyelashes */}
              <path d="M 33 36 Q 40 33 47 36" stroke="#312E81" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 53 36 Q 60 33 67 36" stroke="#312E81" strokeWidth="1.5" fill="none" strokeLinecap="round" />

              {/* Sweet Smiling Mouth */}
              <path d="M 46 51 Q 50 54 54 51" stroke="#E11D48" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* Floating Magic Sparkles Around Genie */}
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
              <motion.circle
                cx="76"
                cy="65"
                r="2.2"
                fill="#A855F7"
                animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </svg>

            {/* Glowing Flight Trail Sparkle effect when flying */}
            {isFlying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.3, 0.8],
                  x: flightTilt > 0 ? [-10, -25, -35] : [10, 25, 35],
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="absolute -bottom-3 pointer-events-none flex items-center gap-1 text-amber-400 drop-shadow-md text-xs font-bold"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-purple-700 font-extrabold bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs">
                  ✨ उड़ रही हूँ...
                </span>
              </motion.div>
            )}

            {/* Pulse ring indicator */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 border-2 border-white rounded-full shadow-xs" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
