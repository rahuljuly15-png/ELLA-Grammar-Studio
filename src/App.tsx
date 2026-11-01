import { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Info,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  HelpCircle,
  PenTool,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Database,
  Check,
  Zap,
  MapPin,
  Settings,
  Calendar,
  Lock,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { CLASS_7_SYLLABUS, ENGINES_META, type CurriculumTopic, type EngineType } from './data/curriculum';
import { getTopicById, type FullTopicData, type NoticePair, type HypothesizeOption, type ClarifyExample } from './data/topicLoader';
import {
  checkSentenceOffline,
  recordProductionAttempt,
  type RuleCheckResult,
  type RuleError,
} from './engines/offlineRuleEngine';
import { exportDatabaseToJson, importDatabaseFromJson, getOfflineDbCounts } from './services/backupService';

type MainView = 'cycle' | 'mastery_map' | 'settings';
type StepKey = 'use' | 'notice' | 'hypothesize' | 'clarify' | 'feedback' | 'schedule';

export default function App() {
  // Main Navigation View: 'cycle' (आज का अभ्यास) | 'mastery_map' (कौशल मानचित्र) | 'settings' (सेटिंग्स व बैकअप)
  const [currentView, setCurrentView] = useState<MainView>('cycle');

  // Selected Topic
  const [activeTopicId, setActiveTopicId] = useState<string>('level1-articles-01');
  const activeTopic: FullTopicData = useMemo(() => getTopicById(activeTopicId), [activeTopicId]);

  // 6-Step Cycle State (USE is open and active on screen)
  const [currentStep, setCurrentStep] = useState<StepKey>('use');
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);

  // Production (USE) state
  const [studentSentence, setStudentSentence] = useState<string>('Wait here for a hour please.');
  const [selfNote, setSelfNote] = useState<string>('');
  const [savedSessionId, setSavedSessionId] = useState<number | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState<boolean>(false);

  // Database stats & feedback
  const [dbStats, setDbStats] = useState<{ sessionsCount: number; errorsCount: number; reviewsCount: number }>({
    sessionsCount: 0,
    errorsCount: 0,
    reviewsCount: 0,
  });
  const [backupToast, setBackupToast] = useState<string | null>(null);
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState<boolean>(false);

  // Real-time offline regex error checking
  const liveCheckResult: RuleCheckResult = useMemo(() => {
    return checkSentenceOffline(studentSentence, activeTopicId);
  }, [studentSentence, activeTopicId]);

  // Refresh local stats
  const refreshStats = async () => {
    try {
      const stats = await getOfflineDbCounts();
      setDbStats(stats);
    } catch (e) {
      console.error('Error fetching DB stats:', e);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // Web Speech API Voice (₹0 In-built TTS)
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/<[^>]*>?/gm, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // When switching topic, reset sentence and step
  const handleSelectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setSelectedHypothesis(null);
    setSavedSessionId(null);
    setIsTopicMenuOpen(false);
    setCurrentView('cycle');
    setCurrentStep('use');

    // Pre-fill appropriate sample sentence based on topic
    if (topicId.includes('articles')) {
      setStudentSentence('Wait here for a hour please.');
    } else if (topicId.includes('agreement')) {
      setStudentSentence('The dog bark loudly every night.');
    } else if (topicId.includes('adjective')) {
      setStudentSentence('Rohan is more taller than Amit.');
    } else if (topicId.includes('tenses')) {
      setStudentSentence('He go to Agra yesterday.');
    } else if (topicId.includes('passive')) {
      setStudentSentence('The sweet apple was eaten by Ram.');
    } else if (topicId.includes('notice')) {
      setStudentSentence('This is to inform all students that sports day is on Monday.');
    } else {
      setStudentSentence('The children play football in the park.');
    }
  };

  // Save current sentence evaluation to Dexie.js
  const handleSaveToDexie = async () => {
    if (!studentSentence.trim()) return;
    try {
      const { sessionId } = await recordProductionAttempt(
        activeTopicId,
        studentSentence,
        liveCheckResult,
        selfNote
      );
      setSavedSessionId(sessionId);
      setIsSavedToDb(true);
      await refreshStats();
      setTimeout(() => setIsSavedToDb(false), 3500);
    } catch (err) {
      console.error('Dexie save error:', err);
    }
  };

  // 1-Click JSON Backup
  const handleExportBackup = async () => {
    try {
      await exportDatabaseToJson();
      setBackupToast('बैकअप JSON फ़ाइल सफलतापूर्वक डाउनलोड हो गई!');
      setTimeout(() => setBackupToast(null), 3000);
    } catch (err) {
      console.error('Backup error:', err);
      setBackupToast('बैकअप निर्यात में त्रुटि हुई');
    }
  };

  // Restore JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importDatabaseFromJson(file);
      setBackupToast(res.message);
      await refreshStats();
      setTimeout(() => setBackupToast(null), 3500);
    } catch (err) {
      console.error('Restore error:', err);
      setBackupToast('बैकअप रीस्टोर विफल रहा');
    }
  };

  // Escape Hatch: Simpler example handler
  const handleSimplerExample = () => {
    setBackupToast('आसान उदाहरण लोड किया गया!');
    setTimeout(() => setBackupToast(null), 2000);
  };

  const steps = activeTopic.steps;

  const cycleStepsList: { key: StepKey; label: string; icon: typeof BookOpen }[] = [
    { key: 'use', label: 'Use & Live Feedback', icon: PenTool },
    { key: 'notice', label: '1. Notice', icon: BookOpen },
    { key: 'hypothesize', label: '2. Hypothesize', icon: HelpCircle },
    { key: 'clarify', label: '3. Clarify', icon: Sparkles },
    { key: 'schedule', label: '4. Schedule & Review', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-3 sm:p-5 md:p-7 font-sans">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & PROGRESSIVE DISCLOSURE TABS              */}
      {/* ======================================================== */}
      <header className="w-full max-w-2xl mx-auto space-y-3 pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                ELLA Grammar Studio v2.1
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Zap className="w-3 h-3 text-emerald-600" />
                Class 7 Bilingual
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">{activeTopic.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
              title="1-Click JSON Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1-Click Backup</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-700">100% Offline</span>
            </div>
          </div>
        </div>

        {/* Primary View Switcher (3 Tabs: Today's Cycle, Mastery Map, Settings) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setCurrentView('cycle')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              currentView === 'cycle'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>आज का अभ्यास</span>
          </button>

          <button
            onClick={() => setCurrentView('mastery_map')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              currentView === 'mastery_map'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>कौशल मानचित्र (21 Topics)</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              currentView === 'settings'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>सेटिंग्स व बैकअप</span>
          </button>
        </div>
      </header>

      {/* Backup Notification Toast */}
      {backupToast && (
        <div className="w-full max-w-2xl mx-auto mt-2 p-2.5 bg-emerald-600 text-white text-xs font-medium rounded-xl text-center shadow-md animate-in fade-in duration-200">
          ✓ {backupToast}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CONTAINER                              */}
      {/* ======================================================== */}
      <main className="w-full max-w-2xl mx-auto my-3 sm:my-5 flex-1 flex flex-col">

        {/* -------------------------------------------------------- */}
        {/* VIEW A: TODAY'S CYCLE (आज का 6-STEP अभ्यास लूप)         */}
        {/* -------------------------------------------------------- */}
        {currentView === 'cycle' && (
          <div className="space-y-4">
            {/* Topic Switcher Bar with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTopicMenuOpen(!isTopicMenuOpen)}
                className="w-full p-2.5 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="text-slate-400 font-normal">विषय (Topic):</span>
                  <span className="font-bold text-slate-900 truncate">{activeTopic.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-600 shrink-0">
                  <span className="text-[11px]">विषय बदलें</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition ${isTopicMenuOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Topic Dropdown Modal */}
              {isTopicMenuOpen && (
                <div className="absolute top-12 left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 max-h-80 overflow-y-auto space-y-2 animate-in fade-in duration-150">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    कक्षा 7 का पूरा पाठ्यक्रम (Class 7 Syllabus):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {CLASS_7_SYLLABUS.map((t: CurriculumTopic) => {
                      const isSelected = activeTopicId === t.topicId;
                      return (
                        <button
                          key={t.topicId}
                          type="button"
                          onClick={() => handleSelectTopic(t.topicId)}
                          className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex flex-col gap-0.5 ${
                            isSelected
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-indigo-600">Level {t.level}</span>
                            <span className="text-[10px] text-slate-400">{t.categoryHi}</span>
                          </div>
                          <span className="truncate">{t.titleHi}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 6-Step Navigation Tabs */}
            <nav className="grid grid-cols-5 gap-1 p-1 bg-slate-200/70 rounded-xl">
              {cycleStepsList.map((stepItem: { key: StepKey; label: string; icon: typeof BookOpen }) => {
                const IconComponent = stepItem.icon;
                const isActive = currentStep === stepItem.key;
                return (
                  <button
                    key={stepItem.key}
                    onClick={() => setCurrentStep(stepItem.key)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{stepItem.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* STEP: USE (LIVE ON-SCREEN PRODUCTION WORKSPACE) */}
            {currentStep === 'use' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. Sentence Input Box */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5" />
                        Stage 1 • Mandatory Production Task (USE)
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        {steps['5_free_production']?.promptHi || 'अपना एक अंग्रेजी वाक्य लिखें:'}
                      </h2>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Live Offline Checker
                    </span>
                  </div>

                  {/* Sample Solutions / Suggestions */}
                  {steps['5_free_production']?.sampleSolutions && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        परीक्षण के लिए उदाहरण चुनें (Click to Test):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {steps['5_free_production'].sampleSolutions.map((sample: string, idx: number) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setStudentSentence(sample)}
                            className="text-[11px] px-2.5 py-1 rounded-lg border bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-slate-700 border-slate-200 transition cursor-pointer font-medium"
                          >
                            {sample}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <label htmlFor="sentence-input">वाक्य लिखें (Your Sentence):</label>
                        {studentSentence.trim() && (
                          <button
                            type="button"
                            onClick={() => speakText(studentSentence)}
                            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                            title="उच्चारण सुनें (Listen Voice)"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSimplerExample}
                        className="text-[11px] text-indigo-600 hover:underline cursor-pointer font-normal flex items-center gap-1"
                      >
                        <HelpCircle className="w-3 h-3" />
                        मुझे और आसान उदाहरण दिखाएँ (Escape Hatch)
                      </button>
                    </div>
                    <div className="relative">
                      <textarea
                        id="sentence-input"
                        value={studentSentence}
                        onChange={(e) => setStudentSentence(e.target.value)}
                        placeholder={steps['5_free_production']?.placeholderHi || 'उदा. My brother is an honest police officer.'}
                        rows={2}
                        className="w-full p-3.5 text-sm sm:text-base font-medium rounded-xl border border-indigo-200 bg-indigo-50/20 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner leading-relaxed"
                      />
                      {studentSentence && (
                        <button
                          type="button"
                          onClick={() => setStudentSentence('')}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
                          title="साफ़ करें"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Self-Explanation & Dexie Save Button */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 items-end">
                    <div className="flex-1 w-full space-y-1">
                      <label className="block text-[11px] font-semibold text-slate-500">
                        आत्म-स्पष्टीकरण (आपने यह नियम क्यों चुना? - वैकल्पिक):
                      </label>
                      <input
                        type="text"
                        value={selfNote}
                        onChange={(e) => setSelfNote(e.target.value)}
                        placeholder="उदा. ध्वनि नियम के अनुसार स्वर से शुरुआत है।"
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveToDexie}
                      disabled={!studentSentence.trim()}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 ${
                        studentSentence.trim()
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isSavedToDb ? '✓ Dexie में सेव हो गया!' : 'Dexie DB में सहेजें'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Offline Feedback Box (Active on Screen) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          !studentSentence.trim()
                            ? 'bg-slate-300'
                            : liveCheckResult.isValid
                            ? 'bg-emerald-500 animate-pulse'
                            : 'bg-rose-500 animate-pulse'
                        }`}
                      />
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <span>ऑफ़लाइन फ़ीडबैक बॉक्स (Live Offline Feedback)</span>
                      </h3>
                    </div>

                    {studentSentence.trim() && (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          liveCheckResult.isValid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {liveCheckResult.isValid ? '✓ 100% सही' : `⚠️ ${liveCheckResult.errors.length} त्रुटि मिली`}
                      </span>
                    )}
                  </div>

                  {/* Empty Input Notice */}
                  {!studentSentence.trim() && (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-1">
                      <p className="text-xs font-medium text-slate-600">
                        👆 ऊपर बॉक्स में अपना वाक्य टाइप करें।
                      </p>
                      <p className="text-[11px] text-slate-400">
                        ऑफ़लाइन इंजन वास्तविक समय में व्याकरण नियमों की जाँच करेगा।
                      </p>
                    </div>
                  )}

                  {/* Valid State */}
                  {studentSentence.trim() && liveCheckResult.isValid && (
                    <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>शाबाश! व्याकरण और ध्वनि नियम बिल्कुल सही हैं।</span>
                      </div>
                      <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                        {liveCheckResult.positiveFeedbackHi}
                      </p>
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-xs text-slate-800 font-semibold flex items-center justify-between">
                        <span>"{liveCheckResult.inputSentence}"</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                          Passed Offline
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error State with Breakdown & 1-Click Fix */}
                  {studentSentence.trim() && !liveCheckResult.isValid && (
                    <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>सुधार सुझाव (Maximum 2 Errors Rule):</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStudentSentence(liveCheckResult.correctedSentence)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>सुधार लागू करें (Apply Fix)</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {liveCheckResult.errors.slice(0, 2).map((err: RuleError, idx: number) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-rose-100 text-xs space-y-1.5 shadow-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold line-through">
                                {err.matchedText}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                                {err.suggestedText}
                              </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-medium">
                              {err.explanationHi}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                        <span className="font-bold text-amber-950">सही वाक्य: </span>
                        <span className="text-amber-900 font-medium">"{liveCheckResult.correctedSentence}"</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        Dexie.js DB: {dbStats.sessionsCount} सत्र सहेजे गए{' '}
                        {savedSessionId ? `(सत्र #${savedSessionId})` : ''}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      SRS Spaced Repetition: {liveCheckResult.isValid ? '+3 दिन बाद' : '+कल समीक्षा'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: NOTICE */}
            {currentStep === 'notice' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 1 • Inductive Observation</span>
                  <p className="text-base font-medium text-slate-800 leading-snug">
                    {steps['1_notice'].instructionHi}
                  </p>
                </div>

                <div className="space-y-3">
                  {steps['1_notice'].pairs.map((pair: NoticePair, idx: number) => (
                    <div key={idx} className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-base text-slate-800 leading-relaxed font-medium">
                          {pair.sentence}
                        </p>
                        <button
                          type="button"
                          onClick={() => speakText(pair.sentence)}
                          className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md transition cursor-pointer shrink-0"
                          title="उच्चारण सुनें (Listen)"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-indigo-700 font-medium">
                        <Info className="w-3.5 h-3.5 shrink-0" />
                        <span>{pair.soundHintHi}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleSimplerExample}
                    className="text-xs text-slate-500 hover:text-indigo-600 cursor-pointer"
                  >
                    मुझे और आसान उदाहरण दिखाएँ
                  </button>
                  <button
                    onClick={() => setCurrentStep('hypothesize')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-xl flex items-center gap-2 transition cursor-pointer text-xs"
                  >
                    <span>अगला चरण: नियम का अनुमान लगाएँ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: HYPOTHESIZE */}
            {currentStep === 'hypothesize' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Step 2 • Active Discovery</span>
                  <p className="text-base font-medium text-slate-800 leading-snug">
                    {steps['2_hypothesize'].questionHi}
                  </p>
                </div>

                <div className="space-y-3">
                  {steps['2_hypothesize'].options.map((opt: HypothesizeOption, idx: number) => {
                    const isSelected = selectedHypothesis === idx;
                    return (
                      <div key={idx} className="space-y-2">
                        <button
                          onClick={() => setSelectedHypothesis(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200 text-indigo-950'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs border ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="flex-1">{opt.textHi}</span>
                        </button>

                        {isSelected && (
                          <div
                            className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                              opt.isCorrect
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                                : 'bg-rose-50 text-rose-900 border border-rose-200'
                            }`}
                          >
                            {opt.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <span>{opt.feedbackHi}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setCurrentStep('notice')}
                    className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center gap-1 text-xs transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>पीछे</span>
                  </button>
                  <button
                    disabled={selectedHypothesis === null}
                    onClick={() => setCurrentStep('clarify')}
                    className={`flex-1 font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 text-xs transition ${
                      selectedHypothesis !== null
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>सुनहरा नियम देखें</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CLARIFY */}
            {currentStep === 'clarify' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">सुनहरा नियम (Golden Rule)</h2>
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Step 3 • Concept Mastery</span>
                </div>

                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                    {steps['3_clarify'].goldenRuleHi}
                  </p>
                  <div className="pt-2 border-t border-amber-200/80 text-xs text-amber-900 leading-normal">
                    {steps['3_clarify'].theRuleHi}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">त्वरित उदाहरण (Quick Check):</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {steps['3_clarify'].examples.map((ex: ClarifyExample, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="font-bold text-indigo-700 text-xs sm:text-sm">{ex.word}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{ex.sound}</p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">{ex.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setCurrentStep('hypothesize')}
                    className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center gap-1 text-xs transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>पीछे</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('use')}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl flex justify-center items-center gap-2 text-xs transition cursor-pointer"
                  >
                    <span>अभ्यास व फ़ीडबैक बॉक्स पर जाएँ (USE)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: SCHEDULE & REFLECTION */}
            {currentStep === 'schedule' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">रिविज़न शेड्यूलर (SRS & Recap)</h2>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Step 6 • Metacognitive Reflection</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-slate-800">
                    {steps['6_reflection']?.promptHi || 'आज आपने अपने शब्दों में क्या सीखा?'}
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    {steps['6_reflection']?.recapPointsHi?.map((point: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-900">Dual-Rating FSRS स्थिति: </span>
                    <span className="text-indigo-700">Next Review Scheduled</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white text-indigo-700 rounded-md font-bold text-[11px]">
                    +3 Days
                  </span>
                </div>

                <button
                  onClick={() => setCurrentStep('use')}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex justify-center items-center gap-2 transition cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>वापस अभ्यास (USE) पर जाएँ</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* VIEW B: MASTERY MAP (कौशल मानचित्र — 4 ENGINES & 21 TOPICS) */}
        {/* -------------------------------------------------------- */}
        {currentView === 'mastery_map' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>कक्षा 7 कौशल मानचित्र (Class 7 Mastery Map)</span>
              </h2>
              <p className="text-xs text-slate-500">
                रटने के बजाय 4 इंटरैक्टिव लर्निग इंजनों और 6 लेवल्स में विभाजित पाठ्यक्रम:
              </p>
            </div>

            {/* 4 Engine Groups */}
            {(Object.keys(ENGINES_META) as EngineType[]).map((engineKey: EngineType) => {
              const meta = ENGINES_META[engineKey];
              const engineTopics = CLASS_7_SYLLABUS.filter((t) => t.engine === engineKey);

              return (
                <div key={engineKey} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{meta.titleHi}</h3>
                      <p className="text-[11px] text-slate-500">{meta.taglineHi}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {engineTopics.length} Topics
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-slate-100">
                    {engineTopics.map((topic: CurriculumTopic) => {
                      const isActive = activeTopicId === topic.topicId;
                      return (
                        <div key={topic.topicId} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                L{topic.level}
                              </span>
                              <h4 className="text-xs font-bold text-slate-800 truncate">{topic.titleHi}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{topic.formulaHi}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectTopic(topic.topicId)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700'
                            }`}
                          >
                            {isActive ? 'वर्तमान' : 'अभ्यास करें'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* VIEW C: SETTINGS & 1-CLICK BACKUP (सेटिंग्स व बैकअप)     */}
        {/* -------------------------------------------------------- */}
        {currentView === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>सेटिंग्स व डेटा प्रबंधन (Settings & 1-Click Backup)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                स्थानीय IndexedDB डेटाबेस नियंत्रण, डेटा एक्सपोर्ट और प्राइवेसी सुरक्षा।
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
                <span className="text-lg sm:text-xl font-bold text-indigo-700">{dbStats.sessionsCount}</span>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">कुल अभ्यास सत्र</p>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
                <span className="text-lg sm:text-xl font-bold text-amber-700">{dbStats.errorsCount}</span>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">त्रुटि पैटर्न ट्रैक</p>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                <span className="text-lg sm:text-xl font-bold text-emerald-700">{dbStats.reviewsCount}</span>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">SRS रिविज़न शेड्यूल</p>
              </div>
            </div>

            {/* Backup & Restore Action Cards */}
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">1-Click JSON Backup डाउनलोड करें</h3>
                  <p className="text-[11px] text-slate-500">सभी 5 टेबल्स का डेटा एकल JSON फ़ाइल में सुरक्षित करें।</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">JSON बैकअप से रीस्टोर करें</h3>
                  <p className="text-[11px] text-slate-500">पूर्व में डाउनलोड की गई बैकअप फ़ाइल से डेटा पुनर्स्थापित करें।</p>
                </div>
                <label className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* DPDP Act 2023 & Minor Privacy Banner */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero-PII & DPDP Act 2023 Compliance</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                यह एप्लिकेशन 100% स्थानीय (Local-First) है। छात्र का कोई भी व्यक्तिगत डेटा (नाम, रोल नंबर, स्कूल) किसी बाहरी सर्वर या AI को नहीं भेजा जाता।
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-2 text-center text-[11px] text-slate-400 flex items-center justify-between">
        <span>ELLA Grammar Studio v2.1 • Class 7 Complete Syllabus</span>
        <span>Sessions Logged: {dbStats.sessionsCount}</span>
      </footer>
    </div>
  );
}
