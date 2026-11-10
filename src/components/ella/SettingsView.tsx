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
} from 'lucide-react';
import {
  getStoredGeminiKey,
  setStoredGeminiKey,
  testGeminiConnection,
} from '../../services/geminiService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detectedVoiceName, setDetectedVoiceName] = useState<string>('');
  const [hasIndianVoice, setHasIndianVoice] = useState<boolean>(false);

  // Gemini AI Key State
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiKey() || '');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  const handleSaveKey = () => {
    setStoredGeminiKey(apiKeyInput);
    setTestResult({
      success: !!apiKeyInput.trim(),
      message: apiKeyInput.trim() ? 'API Key सफलतापूर्वक सुरक्षित सेव हो गई!' : 'API Key हटा दी गई (ऑफ़लाइन मोड सक्रिय)।',
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
      {/* Overview Banner */}
      <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
            <Settings className="w-4 h-4" />
            <span>सेटिंग्स और आपका डेटा</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            स्टूडेंट प्रोफ़ाइल और बैकअप
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            ELLA 100% ऑफ़लाइन है। आपका सारा डेटा आपकी अपनी डिवाइस में सुरक्षित रहता है। आप कभी भी अपना बैकअप डाउनलोड या रीस्टोर कर सकते हैं।
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DPDP Act 2023 Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Profile Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <User className="w-4 h-4 text-indigo-600" />
            <span>स्टूडेंट प्रोफ़ाइल (Profile)</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                स्टूडेंट का नाम (Student Name):
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
                आपकी कक्षा (Class):
              </label>
              <div className="px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-center justify-between font-medium">
                <span>कक्षा 6–10 (CBSE / State Board)</span>
                <span className="text-[11px] font-mono text-indigo-600 font-bold">21 Topics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Telemetry Stats */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>आपकी कुल प्रोग्रेस (Activity Stats)</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
                {dbStats.sessionsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">प्रैक्टिस राउंड्स</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                {dbStats.errorsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">फिक्स की गई गलतियाँ</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                {dbStats.reviewsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">रिवीजन टॉपिक्स</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice & Indian Accent Configuration */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>भारतीय अंग्रेज़ी उच्चारण (Indian English Voice Engine)</span>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>🇮🇳</span>
            <span>en-IN Priority</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          ELLA में उदाहरणों और वाक्यों का उच्चारण भारतीय अंग्रेज़ी एक्सेंट (Indian English) में बोला जाता है ताकि विद्यार्थियों को सहज व स्पष्ट समझ आए।
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>सक्रिय आवाज़: <strong className="text-indigo-700 font-mono">{detectedVoiceName || 'Indian English (en-IN)'}</strong></span>
            </div>
            <div className="text-[11px] text-slate-500">
              {hasIndianVoice
                ? 'प्राकृतिक भारतीय उच्चारण आवाज़ सक्रिय है।'
                : 'सिस्टम भारतीय फोनेटिक्स (en-IN locale) का उपयोग कर रहा है।'}
            </div>
          </div>

          {speakText && (
            <button
              type="button"
              onClick={() => speakText("Wait here for an hour please. Welcome to ELLA Grammar Studio!")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all cursor-pointer shrink-0"
              title="भारतीय उच्चारण का टेस्ट सैंपल सुनें"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>भारतीय उच्चारण टेस्ट करें (Test Accent)</span>
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
            <span>एला जिनी मूवमेंट सेटिंग्स (Genie Motion & Flight Interval)</span>
          </div>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span>🧞‍♀️</span>
            <span>{flightIntervalSeconds === 0 ? 'स्थिर मोड' : `हर ${flightIntervalSeconds}s में उड़ान`}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          जिनी स्क्रीन पर कितनी देर बाद अपनी जगह बदले, यह आप यहाँ चुन सकते हैं। यदि आप चाहते हैं कि जिनी एक ही जगह रुकी रहे, तो 'एक जगह रोकें' चुनें।
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {[
            { sec: 60, label: '60 सेकंड', sub: '1 मिनट' },
            { sec: 90, label: '90 सेकंड', sub: 'डिफ़ॉल्ट (शांत)' },
            { sec: 120, label: '120 सेकंड', sub: '2 मिनट' },
            { sec: 150, label: '150 सेकंड', sub: '2.5 मिनट' },
            { sec: 180, label: '180 सेकंड', sub: '3 मिनट' },
            { sec: 0, label: 'रोक कर रखें', sub: 'स्थिर (No Move)' },
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

      {/* Google Gemini Interactive AI Integration Card */}
      <div className="bg-white border-2 border-indigo-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm shadow-indigo-100/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Bot className="w-5 h-5 text-indigo-600" />
            <span>एला AI इंटेलिजेंस (Google Gemini AI • 100% मुफ़्त)</span>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span>{getStoredGeminiKey() ? 'AI एक्टिवेट है' : 'ऑफ़लाइन मोड'}</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          एला को <strong>Google Gemini Flash AI</strong> से जोड़कर एक असली समझदार AI शिक्षिका बनाएँ! वह आपके किसी भी सवाल, शंका या वाक्य का गहराई व समझदारी से जवाब देगी।
        </p>

        {/* Input & Action Bar */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-semibold text-slate-700">
            आपकी मुफ़्त Google Gemini API Key:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={isKeyVisible ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... (यहाँ अपनी मुफ़्त API Key पेस्ट करें)"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={isKeyVisible ? 'छुपाएँ' : 'देखें'}
              >
                {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveKey}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-indigo-200 cursor-pointer"
            >
              सेव करें
            </button>

            <button
              type="button"
              disabled={isTestingKey}
              onClick={handleTestKey}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
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
                className="px-3 py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium cursor-pointer"
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
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span className="text-rose-500 font-bold shrink-0">⚠️</span>
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* 3-Step Free Setup Guide */}
        <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs space-y-1.5 text-slate-700">
          <div className="font-bold text-indigo-950 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>30 सेकंड में ₹0 मुफ़्त Gemini API Key कैसे पाएँ? (क्रेडिट कार्ड की ज़रूरत नहीं):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 pt-1 text-[11.5px]">
            <li>
              Google AI Studio खोलें:{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                <span>aistudio.google.com/app/apikey</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>अपने Gmail से लॉगिन करें और <strong>"Create API key"</strong> पर क्लिक करें।</li>
            <li>मिली हुई Key को कॉपी करके ऊपर बॉक्स में पेस्ट करें और <strong>'सेव करें'</strong> दबाएँ!</li>
          </ol>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-indigo-100">
            💡 <em>नोट: यदि आपके पास Key नहीं है, तो भी ELLA का स्मार्ट ऑफ़लाइन इंजन हमेशा 100% मुफ़्त काम करता रहेगा।</em>
          </div>
        </div>
      </div>

      {/* Backup and Restore Controls */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">
          1-Click बैकअप व रीस्टोर (Backup & Restore)
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          आप अपने सभी लिखे हुए वाक्य और प्रोग्रेस को एक JSON फ़ाइल में बैकअप कर सकते हैं। किसी दूसरे फ़ोन या कंप्यूटर में इसे 1-क्लिक में रीस्टोर किया जा सकता है।
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportBackup}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs shadow-indigo-200 cursor-pointer"
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
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>JSON फ़ाइल से रीस्टोर करें (Import JSON)</span>
          </button>
        </div>
      </div>

      {/* Privacy: Delete All Data */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 space-y-3">
        <h4 className="text-sm font-bold text-rose-900">
          प्राइवेसी नियंत्रण (Right to be Forgotten)
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          यदि आप इस डिवाइस से अपना सारा अभ्यास डेटा और त्रुटि रिकॉर्ड मिटाना चाहते हैं, तो आप नीचे दिए गए बटन से सभी स्थानीय डेटा को शून्य कर सकते हैं।
        </p>
        <div className="pt-1">
          <button
            onClick={onDeleteAllData}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>इस डिवाइस से मेरा सारा डेटा हटाएं</span>
          </button>
        </div>
      </div>
    </div>
  );
};
