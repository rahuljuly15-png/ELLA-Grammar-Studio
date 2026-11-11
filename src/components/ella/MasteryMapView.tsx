import React, { useState } from 'react';
import {
  Blocks,
  Clock,
  Repeat,
  FileText,
  ArrowRight,
  Sparkles,
  BookOpen,
  Lock,
  GraduationCap,
} from 'lucide-react';
import { CLASS_7_SYLLABUS, ENGINES_META, type CurriculumTopic, type EngineType } from '../../data/curriculum';
import { isTopicAvailable } from '../../data/topicLoader';
import { useLanguage } from '../../i18n/LanguageContext';
import { TOPIC_TRANSLATIONS } from '../../i18n/topicTranslations';

interface MasteryMapViewProps {
  activeTopicId: string;
  onSelectTopic: (topicId: string) => void;
}

export type ClassFilter = 'all' | 'class6_7' | 'class8' | 'class9_10';

export const MasteryMapView: React.FC<MasteryMapViewProps> = ({
  activeTopicId,
  onSelectTopic,
}) => {
  const { language, t } = useLanguage();
  const [selectedEngineFilter, setSelectedEngineFilter] = useState<EngineType | 'all'>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<ClassFilter>('all');

  const getEngineIcon = (engine: EngineType) => {
    switch (engine) {
      case 'sentence_lego':
        return <Blocks className="w-4 h-4 text-indigo-600" />;
      case 'time_mood_slider':
        return <Clock className="w-4 h-4 text-emerald-600" />;
      case 'perspective_transformer':
        return <Repeat className="w-4 h-4 text-amber-600" />;
      case 'blueprint_studio':
        return <FileText className="w-4 h-4 text-purple-600" />;
    }
  };

  const getEngineCardBg = (engine: EngineType) => {
    switch (engine) {
      case 'sentence_lego':
        return 'bg-gradient-to-b from-indigo-50/40 via-white to-white';
      case 'time_mood_slider':
        return 'bg-gradient-to-b from-emerald-50/40 via-white to-white';
      case 'perspective_transformer':
        return 'bg-gradient-to-b from-amber-50/40 via-white to-white';
      case 'blueprint_studio':
        return 'bg-gradient-to-b from-purple-50/40 via-white to-white';
    }
  };

  const getLevelBadgeStyle = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-sky-100 text-sky-800 border-sky-200/80';
      case 2:
        return 'bg-purple-100 text-purple-800 border-purple-200/80';
      case 3:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200/80';
      case 4:
        return 'bg-amber-100 text-amber-800 border-amber-200/80';
      case 5:
        return 'bg-rose-100 text-rose-800 border-rose-200/80';
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200/80';
    }
  };

  const getEngineCardBorder = (engine: EngineType, isSelected: boolean) => {
    if (isSelected) {
      return 'border-indigo-500 ring-2 ring-indigo-400/40 shadow-sm';
    }
    switch (engine) {
      case 'sentence_lego':
        return 'border-indigo-200 hover:border-indigo-400 shadow-xs';
      case 'time_mood_slider':
        return 'border-emerald-200 hover:border-emerald-400 shadow-xs';
      case 'perspective_transformer':
        return 'border-amber-200 hover:border-amber-400 shadow-xs';
      case 'blueprint_studio':
        return 'border-purple-200 hover:border-purple-400 shadow-xs';
    }
  };

  const getEngineHeaderBg = (engine: EngineType) => {
    switch (engine) {
      case 'sentence_lego':
        return 'bg-indigo-50/80 text-indigo-800 border-indigo-100';
      case 'time_mood_slider':
        return 'bg-emerald-50/80 text-emerald-800 border-emerald-100';
      case 'perspective_transformer':
        return 'bg-amber-50/80 text-amber-800 border-amber-100';
      case 'blueprint_studio':
        return 'bg-purple-50/80 text-purple-800 border-purple-100';
    }
  };

  const filteredTopics = CLASS_7_SYLLABUS.filter((topic: CurriculumTopic) => {
    const matchesEngine = selectedEngineFilter === 'all' || topic.engine === selectedEngineFilter;
    let matchesClass = true;
    if (selectedClassFilter === 'class6_7') {
      matchesClass = topic.level === 1 || topic.level === 2;
    } else if (selectedClassFilter === 'class8') {
      matchesClass = topic.level === 3 || topic.level === 4;
    } else if (selectedClassFilter === 'class9_10') {
      matchesClass = topic.level === 5 || topic.level === 6;
    }
    return matchesEngine && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Overview Banner */}
      <div className="p-6 sm:p-7 bg-white border border-indigo-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{t('map_title')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {language === 'en'
              ? '4 Smart Engines • 6 Levels • 21 Interactive Topics'
              : '4 स्मार्ट इंजन • 6 लेवल्स • 21 इंटरैक्टिव विषय'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            {t('map_subtitle')}
          </p>
        </div>

        <div className="text-right hidden md:block">
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
            {filteredTopics.length} / 21 {language === 'en' ? 'Topics' : 'विषय'}
          </span>
        </div>
      </div>

      {/* Grade / Class Filter Pills & Engine Selector (Audit UX-05) */}
      <div className="space-y-3">
        {/* Class Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white border border-indigo-100 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-900 shrink-0">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>{language === 'en' ? 'Filter by Grade / Class:' : 'कक्षा के अनुसार विषय चुनें:'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', labelEn: 'All Classes (21)', labelHi: 'सभी कक्षाएँ (21)' },
              { id: 'class6_7', labelEn: 'Class 6–7 (Foundations)', labelHi: '🎒 कक्षा 6–7 (बुनियादी)' },
              { id: 'class8', labelEn: 'Class 8 (Intermediate)', labelHi: '📘 कक्षा 8 (माध्यमिक)' },
              { id: 'class9_10', labelEn: 'Class 9–10 (Board Exam)', labelHi: '🎓 कक्षा 9–10 (बोर्ड परीक्षा)' },
            ].map((cls) => {
              const isSelected = selectedClassFilter === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassFilter(cls.id as ClassFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-indigo-200'
                      : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200/80 hover:border-indigo-300'
                  }`}
                >
                  {language === 'en' ? cls.labelEn : cls.labelHi}
                </button>
              );
            })}
          </div>
        </div>

        {/* Engine Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/70 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedEngineFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedEngineFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('map_filter_all')}
          </button>
          {Object.values(ENGINES_META).map((meta) => (
            <button
              key={meta.id}
              onClick={() => setSelectedEngineFilter(meta.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedEngineFilter === meta.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getEngineIcon(meta.id)}
              <span>
                {language === 'en' ? meta.titleEn : meta.titleHi}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic: CurriculumTopic) => {
          const isSelected = activeTopicId === topic.topicId;
          const available = isTopicAvailable(topic.topicId);
          const trans = TOPIC_TRANSLATIONS[topic.topicId];

          const displayTitle = language === 'en' ? topic.title : topic.titleHi;
          const displaySub = language === 'en' ? topic.titleHi : topic.title;
          const displayCat = language === 'en' ? (trans?.categoryEn || topic.categoryHi) : topic.categoryHi;
          const displayDesc = language === 'en' ? (trans?.descriptionEn || topic.descriptionHi) : topic.descriptionHi;
          const displayFormula = language === 'en' ? (trans?.formulaEn || topic.formulaHi) : topic.formulaHi;

          return (
            <div
              key={topic.topicId}
              className={`border rounded-3xl p-5 sm:p-6 space-y-4 transition-all flex flex-col justify-between shadow-2xs ${
                !available
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : `${getEngineCardBg(topic.engine)} hover:shadow-md ${getEngineCardBorder(topic.engine, isSelected)}`
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono tabular-nums font-bold px-2 py-0.5 rounded-lg border shadow-2xs ${getLevelBadgeStyle(topic.level)}`}>
                      L{topic.level}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-white/90 border border-slate-200/90 px-2 py-0.5 rounded-lg shadow-2xs">
                      {topic.level <= 2
                        ? (language === 'en' ? 'Class 6–7' : 'कक्षा 6–7')
                        : topic.level <= 4
                        ? (language === 'en' ? 'Class 8' : 'कक्षा 8')
                        : (language === 'en' ? 'Class 9–10' : 'कक्षा 9–10')}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${getEngineHeaderBg(
                      topic.engine
                    )}`}
                  >
                    {getEngineIcon(topic.engine)}
                    <span>{displayCat}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {displayTitle}
                </h3>
                <p className="text-xs text-slate-500 font-mono font-medium truncate">
                  {displaySub}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {displayDesc}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono text-indigo-700 font-semibold truncate">
                  ⚡ {displayFormula}
                </div>

                <button
                  disabled={!available}
                  onClick={() => {
                    if (!available) return;
                    onSelectTopic(topic.topicId);
                  }}
                  className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                    !available
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : isSelected
                      ? 'bg-indigo-600 text-white shadow-indigo-200 cursor-pointer'
                      : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 cursor-pointer'
                  }`}
                >
                  {!available ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'en' ? 'Coming Soon' : 'जल्द आ रहा है'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isSelected
                          ? (language === 'en' ? 'Active Topic (Practicing)' : 'सक्रिय विषय (प्रैक्टिस करें)')
                          : (language === 'en' ? 'Start Topic' : 'प्रैक्टिस शुरू करें')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
