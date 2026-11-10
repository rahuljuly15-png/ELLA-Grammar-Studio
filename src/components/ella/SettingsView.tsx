import React, { useRef, useState, useEffect } from 'react';
import {
  Settings,
  Download,
  Upload,
  Database,
  Trash2,
  ShieldCheck,
  User,
  Volume2,
  Sparkles,
  CheckCircle2,
  Check,
  Bot,
  Key,
  Zap,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  Code2,
  Globe,
  RefreshCw,
} from 'lucide-react';
import {
  getStoredGeminiKey,
  setStoredGeminiKey,
  testGeminiConnection,
} from '../../services/geminiService';
import { PublishGuideView } from './PublishGuideView';
import { useLanguage } from '../../i18n/LanguageContext';

interface SettingsViewProps {
  studentName: string;
  setStudentName: (name: string) => void;
  dbStats: { sessionsCount: number; errorsCount: number; reviewsCount: number };
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAllData: () => void;
  speakText?: (text: string) => void;
  flightIntervalSeconds?: number;
  onUpdateFlightInterval?: (seconds: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  studentName,
  setStudentName,
  dbStats,
  onExportBackup,
  onImportBackup,
  onDeleteAllData,
  speakText,
  flightIntervalSeconds = 90,
  onUpdateFlightInterval,
}) => {
  const { language, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detectedVoiceName, setDetectedVoiceName] = useState<string>('');
  const [hasIndianVoice, setHasIndianVoice] = useState<boolean>(false);

  // =========================================================================
  // Developer Mode PIN & Unlock State
  // =========================================================================
  const [isDevUnlocked, setIsDevUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('ella_dev_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState<string>('');
  const [isPinVisible, setIsPinVisible] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  // Custom PIN Management
  const [isChangingPin, setIsChangingPin] = useState<boolean>(false);
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  // Developer Mode Tab Selection
  const [activeDevTab, setActiveDevTab] = useState<'gemini' | 'backup' | 'publish' | 'pin'>('gemini');

  // Gemini AI Key State
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiKey() || '');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  // Handle Developer PIN Unlock
  const handleUnlockDeveloperMode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const storedPin = localStorage.getItem('ella_dev_pin') || '1507';
    const trimmed = pinInput.trim();

    if (trimmed === storedPin || trimmed === '1507' || trimmed === 'ella2026') {
      setIsDevUnlocked(true);
      try {
        sessionStorage.setItem('ella_dev_unlocked', 'true');
      } catch {}
      setPinError(null);
      setPinSuccess('डेवलपर मोड सफलतापूर्वक अनलॉक हो गया!');
      setPinInput('');
      setTimeout(() => setPinSuccess(null), 3000);
    } else {
      setPinError('गलत सिक्योरिटी पिन (Wrong PIN)। डिफ़ॉल्ट पिन 1507 या ella2026 है।');
    }
  };

  // Handle Developer Mode Lock
  const handleLockDeveloperMode = () => {
    setIsDevUnlocked(false);
    try {
      sessionStorage.removeItem('ella_dev_unlocked');
    } catch {}
    setPinError(null);
    setPinSuccess(null);
  };

  // Handle PIN Update
  const handleSaveNewPin = () => {
    const trimmed = newPinInput.trim();
    if (trimmed.length < 4) {
      setPinChangeMsg('पिन कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }
    localStorage.setItem('ella_dev_pin', trimmed);
    setPinChangeMsg('नया सिक्योरिटी पिन सुरक्षित सेव हो गया!');
    setNewPinInput('');
    setIsChangingPin(false);
    setTimeout(() => setPinChangeMsg(null), 3000);
  };

  const handleSaveKey = () => {
    setStoredGeminiKey(apiKeyInput);
    setTestResult({
      success: !!apiKeyInput.trim(),
      message: apiKeyInput.trim()
        ? 'API Key सफलतापूर्वक सुरक्षित सेव हो गई!'
        : 'API Key हटा दी गई (ऑफ़लाइन मोड सक्रिय)।',
    });
  };

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'कृपया पहले अपनी Gemini API Key दर्ज करें।' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);
    const res = await testGeminiConnection(apiKeyInput);
    setIsTestingKey(false);
    setTestResult(res);
    if (res.success) {
      setStoredGeminiKey(apiKeyInput);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const detectVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const inVoice = voices.find(
          (v) =>
            v.lang === 'en-IN' ||
            v.lang === 'en_IN' ||
            /india|indian|neerja|heera|prabhat|ravi|rishi|veena|kavya/i.test(v.name)
        );
        const inBilingual = voices.find(
          (v) =>
            (v.lang.startsWith('hi') || v.lang === 'hi-IN') &&
            /google|swara|kalpana|madhur/i.test(v.name)
        );

        if (inVoice) {
          setDetectedVoiceName(inVoice.name);
          setHasIndianVoice(true);
        } else if (inBilingual) {
          setDetectedVoiceName(`${inBilingual.name} (Bilingual Indian)`);
          setHasIndianVoice(true);
        } else {
          const generalVoice = voices.find((v) => v.lang.startsWith('en'));
          setDetectedVoiceName(generalVoice ? `${generalVoice.name} (en-IN mode)` : 'Standard Engine (en-IN mode)');
          setHasIndianVoice(false);
        }
      };

      detectVoice();
      window.speechSynthesis.addEventListener('voiceschanged', detectVoice);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', detectVoice);
      };
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* =================================================================== */}
      {/* PART 1: STUDENT / USER VIEW (Front-Facing, Clutter-Free)            */}
      {/* =================================================================== */}
      <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
            <Settings className="w-4 h-4" />
            <span>{t('settings_title')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t('settings_title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {t('settings_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>DPDP Act 2023 Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Profile Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <User className="w-4 h-4 text-indigo-600" />
            <span>{t('profile_title')}</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('profile_name_label')}
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('profile_class_label')}
              </label>
              <div className="px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-center justify-between font-medium">
                <span>{t('profile_class_val')}</span>
                <span className="text-[11px] font-mono text-indigo-600 font-bold">21 Topics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Telemetry Stats */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>{t('stats_title')}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
                {dbStats.sessionsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">{t('stats_rounds')}</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                {dbStats.errorsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">{t('stats_errors')}</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                {dbStats.reviewsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">{t('stats_reviews')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice & Indian Accent Configuration */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>{t('voice_title')}</span>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>🇮🇳</span>
            <span>{t('voice_badge')}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          {t('voice_desc')}
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('voice_active_label')} <strong className="text-indigo-700 font-mono">{detectedVoiceName || 'Indian English (en-IN)'}</strong></span>
            </div>
            <div className="text-[11px] text-slate-500">
              {hasIndianVoice
                ? (language === 'en' ? 'Natural Indian English voice is active.' : 'प्राकृतिक भारतीय उच्चारण आवाज़ सक्रिय है।')
                : (language === 'en' ? 'Using standard phonetic engine with en-IN tuning.' : 'सिस्टम भारतीय फोनेटिक्स (en-IN locale) का उपयोग कर रहा है।')}
            </div>
          </div>

          {speakText && (
            <button
              type="button"
              onClick={() => speakText("Wait here for an hour please. Welcome to ELLA Grammar Studio!")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer shrink-0"
              title={language === 'en' ? "Listen to Indian accent voice sample" : "भारतीय उच्चारण का टेस्ट सैंपल सुनें"}
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('voice_test_btn')}</span>
            </button>
          )}
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-1 text-slate-700">
          <div className="font-bold text-amber-950 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>उच्चारण को और भी सजीव बनाने के सरल तरीके:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pt-1 text-[11.5px]">
            <li><strong>Microsoft Edge ब्राउज़र (सर्वाधिक अनुशंसित):</strong> Edge में 'Microsoft Neerja Natural (Indian English)' आवाज़ पहले से इन-बिल्ट मिलती है जो 100% प्राकृतिक भारतीय लहजे में बोलती है।</li>
            <li><strong>Google Chrome (Windows):</strong> अपने Windows की <em>Settings &gt; Time &amp; Language &gt; Speech &gt; Add voices</em> में जाकर मुफ़्त <strong>"English (India)"</strong> वॉयस पैक जोड़ें (Heera/Ravi)।</li>
            <li><strong>Android / मोबाइल:</strong> Google Play Services में Indian English (en-IN) पहले से ही सक्रिय रहता है।</li>
          </ul>
        </div>
      </div>

      {/* Genie Motion & Movement Timing Settings */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{t('motion_title')}</span>
          </div>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>🧞‍♀️</span>
            <span>
              {flightIntervalSeconds === 0
                ? t('motion_steady')
                : language === 'en'
                ? `Every ${flightIntervalSeconds}s`
                : `हर ${flightIntervalSeconds}s में उड़ान`}
            </span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          {t('motion_desc')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {[
            {
              sec: 60,
              label: language === 'en' ? '60 Seconds' : '60 सेकंड',
              sub: language === 'en' ? '1 minute' : '1 मिनट',
            },
            {
              sec: 90,
              label: language === 'en' ? '90 Seconds' : '90 सेकंड',
              sub: language === 'en' ? 'Default (Calm)' : 'डिफ़ॉल्ट (शांत)',
            },
            {
              sec: 120,
              label: language === 'en' ? '120 Seconds' : '120 सेकंड',
              sub: language === 'en' ? '2 minutes' : '2 मिनट',
            },
            {
              sec: 150,
              label: language === 'en' ? '150 Seconds' : '150 सेकंड',
              sub: language === 'en' ? '2.5 minutes' : '2.5 मिनट',
            },
            {
              sec: 180,
              label: language === 'en' ? '180 Seconds' : '180 सेकंड',
              sub: language === 'en' ? '3 minutes' : '3 मिनट',
            },
            {
              sec: 0,
              label: t('motion_steady'),
              sub: language === 'en' ? 'Stationary' : 'स्थिर (No Move)',
            },
          ].map((opt) => {
            const isSelected = flightIntervalSeconds === opt.sec;
            return (
              <button
                key={opt.sec}
                type="button"
                onClick={() => onUpdateFlightInterval?.(opt.sec)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-50 border-purple-400 text-purple-950 ring-2 ring-purple-400/40 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{opt.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* PART 2: DEVELOPER MODE GATE (Password / PIN Protected)              */}
      {/* =================================================================== */}
      {!isDevUnlocked ? (
        /* LOCKED STATE: Clean, discreet password entry card for teachers & devs */
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{t('dev_gate_title')}</span>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                    {t('dev_gate_badge')}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('dev_gate_desc')}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUnlockDeveloperMode} className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md">
              <div className="relative flex-1">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={isPinVisible ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  placeholder={t('dev_pin_placeholder')}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={() => setIsPinVisible(!isPinVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  title={isPinVisible ? (language === 'en' ? 'Hide PIN' : 'पिन छुपाएँ') : (language === 'en' ? 'Show PIN' : 'पिन देखें')}
                >
                  {isPinVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-indigo-900 cursor-pointer shrink-0"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{t('dev_unlock_btn')}</span>
              </button>
            </div>

            {pinError && (
              <div className="text-xs text-rose-400 font-medium mt-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {pinSuccess && (
              <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{pinSuccess}</span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 mt-2">
              💡 <em>{t('dev_hint')}</em>
            </div>
          </form>
        </div>
      ) : (
        /* =================================================================== */
        /* UNLOCKED STATE: Full Developer & Teacher Admin Console              */
        /* =================================================================== */
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md border-2 border-indigo-500/50 space-y-6">
          {/* Developer Mode Header & Lock Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {t('dev_console_title')}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{t('dev_active_badge')}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('dev_console_desc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLockDeveloperMode}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0"
              title={t('dev_lock_btn')}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('dev_lock_btn')}</span>
            </button>
          </div>

          {/* Sub-Navigation for Developer Tools */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveDevTab('gemini')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeDevTab === 'gemini'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Google Gemini AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDevTab('backup')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeDevTab === 'backup'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Backup & Data Reset' : 'बैकअप, रीस्टोर व डेटा वाइप'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDevTab('publish')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeDevTab === 'publish'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'GitHub & Deployment' : 'GitHub व डिप्लॉयमेंट गाइड'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDevTab('pin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeDevTab === 'pin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Change PIN' : 'पिन बदलें (Security PIN)'}</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE GEMINI AI KEY CONFIGURATION */}
          {activeDevTab === 'gemini' && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>Google Gemini Flash AI इंटीग्रेशन (100% मुफ़्त मॉडल)</span>
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{getStoredGeminiKey() ? 'AI सक्रिय है' : 'ऑफ़लाइन फॉलबैक मोड'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                एला जिनी को Google Gemini AI से कनेक्ट करें। यह विद्यार्थियों के सवालों, व्याकरण शंकाओं और वाक्यों का गहराई से विश्लेषण करने में मदद करता है।
              </p>

              {/* Input & Action Bar */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Google Gemini API Key:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={isKeyVisible ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy... (अपनी Gemini API Key पेस्ट करें)"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setIsKeyVisible(!isKeyVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      title={isKeyVisible ? 'छुपाएँ' : 'देखें'}
                    >
                      {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveKey}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    सेव करें
                  </button>

                  <button
                    type="button"
                    disabled={isTestingKey}
                    onClick={handleTestKey}
                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isTestingKey ? 'जांच हो रही है...' : 'AI टेस्ट करें'}</span>
                  </button>

                  {apiKeyInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setApiKeyInput('');
                        setStoredGeminiKey('');
                        setTestResult({ success: true, message: 'API Key हटा दी गई।' });
                      }}
                      className="px-3 py-2.5 text-rose-400 hover:bg-rose-950/50 border border-rose-800 rounded-xl text-xs font-medium cursor-pointer shrink-0"
                      title="हटाएँ"
                    >
                      हटाएँ
                    </button>
                  )}
                </div>

                {/* Test Status Feedback */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* 3-Step Free Setup Guide */}
              <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs space-y-1.5 text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>मुफ़्त Gemini API Key कैसे पाएँ? (क्रेडिट कार्ड की आवश्यकता नहीं):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pt-1 text-[11.5px]">
                  <li>
                    Google AI Studio खोलें:{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>aistudio.google.com/app/apikey</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>अपने Gmail से लॉगिन करें और <strong>"Create API key"</strong> पर क्लिक करें।</li>
                  <li>मिली हुई Key को ऊपर बॉक्स में पेस्ट करके <strong>'सेव करें'</strong> दबाएँ!</li>
                </ol>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                  💡 <em>बिना API Key के भी ELLA का स्मार्ट ऑफ़लाइन इंजन हमेशा 100% मुफ़्त काम करता रहता है।</em>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUP, RESTORE & DATA RESET */}
          {activeDevTab === 'backup' && (
            <div className="space-y-5">
              {/* Backup & Restore */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>1-Click बैकअप व रीस्टोर (JSON Backup & Restore)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  पूरे डेटाबेस (वाक्य, गलतियों का इतिहास, FSRS रिवीजन स्टेट) को एक सुरक्षित JSON फ़ाइल में एक्सपोर्ट या इम्पोर्ट करें।
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onExportBackup}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>1-Click बैकअप डाउनलोड करें (Export JSON)</span>
                  </button>

                  <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={onImportBackup}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-200 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-300" />
                    <span>JSON फ़ाइल से रीस्टोर करें (Import JSON)</span>
                  </button>
                </div>
              </div>

              {/* Data Reset */}
              <div className="bg-rose-950/40 border border-rose-800/70 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>प्राइवेसी नियंत्रण (Right to be Forgotten - संपूर्ण डेटा वाइप)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  इस डिवाइस से छात्र का संपूर्ण अभ्यास इतिहास, समीक्षा रिकॉर्ड व त्रुटि लॉग स्थायी रूप से मिटाएँ।
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onDeleteAllData}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-300 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>इस डिवाइस से सारा डेटा मिटाएँ (Reset All Data)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB & DEPLOYMENT GUIDE */}
          {activeDevTab === 'publish' && (
            <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-inner">
              <PublishGuideView />
            </div>
          )}

          {/* TAB 4: CHANGE PIN */}
          {activeDevTab === 'pin' && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>सिक्योरिटी पिन बदलें (Change Developer PIN)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                डेवलपर मोड को सुरक्षित रखने के लिए आप अपना व्यक्तिगत पिन सेट कर सकते हैं।
              </p>

              <div className="space-y-3 max-w-sm pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    नया सिक्योरिटी पिन (कम से कम 4 अक्षर या अंक):
                  </label>
                  <input
                    type="text"
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="उदा. 4321 या mypass"
                    className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNewPin}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    पिन सुरक्षित सेव करें
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('ella_dev_pin', '1507');
                      setPinChangeMsg('पिन डिफ़ॉल्ट (1507) पर रीसेट कर दिया गया!');
                      setTimeout(() => setPinChangeMsg(null), 3000);
                    }}
                    className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    1507 पर रीसेट करें
                  </button>
                </div>

                {pinChangeMsg && (
                  <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{pinChangeMsg}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
