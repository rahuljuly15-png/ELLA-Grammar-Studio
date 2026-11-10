import React, { useState } from 'react';
import { X, Search, Check, Blocks, Clock, Repeat, FileText, Lock } from 'lucide-react';
import { CLASS_7_SYLLABUS, ENGINES_META, type CurriculumTopic, type EngineType } from '../../data/curriculum';
import { isTopicAvailable } from '../../data/topicLoader';
import { useLanguage } from '../../i18n/LanguageContext';
import { TOPIC_TRANSLATIONS } from '../../i18n/topicTranslations';

interface TopicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopicId: string;
  onSelectTopic: (topicId: string) => void;
}

export const TopicSelectorModal: React.FC<TopicSelectorModalProps> = ({
  isOpen,
  onClose,
  activeTopicId,
  onSelectTopic,
}) => {
  const { language, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<EngineType | 'all'>('all');

  if (!isOpen) return null;

  const filteredTopics = CLASS_7_SYLLABUS.filter((topic: CurriculumTopic) => {
    const matchesEngine = selectedEngine === 'all' || topic.engine === selectedEngine;
    const matchesSearch =
      topic.title.toLowerCase().includes(search.toLowerCase()) ||
      topic.titleHi.toLowerCase().includes(search.toLowerCase()) ||
      topic.categoryHi.toLowerCase().includes(search.toLowerCase());
    return matchesEngine && matchesSearch;
  });

  const getEngineIcon = (engine: EngineType) => {
    switch (engine) {
      case 'sentence_lego':
        return <Blocks className="w-3.5 h-3.5 text-indigo-600" />;
      case 'time_mood_slider':
        return <Clock className="w-3.5 h-3.5 text-emerald-600" />;
      case 'perspective_transformer':
        return <Repeat className="w-3.5 h-3.5 text-amber-600" />;
      case 'blueprint_studio':
        return <FileText className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t('modal_title')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('modal_subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title={t('modal_close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Engine Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('modal_search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedEngine('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedEngine === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'en' ? 'All Topics' : 'सभी विषय'}
            </button>
            {Object.values(ENGINES_META).map((meta) => (
              <button
                key={meta.id}
                onClick={() => setSelectedEngine(meta.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedEngine === meta.id
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {getEngineIcon(meta.id)}
                <span>{language === 'en' ? meta.titleEn : meta.titleHi}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topics List */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2.5">
          {filteredTopics.map((topic: CurriculumTopic) => {
            const isSelected = activeTopicId === topic.topicId;
            const available = isTopicAvailable(topic.topicId);
            const trans = TOPIC_TRANSLATIONS[topic.topicId];

            const displayTitle = language === 'en' ? topic.title : topic.titleHi;
            const displayCat = language === 'en' ? (trans?.categoryEn || topic.categoryHi) : topic.categoryHi;
            const displayDesc = language === 'en' ? (trans?.descriptionEn || topic.descriptionHi) : topic.descriptionHi;

            return (
              <div
                key={topic.topicId}
                onClick={() => {
                  if (!available) return;
                  onSelectTopic(topic.topicId);
                  onClose();
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  !available
                    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/30 cursor-pointer shadow-xs'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    L{topic.level}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span>{displayCat}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono text-slate-400">{topic.topicId}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {displayTitle}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {!available ? (
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Lock className="w-3 h-3" />
                      <span>{language === 'en' ? 'Soon' : 'जल्द'}</span>
                    </span>
                  ) : isSelected ? (
                    <span className="text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'en' ? 'Selected' : 'सक्रिय'}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600">
                      {language === 'en' ? 'Select →' : 'चुनें →'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
