import React from 'react';
import {
  BookOpen,
  MapPin,
  AlertTriangle,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type EllaView = 'cycle' | 'mastery_map' | 'error_vault' | 'publish' | 'settings';

interface EllaHeaderProps {
  currentView: EllaView;
  setCurrentView: (view: EllaView) => void;
  errorsCount: number;
  onOpenPublishModal?: () => void;
  onExportBackup?: () => void;
  sessionsCount?: number;
}

export const EllaHeader: React.FC<EllaHeaderProps> = ({
  currentView,
  setCurrentView,
  errorsCount,
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-indigo-100 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
              ELLA Grammar Studio
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              Class 6–10
            </span>
          </div>
          <p className="text-xs text-slate-500">
            खेल-खेल में आसान इंग्लिश ग्रामर • बिना रटे समझें
          </p>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Clean, student-focused tabs) */}
      <nav className="flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200 rounded-xl overflow-x-auto">
        <button
          onClick={() => setCurrentView('cycle')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            currentView === 'cycle'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>डेली प्रैक्टिस</span>
        </button>

        <button
          onClick={() => setCurrentView('mastery_map')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            currentView === 'mastery_map'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span>लर्निंग मैप (21 टॉपिक्स)</span>
        </button>

        <button
          onClick={() => setCurrentView('error_vault')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            currentView === 'error_vault'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>मिस्टेक वॉल्ट ({errorsCount})</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            currentView === 'settings'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>सेटिंग्स</span>
        </button>
      </nav>

      {/* Zone 3: 100% Offline & PWA App Install */}
      <div className="flex items-center gap-2.5 shrink-0 justify-end">
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% ऑफ़लाइन</span>
        </div>

        <PWAInstallButton />
      </div>
    </header>
  );
};
