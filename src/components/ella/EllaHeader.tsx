import React from 'react';
import {
  BookOpen,
  MapPin,
  AlertTriangle,
  Settings,
  Download,
  ShieldCheck,
  Globe,
  Sparkles,
  Share2,
} from 'lucide-react';

export type EllaView = 'cycle' | 'mastery_map' | 'error_vault' | 'publish' | 'settings';

interface EllaHeaderProps {
  currentView: EllaView;
  setCurrentView: (view: EllaView) => void;
  onExportBackup: () => void;
  onOpenPublishModal: () => void;
  sessionsCount: number;
  errorsCount: number;
}

export const EllaHeader: React.FC<EllaHeaderProps> = ({
  currentView,
  setCurrentView,
  onExportBackup,
  onOpenPublishModal,
  sessionsCount,
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
            आगमनात्मक द्विभाषी अंग्रेजी व्याकरण (Inductive Grammar)
          </p>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Clean, soft, single-line tabs) */}
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
          <span>आज का अभ्यास</span>
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
          <span>कौशल मानचित्र (21 विषय)</span>
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
          <span>त्रुटि बैंक ({errorsCount})</span>
        </button>

        <button
          onClick={() => setCurrentView('publish')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            currentView === 'publish'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          <span>₹0 फ्री पब्लिश</span>
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

      {/* Zone 3: Primary Action & 100% Offline */}
      <div className="flex items-center gap-2.5 shrink-0 justify-end">
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">100% मुफ़्त व ऑफ़लाइन</span>
        </div>

        <button
          onClick={onOpenPublishModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-xs shadow-emerald-200 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>लाइव लिंक देखें</span>
        </button>
      </div>
    </header>
  );
};
