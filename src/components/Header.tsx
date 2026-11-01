import React from 'react';
import { GitBranch, Code2, Layers, SendHorizontal, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'preview' | 'analysis' | 'endpoints' | 'code';
  setActiveTab: (tab: 'preview' | 'analysis' | 'endpoints' | 'code') => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenShareModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
          <GitBranch className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          RepoCraft
        </span>
      </div>

      {/* Zone 2: Navigation Links (Single-line, unboxed, functional tabs) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('preview')}
          className={`whitespace-nowrap transition-colors ${
            activeTab === 'preview'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Frontend Preview
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`whitespace-nowrap transition-colors ${
            activeTab === 'analysis'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Repository Architecture
        </button>
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`whitespace-nowrap transition-colors ${
            activeTab === 'endpoints'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          API Endpoints & Schemas
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`whitespace-nowrap transition-colors ${
            activeTab === 'code'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Generated TSX Code
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenShareModal}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/20"
        >
          <SendHorizontal className="w-3.5 h-3.5" />
          <span>Share Repo in Chat</span>
        </button>
      </div>
    </header>
  );
};
