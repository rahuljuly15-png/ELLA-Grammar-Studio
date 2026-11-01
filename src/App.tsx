/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EllaHeader, EllaView } from './components/ella/EllaHeader';
import { PracticeCycleView } from './components/ella/PracticeCycleView';
import { MasteryMapView } from './components/ella/MasteryMapView';
import { ErrorVaultView } from './components/ella/ErrorVaultView';
import { SettingsView } from './components/ella/SettingsView';
import { PublishGuideView } from './components/ella/PublishGuideView';
import { TopicSelectorModal } from './components/ella/TopicSelectorModal';
import { getTopicById, FullTopicData } from './data/topicLoader';
import { checkSentenceOffline, recordProductionAttempt, RuleCheckResult } from './engines/offlineRuleEngine';
import { exportDatabaseToJson, importDatabaseFromJson, getOfflineDbCounts, deleteStudentData } from './services/backupService';
import { Check, GitBranch, ArrowUpRight } from 'lucide-react';

export default function App() {
  // Navigation View: 'cycle' | 'mastery_map' | 'error_vault' | 'publish' | 'settings'
  const [currentView, setCurrentView] = useState<EllaView>('cycle');
  const [activeTopicId, setActiveTopicId] = useState<string>('level1-articles-01');
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // Active topic data
  const activeTopic: FullTopicData = useMemo(() => getTopicById(activeTopicId), [activeTopicId]);

  // Production (USE) state
  const [studentSentence, setStudentSentence] = useState<string>('Wait here for a hour please.');
  const [selfNote, setSelfNote] = useState<string>('');
  const [savedSessionId, setSavedSessionId] = useState<number | null>(null);
  const [isSavedToDb, setIsSavedToDb] = useState(false);
  const [studentName, setStudentName] = useState('Rahul Sharma');

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
  }, []);

  // Web Speech API Voice (Indian English -> British -> US fallback)
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/<[^>]*>?/gm, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find((v) => v.lang === 'en-IN');
      const englishVoice = voices.find((v) => v.lang.startsWith('en'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      } else if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
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
      showToast(`अभ्यास सत्र #${sessionId} सफलतापूर्वक Dexie डेटाबेस में सेव हुआ!`);
      setTimeout(() => setIsSavedToDb(false), 3500);
    } catch (err) {
      console.error('Dexie save error:', err);
      showToast('डेटाबेस में सेव करते समय त्रुटि हुई');
    }
  };

  // 1-Click JSON Backup
  const handleExportBackup = async () => {
    try {
      await exportDatabaseToJson();
      showToast('बैकअप JSON फ़ाइल डाउनलोड हो गई!');
    } catch (err) {
      console.error('Backup error:', err);
      showToast('बैकअप निर्यात में त्रुटि हुई');
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
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
        onExportBackup={handleExportBackup}
        onOpenPublishModal={() => setCurrentView('publish')}
        sessionsCount={dbStats.sessionsCount}
        errorsCount={dbStats.errorsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Repo attribution ribbon */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-slate-600">
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-medium">संबद्ध रिपॉजिटरी:</span>
            <a
              href="https://github.com/rahuljuly15-png/ELLA-Grammar-Studio"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 font-mono hover:underline flex items-center gap-1 font-bold"
            >
              <span>rahuljuly15-png/ELLA-Grammar-Studio</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>सत्र: <strong className="text-slate-900 font-mono tabular-nums">{dbStats.sessionsCount}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>सुधारी गलतियाँ: <strong className="text-amber-600 font-mono tabular-nums">{dbStats.errorsCount}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>छात्र: <strong className="text-slate-900">{studentName}</strong></span>
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
            onEscapeHatch={() => {
              showToast('आसान उदाहरण लोड किया गया!');
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
            setStudentName={setStudentName}
            dbStats={dbStats}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onDeleteAllData={handleDeleteAllData}
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

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">ELLA Grammar Studio v2.1</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Local-First PWA • Dexie.js • ₹0 Free Model</span>
          </div>
          <div className="text-slate-600">
            कक्षा 6–10 के विद्यार्थियों के लिए सरल, आकर्षक व 100% मुफ़्त
          </div>
        </div>
      </footer>
    </div>
  );
}
