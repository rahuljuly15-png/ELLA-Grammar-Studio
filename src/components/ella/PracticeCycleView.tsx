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
  Lock,
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
import { useLanguage } from '../../i18n/LanguageContext';

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
  flightIntervalSeconds?: number;
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
  flightIntervalSeconds = 90,
}) => {
  const { language, t, getTopic } = useLanguage();
  const topic = getTopic(activeTopic);
  const steps = topic.steps;

  // Always default to inductive discovery (Step 1: Notice)
  const [currentStep, setCurrentStep] = useState<StepKey>('notice');
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const [ratedFeedback, setRatedFeedback] = useState<string | null>(null);
  const [showAdvancedStats, setShowAdvancedStats] = useState<boolean>(false);
  // Pedagogical step gating (Audit UX-04): Students can always navigate backwards, but must unlock steps in sequence
  const [maxUnlockedStepIndex, setMaxUnlockedStepIndex] = useState<number>(0);

  // Reset hypothesis, hints, and step to 'notice' on topic change
  useEffect(() => {
    setSelectedHypothesis(null);
    setRevealedHints({});
    setGuidedAnswers({});
    setCurrentStep('notice');
    setMaxUnlockedStepIndex(0);
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

  // Note: steps is derived from localized topic above
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
    { key: 'notice', num: 1, label: t('step1_pill'), icon: BookOpen, shortTitle: t('step1_pill') },
    { key: 'hypothesize', num: 2, label: t('step2_pill'), icon: HelpCircle, shortTitle: t('step2_pill') },
    { key: 'clarify', num: 3, label: t('step3_pill'), icon: Sparkles, shortTitle: t('step3_pill') },
    { key: 'use', num: 4, label: t('step4_pill'), icon: PenTool, shortTitle: t('step4_pill') },
    { key: 'schedule', num: 5, label: t('step5_pill'), icon: Calendar, shortTitle: t('step5_pill') },
  ];

  // Kid-Friendly Soft Pastel Thematic Styles for Each Step
  const stepPillStyles: Record<StepKey, { active: string; completed: string; inactive: string }> = {
    notice: {
      active: 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm shadow-sky-300 ring-2 ring-sky-500/20',
      completed: 'bg-sky-50/90 text-sky-900 border border-sky-200/90 hover:bg-sky-100/80',
      inactive: 'bg-white/80 text-slate-600 border border-slate-200/80 hover:border-sky-300 hover:text-sky-800',
    },
    hypothesize: {
      active: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-300 ring-2 ring-amber-500/20',
      completed: 'bg-amber-50/90 text-amber-900 border border-amber-200/90 hover:bg-amber-100/80',
      inactive: 'bg-white/80 text-slate-600 border border-slate-200/80 hover:border-amber-300 hover:text-amber-800',
    },
    clarify: {
      active: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-sm shadow-purple-300 ring-2 ring-purple-500/20',
      completed: 'bg-purple-50/90 text-purple-900 border border-purple-200/90 hover:bg-purple-100/80',
      inactive: 'bg-white/80 text-slate-600 border border-slate-200/80 hover:border-purple-300 hover:text-purple-800',
    },
    use: {
      active: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-300 ring-2 ring-emerald-500/20',
      completed: 'bg-emerald-50/90 text-emerald-900 border border-emerald-200/90 hover:bg-emerald-100/80',
      inactive: 'bg-white/80 text-slate-600 border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-800',
    },
    schedule: {
      active: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm shadow-rose-300 ring-2 ring-rose-500/20',
      completed: 'bg-rose-50/90 text-rose-900 border border-rose-200/90 hover:bg-rose-100/80',
      inactive: 'bg-white/80 text-slate-600 border border-slate-200/80 hover:border-rose-300 hover:text-rose-800',
    },
  };

  const stepOrder: StepKey[] = ['notice', 'hypothesize', 'clarify', 'use', 'schedule'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progressPercent = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. TOPIC HEADER CARD (Compact on mobile, Audit UX-02)    */}
      {/* ======================================================== */}
      <div className="p-3.5 sm:p-6 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30 border border-indigo-100/90 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-black flex items-center justify-center text-base sm:text-lg shadow-sm shadow-purple-200 shrink-0">
            L{topic.level}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="text-indigo-700 font-extrabold tracking-wide uppercase bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-md text-xs">{topic.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-400 text-xs">{topic.topicId}</span>
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 sm:mt-1">
              {topic.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xl">
              {topic.descriptionHi}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTopicModal}
          className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-extrabold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200/80 rounded-2xl transition-all cursor-pointer shrink-0 shadow-2xs self-start sm:self-center"
        >
          <span>{t('topic_choose_another')}</span>
          <ChevronDown className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. DUOLINGO-STYLE PROGRESS TRACKER & STEPPER PILLS       */}
      {/* ======================================================== */}
      <div className="bg-white/95 backdrop-blur-xs border border-indigo-100/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* Animated Progress Bar */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span className="flex items-center gap-1.5 text-indigo-800 font-extrabold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{t('step_progress_prefix')} {currentStepIndex + 1} / 5: {cycleStepsList[currentStepIndex].shortTitle}</span>
          </span>
          <span className="text-slate-500 font-mono font-bold">{Math.round(progressPercent)}% {t('step_complete_suffix')}</span>
        </div>

        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 via-purple-500 to-emerald-400 rounded-full"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* 5-Step Segmented Navigation Pills (Pedagogically Gated: backward navigation is always free; forward requires completing steps) */}
        <div className="flex items-center sm:grid sm:grid-cols-5 gap-1.5 pt-1 overflow-x-auto no-scrollbar scroll-smooth pb-0.5">
          {cycleStepsList.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            const isActive = currentStep === stepItem.key;
            const isCompleted = idx < currentStepIndex;
            const isLocked = idx > maxUnlockedStepIndex;
            const theme = stepPillStyles[stepItem.key];

            return (
              <button
                key={stepItem.key}
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) setCurrentStep(stepItem.key);
                }}
                title={
                  isLocked
                    ? (language === 'en' ? 'Complete earlier steps first to unlock' : 'अनलॉक करने के लिए पहले पिछला कदम पूरा करें')
                    : ''
                }
                className={`flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all shrink-0 sm:shrink shadow-2xs ${
                  isLocked
                    ? 'bg-slate-100/70 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-60 shadow-none'
                    : isActive
                    ? `${theme.active} cursor-pointer`
                    : isCompleted
                    ? `${theme.completed} cursor-pointer`
                    : `${theme.inactive} cursor-pointer`
                }`}
              >
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : isCompleted && !isActive ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
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
            className="bg-gradient-to-b from-sky-50/50 via-white to-white border border-sky-100 rounded-3xl p-6 sm:p-8 pb-28 sm:pb-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-800 bg-sky-100/90 border border-sky-200/80 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('step1_badge')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {steps['1_notice']?.stepTitleHi || t('step1_heading')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                {steps['1_notice']?.instructionHi}
              </p>
            </div>

            {/* Contrast Flashcards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {steps['1_notice']?.pairs.map((pair, idx) => {
                const cardColors = idx % 2 === 0
                  ? {
                      bg: 'bg-gradient-to-br from-sky-50/80 via-white to-blue-50/40 border-sky-200/90 hover:border-sky-300 hover:shadow-sky-100/70',
                      pill: 'bg-sky-100 text-sky-800 border-sky-200/80',
                      highlight: 'bg-sky-100 text-sky-900 border-sky-200/80',
                    }
                  : {
                      bg: 'bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 border-purple-200/90 hover:border-purple-300 hover:shadow-purple-100/70',
                      pill: 'bg-purple-100 text-purple-800 border-purple-200/80',
                      highlight: 'bg-purple-100 text-purple-900 border-purple-200/80',
                    };

                return (
                  <div
                    key={idx}
                    className={`group relative p-5 border rounded-2xl space-y-3 shadow-2xs hover:shadow-md transition-all duration-200 ${cardColors.bg}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-lg border shadow-2xs ${cardColors.pill}`}>
                        {t('step1_example_label')} #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakText(pair.sentence)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-700 bg-white/80 hover:bg-white border border-slate-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title={language === 'en' ? "Listen pronunciation" : "उच्चारण सुनें (Listen)"}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{t('step1_listen_btn')}</span>
                      </button>
                    </div>

                    <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tracking-tight leading-snug">
                      {pair.sentence}
                    </div>

                    <div className="pt-3 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className={`font-bold font-mono px-2.5 py-1 rounded-lg border shadow-2xs ${cardColors.highlight}`}>
                        ✨ {pair.highlightWord}
                      </span>
                      <span className="text-slate-700 text-[11px] font-medium bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
                        {language === 'en' ? 'Sound: ' : 'ध्वनि: '}<strong className="text-slate-900">{pair.soundHintHi}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 1 Footer CTA */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentStep('hypothesize');
                  setMaxUnlockedStepIndex((prev) => Math.max(prev, 1));
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 rounded-2xl transition-all shadow-sm shadow-sky-300 cursor-pointer"
              >
                <span>{t('step1_next_btn')}</span>
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
            className="bg-gradient-to-b from-amber-50/40 via-white to-white border border-amber-100 rounded-3xl p-6 sm:p-8 pb-28 sm:pb-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-200/80 shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('step2_badge')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {steps['2_hypothesize']?.stepTitleHi || t('step2_heading')}
              </h2>
            </div>

            {/* Friendly Inductive Question Tile */}
            <div className="p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3 shadow-2xs">
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

                const optionPastels = [
                  { letter: 'bg-sky-100 text-sky-800 border-sky-200', card: 'bg-gradient-to-r from-sky-50/30 via-white to-white hover:border-sky-300 hover:bg-sky-50/40' },
                  { letter: 'bg-purple-100 text-purple-800 border-purple-200', card: 'bg-gradient-to-r from-purple-50/30 via-white to-white hover:border-purple-300 hover:bg-purple-50/40' },
                  { letter: 'bg-rose-100 text-rose-800 border-rose-200', card: 'bg-gradient-to-r from-rose-50/30 via-white to-white hover:border-rose-300 hover:bg-rose-50/40' },
                  { letter: 'bg-amber-100 text-amber-800 border-amber-200', card: 'bg-gradient-to-r from-amber-50/30 via-white to-white hover:border-amber-300 hover:bg-amber-50/40' },
                ];
                const pastel = optionPastels[idx % optionPastels.length];

                return (
                  <motion.div
                    key={idx}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedHypothesis(idx);
                      }
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedHypothesis(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all space-y-3 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? opt.isCorrect
                          ? 'bg-emerald-50/90 border-emerald-400 text-slate-900 ring-2 ring-emerald-400/30 shadow-xs'
                          : 'bg-amber-50/90 border-amber-400 text-slate-900 ring-2 ring-amber-400/30 shadow-xs'
                        : `${pastel.card} border-slate-200/90 text-slate-800`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                            isSelected
                              ? opt.isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-600 text-white'
                              : `${pastel.letter} border`
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
                          {opt.isCorrect ? (language === 'en' ? '✓ Correct Guess!' : '✓ सही अनुमान!') : (language === 'en' ? '🤔 Think Again' : '🤔 एक बार फिर सोचें')}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2.5 mt-2.5"
                      >
                        <div
                          className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed font-medium ${
                            opt.isCorrect
                              ? 'bg-emerald-100/80 text-emerald-950 border border-emerald-300/60'
                              : 'bg-amber-100/80 text-amber-950 border border-amber-300/60'
                          }`}
                        >
                          {opt.feedbackHi}
                        </div>

                        {/* Socratic Diagnostic Box on Wrong Guess (Anti-Guessing Guardrail) */}
                        {!opt.isCorrect && (
                          <div className="p-3 bg-indigo-50/90 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 leading-relaxed space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                              <span>{t('step2_socratic_why_not')}</span>
                            </div>
                            <p className="text-slate-700">
                              {t('step2_socratic_tip')}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Step 2 Footer Navigation (Gated: requires an honest attempt first) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep('notice')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'en' ? '← Back to Notice' : '← वापस फर्क देखें'}</span>
              </button>

              <motion.button
                whileHover={selectedHypothesis !== null ? { scale: 1.02 } : {}}
                whileTap={selectedHypothesis !== null ? { scale: 0.98 } : {}}
                disabled={selectedHypothesis === null}
                onClick={() => {
                  if (selectedHypothesis !== null) {
                    setCurrentStep('clarify');
                    setMaxUnlockedStepIndex((prev) => Math.max(prev, 2));
                  }
                }}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-sm ${
                  selectedHypothesis === null
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none border border-slate-300'
                    : isHypothesisCorrect
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 cursor-pointer'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 cursor-pointer'
                }`}
              >
                <span>
                  {selectedHypothesis === null
                    ? `🤔 ${t('step2_choose_first_msg')}`
                    : isHypothesisCorrect
                    ? t('step2_unlock_rule_btn')
                    : t('step2_see_rule_btn')}
                </span>
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
            className="bg-gradient-to-b from-purple-50/50 via-white to-white border border-purple-100 rounded-3xl p-6 sm:p-8 pb-28 sm:pb-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-purple-900 bg-purple-100/90 border border-purple-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>{t('step3_badge')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {steps['3_clarify']?.stepTitleHi || t('step3_heading')}
              </h2>
            </div>

            {/* Golden Rule Hero Banner */}
            <div className="p-6 bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-orange-50/50 border-2 border-amber-300/90 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{t('step3_golden_rule')}</span>
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
                {t('step3_quick_examples')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {steps['3_clarify']?.examples.map((ex, idx) => {
                  const exampleThemes = [
                    {
                      card: 'bg-gradient-to-b from-sky-50/80 to-white border-sky-200/90 hover:border-sky-300 shadow-sky-100/60',
                      word: 'text-sky-800',
                      badge: 'bg-sky-100/90 text-sky-900 border-sky-200/80',
                    },
                    {
                      card: 'bg-gradient-to-b from-purple-50/80 to-white border-purple-200/90 hover:border-purple-300 shadow-purple-100/60',
                      word: 'text-purple-800',
                      badge: 'bg-purple-100/90 text-purple-900 border-purple-200/80',
                    },
                    {
                      card: 'bg-gradient-to-b from-emerald-50/80 to-white border-emerald-200/90 hover:border-emerald-300 shadow-emerald-100/60',
                      word: 'text-emerald-800',
                      badge: 'bg-emerald-100/90 text-emerald-900 border-emerald-200/80',
                    },
                  ];
                  const exTheme = exampleThemes[idx % exampleThemes.length];

                  return (
                    <div
                      key={idx}
                      className={`p-4 border rounded-2xl space-y-2 hover:bg-white transition-all shadow-2xs ${exTheme.card}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-bold font-mono ${exTheme.word}`}>
                          {ex.word}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(ex.word)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white/80 rounded-lg transition-colors cursor-pointer"
                          title={language === 'en' ? "Listen pronunciation" : "उच्चारण सुनें"}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block border shadow-2xs ${exTheme.badge}`}>
                        {language === 'en' ? 'Sound: ' : 'ध्वनि: '}{ex.sound}
                      </div>
                      <div className="text-xs text-slate-600 leading-snug">
                        {ex.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guided Practice Quick Warm-up (if available in topic) */}
            {guidedPractice?.questions && guidedPractice.questions.length > 0 && (
              <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{language === 'en' ? 'Quick Warm-up Check:' : 'त्वरित अभ्यास (Quick Check):'}</span>
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    {language === 'en' ? 'Click to select answer' : 'उत्तर पर क्लिक करें'}
                  </span>
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
                            {isCorrect ? (language === 'en' ? '✓ Correct! ' : '✓ सही उत्तर! ') : (language === 'en' ? '✗ Correct answer: ' + q.correctAnswer + ' · ' : '✗ सही उत्तर: ' + q.correctAnswer + ' · ')}
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
                <span>{language === 'en' ? '← Back to Guess' : '← वापस अंदाज़ा देखें'}</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentStep('use');
                  setMaxUnlockedStepIndex((prev) => Math.max(prev, 3));
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>{t('step3_next_btn')}</span>
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
            className="bg-gradient-to-b from-emerald-50/50 via-white to-white border border-emerald-100 rounded-3xl p-6 sm:p-8 pb-28 sm:pb-8 space-y-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-200/80 shadow-2xs">
                  <PenTool className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('step4_badge')}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {steps['5_free_production']?.promptHi || t('step4_heading')}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50/90 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'en' ? '⚡ Instant Offline Checker' : '⚡ सुपरफास्ट ऑफ़लाइन चेकर'}</span>
                </span>
              </div>
            </div>

            {/* Quick Test Inspiration Chips */}
            {steps['5_free_production']?.sampleSolutions && (
              <div className="p-4 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-sky-50/40 border border-emerald-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>{language === 'en' ? 'Click to Test Example:' : 'परीक्षण के लिए उदाहरण चुनें:'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={onEscapeHatch}
                    className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
                  >
                    {t('step4_escape_btn')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {steps['5_free_production'].sampleSolutions.map((sample, idx) => {
                    const chipPastels = [
                      'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100/80',
                      'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100/80',
                      'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/80',
                      'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/80',
                    ];
                    const chipColor = chipPastels[idx % chipPastels.length];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setStudentSentence(sample)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer font-bold shadow-2xs ${chipColor}`}
                      >
                        {sample}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sentence Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span>{language === 'en' ? 'Your English Sentence:' : 'आपका अंग्रेजी वाक्य (Your Sentence):'}</span>
                  {studentSentence.trim() && (
                    <button
                      type="button"
                      onClick={() => speakText(studentSentence)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      title={language === 'en' ? "Listen pronunciation" : "उच्चारण सुनें"}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t('step1_listen_btn')}</span>
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-normal">
                  {language === 'en' ? 'Checked in real-time as you type' : 'जैसे-जैसे आप टाइप करेंगे, स्वतः जांच होगी'}
                </span>
              </div>

              <textarea
                rows={3}
                value={studentSentence}
                onChange={(e) => setStudentSentence(e.target.value)}
                placeholder={steps['5_free_production']?.placeholderHi || t('step4_placeholder')}
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
                      {liveCheckResult.errors.length} {liveCheckResult.errors.length === 1 ? t('step4_fix_found') : t('step4_fixes_found')}:
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
                              <span>{revealedHints[idx] ? (language === 'en' ? 'Hide Hint' : 'संकेत छुपाएँ') : (language === 'en' ? '💡 Clue (Hint)' : '💡 संकेत (Hint)')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => applyCorrection(err)}
                              className="px-3.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('step4_fix_btn')}</span>
                            </button>
                          </div>
                        </div>

                        {revealedHints[idx] && (
                          <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 font-medium leading-relaxed">
                            <strong>{language === 'en' ? '💡 Thinking Clue: ' : '💡 सोचने का संकेत: '}</strong> {err.inductiveHintHi || err.explanationHi}
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
                      {liveCheckResult.positiveFeedbackHi || t('step4_perfect_msg')}
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
                {t('step4_note_label')}
              </label>
              <input
                type="text"
                value={selfNote}
                onChange={(e) => setSelfNote(e.target.value)}
                placeholder={t('step4_note_placeholder')}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  {isSavedToDb ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {language === 'en' ? `Saved safely! 💾 (Session #${savedSessionId})` : `सुरक्षित सेव हो गया! 💾 (सत्र #${savedSessionId})`}
                    </span>
                  ) : (
                    <span>{language === 'en' ? 'Save your sentence to your personal study log.' : 'प्रगति को अपनी व्यक्तिगत प्रोफ़ाइल में सुरक्षित करें।'}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onSaveToDexie}
                  disabled={!studentSentence.trim()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-sm shadow-indigo-200 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavedToDb ? t('step4_saved_btn') : t('step4_save_btn')}</span>
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
                <span>{language === 'en' ? '← Back to Secret Rule' : '← वापस सीक्रेट फॉर्मूला'}</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCurrentStep('schedule');
                  setMaxUnlockedStepIndex(4);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>{t('step4_next_btn')}</span>
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
            className="bg-gradient-to-b from-rose-50/50 via-white to-white border border-rose-100 rounded-3xl p-6 sm:p-8 pb-28 sm:pb-8 space-y-6 shadow-xs"
          >
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-900 bg-rose-100/90 border border-rose-200/80 shadow-2xs">
                <Brain className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('step5_badge')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('step5_heading')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t('step5_desc')}
              </p>
            </div>

            {/* Victory Celebration Card */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-2xl flex items-center gap-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-200">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  {language === 'en' ? 'Awesome effort! Topic cycle complete 🎉' : 'शानदार प्रयास! इस विषय का चक्र पूरा हुआ 🎉'}
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {language === 'en' ? 'Rate how well you recalled this rule so FSRS schedules your next smart review date.' : 'अपने अनुभव के आधार पर नीचे रेटिंग दें ताकि स्मार्ट टाइमर आपकी अगली रिवीजन तारीख तय कर सके।'}
                </p>
              </div>
            </div>

            {/* Next Due Date Banner */}
            <div className="p-6 bg-gradient-to-r from-indigo-50/90 via-purple-50/40 to-indigo-50/90 border border-indigo-200/80 rounded-2xl space-y-3 shadow-2xs">
              <div className="font-bold text-indigo-900 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'en' ? 'Next Smart Review Date:' : 'आगामी समीक्षा तिथि (Next Review Date):'}</span>
                </div>
                {reviewState?.next_due_date && (
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
                    {language === 'en' ? 'Target Retention: 90%' : 'लक्ष्य प्रतिधारण: 90%'}
                  </span>
                )}
              </div>

              {isLoadingReview ? (
                <p className="text-xs text-slate-500">{language === 'en' ? 'Loading review state...' : 'डेटाबेस से समीक्षा लोड हो रही है...'}</p>
              ) : reviewState?.next_due_date ? (
                <div className="space-y-3">
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    {new Date(reviewState.next_due_date).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="px-2.5 py-1 bg-white/90 border border-emerald-200/80 rounded-lg text-emerald-900 font-medium">
                      {language === 'en' ? 'Accuracy Level:' : 'सटीकता स्तर (Accuracy):'}{' '}
                      <strong className="text-emerald-700 font-mono">{reviewState.production_accuracy_score}%</strong>
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="px-2.5 py-1 bg-white/90 border border-indigo-200/80 rounded-lg text-indigo-900 font-medium">
                      {language === 'en' ? 'Recall Score:' : 'स्मृति स्कोर (Recall):'}{' '}
                      <strong className="text-indigo-700 font-mono">{reviewState.rule_recall_score}%</strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-semibold text-slate-600">
                  {language === 'en' ? 'No review scheduled yet. Rate your recall below to set your first review!' : 'अभी कोई समीक्षा तय नहीं हुई है। नीचे रेटिंग देकर अपनी पहली समीक्षा तय करें!'}
                </div>
              )}
            </div>

            {/* Feedback notification on Rating */}
            {ratedFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-900 font-bold text-xs rounded-xl text-center border border-indigo-200 shadow-2xs"
              >
                ✨ {ratedFeedback}
              </motion.div>
            )}

            {/* Kid-Friendly Memory Strength Banner (Cognitive Load Audit UX-01) */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/40 border border-indigo-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xl shrink-0">
                  🧠
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'en' ? 'Memory Power Level' : 'याददाश्त मजबूती स्तर'}
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <span className="text-amber-500">
                      {reviewState?.stability && reviewState.stability >= 10
                        ? '⭐⭐⭐⭐⭐'
                        : reviewState?.stability && reviewState.stability >= 5
                        ? '⭐⭐⭐⭐'
                        : reviewState?.stability && reviewState.stability >= 2
                        ? '⭐⭐⭐'
                        : '⭐⭐'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700">
                      {reviewState?.stability && reviewState.stability >= 10
                        ? (language === 'en' ? '(Ultra Strong)' : '(अत्यंत मजबूत)')
                        : reviewState?.stability && reviewState.stability >= 5
                        ? (language === 'en' ? '(Very Strong)' : '(काफी मजबूत)')
                        : reviewState?.stability && reviewState.stability >= 2
                        ? (language === 'en' ? '(Good)' : '(अच्छा स्तर)')
                        : (language === 'en' ? '(Building up)' : '(बन रही है)')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Optional Toggle to view raw mathematical FSRS metrics */}
              <button
                type="button"
                onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-white/90 hover:bg-white border border-indigo-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer self-start sm:self-center shadow-2xs flex items-center gap-1.5"
              >
                <span>📊</span>
                <span>
                  {showAdvancedStats
                    ? (language === 'en' ? 'Hide Details' : 'विवरण छुपाएँ')
                    : (language === 'en' ? 'Show Algorithm Stats' : 'तकनीकी विवरण देखें')}
                </span>
              </button>
            </div>

            {/* Optional Advanced FSRS Cognitive Metrics Grid (Collapsible for students) */}
            {showAdvancedStats && (
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{language === 'en' ? 'Advanced FSRS Algorithm Parameters:' : 'उन्नत FSRS एल्गोरिदम पैरामीटर्स:'}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-gradient-to-b from-indigo-50/80 via-white to-white border border-indigo-200/90 rounded-2xl space-y-1 shadow-2xs">
                    <span className="text-xs font-semibold text-slate-500 block">{language === 'en' ? 'Memory Power' : 'मेमोरी पावर (Stability)'}</span>
                    <span className="text-base font-bold font-mono text-indigo-700">
                      {reviewState?.stability ? `${reviewState.stability.toFixed(1)} ${language === 'en' ? 'days' : 'दिन'}` : (language === 'en' ? '3.5 days' : '3.5 दिन')}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gradient-to-b from-emerald-50/80 via-white to-white border border-emerald-200/90 rounded-2xl space-y-1 shadow-2xs">
                    <span className="text-xs font-semibold text-slate-500 block">{language === 'en' ? 'Retention Chance' : 'याद रहने का चांस (Recall)'}</span>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      {reviewState?.stability
                        ? `${calculateRetention(reviewState.stability, 0)}%`
                        : '95%'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gradient-to-b from-amber-50/80 via-white to-white border border-amber-200/90 rounded-2xl space-y-1 shadow-2xs">
                    <span className="text-xs font-semibold text-slate-500 block">{language === 'en' ? 'Difficulty Level' : 'चुनौती स्तर (Level)'}</span>
                    <span className="text-base font-bold font-mono text-amber-700">
                      {reviewState?.difficulty ? `${reviewState.difficulty.toFixed(1)} / 10` : '4.5 / 10'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gradient-to-b from-purple-50/80 via-white to-white border border-purple-200/90 rounded-2xl space-y-1 shadow-2xs">
                    <span className="text-xs font-semibold text-slate-500 block">{language === 'en' ? 'Practice Reps' : 'प्रैक्टिस राउंड्स (Reps)'}</span>
                    <span className="text-base font-bold font-mono text-purple-700">
                      {reviewState?.reps ?? 1} {language === 'en' ? 'reps' : 'बार'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Self-Rating Buttons */}
            <div className="p-5 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-purple-50/20 border border-indigo-100/90 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'en' ? 'Rate Your Recall:' : 'खुद को रेट करें (Rate Your Recall):'}</span>
                </span>
                <span className="text-slate-500 text-[11px]">
                  {language === 'en' ? 'Click to schedule next review' : 'क्लिक करके रिवीजन टाइम चुनें'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.AGAIN)}
                  className="p-3.5 rounded-xl border border-rose-200 bg-gradient-to-b from-rose-50/80 via-white to-white hover:bg-rose-100/80 text-rose-900 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-rose-300"
                >
                  <span className="text-sm">🔴 {t('fsrs_again_label')}</span>
                  <span className="text-[11px] font-normal text-rose-600">{t('fsrs_again_sub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.HARD)}
                  className="p-3.5 rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/80 via-white to-white hover:bg-amber-100/80 text-amber-900 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-amber-300"
                >
                  <span className="text-sm">🟡 {t('fsrs_hard_label')}</span>
                  <span className="text-[11px] font-normal text-amber-600">{t('fsrs_hard_sub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.GOOD)}
                  className="p-3.5 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 via-white to-white hover:bg-emerald-100/80 text-emerald-900 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-emerald-300"
                >
                  <span className="text-sm">🟢 {t('fsrs_good_label')}</span>
                  <span className="text-[11px] font-normal text-emerald-600">{t('fsrs_good_sub')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFSRSRating(FSRS_RATINGS.EASY)}
                  className="p-3.5 rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50/80 via-white to-white hover:bg-sky-100/80 text-sky-900 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer hover:border-sky-300"
                >
                  <span className="text-sm">🔵 {t('fsrs_easy_label')}</span>
                  <span className="text-[11px] font-normal text-sky-600">{t('fsrs_easy_sub')}</span>
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
                <span>{language === 'en' ? 'Practice This Topic Again' : 'इसी विषय का पुनः अभ्यास करें'}</span>
              </button>

              <button
                type="button"
                onClick={onOpenTopicModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>{t('step5_complete_btn')}</span>
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
        flightIntervalSeconds={flightIntervalSeconds}
        activeTopic={topic}
      />
    </div>
  );
};
