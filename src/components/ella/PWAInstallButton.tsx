import React, { useState } from 'react';
import { Download, Smartphone, X, Check, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLanguage } from '../../i18n/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language, t } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running inside standalone installed PWA WebAPK
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>{language === 'en' ? 'App Installed' : 'ऐप स्थापित है'}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      await install();
      setIsInstalling(false);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowHelpGuide(true);
    }
  };

  const buttonLabel = isIOS
    ? language === 'en'
      ? 'Add to iPhone'
      : 'iPhone में जोड़ें'
    : t('btn_install');

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title={language === 'en' ? 'Install as App on your mobile device' : 'मोबाइल में ऐप के रूप में इंस्टॉल करें (Install as Android App)'}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl transition-all shadow-sm shadow-indigo-300 active:scale-95 cursor-pointer"
      >
        <Smartphone className="w-3.5 h-3.5 animate-pulse" />
        <span>{buttonLabel}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  🍎
                </div>
                <h3 className="text-base font-bold text-slate-900">iPhone / iPad में जोड़ें</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <p>Safari ब्राउज़र के नीचे <strong>Share (शेयर ⎋)</strong> बटन पर टैप करें।</p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <p>नीचे स्क्रॉल करके <strong>'Add to Home Screen' (होम स्क्रीन में जोड़ें ⊞)</strong> चुनें।</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              समझ गया (Got it)
            </button>
          </div>
        </div>
      )}

      {/* Android Manual Guide Modal (if beforeinstallprompt didn't fire yet) */}
      {showHelpGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  📱
                </div>
                <h3 className="text-base font-bold text-slate-900">Android में ऐप इंस्टॉल करें</h3>
              </div>
              <button
                onClick={() => setShowHelpGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <p>Chrome में ऊपर दाईं ओर <strong>तीन बिंदुओं (⋮)</strong> वाले मेनू पर टैप करें।</p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <p>मेनू में <strong>'Install app' (ऐप इंस्टॉल करें)</strong> या <strong>'Add to Home screen'</strong> पर टैप करें।</p>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
                ✓ इंस्टॉल होने के बाद यह बिना इंटरनेट के भी सीधे होम स्क्रीन से खुलेगा!
              </div>
            </div>

            <button
              onClick={() => setShowHelpGuide(false)}
              className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              ठीक है (OK)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
