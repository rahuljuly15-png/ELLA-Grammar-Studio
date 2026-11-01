import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, FileText, Database, ShieldCheck, KeyRound } from 'lucide-react';
import { SAMPLE_REPOSITORIES } from '../data/sampleRepos';
import { RepoAnalysis } from '../types';

interface RepoInputBarProps {
  onAnalyzeUrl: (url: string, token?: string) => Promise<void>;
  onSelectSample: (sample: RepoAnalysis) => void;
  onCustomSchema: (raw: string) => void;
  isLoading: boolean;
  currentRepoFullName: string;
}

export const RepoInputBar: React.FC<RepoInputBarProps> = ({
  onAnalyzeUrl,
  onSelectSample,
  onCustomSchema,
  isLoading,
  currentRepoFullName,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showRawPaste, setShowRawPaste] = useState(false);
  const [rawText, setRawText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onAnalyzeUrl(inputUrl.trim(), githubToken.trim() || undefined);
    }
  };

  const handleRawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawText.trim()) {
      onCustomSchema(rawText.trim());
      setShowRawPaste(false);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm">
      <div className="space-y-4">
        {/* Main URL Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste GitHub repository (e.g. owner/repo or https://github.com/...)"
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputUrl.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Repo...</span>
              </>
            ) : (
              <>
                <span>Study Repo & Build UI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Optional GitHub Token Drawer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-2">
            <span>Quick Samples:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SAMPLE_REPOSITORIES.map((sample) => (
                <button
                  key={sample.metadata.fullName}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    currentRepoFullName === sample.metadata.fullName
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {sample.framework}: {sample.metadata.repo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3" />
              <span>{showTokenInput ? 'Hide Token' : 'Add GitHub Token (Optional)'}</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setShowRawPaste(!showRawPaste)}
              className="hover:text-slate-200 transition-colors inline-flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>{showRawPaste ? 'Close Manual Input' : 'Paste Code / OpenAPI Schema'}</span>
            </button>
          </div>
        </div>

        {/* GitHub Personal Access Token field (for private repos or rate limit prevention) */}
        {showTokenInput && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="block text-xs text-slate-300 font-medium">
              GitHub Personal Access Token (stored in memory only, bypasses 60 req/hr rate limit or reads private repos)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Manual Code / OpenAPI Schema Drawer */}
        {showRawPaste && (
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Paste Local Backend Code or OpenAPI Spec</h4>
                <p className="text-xs text-slate-400">
                  Ideal for private repositories, swagger.json, or Express/FastAPI route files.
                </p>
              </div>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`{\n  "openapi": "3.0.0",\n  "paths": {\n    "/api/orders": {\n      "get": { "summary": "List orders" }\n    }\n  }\n}`}
              className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRawPaste(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRawSubmit}
                disabled={!rawText.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50"
              >
                Parse & Generate Frontend
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
