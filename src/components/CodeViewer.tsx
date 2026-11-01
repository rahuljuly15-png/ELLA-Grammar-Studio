import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { generateReactCode } from '../services/codeGenerator';
import { EntityDefinition, RepoAnalysis } from '../types';

interface CodeViewerProps {
  analysis: RepoAnalysis;
  entity: EntityDefinition;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ analysis, entity }) => {
  const [copied, setCopied] = useState(false);
  const code = generateReactCode(analysis, entity);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${entity.singular}Dashboard.tsx`;
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Code Header Bar */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Production React + Tailwind TSX</span>
            <span aria-hidden="true">·</span>
            <span>Zero-dependency except Lucide icons</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {entity.singular}Dashboard.tsx
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy TSX Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .tsx</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>src/components/{entity.singular}Dashboard.tsx</span>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {code.split('\n').length} lines
          </span>
        </div>

        <pre className="p-5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[600px]">
          <code>{code}</code>
        </pre>
      </div>

      {/* Drop-in Integration Guide */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
        <h4 className="text-sm font-semibold text-white">How to Use This Frontend</h4>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Plug-and-play:</strong> Copy the code above directly into your React (Vite / Next.js) project.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Styling:</strong> Works with standard Tailwind CSS v3 or v4 classes out of the box.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Connecting Backend:</strong> Replace <code className="text-indigo-300">INITIAL_DATA</code> with your API fetch call to <code className="text-indigo-300">{analysis.metadata.fullName}</code>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
