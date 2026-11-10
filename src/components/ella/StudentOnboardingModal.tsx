import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowRight, ArrowLeft, CheckCircle2, Lightbulb, Compass, Award } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      badge: t('tour_step1_badge'),
      title: t('tour_step1_title'),
      desc: t('tour_step1_desc'),
      icon: Lightbulb,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      visual: (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2 text-left">
          <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
            <span>✨</span>
            <span>{language === 'en' ? 'Old Way vs ELLA Way:' : 'पुराना तरीका vs ELLA तरीका:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white border border-rose-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-rose-600">❌ {language === 'en' ? 'Rote Rules' : 'रटना'}</span>
              <p className="text-[11px] text-slate-600">{language === 'en' ? 'Memorize dry formula before reading.' : 'बिना समझे नियम की परिभाषा रटना।'}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-emerald-700">✓ {language === 'en' ? 'Discover Pattern' : 'पैटर्न पहचानना'}</span>
              <p className="text-[11px] text-slate-700">{language === 'en' ? 'See examples out loud, spot the clue!' : 'पहले उदाहरण सुनें और खुद अंतर समझें!'}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: t('tour_step2_badge'),
      title: t('tour_step2_title'),
      desc: t('tour_step2_desc'),
      icon: Compass,
      color: 'from-indigo-600 to-purple-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      visual: (
        <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl space-y-2 text-left">
          <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
            <span>🌀</span>
            <span>{language === 'en' ? 'Your 5-Step Learning Journey:' : 'आपके 5 आसान कदम:'}</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-[11px] font-bold">
            <span className="px-2 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-700 shrink-0">1. {language === 'en' ? 'Notice' : 'फर्क'}</span>
            <span className="text-indigo-400">→</span>
            <span className="px-2 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-700 shrink-0">2. {language === 'en' ? 'Guess' : 'अंदाज़ा'}</span>
            <span className="text-indigo-400">→</span>
            <span className="px-2 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-700 shrink-0">3. {language === 'en' ? 'Rule' : 'नियम'}</span>
            <span className="text-indigo-400">→</span>
            <span className="px-2 py-1 bg-white border border-indigo-200 rounded-lg text-emerald-700 shrink-0">4. {language === 'en' ? 'Build' : 'वाक्य'}</span>
            <span className="text-indigo-400">→</span>
            <span className="px-2 py-1 bg-white border border-indigo-200 rounded-lg text-purple-700 shrink-0">5. {language === 'en' ? 'Review' : 'रिवीजन'}</span>
          </div>
        </div>
      ),
    },
    {
      badge: t('tour_step3_badge'),
      title: t('tour_step3_title'),
      desc: t('tour_step3_desc'),
      icon: Sparkles,
      color: 'from-amber-500 to-rose-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      visual: (
        <div className="p-3.5 bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-md shrink-0">
            🪔
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
              <span>{t('genie_title')}</span>
              <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full font-extrabold">100% Friendly</span>
            </span>
            <p className="text-[11px] text-slate-700 leading-snug">
              {language === 'en'
                ? 'Tap the Golden Magic Lamp in the corner anytime to ask questions, hear Indian English pronunciation, or get clues!'
                : 'कोने में जादुई चिराग पर कभी भी टैप करें — सवाल पूछें, भारतीय उच्चारण सुनें और बिना झिझक सीखें!'}
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ella_onboarding_completed', 'true');
    }
    onClose();
  };

  const current = slides[currentSlide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden text-center space-y-6"
      >
        {/* Top Header Row: Badge + Skip Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('tour_modal_badge')}</span>
          </span>

          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          >
            {t('tour_skip_btn')} ✕
          </button>
        </div>

        {/* Animated Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Visual Header Icon */}
            <div className="flex justify-center">
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white shadow-lg`}>
                <Icon className="w-8 h-8" />
              </div>
            </div>

            {/* Slide Title & Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {current.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {current.desc}
              </p>
            </div>

            {/* Interactive Visual Box */}
            {current.visual}
          </motion.div>
        </AnimatePresence>

        {/* Footer: Stepper Dots & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlide === idx
                    ? 'w-7 h-2 bg-indigo-600'
                    : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-end gap-2">
            {currentSlide > 0 && (
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => prev - 1)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                {t('tour_prev_btn')}
              </button>
            )}

            {currentSlide < slides.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-300 cursor-pointer"
              >
                <span>{t('tour_next_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-emerald-200 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('tour_finish_btn')}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};