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
} from 'lucide-react';
import { CLASS_7_SYLLABUS, ENGINES_META, type CurriculumTopic, type EngineType } from '../../data/curriculum';
import { isTopicAvailable } from '../../data/topicLoader';

interface MasteryMapViewProps {
  activeTopicId: string;
  onSelectTopic: (topicId: string) => void;
}

export const MasteryMapView: React.FC<MasteryMapViewProps> = ({
  activeTopicId,
  onSelectTopic,
}) => {
  const [selectedEngineFilter, setSelectedEngineFilter] = useState<EngineType | 'all'>('all');

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

  const filteredTopics = CLASS_7_SYLLABUS.filter((t: CurriculumTopic) => {
    return selectedEngineFilter === 'all' || t.engine === selectedEngineFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Overview Banner */}
      <div className="p-6 sm:p-7 bg-white border border-indigo-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>कक्षा 7 कौशल प्रगति मानचित्र</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            4 शिक्षण इंजन • 6 लेवल्स • 21 आगमनात्मक विषय
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            प्रत्येक विषय को 6-चरणीय आगमनात्मक लूप के अनुसार तैयार किया गया है ताकि आप केवल नियम रटें नहीं, बल्कि सही वाक्य बनाना सीखें।
          </p>
        </div>

        {/* Engine Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setSelectedEngineFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedEngineFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            सभी 21 विषय
          </button>
          {Object.values(ENGINES_META).map((meta) => (
            <button
              key={meta.id}
              onClick={() => setSelectedEngineFilter(meta.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedEngineFilter === meta.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getEngineIcon(meta.id)}
              <span className="hidden sm:inline">{meta.titleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic: CurriculumTopic) => {
          const isSelected = activeTopicId === topic.topicId;
          const available = isTopicAvailable(topic.topicId);
          return (
            <div
              key={topic.topicId}
              className={`border rounded-3xl p-5 sm:p-6 space-y-4 transition-all flex flex-col justify-between ${
                !available
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : `bg-white hover:shadow-md ${getEngineCardBorder(topic.engine, isSelected)}`
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono tabular-nums text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                    Level {topic.level}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 ${getEngineHeaderBg(
                      topic.engine
                    )}`}
                  >
                    {getEngineIcon(topic.engine)}
                    <span>{topic.categoryHi}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {topic.titleHi}
                </h3>
                <p className="text-xs text-slate-500 font-mono font-medium truncate">
                  {topic.title}
                </p>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {topic.descriptionHi}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono text-indigo-700 font-semibold truncate">
                  ⚡ {topic.formulaHi}
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
                      <span>जल्द आ रहा है (Coming soon)</span>
                    </>
                  ) : (
                    <>
                      <span>{isSelected ? 'सक्रिय विषय (अभ्यास करें)' : 'अभ्यास शुरू करें'}</span>
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
