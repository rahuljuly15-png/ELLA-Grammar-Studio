import React, { useState } from 'react';
import { X, Search, Check, Blocks, Clock, Repeat, FileText, Lock } from 'lucide-react';
import { CLASS_7_SYLLABUS, ENGINES_META, type CurriculumTopic, type EngineType } from '../../data/curriculum';
import { isTopicAvailable } from '../../data/topicLoader';

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
  const [search, setSearch] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<EngineType | 'all'>('all');

  if (!isOpen) return null;

  const filteredTopics = CLASS_7_SYLLABUS.filter((t: CurriculumTopic) => {
    const matchesEngine = selectedEngine === 'all' || t.engine === selectedEngine;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.titleHi.toLowerCase().includes(search.toLowerCase()) ||
      t.categoryHi.toLowerCase().includes(search.toLowerCase());
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
              व्याकरण विषय चुनें (Class 7 Curriculum)
            </h3>
            <p className="text-xs text-slate-500">
              4 शिक्षण इंजन • 6 लेवल्स • 21 आगमनात्मक विषय
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
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
              placeholder="विषय खोजें (e.g. Articles, Tenses, Nouns, Modals)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedEngine('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedEngine === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी 21 विषय
            </button>
            {Object.values(ENGINES_META).map((meta) => (
              <button
                key={meta.id}
                onClick={() => setSelectedEngine(meta.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedEngine === meta.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {getEngineIcon(meta.id)}
                <span>{meta.titleEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
          {filteredTopics.map((topic: CurriculumTopic) => {
            const isSelected = activeTopicId === topic.topicId;
            const available = isTopicAvailable(topic.topicId);
            return (
              <button
                key={topic.topicId}
                disabled={!available}
                onClick={() => {
                  if (!available) return;
                  onSelectTopic(topic.topicId);
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                  !available
                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    : isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 text-slate-900 ring-2 ring-indigo-400/30 cursor-pointer'
                    : 'bg-slate-50/60 border-slate-200 hover:border-indigo-200 hover:bg-white text-slate-700 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono tabular-nums text-indigo-700 font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                      Level {topic.level}
                    </span>
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      {getEngineIcon(topic.engine)}
                      <span>{topic.categoryHi}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {topic.titleHi}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-mono font-medium">
                    {topic.title}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
                  <span className="truncate max-w-[180px] font-mono">{topic.formulaHi}</span>
                  {!available ? (
                    <span className="text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 shrink-0">
                      <Lock className="w-3 h-3 text-amber-600" />
                      जल्द आ रहा है (Coming soon)
                    </span>
                  ) : isSelected ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-bold shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      सक्रिय
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
