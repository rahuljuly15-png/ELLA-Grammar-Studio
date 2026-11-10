/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EllaHeader, type EllaView } from './components/ella/EllaHeader';
import { PracticeCycleView } from './components/ella/PracticeCycleView';
import { MasteryMapView } from './components/ella/MasteryMapView';
import { ErrorVaultView } from './components/ella/ErrorVaultView';
import { SettingsView } from './components/ella/SettingsView';
import { PublishGuideView } from './components/ella/PublishGuideView';
import { TopicSelectorModal } from './components/ella/TopicSelectorModal';
import { StudentOnboardingModal } from './components/ella/StudentOnboardingModal';
import { getTopicById, type FullTopicData } from './data/topicLoader';
import { checkSentenceOffline, recordProductionAttempt, type RuleCheckResult } from './engines/offlineRuleEngine';
import { exportDatabaseToJson, importDatabaseFromJson, getOfflineDbCounts, deleteStudentData } from './services/backupService';
import { Check } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

function AppInner() {
  const { language, t } = useLanguage();

  // Navigation View: 'cycle' | 'mastery_map' | 'error_vault' | 'publish' | 'settings'
  const [currentView, setCurrentView] = useState<EllaView>('cycle');
  const [activeTopicId, setActiveTopicId] = useState<string>('level1-articles-01');
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasDismissedBackupReminder, setHasDismissedBackupReminder] = useState(false);

  // Active topic data
  const activeTopic: FullTopicData = useMemo(() => getTopicById(activeTopicId), [activeTopicId]);

  // Production (USE) state
  const [studentSentence, setStudentSentence] = useState<string>('Wait here for a hour please.');
  const [selfNote, setSelfNote] = useState<string>('');
  const [savedSessionId, setSavedSessionId] = useState<number | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState(false);
  const [studentName, setStudentName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ella_student_name');
      if (saved && saved.trim()) return saved;
    }
    return 'Ishu';
  });

  const handleUpdateStudentName = (name: string) => {
    setStudentName(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ella_student_name', name);
    }
  };

  // Genie motion flight interval: 0 default (Stationary / Calm Mode - docked peacefully in corner)
  const [genieFlightInterval, setGenieFlightInterval] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ella_genie_flight_interval');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return 0; // Default: Stationary (Calm corner mode - does not disrupt reading)
  });

  const handleUpdateFlightInterval = (seconds: number) => {
    setGenieFlightInterval(seconds);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ella_genie_flight_interval', String(seconds));
    }
    showToast(
      seconds === 0
        ? (language === 'en' ? 'Genie is stationary (No move)' : 'जिनी को एक जगह रोक दिया गया है (स्थिर मोड)')
        : (language === 'en' ? `Genie will now move every ${seconds} seconds!` : `जिनी अब हर ${seconds} सेकंड में अपनी जगह बदलेगी!`)
    );
  };

  // Database stats
  const [dbStats, setDbStats] = useState<{ sessionsCount: number; errorsCount: number; reviewsCount: number }>({
    sessionsCount: 0,
    errorsCount: 0,
    reviewsCount: 0,
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time offline regex error checking (0ms latency)
  const liveCheckResult: RuleCheckResult = useMemo(() => {
    return checkSentenceOffline(studentSentence, activeTopicId);
  }, [studentSentence, activeTopicId]);

  // Refresh DB stats from Dexie
  const refreshStats = async () => {
    try {
      const stats = await getOfflineDbCounts();
      setDbStats(stats);
    } catch (e) {
      console.error('Error reading Dexie stats:', e);
    }
  };

  useEffect(() => {
    refreshStats();

    // Check if first-time student onboarding tour should be presented
    if (typeof window !== 'undefined') {
      const hasCompletedTour = localStorage.getItem('ella_onboarding_completed') === 'true';
      if (!hasCompletedTour) {
        const timer = setTimeout(() => setIsTourOpen(true), 600);
        return () => clearTimeout(timer);
      }
    }

    // Warm up speech synthesis voices cache
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
    }
  }, []);

  // Lifelike Natural Voice Engine (Female Genie Tone with Hindi/English detection)
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      // Clean emojis, markdown symbols, and HTML tags so voice sounds smooth & doesn't recite emoji names
      const clean = text
        .replace(/<[^>]*>?/gm, '')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[*_#`~]/g, '')
        .trim();

      if (!clean) return;

      const utterance = new SpeechSynthesisUtterance(clean);
      const isHindi = /[\u0900-\u097F]/.test(clean);
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        if (isHindi) {
          // Priority for Hindi: Natural female voices (Google हिन्दी, Microsoft Swara/Kalpana/Heera)
          const hiFemale = voices.find(
            (v) =>
              (v.lang.startsWith('hi') || v.lang === 'hi-IN') &&
              /female|swara|kalpana|heera|google|natural/i.test(v.name)
          );
          const hiAny = voices.find((v) => v.lang.startsWith('hi') || v.lang === 'hi-IN');
          const inFemale = voices.find(
            (v) => v.lang === 'en-IN' && /female|heera|neerja|google/i.test(v.name)
          );

          if (hiFemale) {
            utterance.voice = hiFemale;
            utterance.lang = hiFemale.lang;
          } else if (hiAny) {
            utterance.voice = hiAny;
            utterance.lang = hiAny.lang;
          } else if (inFemale) {
            utterance.voice = inFemale;
          }
        } else {
          // =========================================================================
          // STRICT PRIORITY FOR ENGLISH: AUTHENTIC INDIAN ENGLISH ACCENT (en-IN)
          // =========================================================================

          // 1. Natural / Female Indian English Voice (Microsoft Neerja, Microsoft Heera, Veena, Kavya, Google English India)
          const inFemale = voices.find(
            (v) =>
              (v.lang === 'en-IN' || v.lang === 'en_IN' || /india/i.test(v.name) || /india/i.test(v.lang)) &&
              /female|neerja|heera|veena|kavya|google|natural/i.test(v.name)
          );

          // 2. Any Indian English Voice (Microsoft Prabhat, Microsoft Ravi, Rishi, en-IN, en_IN)
          const inAny = voices.find(
            (v) =>
              v.lang === 'en-IN' ||
              v.lang === 'en_IN' ||
              /india|indian|neerja|heera|prabhat|ravi|rishi|veena|kavya/i.test(v.name) ||
              /india/i.test(v.lang)
          );

          // 3. Indian Hindi voice speaking English (Google हिन्दी, Swara, Kalpana - natural Indian accent)
          const inBilingual = voices.find(
            (v) =>
              (v.lang.startsWith('hi') || v.lang === 'hi-IN') &&
              /google|swara|kalpana|madhur/i.test(v.name)
          );

          // 4. Standard English fallback ONLY if device has zero Indian voices
          const enFallback = voices.find((v) => v.lang.startsWith('en'));

          if (inFemale) {
            utterance.voice = inFemale;
          } else if (inAny) {
            utterance.voice = inAny;
          } else if (inBilingual) {
            utterance.voice = inBilingual;
          } else if (enFallback) {
            utterance.voice = enFallback;
          }

          // Always explicitly set locale to en-IN for Indian pronunciation & phonetics
          utterance.lang = 'en-IN';
        }
      } else {
        utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      }

      // Cheerful, youthful Genie pitch & natural pace
      utterance.pitch = isHindi ? 1.08 : 1.04;
      utterance.rate = 0.95;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis playback error:', e);
    }
  };

  // Handle switching topic
  const handleSelectTopic = (topicId: string) => {
    setActiveTopicId(topicId);
    setSavedSessionId(null);
    setIsSavedToDb(false);
    setCurrentView('cycle');

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

  // Save current production sentence to Dexie
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
      showToast(
        language === 'en'
          ? `Practice session #${sessionId} saved successfully!`
          : `अभ्यास सत्र #${sessionId} सफलतापूर्वक Dexie डेटाबेस में सेव हुआ!`
      );
      setTimeout(() => setIsSavedToDb(false), 3500);
    } catch (err) {
      console.error('Dexie save error:', err);
      showToast(language === 'en' ? 'Error saving to database' : 'डेटाबेस में सेव करते समय त्रुटि हुई');
    }
  };

  // 1-Click JSON Backup
  const handleExportBackup = async () => {
    try {
      await exportDatabaseToJson();
      showToast(language === 'en' ? 'Backup JSON file downloaded!' : 'बैकअप JSON फ़ाइल डाउनलोड हो गई!');
    } catch (err) {
      console.error('Backup error:', err);
      showToast(language === 'en' ? 'Error exporting backup' : 'बैकअप निर्यात में त्रुटि हुई');
    }
  };

  // Restore JSON Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importDatabaseFromJson(file);
      showToast(res.message);
      await refreshStats();
    } catch (err) {
      console.error('Restore error:', err);
      showToast('बैकअप रीस्टोर विफल रहा');
    }
  };

  // Delete All Data (DPDP Act)
  const handleDeleteAllData = async () => {
    if (window.confirm('क्या आप वाकई इस डिवाइस से अपना सारा अभ्यास रिकॉर्ड हमेशा के लिए हटाना चाहते हैं?')) {
      const res = await deleteStudentData(1);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ella_student_name');
      }
      setStudentName('Ishu');
      showToast(res.message);
      await refreshStats();
    }
  };

  // Retry error from Error Vault
  const handleRetryFromVault = (topicId: string, wrongSentence: string) => {
    setActiveTopicId(topicId);
    setStudentSentence(wrongSentence);
    setCurrentView('cycle');
    showToast(`विषय ${topicId} खोला गया। अब सही वाक्य बनाकर सुधारें।`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-purple-50/25 to-pink-50/30 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      {/* Ambient kid-friendly soft pastel light orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="fixed top-1/3 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none translate-x-1/3 z-0" />
      <div className="fixed bottom-0 left-1/4 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl pointer-events-none translate-y-1/3 z-0" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-300 text-slate-800 text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <EllaHeader
        currentView={currentView}
        setCurrentView={setCurrentView}
        errorsCount={dbStats.errorsCount}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        {/* Android Storage Cleaner Safety Alert: Proactive Backup Reminder */}
        {dbStats.sessionsCount >= 5 && !hasDismissedBackupReminder && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="text-base shrink-0">💾</span>
              <div>
                <span className="font-bold text-amber-950">{t('backup_reminder_title')}</span>
                <p className="text-[11px] text-amber-800 leading-snug">{t('backup_reminder_desc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {t('backup_reminder_btn')}
              </button>
              <button
                type="button"
                onClick={() => setHasDismissedBackupReminder(true)}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                {t('backup_reminder_dismiss')} ✕
              </button>
            </div>
          </div>
        )}

        {/* Student progress ribbon with soft playful pastel highlights */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-pink-50/50 border border-indigo-100/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-indigo-800 font-extrabold text-[13px]">{t('ribbon_title')}</span>
            <span aria-hidden="true" className="text-indigo-200 font-bold">·</span>
            <span className="text-indigo-700 font-bold bg-white/80 border border-indigo-200/70 px-2 py-0.5 rounded-full text-[10px]">{t('classBadge')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50/90 border border-sky-200/80 text-sky-900 font-semibold shadow-2xs">
              <span>🎯</span>
              <span>{t('ribbon_rounds')}</span>
              <strong className="text-sky-700 font-mono font-extrabold tabular-nums">{dbStats.sessionsCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-900 font-semibold shadow-2xs">
              <span>🌟</span>
              <span>{t('ribbon_errors')}</span>
              <strong className="text-amber-700 font-mono font-extrabold tabular-nums">{dbStats.errorsCount}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-900 font-semibold shadow-2xs">
              <span>👤</span>
              <span>{t('ribbon_student')}</span>
              <strong className="text-emerald-800 font-extrabold">{studentName}</strong>
            </span>
          </div>
        </div>

        {/* Dynamic View Router */}
        {currentView === 'cycle' && (
          <PracticeCycleView
            activeTopic={activeTopic}
            onOpenTopicModal={() => setIsTopicModalOpen(true)}
            studentSentence={studentSentence}
            setStudentSentence={setStudentSentence}
            liveCheckResult={liveCheckResult}
            selfNote={selfNote}
            setSelfNote={setSelfNote}
            onSaveToDexie={handleSaveToDexie}
            isSavedToDb={isSavedToDb}
            savedSessionId={savedSessionId}
            speakText={speakText}
            studentName={studentName}
            flightIntervalSeconds={genieFlightInterval}
            onEscapeHatch={() => {
              showToast(t('toast_escape'));
              if (activeTopic.steps['5_free_production']?.sampleSolutions?.[0]) {
                setStudentSentence(activeTopic.steps['5_free_production'].sampleSolutions[0]);
              }
            }}
          />
        )}

        {currentView === 'mastery_map' && (
          <MasteryMapView
            activeTopicId={activeTopicId}
            onSelectTopic={handleSelectTopic}
          />
        )}

        {currentView === 'error_vault' && (
          <ErrorVaultView onRetryTopic={handleRetryFromVault} />
        )}

        {currentView === 'publish' && (
          <PublishGuideView />
        )}

        {currentView === 'settings' && (
          <SettingsView
            studentName={studentName}
            setStudentName={handleUpdateStudentName}
            dbStats={dbStats}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onDeleteAllData={handleDeleteAllData}
            speakText={speakText}
            flightIntervalSeconds={genieFlightInterval}
            onUpdateFlightInterval={handleUpdateFlightInterval}
          />
        )}
      </main>

      {/* Topic Switcher Modal */}
      <TopicSelectorModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        activeTopicId={activeTopicId}
        onSelectTopic={handleSelectTopic}
      />

      {/* Guided Student Onboarding Tour Modal */}
      <StudentOnboardingModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">{t('footer_brand')}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{t('footer_offline')}</span>
          </div>
          <div className="text-slate-600">
            {t('footer_audience')}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
