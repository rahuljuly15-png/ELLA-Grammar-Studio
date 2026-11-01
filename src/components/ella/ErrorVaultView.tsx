import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { db, type ErrorPattern } from '../../db/dexieDb';

interface ErrorVaultViewProps {
  onRetryTopic: (topicId: string, wrongSentence: string) => void;
}

export const ErrorVaultView: React.FC<ErrorVaultViewProps> = ({ onRetryTopic }) => {
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
    if (window.confirm('क्या आप वाकई त्रुटि बैंक से सभी रिकॉर्ड हटाना चाहते हैं?')) {
      await db.error_patterns.clear();
      await loadErrors();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-700 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>त्रुटि विश्लेषण बैंक (Error Vault)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            व्यक्तिगत व्याकरण कमज़ोरियों का रिकॉर्ड
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            आपके द्वारा लिखे गए वाक्यों में पकड़ी गई गलतियों का विश्लेषण। यहाँ से आप सीधे उसी वाक्य का पुनः अभ्यास कर सकते हैं।
          </p>
        </div>

        {errors.length > 0 && (
          <button
            onClick={handleClearErrors}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>त्रुटि बैंक खाली करें</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl">
          डेटाबेस से त्रुटि रिकॉर्ड लोड हो रहे हैं...
        </div>
      ) : errors.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            त्रुटि बैंक अभी खाली है!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            जब आप "आज का अभ्यास" में वाक्य लिखेंगे और ऑफ़लाइन रूल इंजन किसी व्याकरण त्रुटि को पकड़ेगा, तो वह यहाँ दर्ज हो जाएगी ताकि आप उसका दोबारा अभ्यास कर सकें।
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-3xl bg-white overflow-hidden shadow-xs">
          {errors.map((err, idx) => (
            <div
              key={err.id || idx}
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                    {err.topic_id}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                    {new Date(err.timestamp).toLocaleDateString('hi-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-emerald-700 font-medium text-[11px]">
                    {err.caught_by === 'offline_rule' ? '0ms Offline Regex' : 'AI Analysis'}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="text-rose-700 font-mono">
                    <span className="text-slate-500 font-sans mr-2">गलत वाक्य:</span>
                    <span className="line-through bg-rose-50 px-2 py-0.5 rounded font-bold">
                      {err.wrong_input}
                    </span>
                  </div>
                  <div className="text-emerald-800 font-mono">
                    <span className="text-slate-500 font-sans mr-2">सही सुधार:</span>
                    <span className="bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      {err.corrected_output}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRetryTopic(err.topic_id, err.wrong_input)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs shadow-indigo-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>पुनः अभ्यास करें</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
