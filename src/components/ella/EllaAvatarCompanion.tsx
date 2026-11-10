import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, X, MessageCircle, ChevronUp, ChevronDown, Heart } from 'lucide-react';
import type { StepKey } from './PracticeCycleView';
import type { RuleCheckResult } from '../../engines/offlineRuleEngine';

export type EllaMood = 'waving' | 'thinking' | 'cheering' | 'guiding' | 'celebrating';

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
  const [clickCount, setClickCount] = useState(0);

  const displayName = studentName?.trim() || 'Ishu';

  // Random fun motivational quotes when student taps Ella
  const funTips = [
    `शानदार जा रहे हो ${displayName}! हर गलती से हम एक नया नियम सीखते हैं! 🚀`,
    `पता है ${displayName}? इंग्लिश बोलने का सबसे बड़ा सीक्रेट है रोज़ 5 मिनट प्रैक्टिस! ✨`,
    `तुम्हारी प्रोग्रेस देखकर मुझे बहुत खुशी हो रही है ${displayName}! Keep shining! 🌟`,
    `याद रखना ${displayName}: स्पेलिंग नहीं, बोलने की आवाज़ (Sound) ही असली नियम है! 🎧`,
    `तुम बहुत तेजी से सीख रहे हो ${displayName}! You're a rockstar! 🎸`,
  ];

  // Dynamic dialogue & mood engine based on real-time learner state
  useEffect(() => {
    // Priority 1: Step 4 (Sentence Builder - Use)
    if (currentStep === 'use') {
      if (isSavedToDb) {
        setMood('celebrating');
        setDialogue(`वाह ${displayName}! आपकी आज की मेहनत लोकल डेटाबेस में सुरक्षित सेव हो गई! 💾✨`);
      } else if (studentSentence.trim().length > 0 && liveCheckResult.errors.length === 0) {
        setMood('cheering');
        setDialogue(`सुपरस्टार ${displayName}! 🎉 आपका वाक्य 100% सही और परफेक्ट है! अब 'प्रगति सेव करें' पर क्लिक करो!`);
      } else if (liveCheckResult.errors.length > 0) {
        setMood('guiding');
        setDialogue(`अरे ${displayName}, एक छोटा सा सुधार बाकी है! 💡 नीचे दिए 'सुधारें (Apply Fix)' पर क्लिक करो!`);
      } else {
        setMood('guiding');
        setDialogue(`चलो ${displayName}, अब आपकी बारी है! ऊपर दिए बॉक्स में अपना एक प्यारा सा वाक्य लिखो ✍️`);
      }
      return;
    }

    // Priority 2: Step 2 (Hypothesize)
    if (currentStep === 'hypothesize') {
      if (selectedHypothesis !== null) {
        if (isHypothesisCorrect) {
          setMood('celebrating');
          setDialogue(`कमाल कर दिया ${displayName}! 🎯 आपका अंदाज़ा 100% सही निकला! अब चलो सीक्रेट फॉर्मूला अनलॉक करें!`);
        } else {
          setMood('thinking');
          setDialogue(`कोई बात नहीं ${displayName}! एक बार शब्द को बोलकर देखो, फिर सोचो पहली आवाज़ क्या है? 💪`);
        }
      } else {
        setMood('thinking');
        setDialogue(`सोचो-सोचो ${displayName}! 💡 क्या स्पेलिंग से नियम बनता है या बोलने की आवाज़ (Sound) से?`);
      }
      return;
    }

    // Priority 3: Step 1 (Notice)
    if (currentStep === 'notice') {
      setMood('waving');
      setDialogue(`हाय ${displayName}! 👋 इन दोनों वाक्यों को बोलकर सुनो, तुम्हें 'a' और 'an' में क्या फर्क दिखा?`);
      return;
    }

    // Priority 4: Step 3 (Clarify)
    if (currentStep === 'clarify') {
      setMood('guiding');
      setDialogue(`ये रहा आज का असली सीक्रेट फॉर्मूला, ${displayName}! 👑 इसे दिमाग में बैठा लो, कभी गलती नहीं होगी!`);
      return;
    }

    // Priority 5: Step 5 (Schedule & FSRS)
    if (currentStep === 'schedule') {
      setMood('celebrating');
      setDialogue(`मिशन पूरा हुआ ${displayName}! 🏆 खुद को स्टार रेटिंग दो ताकि स्मार्ट टाइमर तुम्हारी अगली रिवीजन तय कर सके!`);
      return;
    }
  }, [currentStep, selectedHypothesis, isHypothesisCorrect, liveCheckResult, studentSentence, isSavedToDb, displayName]);

  const handleAvatarClick = () => {
    setMood('cheering');
    const nextIndex = (clickCount + 1) % funTips.length;
    setClickCount(nextIndex);
    setDialogue(funTips[nextIndex]);
    speakText(funTips[nextIndex]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-none select-none">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-2 max-w-xs sm:max-w-sm pointer-events-auto"
          >
            {/* Friendly Speech Bubble */}
            <div className="relative p-4 bg-white/95 backdrop-blur-md border-2 border-indigo-200/90 rounded-3xl shadow-xl shadow-indigo-100/50 space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-indigo-50 pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>एला (Ella Assistant)</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                    Your Buddy
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => speakText(dialogue)}
                    className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="एला की आवाज़ सुनें (Listen Voice)"
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
                <span className="hover:text-indigo-600 cursor-pointer" onClick={handleAvatarClick}>
                  💡 मुझे टैप करें नई टिप के लिए!
                </span>
                <Heart className="w-3 h-3 text-rose-400 fill-rose-300" />
              </div>

              {/* Tail pointing down to avatar */}
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-200 rotate-45 transform" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Animated Ella Mascot */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={isMinimized ? () => setIsMinimized(false) : handleAvatarClick}
        className="pointer-events-auto cursor-pointer relative group flex items-center gap-2"
        title={isMinimized ? "एला से बात करें (Click to Open)" : "टैप करें और नई प्रेरणा पाएँ!"}
      >
        {isMinimized && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-3 py-1.5 bg-white border border-indigo-200 shadow-md rounded-full text-xs font-bold text-indigo-700 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>एला से पूछें</span>
            <ChevronUp className="w-3 h-3 text-slate-400" />
          </motion.div>
        )}

        <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-indigo-400 p-1 shadow-lg shadow-indigo-300/60 ring-3 ring-white">
          {/* Animated SVG Character */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Cute Owl / Robot Body */}
            <defs>
              <linearGradient id="ellaBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="ellaBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EEF2FF" />
                <stop offset="100%" stopColor="#E0E7FF" />
              </linearGradient>
            </defs>

            {/* Wings */}
            <motion.path
              d={mood === 'waving' ? "M 18 50 C 6 42 2 24 16 26 C 24 28 26 44 22 52 Z" : "M 18 52 C 10 56 12 70 20 72 C 24 72 26 60 22 52 Z"}
              fill="#4338CA"
              animate={mood === 'waving' ? { rotate: [-8, 12, -8] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
            <path
              d="M 82 52 C 90 56 88 70 80 72 C 76 72 74 60 78 52 Z"
              fill="#4338CA"
            />

            {/* Body */}
            <ellipse cx="50" cy="56" rx="36" ry="34" fill="url(#ellaBodyGrad)" />

            {/* Belly */}
            <ellipse cx="50" cy="62" rx="24" ry="22" fill="url(#ellaBellyGrad)" />

            {/* Cute Feather patterns on belly */}
            <path d="M 44 60 Q 50 63 56 60" stroke="#818CF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 42 67 Q 50 70 58 67" stroke="#818CF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Eyes Outer Glasses / Rings */}
            <circle cx="37" cy="42" r="14" fill="#FFFFFF" stroke="#312E81" strokeWidth="2.5" />
            <circle cx="63" cy="42" r="14" fill="#FFFFFF" stroke="#312E81" strokeWidth="2.5" />
            {/* Glasses Bridge */}
            <path d="M 48 42 L 52 42" stroke="#312E81" strokeWidth="3" strokeLinecap="round" />

            {/* Eyes Pupils */}
            {mood === 'cheering' || mood === 'celebrating' ? (
              // Happy squinting smiling eyes ^ ^
              <>
                <path d="M 31 43 Q 37 36 43 43" stroke="#1E1B4B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M 57 43 Q 63 36 69 43" stroke="#1E1B4B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </>
            ) : mood === 'thinking' ? (
              // Thinking looking-up eyes
              <>
                <circle cx="39" cy="38" r="6" fill="#1E1B4B" />
                <circle cx="41" cy="36" r="2" fill="#FFFFFF" />
                <circle cx="65" cy="38" r="6" fill="#1E1B4B" />
                <circle cx="67" cy="36" r="2" fill="#FFFFFF" />
              </>
            ) : (
              // Big curious friendly pupils
              <>
                <circle cx="38" cy="42" r="6.5" fill="#1E1B4B" />
                <circle cx="40" cy="40" r="2.2" fill="#FFFFFF" />
                <circle cx="62" cy="42" r="6.5" fill="#1E1B4B" />
                <circle cx="64" cy="40" r="2.2" fill="#FFFFFF" />
              </>
            )}

            {/* Cute Rosy Cheeks */}
            <ellipse cx="27" cy="49" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.85" />
            <ellipse cx="73" cy="49" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.85" />

            {/* Beak */}
            <polygon points="50,45 44,53 56,53" fill="#F59E0B" />

            {/* Graduation / Star Cap */}
            <polygon points="50,12 28,21 50,28 72,21" fill="#1E1B4B" />
            <rect x="42" y="24" width="16" height="5" fill="#312E81" rx="1.5" />
            {/* Tassel */}
            <path d="M 50 20 L 70 27 L 70 34" stroke="#F59E0B" strokeWidth="2" fill="none" />
            <circle cx="70" cy="35" r="2" fill="#F59E0B" />
          </svg>

          {/* Pulse ring indicator */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};
