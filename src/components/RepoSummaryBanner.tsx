import React from 'react';
import { Star, GitFork, ExternalLink, Database, Shield, Cpu, BookOpen } from 'lucide-react';
import { RepoAnalysis } from '../types';

interface RepoSummaryBannerProps {
  analysis: RepoAnalysis;
  selectedEntityId: string;
  onSelectEntity: (id: string) => void;
}

export const RepoSummaryBanner: React.FC<RepoSummaryBannerProps> = ({
  analysis,
  selectedEntityId,
  onSelectEntity,
}) => {
  const { metadata, framework, database, authStrategy, entities, endpoints } = analysis;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
      {/* Top row: Repo Title, Metadata & Link */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Unboxed metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1.5 font-medium">
            <span className="text-indigo-400 font-semibold">{framework}</span>
            <span aria-hidden="true">·</span>
            <span>{metadata.language}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {metadata.stars.toLocaleString()}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums flex items-center gap-1">
              <GitFork className="w-3 h-3 text-slate-400" />
              {metadata.forks.toLocaleString()}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{endpoints.length} APIs</span>
          </div>

          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{metadata.fullName}</span>
            {metadata.htmlUrl !== '#' && (
              <a
                href={metadata.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                title="Open on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            {metadata.description}
          </p>
        </div>

        {/* Detected Specs Overview */}
        <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Database:</span>
            <span className="font-medium text-slate-200">{database}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Auth:</span>
            <span className="font-medium text-slate-200">{authStrategy}</span>
          </div>
        </div>
      </div>

      {/* Entity Selection Tabs (Functional segmented controls) */}
      {entities.length > 0 && (
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Studied Backend Entities:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {entities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => onSelectEntity(entity.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedEntityId === entity.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {entity.name} ({entity.sampleData.length})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
