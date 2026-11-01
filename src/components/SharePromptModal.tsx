import React, { useState } from 'react';
import { X, Copy, Check, Send, Sparkles, GitBranch, Terminal } from 'lucide-react';
import { RepoAnalysis } from '../types';

interface SharePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: RepoAnalysis;
}

export const SharePromptModal: React.FC<SharePromptModalProps> = ({
  isOpen,
  onClose,
  analysis,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generatedPrompt = `नमस्ते! मैं अपनी GitHub रेपो के लिए एक नया फ्रंट-एंड बनवाना चाहता हूँ:
रेपो: ${analysis.metadata.htmlUrl !== '#' ? analysis.metadata.htmlUrl : analysis.metadata.fullName}
फ्रेमवर्क: ${analysis.framework}
डेटाबेस: ${analysis.database}
ऑथेंटिकेशन: ${analysis.authStrategy}
मुख्य एंटिटीज: ${analysis.entities.map((e) => e.name).join(', ')}

कृपया इसे स्टडी करके इसके लिए एक आधुनिक, रिस्पॉन्सिव React + Tailwind फ्रंट-एंड डैशबोर्ड बना दीजिए जिसमें CRUD ऑपरेशन्स, सर्च/फिल्टर, और API इंटीग्रेशन शामिल हो।`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              चैट में रेपो शेयर करें (Share Repo in Chat)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hindi explanation block */}
        <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl space-y-2 text-xs text-indigo-200">
          <p className="font-semibold text-white text-sm">
            हाँ, बिल्कुल! आप अपनी रेपो का लिंक चैट में कभी भी भेज सकते हैं:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>
              <strong>पब्लिक रेपो:</strong> बस रेपो का GitHub URL यहाँ चैट में भेजें।
            </li>
            <li>
              <strong>प्राइवेट रेपो:</strong> आप उसका <code>README.md</code>, API Endpoints, OpenAPI/Swagger JSON, या मॉडल्स का कोड यहाँ चैट में पेस्ट कर सकते हैं।
            </li>
            <li>
              हम पूरा बैकएंड आर्किटेक्चर स्टडी करके तुरंत लाइव इंटरएक्टिव फ्रंट-एंड तैयार कर देंगे!
            </li>
          </ul>
        </div>

        {/* Ready to copy prompt box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>रेडी-टू-सेंड चैट प्रॉम्प्ट (Ready to paste in chat):</span>
            <button
              onClick={handleCopyPrompt}
              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Message</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            rows={6}
            value={generatedPrompt}
            className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-sans focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied! Now paste in chat</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy & Paste in Chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
