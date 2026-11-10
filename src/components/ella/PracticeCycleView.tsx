import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  ChevronDown,
  Brain,
  Clock,
  RotateCcw,
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

export type StepKey = 'use' | 'notice' | 'hypothesize' | 'clarify' | 'schedule';

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
}) => {
  const [currentStep, setCurrentStep] = useState<StepKey>('use');
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);

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

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const cycleStepsList: { key: StepKey; label: string; icon: any }[] = [
    { key: 'use', label: 'Use & Live Feedback', icon: PenTool },
    { key: 'notice', label: '1. Notice (अवलोकन)', icon: BookOpen },
    { key: 'hypothesize', label: '2. Hypothesize (अनुमान)', icon: HelpCircle },
    { key: 'clarify', label: '3. Clarify (स्वर्ण नियम)', icon: Sparkles },
    { key: 'schedule', label: '4. Review & Schedule', icon: Calendar },
  ];

  const applyCorrection = (error: RuleError) => {
    const updated = studentSentence.replace(error.matchedText, error.suggestedText);
    setStudentSentence(updated);
  };

  const handleFSRSRating = async (rating: FSRSRating) => {
    const now = new Date();
    const nextFSRS = computeNextFSRSState(reviewState || undefined, rating, now);
    const recallScores: Record<FSRSRating, number> = { 1: 50, 2: 70, 3: 90, 4: 98 };
    const accuracy = reviewState?.production_accuracy_score ?? 100;

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

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Topic Switcher Bar (Light, Friendly Card) */}
      <div className="p-4 sm:p-5 bg-white border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 font-bold font-mono text-sm">
            L{activeTopic.level}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-indigo-600 font-bold">{activeTopic.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{activeTopic.topicId}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight mt-0.5">
              {activeTopic.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenTopicModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer border border-slate-200/80"
        >
          <span>पाठ्यक्रम से दूसरा विषय चुनें</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* 5-Step Segmented Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
        {cycleStepsList.map((stepItem) => {
          const Icon = stepItem.icon;
          const isActive = currentStep === stepItem.key;
          return (
            <button
              key={stepItem.key}
              onClick={() => setCurrentStep(stepItem.key)}
              className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{stepItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* STEP 1: USE & LIVE FEEDBACK (वाक्य निर्माण)              */}
      {/* ======================================================== */}
      {currentStep === 'use' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  चरण 4 • Mandatory Production Task (USE)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {steps['5_free_production']?.promptHi || 'अपना एक अंग्रेजी वाक्य लिखें:'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  0ms Offline Regex Engine
                </span>
              </div>
            </div>

            {/* Quick Test Samples */}
            {steps['5_free_production']?.sampleSolutions && (
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 font-semibold">
                  परीक्षण के लिए उदाहरण चुनें (Click to Test):
                </div>
                <div className="flex flex-wrap gap-2">
                  {steps['5_free_production'].sampleSolutions.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStudentSentence(sample)}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-800 text-slate-700 transition-colors cursor-pointer font-medium"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sentence Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <span>वाक्य लिखें (Your Sentence):</span>
                  {studentSentence.trim() && (
                    <button
                      type="button"
                      onClick={() => speakText(studentSentence)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                      title="उच्चारण सुनें (Listen Voice)"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onEscapeHatch}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-medium cursor-pointer"
                >
                  आसान उदाहरण दिखाएँ (Escape Hatch)
                </button>
              </div>

              <textarea
                rows={3}
                value={studentSentence}
                onChange={(e) => setStudentSentence(e.target.value)}
                placeholder={steps['5_free_production']?.placeholderHi || 'e.g. He waited for an hour.'}
                className="w-full p-4 text-sm font-mono bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all leading-relaxed shadow-2xs"
              />
            </div>

            {/* LIVE FEEDBACK BOX */}
            <div className="pt-1">
              {liveCheckResult.errors.length > 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      {liveCheckResult.errors.length} सुधार आवश्यक (Max 2 Rule):
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {liveCheckResult.errors.slice(0, 2).map((err, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white border border-amber-200/80 rounded-xl space-y-2 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs">
                            <span className="text-rose-600 line-through font-mono font-bold mr-2">
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
                              className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Apply Fix</span>
                            </button>
                          </div>
                        </div>

                        {revealedHints[idx] && (
                          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-900 font-medium">
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
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      {liveCheckResult.positiveFeedbackHi ||
                        'शाबाश! आपका वाक्य व्याकरण के नियमों के अनुसार 100% सही है।'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-bold shrink-0">
                    Accuracy: 100%
                  </span>
                </div>
              ) : null}
            </div>

            {/* Self-Reflection Note */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                आत्म-चिंतन नोट (Self-Explanation Note): आज आपने क्या नया नियम सीखा?
              </label>
              <input
                type="text"
                value={selfNote}
                onChange={(e) => setSelfNote(e.target.value)}
                placeholder="उदा. 'Hour' में 'h' मूक (silent) होता है इसलिए 'An hour' बोलते हैं..."
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  {isSavedToDb ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      लोकल डेटाबेस (Dexie) में सेव हुआ! (Session #{savedSessionId})
                    </span>
                  ) : (
                    <span>प्रयास को अपनी व्यक्तिगत प्रगति में सेव करें।</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onSaveToDexie}
                  disabled={!studentSentence.trim()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all shadow-xs shadow-indigo-200 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>अभ्यास सेव करें (Save to Local DB)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: NOTICE (अवलोकन व तुलना)                          */}
      {/* ======================================================== */}
      {currentStep === 'notice' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              चरण 1 • अवलोकन (Observation)
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {steps['1_notice']?.stepTitleHi || 'ध्यान से देखें और अंतर समझें'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {steps['1_notice']?.instructionHi}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {steps['1_notice']?.pairs.map((pair, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-2 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-600 font-bold">
                    उदाहरण #{idx + 1}
                  </span>
                  <button
                    onClick={() => speakText(pair.sentence)}
                    className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                    title="उच्चारण सुनें"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm font-semibold text-slate-900 font-mono">
                  {pair.sentence}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-amber-800 font-bold font-mono bg-amber-100/70 px-2 py-0.5 rounded">
                    [{pair.highlightWord}]
                  </span>
                  <span className="text-slate-600">
                    ध्वनि: <strong className="text-slate-900">{pair.soundHintHi}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep('hypothesize')}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>अगला चरण: 2. Hypothesize</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: HYPOTHESIZE (सक्रिय अनुमान)                      */}
      {/* ======================================================== */}
      {currentStep === 'hypothesize' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              चरण 2 • सक्रिय अनुमान (Active Discovery)
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {steps['2_hypothesize']?.stepTitleHi || 'स्वयं नियम का अनुमान लगाएँ'}
            </h3>
            <p className="text-sm font-bold text-slate-900 mt-2 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
              ❓ {steps['2_hypothesize']?.questionHi}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {steps['2_hypothesize']?.options.map((opt, idx) => {
              const isSelected = selectedHypothesis === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedHypothesis(idx)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? opt.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900 ring-2 ring-emerald-400/40'
                        : 'bg-rose-50 border-rose-300 text-slate-900 ring-2 ring-rose-400/40'
                      : 'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      {String.fromCharCode(65 + idx)}. {opt.textHi}
                    </span>
                    {isSelected && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${opt.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {opt.isCorrect ? '✓ सही अनुमान!' : '✗ पुनः विचार करें'}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div
                      className={`p-2.5 rounded-xl text-xs leading-relaxed font-medium ${
                        opt.isCorrect
                          ? 'bg-emerald-100/70 text-emerald-900'
                          : 'bg-rose-100/70 text-rose-900'
                      }`}
                    >
                      {opt.feedbackHi}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep('notice')}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              ← वापस Notice देखें
            </button>
            <button
              onClick={() => setCurrentStep('clarify')}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>अगला चरण: 3. Clarify (नियम)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: CLARIFY (स्वर्ण नियम व स्पष्टीकरण)               */}
      {/* ======================================================== */}
      {currentStep === 'clarify' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              चरण 3 • नियम स्पष्टीकरण (Golden Formula)
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {steps['3_clarify']?.stepTitleHi || 'स्वर्ण नियम (The Golden Rule)'}
            </h3>
          </div>

          {/* Golden Rule Highlight Card */}
          <div className="p-5 bg-gradient-to-r from-amber-50 via-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>स्वर्ण नियम (Golden Rule):</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {steps['3_clarify']?.goldenRuleHi}
            </div>
            <p className="text-xs text-slate-700 leading-relaxed pt-2 border-t border-indigo-200/60">
              {steps['3_clarify']?.theRuleHi}
            </p>
          </div>

          {/* Examples Grid */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-600">
              ध्वनि-संकेत और उदाहरण (Sound Examples):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps['3_clarify']?.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-indigo-700">
                      {ex.word}
                    </span>
                    <button
                      onClick={() => speakText(ex.word)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="उच्चारण सुनें"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block">
                    ध्वनि: {ex.sound}
                  </div>
                  <div className="text-xs text-slate-600 leading-tight pt-1">
                    {ex.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep('hypothesize')}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              ← वापस Hypothesize
            </button>
            <button
              onClick={() => setCurrentStep('use')}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>वाक्य निर्माण करें (Go to USE)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 5: SCHEDULE & REVIEW (FSRS Engine)                  */}
      {/* ======================================================== */}
      {currentStep === 'schedule' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-600" />
              <span>चरण 4 • FSRS स्मृति समीक्षा (Cognitive Spaced Repetition)</span>
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              स्मृति स्थायित्व व अगली समीक्षा तालिका
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              FSRS कलन-विधि द्वारा छात्र के अभ्यास इतिहास के आधार पर वैज्ञानिक रूप से निर्धारित समय।
            </p>
          </div>

          {/* Next Due Date Banner */}
          <div className="p-5 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-indigo-50/80 border border-indigo-200 rounded-2xl space-y-3">
            <div className="font-bold text-indigo-900 flex items-center justify-between text-sm">
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
                अभी कोई समीक्षा तय नहीं हुई है। वाक्य निर्माण करने पर यह स्वतः शेड्यूल होगी।
              </div>
            )}
          </div>

          {/* FSRS Cognitive Metrics Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>मेमोरी मेट्रिक्स (Cognitive Stability & Difficulty):</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">स्मृति स्थायित्व (Stability)</span>
                <span className="text-base font-bold font-mono text-indigo-700">
                  {reviewState?.stability ? `${reviewState.stability.toFixed(1)} दिन` : '3.5 दिन'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">अनुमानित प्रतिधारण (Recall)</span>
                <span className="text-base font-bold font-mono text-emerald-700">
                  {reviewState?.stability
                    ? `${calculateRetention(reviewState.stability, 0)}%`
                    : '95%'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">कठिनाई स्तर (Difficulty)</span>
                <span className="text-base font-bold font-mono text-amber-700">
                  {reviewState?.difficulty ? `${reviewState.difficulty.toFixed(1)} / 10` : '4.5 / 10'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">सफल आवृत्तियां (Reps)</span>
                <span className="text-base font-bold font-mono text-purple-700">
                  {reviewState?.reps ?? 1} बार
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Self-Rating Buttons */}
          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                <span>स्व-मूल्यांकन (Self-Rate & Adjust Schedule):</span>
              </span>
              <span className="text-slate-500 text-[11px]">अपनी सुविधानुसार शेड्यूल बदलें</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleFSRSRating(FSRS_RATINGS.AGAIN)}
                className="p-3 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span>🔴 पुनः अभ्यास</span>
                <span className="text-[10px] font-normal text-rose-600">कल (1 दिन)</span>
              </button>

              <button
                type="button"
                onClick={() => handleFSRSRating(FSRS_RATINGS.HARD)}
                className="p-3 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span>🟡 थोड़ा कठिन</span>
                <span className="text-[10px] font-normal text-amber-600">2 दिन बाद</span>
              </button>

              <button
                type="button"
                onClick={() => handleFSRSRating(FSRS_RATINGS.GOOD)}
                className="p-3 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span>🟢 अच्छा (Good)</span>
                <span className="text-[10px] font-normal text-emerald-600">4 दिन बाद</span>
              </button>

              <button
                type="button"
                onClick={() => handleFSRSRating(FSRS_RATINGS.EASY)}
                className="p-3 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-800 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <span>🔵 बहुत सरल</span>
                <span className="text-[10px] font-normal text-indigo-600">7+ दिन बाद</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep('use')}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <span>अभ्यास पर वापस जाएँ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
