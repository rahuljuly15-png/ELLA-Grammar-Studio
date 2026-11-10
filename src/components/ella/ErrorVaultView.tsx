import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { db, type ErrorPattern } from '../../db/dexieDb';
import { useLanguage } from '../../i18n/LanguageContext';

interface ErrorVaultViewProps {
  onRetryTopic: (topicId: string, wrongSentence: string) => void;
}

export const ErrorVaultView: React.FC<ErrorVaultViewProps> = ({ onRetryTopic }) => {
  const { language, t } = useLanguage();
  const [errors, setErrors] = useState<ErrorPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadErrors = async () => {
    setIsLoading(true);
    try {
      const records = await db.error_patterns.reverse().limit(50).toArray();
      setErrors(records);
    } catch (err) {
      console.error('Failed to load error patterns from Dexie:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadErrors();
  }, []);

  const handleClearErrors = async () => {
    if (window.confirm(t('vault_confirm_clear'))) {
      await db.error_patterns.clear();
      await loadErrors();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-6 sm:p-7 bg-gradient-to-r from-amber-50/60 via-orange-50/30 to-yellow-50/40 border border-amber-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-800 font-extrabold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 fill-amber-400" />
            <span>{t('vault_title')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
            {language === 'en' ? 'Learn from Your Mistakes Without Fear' : 'यहाँ आपकी गलतियों से सीखने का मौका है'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {t('vault_subtitle')}
          </p>
        </div>

        {errors.length > 0 && (
          <button
            onClick={handleClearErrors}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('vault_clear_btn')}</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl">
          {language === 'en' ? 'Loading records from local database...' : 'डेटाबेस से रिकॉर्ड लोड हो रहे हैं...'}
        </div>
      ) : errors.length === 0 ? (
        <div className="p-12 text-center bg-gradient-to-b from-emerald-50/40 via-white to-white border border-emerald-200/90 rounded-3xl space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            {t('vault_empty_title')}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {t('vault_empty_desc')}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-3xl bg-white overflow-hidden shadow-xs">
          {errors.map((err, idx) => (
            <div
              key={err.id || idx}
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-amber-50/30 transition-colors"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-indigo-800 font-bold bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                    {err.topic_id}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                    {new Date(err.timestamp).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {err.caught_by === 'offline_rule' ? '⚡ 0ms Offline' : '✨ AI Analysis'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  {err.full_sentence && (
                    <div className="text-slate-700 font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-slate-500 font-sans mr-2 font-medium">{t('vault_original_label')}</span>
                      <span>"{err.full_sentence}"</span>
                    </div>
                  )}
                  <div className="text-rose-800 font-mono">
                    <span className="text-slate-500 font-sans mr-2 font-medium">{language === 'en' ? 'Tricky part:' : 'गलत अंश:'}</span>
                    <span className="line-through bg-rose-100/80 border border-rose-200/80 px-2.5 py-0.5 rounded-lg font-bold">
                      {err.wrong_input}
                    </span>
                  </div>
                  <div className="text-emerald-900 font-mono">
                    <span className="text-slate-500 font-sans mr-2 font-medium">{t('vault_corrected_label')}</span>
                    <span className="bg-emerald-100/80 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg font-bold">
                      {err.corrected_output}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRetryTopic(err.topic_id, err.full_sentence || err.wrong_input)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs shadow-indigo-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('vault_retry_btn')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
