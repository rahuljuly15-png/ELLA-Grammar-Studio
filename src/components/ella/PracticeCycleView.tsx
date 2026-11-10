import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  PenTool,
  Calendar,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Brain,
  Clock,
  RotateCcw,
  Trophy,
  CheckCircle,
  HelpCircle as QuestionIcon,
  Flame,
  Award,
} from 'lucide-react';
import type { FullTopicData } from '../../data/topicLoader';
import type { RuleCheckResult, RuleError } from '../../engines/offlineRuleEngine';
import { db, type ReviewState } from '../../db/dexieDb';
import {
  type FSRSRating,
  FSRS_RATINGS,
  computeNextFSRSState,
  calculateRetention,
} from '../../services/fsrsScheduler';
import { EllaAvatarCompanion } from './EllaAvatarCompanion';

export type StepKey = 'notice' | 'hypothesize' | 'clarify' | 'use' | 'schedule';

interface PracticeCycleViewProps {
  activeTopic: FullTopicData;
  onOpenTopicModal: () => void;
  studentSentence: string;
  setStudentSentence: (sentence: string) => void;
  liveCheckResult: RuleCheckResult;
  selfNote: string;
  setSelfNote: (note: string) => void;
  onSaveToDexie: () => Promise<void>;
  isSavedToDb: boolean;
  savedSessionId: number | null;
  speakText: (text: string) => void;
  onEscapeHatch: () => void;
  studentName?: string;
}

export const PracticeCycleView: React.FC<PracticeCycleViewProps> = ({
  activeTopic,
  onOpenTopicModal,
  studentSentence,
  setStudentSentence,
  liveCheckResult,
  selfNote,
  setSelfNote,
  onSaveToDexie,
  isSavedToDb,
  savedSessionId,
  speakText,
  onEscapeHatch,
  studentName = 'Ishu',
}) => {
  // Always default to inductive discovery (Step 1: Notice)
  const [currentStep, setCurrentStep] = useState<StepKey>('notice');
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const [ratedFeedback, setRatedFeedback] = useState<string | null>(null);

  // Reset hypothesis, hints, and step to 'notice' on topic change
  useEffect(() => {
    setSelectedHypothesis(null);
    setRevealedHints({});
    setGuidedAnswers({});
    setCurrentStep('notice');
  }, [activeTopic.topicId]);

  // Load FSRS Review State from Dexie
  useEffect(() => {
    let isMounted = true;
    setIsLoadingReview(true);
    db.review_states
      .where({ student_id: 1, topic_id: activeTopic.topicId })
      .first()
      .then((res) => {
        if (isMounted) {
          setReviewState(res || null);
          setIsLoadingReview(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching review state:', err);
        if (isMounted) setIsLoadingReview(false);
      });
    return () => {
      isMounted = false;
    };
  }, [activeTopic.topicId, isSavedToDb]);

  const steps = activeTopic.steps;
  const isHypothesisCorrect =
    selectedHypothesis !== null
      ? (steps['2_hypothesize']?.options[selectedHypothesis]?.isCorrect ?? null)
      : null;
  const guidedPractice = (steps as any)['4_guided_practice'] as {
    stepTitleHi?: string;
    instructionHi?: string;
    questions?: Array<{
      id: string;
      sentence: string;
      options: string[];
      correctAnswer: string;
      explanationHi: string;
    }>;
  } | undefined;

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const applyCorrection = (error: RuleError) => {
    const updated = studentSentence.replace(error.matchedText, error.suggestedText);
    setStudentSentence(updated);
  };

  const handleFSRSRating = async (rating: FSRSRating) => {
    const now = new Date();
    const nextFSRS = computeNextFSRSState(reviewState || undefined, rating, now);
    const recallScores: Record<FSRSRating, number> = { 1: 50, 2: 70, 3: 90, 4: 98 };
    const accuracy = reviewState?.production_accuracy_score ?? 100;

    const ratingLabels: Record<FSRSRating, string> = {
      1: 'कल (1 दिन) पुनः अभ्यास सेट किया गया',
      2: '2 दिन बाद समीक्षा तय हुई',
      3: '4 दिन बाद समीक्षा तय हुई',
      4: '7+ दिन बाद समीक्षा तय हुई',
    };
    setRatedFeedback(ratingLabels[rating]);
    setTimeout(() => setRatedFeedback(null), 3500);

    if (reviewState?.id) {
      await db.review_states.update(reviewState.id, {
        rule_recall_score: recallScores[rating],
        stability: nextFSRS.stability,
        difficulty: nextFSRS.difficulty,
        reps: nextFSRS.reps,
        lapses: nextFSRS.lapses,
        last_review: now,
        next_due_date: nextFSRS.nextDueDate,
      });
      setReviewState({
        ...reviewState,
        rule_recall_score: recallScores[rating],
        stability: nextFSRS.stability,
        difficulty: nextFSRS.difficulty,
        reps: nextFSRS.reps,
        lapses: nextFSRS.lapses,
        last_review: now,
        next_due_date: nextFSRS.nextDueDate,
      });
    } else {
      const id = await db.review_states.put({
        student_id: 1,
        topic_id: activeTopic.topicId,
        production_accuracy_score: accuracy,
        rule_recall_score: recallScores[rating],
        stability: nextFSRS.stability,
        difficulty: nextFSRS.difficulty,
        reps: nextFSRS.reps,
        lapses: nextFSRS.lapses,
        last_review: now,
        next_due_date: nextFSRS.nextDueDate,
      });
      setReviewState({
        id: id as number,
        student_id: 1,
        topic_id: activeTopic.topicId,
        production_accuracy_score: accuracy,
        rule_recall_score: recallScores[rating],
        stability: nextFSRS.stability,
        difficulty: nextFSRS.difficulty,
        reps: nextFSRS.reps,
        lapses: nextFSRS.lapses,
        last_review: now,
        next_due_date: nextFSRS.nextDueDate,
      });
    }
  };

  const cycleStepsList: { key: StepKey; num: number; label: string; icon: any; shortTitle: string }[] = [
    { key: 'notice', num: 1, label: '1. Notice', icon: BookOpen, shortTitle: '1. फर्क पहचानें' },
    { key: 'hypothesize', num: 2, label: '2. Hypothesize', icon: HelpCircle, shortTitle: '2. अंदाज़ा लगाएँ' },
    { key: 'clarify', num: 3, label: '3. Clarify', icon: Sparkles, shortTitle: '3. सीक्रेट फॉर्मूला' },
    { key: 'use', num: 4, label: '4. Sentence Builder', icon: PenTool, shortTitle: '4. वाक्य बनाएँ' },
    { key: 'schedule', num: 5, label: '5. Review & FSRS', icon: Calendar, shortTitle: '5. सुपर रिवीजन' },
  ];

  const stepOrder: StepKey[] = ['notice', 'hypothesize', 'clarify', 'use', 'schedule'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progressPercent = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOPIC HEADER CARD (Clean, Friendly, Apple-style)      */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 bg-white/95 backdrop-blur-md border border-indigo-100 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white font-extrabold flex items-center justify-center text-lg shadow-sm shadow-indigo-200 shrink-0">
            L{activeTopic.level}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-indigo-600 font-bold tracking-wide uppercase">{activeTopic.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-400">{activeTopic.topicId}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {activeTopic.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-xl">
              {activeTopic.descriptionHi}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTopicModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/70 rounded-2xl transition-all cursor-pointer shrink-0"
        >
          <span>पाठ्यक्रम से दूसरा विषय चुनें</span>
          <ChevronDown className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. DUOLINGO-STYLE PROGRESS TRACKER & STEPPER PILLS       */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Animated Progress Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span className="flex items-center gap-1.5 text-indigo-700 font-extrabold">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>कदम {currentStepIndex + 1} / 5: {cycleStepsList[currentStepIndex].shortTitle}</span>
          </span>
          <span className="text-slate-400 font-mono">{Math.round(progressPercent)}% पूर्ण</span>
        </div>

        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* 5-Step Segmented Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
          {cycleStepsList.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            const isActive = currentStep === stepItem.key;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={stepItem.key}
                onClick={() => setCurrentStep(stepItem.key)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-300 ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/60'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="truncate">{stepItem.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. STEP CONTENT WITH MOTION ANIMATED TRANSITIONS         */}
      {/* ======================================================== */}
      <AnimatePresence mode="wait">
        {/* ---------------------------------------------------- */}
        {/* STEP 1: NOTICE (अवलोकन व तुलना)                     */}
        {/* ---------------------------------------------------- */}
        {currentStep === 'notice' && (
          <motion.div
            key="notice"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span>कदम 1 • फर्क पहचानें (Spot the Difference)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {steps['1_notice']?.stepTitleHi || 'ध्यान से देखें और अंतर समझें'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {steps['1_notice']?.instructionHi}
              </p>
            </div>

            {/* Contrast Flashcards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {steps['1_notice']?.pairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="group relative p-5 bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-2xl space-y-3 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      उदाहरण #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakText(pair.sentence)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200/60 rounded-lg transition-colors cursor-pointer"
                      title="उच्चारण सुनें (Listen)"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>सुनें</span>
                    </button>
                  </div>

                  <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tracking-tight leading-snug">
                    {pair.sentence}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-amber-900 font-bold font-mono bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      ✨ {pair.highlightWord}
                    </span>
                    <span className="text-slate-600 text-[11px] font-medium bg-slate-100/80 px-2.5 py-1 rounded-lg">
                      ध्वनि: <strong className="text-slate-900">{pair.soundHintHi}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Step 1 Footer CTA */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep('hypothesize')}
                className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>अगला कदम: अंदाज़ा लगाएँ (Take a Guess)</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 2: HYPOTHESIZE (सक्रिय अनुमान)                 */}
        {/* ---------------------------------------------------- */}
        {currentStep === 'hypothesize' && (
          <motion.div
            key="hypothesize"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>कदम 2 • दिमाग की बत्ती जलाएँ 💡 (Take a Guess)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {steps['2_hypothesize']?.stepTitleHi || 'स्वयं नियम का अंदाज़ा लगाएँ'}
              </h2>
            </div>

            {/* Friendly Inductive Question Tile */}
            <div className="p-5 bg-gradient-to-r from-amber-50/80 via-indigo-50/40 to-amber-50/60 border border-amber-200/80 rounded-2xl flex items-start gap-3">
              <QuestionIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {steps['2_hypothesize']?.questionHi}
              </p>
            </div>

            {/* Interactive Choice Tiles */}
            <div className="space-y-3 pt-1">
              {steps['2_hypothesize']?.options.map((opt, idx) => {
                const isSelected = selectedHypothesis === idx;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedHypothesis(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all space-y-3 ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-50/90 border-emerald-400 text-slate-900 ring-2 ring-emerald-400/30 shadow-xs'
                          : 'bg-amber-50/90 border-amber-400 text-slate-900 ring-2 ring-amber-400/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                            isSelected
                              ? opt.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="font-semibold text-slate-900 leading-snug">
                          {opt.textHi}
                        </span>
                      </div>

                      {isSelected && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                            opt.isCorrect
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          {opt.isCorrect ? '✓ सही अनुमान!' : '🤔 एक बार फिर सोचें'}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed font-medium ${
                          opt.isCorrect
                            ? 'bg-emerald-100/80 text-emerald-950 border border-emerald-300/60'
                            : 'bg-amber-100/80 text-amber-950 border border-amber-300/60'
                        }`}
                      >
                        {opt.feedbackHi}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Step 2 Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('notice')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← वापस फर्क देखें</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep('clarify')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>सीक्रेट फॉर्मूला अनलॉक करें 👑</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 3: CLARIFY (स्वर्ण नियम व स्पष्टीकरण)          */}
        {/* ---------------------------------------------------- */}
        {currentStep === 'clarify' && (
          <motion.div
            key="clarify"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>कदम 3 • सीक्रेट फॉर्मूला 👑 (The Secret Rule)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {steps['3_clarify']?.stepTitleHi || 'आज का सीक्रेट फॉर्मूला'}
              </h2>
            </div>

            {/* Golden Rule Hero Banner */}
            <div className="p-6 bg-gradient-to-br from-amber-50 via-indigo-50/50 to-amber-100/50 border-2 border-amber-200/90 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                <span>आज का सीक्रेट फॉर्मूला (The Secret Rule):</span>
              </div>
              <div className="text-base sm:text-xl font-extrabold text-slate-900 leading-relaxed font-sans">
                {steps['3_clarify']?.goldenRuleHi}
              </div>
              {steps['3_clarify']?.theRuleHi && (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-3 border-t border-amber-200/80">
                  {steps['3_clarify']?.theRuleHi}
                </p>
              )}
            </div>

            {/* Sound Examples Grid */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                ध्वनि-संकेत और उदाहरण (Sound Examples):
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {steps['3_clarify']?.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-indigo-300 hover:bg-white transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold font-mono text-indigo-700">
                        {ex.word}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(ex.word)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="उच्चारण सुनें"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-amber-900 font-bold bg-amber-100/80 px-2 py-0.5 rounded-md inline-block">
                      ध्वनि: {ex.sound}
                    </div>
                    <div className="text-xs text-slate-600 leading-snug">
                      {ex.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Guided Practice Quick Warm-up (if available in topic) */}
            {guidedPractice?.questions && guidedPractice.questions.length > 0 && (
              <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>त्वरित अभ्यास (Quick Check):</span>
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">उत्तर पर क्लिक करें</span>
                </div>

                <div className="space-y-3">
                  {guidedPractice.questions.slice(0, 2).map((q) => {
                    const selected = guidedAnswers[q.id];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === q.correctAnswer;

                    return (
                      <div key={q.id} className="p-3.5 bg-white border border-indigo-100/80 rounded-xl space-y-2">
                        <div className="text-xs sm:text-sm font-semibold font-mono text-slate-800">
                          {q.sentence}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setGuidedAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                                selected === opt
                                  ? opt === q.correctAnswer
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-rose-600 text-white'
                                  : 'bg-slate-100 hover:bg-indigo-50 text-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                        {isAnswered && (
                          <div
                            className={`text-xs p-2 rounded-lg ${
                              isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {isCorrect ? '✓ सही उत्तर! ' : '✗ सही उत्तर: ' + q.correctAnswer + ' · '}
                            {q.explanationHi}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('hypothesize')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← वापस अंदाज़ा देखें</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep('use')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>अब अपना वाक्य बनाएँ (Sentence Studio) ✍️</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 4: USE & LIVE SENTENCE BUILDER (वाक्य निर्माण)  */}
        {/* ---------------------------------------------------- */}
        {currentStep === 'use' && (
          <motion.div
            key="use"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60">
                  <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                  <span>कदम 4 • अपना वाक्य बनाएँ (Sentence Studio)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {steps['5_free_production']?.promptHi || 'अपना एक अंग्रेजी वाक्य लिखें:'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>⚡ सुपरफास्ट ऑफ़लाइन चेकर</span>
                </span>
              </div>
            </div>

            {/* Quick Test Inspiration Chips */}
            {steps['5_free_production']?.sampleSolutions && (
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>परीक्षण के लिए उदाहरण चुनें (Click to Test):</span>
                  </span>
                  <button
                    type="button"
                    onClick={onEscapeHatch}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer"
                  >
                    आसान उदाहरण (Escape Hatch)
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {steps['5_free_production'].sampleSolutions.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStudentSentence(sample)}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/70 text-slate-800 transition-all cursor-pointer font-medium shadow-2xs"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sentence Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span>आपका अंग्रेजी वाक्य (Your Sentence):</span>
                  {studentSentence.trim() && (
                    <button
                      type="button"
                      onClick={() => speakText(studentSentence)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      title="उच्चारण सुनें (Listen Voice)"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>सुनें</span>
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-normal">
                  जैसे-जैसे आप टाइप करेंगे, स्वतः जांच होगी
                </span>
              </div>

              <textarea
                rows={3}
                value={studentSentence}
                onChange={(e) => setStudentSentence(e.target.value)}
                placeholder={steps['5_free_production']?.placeholderHi || 'e.g. He waited for an hour.'}
                className="w-full p-4 text-base font-mono bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all leading-relaxed shadow-2xs"
              />
            </div>

            {/* LIVE FEEDBACK CARD */}
            <div>
              {liveCheckResult.errors.length > 0 ? (
                <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      {liveCheckResult.errors.length} आसान सुधार (Quick Fix):
                    </span>
                  </div>

                  <div className="space-y-3">
                    {liveCheckResult.errors.slice(0, 2).map((err, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white border border-amber-200 rounded-xl space-y-2.5 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-sm font-semibold">
                            <span className="text-rose-600 line-through font-mono mr-2">
                              {err.matchedText}
                            </span>
                            <span className="text-emerald-700 font-mono font-bold">
                              → {err.suggestedText}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleHint(idx)}
                              className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                              <span>{revealedHints[idx] ? 'संकेत छुपाएँ' : '💡 संकेत (Hint)'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => applyCorrection(err)}
                              className="px-3.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>सुधारें (Apply Fix)</span>
                            </button>
                          </div>
                        </div>

                        {revealedHints[idx] && (
                          <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 font-medium leading-relaxed">
                            <strong>💡 सोचने का संकेत:</strong> {err.inductiveHintHi || err.explanationHi}
                          </div>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {err.explanationHi}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : studentSentence.trim() ? (
                <div className="p-5 bg-emerald-50/90 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-3 text-emerald-950 font-semibold text-sm">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>
                      {liveCheckResult.positiveFeedbackHi ||
                        'शाबाश! आपका वाक्य व्याकरण के नियमों के अनुसार 100% सही है।'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold shrink-0 self-start sm:self-center border border-emerald-200">
                    Accuracy: 100%
                  </span>
                </div>
              ) : null}
            </div>

            {/* Self-Reflection Note */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                मेरा सीक्रेट नोट 📝 (आज मैंने क्या नया सीखा?):
              </label>
              <input
                type="text"
                value={selfNote}
                onChange={(e) => setSelfNote(e.target.value)}
                placeholder="उदा. 'Hour' में 'h' मूक (silent) होता है इसलिए 'An hour' बोलते हैं..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  {isSavedToDb ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      सुरक्षित सेव हो गया! 💾 (सत्र #{savedSessionId})
                    </span>
                  ) : (
                    <span>प्रगति को अपनी व्यक्तिगत प्रोफ़ाइल में सुरक्षित करें।</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onSaveToDexie}
                  disabled={!studentSentence.trim()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-sm shadow-indigo-200 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>प्रगति सेव करें (Save Progress)</span>
                </button>
              </div>
            </div>

            {/* Step 4 Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('clarify')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← वापस सीक्रेट फॉर्मूला</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep('schedule')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>सुपर मेमोरी रिवीजन 🧠</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* STEP 5: SCHEDULE & REVIEW (FSRS Engine)              */}
        {/* ---------------------------------------------------- */}
        {currentStep === 'schedule' && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200/60">
                <Brain className="w-3.5 h-3.5 text-purple-600" />
                <span>कदम 5 • सुपर मेमोरी रिवीजन 🧠 (Smart Review)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                मेमोरी स्कोर व अगली रिवीजन तारीख
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                साइंटिफिक AI मेमोरी टाइमर: ताकि आप इस नियम को कभी न भूलें!
              </p>
            </div>

            {/* Victory Celebration Card */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  शानदार प्रयास! इस विषय का चक्र पूरा हुआ 🎉
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  अपने अनुभव के आधार पर नीचे रेटिंग दें ताकि स्मार्ट टाइमर आपकी अगली रिवीजन तारीख तय कर सके।
                </p>
              </div>
            </div>

            {/* Next Due Date Banner */}
            <div className="p-6 bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-indigo-50/90 border border-indigo-200/80 rounded-2xl space-y-3">
              <div className="font-bold text-indigo-900 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>आगामी समीक्षा तिथि (Next Review Date):</span>
                </div>
                {reviewState?.next_due_date && (
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    लक्ष्य प्रतिधारण: 90%
                  </span>
                )}
              </div>

              {isLoadingReview ? (
                <p className="text-xs text-slate-500">डेटाबेस से समीक्षा लोड हो रही है...</p>
              ) : reviewState?.next_due_date ? (
                <div className="space-y-3">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    {new Date(reviewState.next_due_date).toLocaleDateString('hi-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>
                      सटीकता स्तर (Accuracy):{' '}
                      <strong className="text-emerald-700 font-mono">{reviewState.production_accuracy_score}%</strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>
                      स्मृति स्कोर (Recall):{' '}
                      <strong className="text-indigo-700 font-mono">{reviewState.rule_recall_score}%</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-600">
                  अभी कोई समीक्षा तय नहीं हुई है। नीचे रेटिंग देकर अपनी पहली समीक्षा तय करें!
                </div>
              )}
            </div>

            {/* Feedback notification on Rating */}
            {ratedFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-indigo-100 text-indigo-900 font-bold text-xs rounded-xl text-center border border-indigo-200"
              >
                ✨ {ratedFeedback}
              </motion.div>
            )}

            {/* FSRS Cognitive Metrics Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>मेमोरी स्कोरकार्ड (Memory Power & Level):</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">मेमोरी पावर (Stability)</span>
                  <span className="text-base font-bold font-mono text-indigo-700">
                    {reviewState?.stability ? `${reviewState.stability.toFixed(1)} दिन` : '3.5 दिन'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">याद रहने का चांस (Recall)</span>
                  <span className="text-base font-bold font-mono text-emerald-700">
                    {reviewState?.stability
                      ? `${calculateRetention(reviewState.stability, 0)}%`
                      : '95%'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">चुनौती स्तर (Level)</span>
                  <span className="text-base font-bold font-mono text-amber-700">
                    {reviewState?.difficulty ? `${reviewState.difficulty.toFixed(1)} / 10` : '4.5 / 10'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">प्रैक्टिस राउंड्स (Reps)</span>
                  <span className="text-base font-bold font-mono text-purple-700">
                    {reviewState?.reps ?? 1} बार
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Self-Rating Buttons */}
            <div className="p-5 bg-slate-50/90 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>खुद को रेट करें (Rate Your Recall):</span>
                </span>
                <span className="text-slate-500 text-[11px]">क्लिक करके रिवीजन टाइम चुनें</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.AGAIN)}
                  className="p-3.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-rose-300"
                >
                  <span className="text-sm">🔴 पुनः अभ्यास</span>
                  <span className="text-[11px] font-normal text-rose-600">कल (1 दिन)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.HARD)}
                  className="p-3.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-amber-300"
                >
                  <span className="text-sm">🟡 थोड़ा कठिन</span>
                  <span className="text-[11px] font-normal text-amber-600">2 दिन बाद</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.GOOD)}
                  className="p-3.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-emerald-300"
                >
                  <span className="text-sm">🟢 अच्छा (Good)</span>
                  <span className="text-[11px] font-normal text-emerald-600">4 दिन बाद</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.EASY)}
                  className="p-3.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-indigo-300"
                >
                  <span className="text-sm">🔵 बहुत सरल</span>
                  <span className="text-[11px] font-normal text-indigo-600">7+ दिन बाद</span>
                </button>
              </div>
            </div>

            {/* Step 5 Footer / Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('notice')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>इसी विषय का पुनः अभ्यास करें</span>
              </button>

              <button
                type="button"
                onClick={onOpenTopicModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>🚀 अगला विषय चुनें (Choose Next Topic)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Ella Avatar Companion */}
      <EllaAvatarCompanion
        currentStep={currentStep}
        studentName={studentName || 'Ishu'}
        selectedHypothesis={selectedHypothesis}
        isHypothesisCorrect={isHypothesisCorrect}
        liveCheckResult={liveCheckResult}
        studentSentence={studentSentence}
        isSavedToDb={isSavedToDb}
        speakText={speakText}
      />
    </div>
  );
};
