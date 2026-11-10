import React, { useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  Database,
  Trash2,
  ShieldCheck,
  User,
} from 'lucide-react';

interface SettingsViewProps {
  studentName: string;
  setStudentName: (name: string) => void;
  dbStats: { sessionsCount: number; errorsCount: number; reviewsCount: number };
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  studentName,
  setStudentName,
  dbStats,
  onExportBackup,
  onImportBackup,
  onDeleteAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Overview Banner */}
      <div className="p-6 sm:p-7 bg-white border border-slate-200/90 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-1">
            <Settings className="w-4 h-4" />
            <span>सेटिंग्स और आपका डेटा</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            स्टूडेंट प्रोफ़ाइल और बैकअप
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            ELLA 100% ऑफ़लाइन है। आपका सारा डेटा आपकी अपनी डिवाइस में सुरक्षित रहता है। आप कभी भी अपना बैकअप डाउनलोड या रीस्टोर कर सकते हैं।
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>DPDP Act 2023 Compliant</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Profile Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <User className="w-4 h-4 text-indigo-600" />
            <span>स्टूडेंट प्रोफ़ाइल (Profile)</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                स्टूडेंट का नाम (Student Name):
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                आपकी कक्षा (Class):
              </label>
              <div className="px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-center justify-between font-medium">
                <span>कक्षा 6–10 (CBSE / State Board)</span>
                <span className="text-[11px] font-mono text-indigo-600 font-bold">21 Topics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Telemetry Stats */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>आपकी कुल प्रोग्रेस (Activity Stats)</span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-indigo-700 tabular-nums">
                {dbStats.sessionsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">प्रैक्टिस राउंड्स</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                {dbStats.errorsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">फिक्स की गई गलतियाँ</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-center">
              <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                {dbStats.reviewsCount}
              </span>
              <div className="text-[11px] text-slate-600 font-medium">रिवीजन टॉपिक्स</div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup and Restore Controls */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">
          1-Click बैकअप व रीस्टोर (Backup & Restore)
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          आप अपने सभी लिखे हुए वाक्य और प्रोग्रेस को एक JSON फ़ाइल में बैकअप कर सकते हैं। किसी दूसरे फ़ोन या कंप्यूटर में इसे 1-क्लिक में रीस्टोर किया जा सकता है।
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExportBackup}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs shadow-indigo-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>1-Click बैकअप डाउनलोड करें (Export JSON)</span>
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={onImportBackup}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>JSON फ़ाइल से रीस्टोर करें (Import JSON)</span>
          </button>
        </div>
      </div>

      {/* Privacy: Delete All Data */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 space-y-3">
        <h4 className="text-sm font-bold text-rose-900">
          प्राइवेसी नियंत्रण (Right to be Forgotten)
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          यदि आप इस डिवाइस से अपना सारा अभ्यास डेटा और त्रुटि रिकॉर्ड मिटाना चाहते हैं, तो आप नीचे दिए गए बटन से सभी स्थानीय डेटा को शून्य कर सकते हैं।
        </p>
        <div className="pt-1">
          <button
            onClick={onDeleteAllData}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>इस डिवाइस से मेरा सारा डेटा हटाएं</span>
          </button>
        </div>
      </div>
    </div>
  );
};
