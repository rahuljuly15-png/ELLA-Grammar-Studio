import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, ChevronDown, ChevronUp, Mic, MicOff, Send, Zap, Pause, Play, Move } from 'lucide-react';
import type { StepKey } from './PracticeCycleView';
import type { RuleCheckResult } from '../../engines/offlineRuleEngine';
import type { FullTopicData } from '../../data/topicLoader';
import { getProactiveTeachingDialogue, generateTutorResponse } from '../../engines/ellaTutorEngine';
import { askEllaAI, getStoredGeminiKey } from '../../services/geminiService';
import { useLanguage } from '../../i18n/LanguageContext';

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
  const { language, t } = useLanguage();
  // Lamp Mode: true = collapsed into Golden Magic Lamp (चिराग), false = dialogue bubble expanded
  const [isLampMode, setIsLampMode] = useState(false);
  // Expandable Q&A input: false = slim compact tip, true = input field & mic visible
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [mood, setMood] = useState<EllaMood>('waving');
  const [dialogue, setDialogue] = useState<string>('');
  const [autoVoice, setAutoVoice] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(() => !!getStoredGeminiKey());

  // Pause State: stops autonomous flight and auto-voice
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ella_genie_paused') === 'true';
    }
    return false;
  });

  // Custom Dragged Position of Ella the Genie directly (allows placing in exact corner)
  const [customCoords, setCustomCoords] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    origX: number;
    origY: number;
    moved: boolean;
  }>({
    pointerX: 0,
    pointerY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });

  useEffect(() => {
    setHasGeminiKey(!!getStoredGeminiKey());
  }, []);

  const handleTogglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    if (typeof window !== 'undefined') {
      if (next) {
        localStorage.setItem('ella_genie_paused', 'true');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } else {
        localStorage.removeItem('ella_genie_paused');
      }
    }
  };

  // Flight spot
  const [currentSpotIndex, setCurrentSpotIndex] = useState(0);
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

  // Exact coordinates of Ella the Genie & Lamp
  const geniePos = useMemo(() => {
    if (customCoords) return customCoords;
    return currentSpot.getGenieCoords(screenSize.w, screenSize.h);
  }, [customCoords, currentSpot, screenSize]);

  // Dynamic calculations for Dialogue Bubble:
  // Automatically switches side (Right or Left) based on Ella's screen location!
  const bubbleLayout = useMemo(() => {
    const isSmall = screenSize.w < 640;
    const bubbleW = isSmall ? Math.min(screenSize.w - 100, 270) : 310;
    const isLeft = geniePos.x < screenSize.w / 2;

    // If Ella is on the left half of the screen, bubble MUST be on her RIGHT
    // If Ella is on the right half of the screen, bubble MUST be on her LEFT
    let bubbleX = isLeft
      ? geniePos.x + 86
      : geniePos.x - bubbleW - 14;

    // Clamp strictly within viewport borders so it never hangs off or blocks the edge
    bubbleX = Math.max(10, Math.min(screenSize.w - bubbleW - 12, bubbleX));

    // Vertical placement: align smoothly with Ella
    const isNearTop = geniePos.y < 160;
    const isNearBottom = geniePos.y > screenSize.h - 220;

    let bubbleY = geniePos.y;
    if (isNearTop) {
      bubbleY = Math.max(75, Math.min(geniePos.y, screenSize.h - 200));
    } else if (isNearBottom) {
      bubbleY = Math.max(75, geniePos.y - 70);
    } else {
      bubbleY = Math.max(75, Math.min(geniePos.y - 15, screenSize.h - 200));
    }

    return {
      isLeft,
      bubbleX,
      bubbleY,
      bubbleW,
    };
  }, [geniePos, screenSize]);

  // Drag and Drop pointer handlers: student grabs Ella directly to place her anywhere
  const handleDragPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Left-click or touch only

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      origX: geniePos.x,
      origY: geniePos.y,
      moved: false,
    };

    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleDragPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    if (Math.hypot(dx, dy) > 4) {
      dragStartRef.current.moved = true;
    }

    const genieW = 80;
    const genieH = 145;

    // Allows dragging all the way to the very edge/corner (10px from edge!)
    const maxX = Math.max(10, screenSize.w - genieW - 10);
    const maxY = Math.max(75, screenSize.h - genieH - 10);

    const newX = Math.max(10, Math.min(maxX, dragStartRef.current.origX + dx));
    const newY = Math.max(75, Math.min(maxY, dragStartRef.current.origY + dy));

    setCustomCoords({ x: newX, y: newY });
  };

  const handleDragPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    // If the student moved the avatar, pause autonomous flight so it stays right here
    if (dragStartRef.current.moved) {
      setIsPaused(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ella_genie_paused', 'true');
      }
    }
  };

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
    setCustomCoords(null); // Release custom pinned coordinates to rejoin flight path
    setIsFlying(true);

    const nextIndex = (currentSpotIndex + 1) % SPOTS.length;
    const nextSpot = SPOTS[nextIndex];

    const currentCoords = currentSpot.getGenieCoords(screenSize.w, screenSize.h);
    const nextCoords = nextSpot.getGenieCoords(screenSize.w, screenSize.h);

    const tilt = nextCoords.x > currentCoords.x ? 8 : -8;
    setFlightTilt(tilt);

    setCurrentSpotIndex(nextIndex);

    setTimeout(() => {
      setIsFlying(false);
      setFlightTilt(0);
    }, 3200);
  };

  useEffect(() => {
    if (flightIntervalSeconds === 0 || isPaused) return;

    const intervalMs = Math.max(30, flightIntervalSeconds) * 1000;
    const timer = setTimeout(() => {
      flyToNextSpot();
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [currentSpotIndex, flightIntervalSeconds, screenSize, isPaused]);

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
      language,
    });

    setDialogue(tutorState.reply);
    setMood(tutorState.mood);

    // Proactive Auto-Voice: Speaks automatically if not paused!
    if (!isPaused && autoVoice && tutorState.reply) {
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
    language,
    isPaused,
  ]);

  // Two-Way Interactive Dialogue Handler (Uses Google Gemini AI if connected, else Offline Engine)
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || userInput).trim();
    if (!q) return;

    setUserInput('');
    const geminiKey = getStoredGeminiKey();

    if (geminiKey) {
      setIsGeneratingAI(true);
      const option = selectedHypothesis !== null
        ? activeTopic.steps['2_hypothesize']?.options[selectedHypothesis]
        : null;

      const aiReply = await askEllaAI(q, {
        studentName: displayName,
        currentStep,
        topicTitle: activeTopic.title || 'English Grammar',
        goldenRule: activeTopic.steps['3_clarify']?.goldenRuleHi,
        studentSentence,
        errors: liveCheckResult.errors.map((e) => `${e.matchedText} -> ${e.suggestedText} (${e.explanationHi})`),
        selectedHypothesisText: option?.textHi,
        isHypothesisCorrect,
        language,
      });

      setIsGeneratingAI(false);

      if (aiReply) {
        setDialogue(aiReply);
        setMood('cheering');
        if (autoVoice) {
          speakText(aiReply);
        }
        return;
      }
    }

    // Offline Socratic ESL Brain Fallback
    const res = generateTutorResponse(q, {
      studentName: displayName,
      currentStep,
      activeTopic,
      selectedHypothesis,
      isHypothesisCorrect,
      liveCheckResult,
      studentSentence,
      language,
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
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';
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
    if (language === 'en') {
      switch (currentStep) {
        case 'notice':
          return ['👂 What is the sound difference?', '💡 Explain simply', '🔍 One more example'];
        case 'hypothesize':
          return ['🔍 Give me a clue', '🤔 Spelling vs Sound?', '💡 Explain rule'];
        case 'clarify':
          return ['👑 Give another example', '📖 Repeat the rule', '🔍 I have a doubt'];
        case 'use':
          return ['🔍 Check my mistake', '💡 Show correct sentence', '✍️ How do I write it?'];
        case 'schedule':
          return ['🧠 Why is review important?', '🏆 What is my score?'];
      }
    }
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
  }, [currentStep, language]);

  // Render cartoon speech bubble comic dots pointing towards Ella
  const renderComicDotsLeft = () => (
    <div className="flex items-center gap-1 shrink-0 mr-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-white border-2 border-indigo-200" />
      <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-200" />
      <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-200 shadow-2xs" />
    </div>
  );

  const renderComicDotsRight = () => (
    <div className="flex items-center gap-1 shrink-0 ml-1.5">
      <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-200 shadow-2xs" />
      <span className="w-2 h-2 rounded-full bg-white border-2 border-indigo-200" />
      <span className="w-1.5 h-1.5 rounded-full bg-white border-2 border-indigo-200" />
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 1. DYNAMIC AUTO-ORIENTED SPEECH BUBBLE                   */}
      {/* Automatically opens to Right or Left based on Ella's pos */}
      {/* ======================================================== */}
      <AnimatePresence>
        {!isLampMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: bubbleLayout.bubbleX,
              y: bubbleLayout.bubbleY,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: isDragging ? 0 : 0.25,
              ease: 'easeOut',
            }}
            style={{ left: 0, top: 0 }}
            className={`absolute pointer-events-auto z-50 flex items-center ${
              bubbleLayout.isLeft ? 'flex-row' : 'flex-row-reverse'
            }`}
          >
            {/* Comic dots pointing towards Ella */}
            {bubbleLayout.isLeft ? renderComicDotsLeft() : renderComicDotsRight()}

            {/* Bubbly Cartoon Oval Speech Card (Compact & Auto-adjusting) */}
            <div
              style={{ width: bubbleLayout.bubbleW }}
              className="relative px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white/95 backdrop-blur-md border-2 border-indigo-200/90 rounded-[26px] sm:rounded-[30px] shadow-xl shadow-indigo-100/70 space-y-2 max-w-[320px]"
            >
              {/* Header: Name + Pause + Auto-Voice + Tuck into Lamp */}
              <div className="flex items-center justify-between gap-1.5 border-b border-indigo-50 pb-1 select-none">
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700">
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="truncate">{t('genie_title')}</span>
                  {hasGeminiKey && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1 py-0.2 rounded-full flex items-center gap-0.5 shrink-0">
                      <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                      <span>AI</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Pause / Resume Button */}
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className={`p-1 rounded-full transition-all cursor-pointer text-[10px] font-bold flex items-center gap-0.5 ${
                      isPaused
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                    title={isPaused ? t('genie_resume_btn') : t('genie_pause_btn')}
                  >
                    {isPaused ? <Play className="w-3 h-3 text-amber-700 fill-amber-700" /> : <Pause className="w-3 h-3" />}
                  </button>

                  {/* Proactive Auto-Voice Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !autoVoice;
                      setAutoVoice(next);
                      if (next && !isPaused) speakText(dialogue);
                    }}
                    className={`p-1 rounded-full transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-0.5 ${
                      autoVoice ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={autoVoice ? "टीचिंग पॉज़ / म्यूट करें" : "टीचिंग आवाज़ चालू करें"}
                  >
                    {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>

                  {/* Tuck into Lamp Button (User Request: Collapse box into Magic Lamp) */}
                  <button
                    type="button"
                    onClick={() => setIsLampMode(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full transition-all cursor-pointer shadow-2xs"
                    title={t('genie_lamp_tuck')}
                  >
                    <span>🪔</span>
                    <span className="hidden sm:inline">{language === 'en' ? 'Lamp' : 'चिराग'}</span>
                    <span className="text-slate-400 font-bold ml-0.5">✕</span>
                  </button>
                </div>
              </div>

              {/* Analytical, concise teaching reply or thinking indicator */}
              {isGeneratingAI ? (
                <div className="flex items-center gap-1.5 py-1 text-xs text-indigo-600 font-bold animate-pulse">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{t('genie_thinking')} ✨</span>
                </div>
              ) : (
                <p className="text-xs sm:text-[12.5px] text-slate-800 font-semibold leading-snug">
                  {dialogue}
                </p>
              )}

              {/* Action footer: 1-2 Quick Reaction Chips + Ask Ella button */}
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-100">
                <div className="flex flex-wrap gap-1">
                  {quickChips.slice(0, 2).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-medium transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuestionOpen(!isQuestionOpen)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-indigo-50/80 cursor-pointer"
                >
                  <span>💬 {t('genie_ask_btn')}</span>
                </button>
              </div>

              {/* Expandable Two-Way Input: Speak or Type to Ella (Only when opened) */}
              {isQuestionOpen && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1 pt-1.5 border-t border-indigo-50 animate-in fade-in duration-150"
                >
                  <input
                    id="ella-user-input"
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={t('genie_input_placeholder')}
                    className="flex-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                  />

                  {/* Speech Recognition Mic */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 ${
                      isListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title={isListening ? "सुन रही हूँ..." : "बोलकर पूछें"}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  </button>

                  <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="p-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-full transition-all cursor-pointer shrink-0"
                    title="भेजें"
                  >
                    <Send className="w-2.5 h-2.5" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 2. THE MAGICAL GIRL GENIE & HER GOLDEN MAGIC LAMP (चिराग) */}
      {/* Directly draggable to any corner of the screen           */}
      {/* ======================================================== */}
      <motion.div
        animate={{
          x: geniePos.x,
          y: geniePos.y,
        }}
        transition={
          isDragging
            ? { duration: 0 }
            : {
                duration: 2.8,
                ease: [0.34, 1.15, 0.64, 1],
              }
        }
        style={{ left: 0, top: 0 }}
        className="absolute pointer-events-auto z-40 select-none"
      >
        <motion.div
          ref={avatarRef}
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handleDragPointerUp}
          onPointerCancel={handleDragPointerUp}
          animate={{
            rotate: flightTilt,
          }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: isDragging ? 1.05 : 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            if (dragStartRef.current.moved) return;
            // Clicking Ella or her Lamp toggles the dialogue bubble open / closed!
            setIsLampMode(!isLampMode);
          }}
          className={`relative group flex flex-col items-center shrink-0 touch-none select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          title={`${t('genie_drag_tooltip')} • ${t('genie_lamp_tip')}`}
        >
          {/* Paused floating status badge */}
          {isPaused && (
            <span
              className="absolute -top-1.5 -left-1.5 z-20 px-1.5 py-0.5 bg-amber-500 border-2 border-white rounded-full text-[9px] font-extrabold text-white flex items-center gap-0.5 shadow-xs"
              title={t('genie_paused_badge')}
            >
              ⏸
            </span>
          )}

          {/* Hover Drag Helper Pill */}
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-700/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm whitespace-nowrap pointer-events-none z-20">
            <Move className="w-2.5 h-2.5" />
            <span>{language === 'en' ? 'Drag me' : 'पकड़कर घुमाएँ'}</span>
          </span>

          {/* Floating Genie Glow Container with Sinusoidal Hover */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'easeInOut',
            }}
            className="relative w-18 h-24 sm:w-20 sm:h-26 drop-shadow-xl overflow-visible shrink-0"
          >
            {/* Animated SVG Girl Genie + Golden Magic Lamp (चिराग) */}
            <svg viewBox="0 0 100 148" className="w-full h-full overflow-visible">
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
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
                </linearGradient>

                {/* Burnished Brass Gold for Magic Lamp (जादुई चिराग) */}
                <linearGradient id="magicLampGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="25%" stopColor="#F59E0B" />
                  <stop offset="70%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                <filter id="lampGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Floating Magical Cloud/Smoke Tail emerging out of Lamp Spout (27, 108) */}
              <motion.path
                d="M 50 78 C 42 86 36 94 44 102 C 48 106 32 108 27 108"
                fill="none"
                stroke="url(#genieTailGrad)"
                strokeWidth="8.5"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M 50 78 C 42 86 36 94 44 102 C 48 106 32 108 27 108",
                    "M 50 78 C 58 86 60 94 52 102 C 46 106 34 108 27 108",
                    "M 50 78 C 42 86 36 94 44 102 C 48 106 32 108 27 108",
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
              <rect x="42" y="74" width="16" height="4" rx="2" fill="url(#magicLampGoldGrad)" />

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
              <polygon points="50,11 44,18 56,18" fill="url(#magicLampGoldGrad)" />
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

              {/* ======================================================== */}
              {/* 🪔 THE GOLDEN MAGIC LAMP (जादुई चिराग) UNDER THE GENIE  */}
              {/* ======================================================== */}
              <g id="magicLampGroup" filter="url(#lampGlow)" className="transition-transform group-hover:scale-105">
                {/* Lamp Base Pedestal */}
                <ellipse cx="50" cy="140" rx="14" ry="4" fill="url(#magicLampGoldGrad)" stroke="#78350F" strokeWidth="1" />
                <path d="M 45 135 L 47 140 L 53 140 L 55 135 Z" fill="url(#magicLampGoldGrad)" stroke="#78350F" strokeWidth="0.8" />

                {/* Lamp Main Pot Belly */}
                <path
                  d="M 34 125 C 32 133 40 137 50 137 C 60 137 68 133 66 125 C 64 119 36 119 34 125 Z"
                  fill="url(#magicLampGoldGrad)"
                  stroke="#78350F"
                  strokeWidth="1.2"
                />

                {/* Lamp Spout curving UP and LEFT towards the smoke tail */}
                <path
                  d="M 36 123 C 28 121 21 115 25 108 C 28 108 32 113 40 120 Z"
                  fill="url(#magicLampGoldGrad)"
                  stroke="#78350F"
                  strokeWidth="1"
                />
                {/* Spout Lip / Orifice where smoke emerges */}
                <ellipse cx="26" cy="108" rx="2.8" ry="1.4" fill="#78350F" />

                {/* Lamp Handle (Right Side ornate loop) */}
                <path
                  d="M 64 122 C 75 117 78 129 65 131"
                  fill="none"
                  stroke="url(#magicLampGoldGrad)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Lamp Lid & Ruby Finial */}
                <ellipse cx="50" cy="121" rx="7" ry="2.2" fill="url(#magicLampGoldGrad)" stroke="#78350F" strokeWidth="0.8" />
                <circle cx="50" cy="117" r="2.5" fill="#EF4444" stroke="#78350F" strokeWidth="0.6" />

                {/* Glint and golden sheen highlight */}
                <path d="M 40 127 Q 50 130 60 127" stroke="#FEF08A" strokeWidth="1.5" fill="none" opacity="0.85" />
                <circle cx="48" cy="131" r="1.2" fill="#FFFFFF" opacity="0.9" />

                {/* Magical Lamp Sparkles */}
                <motion.circle
                  cx="26"
                  cy="104"
                  r="2"
                  fill="#FDE047"
                  animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </g>

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

          {/* Mini Lamp Toggle Pill under the Lamp */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsLampMode(!isLampMode);
            }}
            className="mt-1 flex items-center justify-center cursor-pointer"
          >
            <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 transition-transform hover:scale-105 border border-amber-300">
              <span>🪔</span>
              <span>{isLampMode ? (language === 'en' ? 'Open' : 'खोलें') : (language === 'en' ? 'Lamp' : 'चिराग')}</span>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
