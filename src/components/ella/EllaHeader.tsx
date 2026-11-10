import React from 'react';
import {
  BookOpen,
  MapPin,
  AlertTriangle,
  Settings,
  ShieldCheck,
  Sparkles,
  Languages,
  HelpCircle,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useLanguage } from '../../i18n/LanguageContext';

export type EllaView = 'cycle' | 'mastery_map' | 'error_vault' | 'publish' | 'settings';

interface EllaHeaderProps {
  currentView: EllaView;
  setCurrentView: (view: EllaView) => void;
  errorsCount: number;
  onOpenPublishModal?: () => void;
  onExportBackup?: () => void;
  sessionsCount?: number;
  onOpenTour?: () => void;
}

export const EllaHeader: React.FC<EllaHeaderProps> = ({
  currentView,
  setCurrentView,
  errorsCount,
  onOpenTour,
}) => {
  const { language, setLanguage, t } = useLanguage();

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
              {t('appName')}
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              {t('classBadge')}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('tagline')}
          </p>
        </div>
      </div>

      {/* Zone 2: Navigation Links (Clean, student-focused tabs) */}
      <nav className="flex items-center gap-1 p-1 bg-slate-100/90 border border-slate-200 rounded-xl overflow-x-auto">
        <button
          onClick={() => setCurrentView('cycle')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            currentView === 'cycle'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('nav_practice')}</span>
        </button>

        <button
          onClick={() => setCurrentView('mastery_map')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            currentView === 'mastery_map'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span>{t('nav_map')}</span>
        </button>

        <button
          onClick={() => setCurrentView('error_vault')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            currentView === 'error_vault'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('nav_vault')} ({errorsCount})</span>
        </button>

        <button
          onClick={() => setCurrentView('settings')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            currentView === 'settings'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('nav_settings')}</span>
        </button>

        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200/60 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
            title={language === 'en' ? 'Open 30-Second Student Tour' : '30-सेकंड की स्टूडेंट गाइड खोलें'}
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('nav_tour_btn')}</span>
          </button>
        )}
      </nav>

      {/* Zone 3: Language Conversion Toggle, 100% Offline & PWA App Install */}
      <div className="flex items-center gap-2 shrink-0 justify-end">
        {/* Language Conversion Toggle (Small, Top Right Corner) */}
        <div 
          className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0 shadow-2xs"
          role="group"
          aria-label="Language selection"
        >
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'hi'
                ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="हिन्दी में बदलें"
          >
            <span className="text-xs">🇮🇳</span>
            <span className="text-[11px] font-bold">हिन्दी</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Switch to English"
          >
            <span className="text-xs">🇬🇧</span>
            <span className="text-[11px] font-bold">English</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-xl font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('badge_offline')}</span>
        </div>

        <PWAInstallButton />
      </div>
    </header>
  );
};
