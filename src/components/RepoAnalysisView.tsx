import React from 'react';
import {
  Layers,
  FileCode,
  ShieldCheck,
  Database,
  Workflow,
  Sparkles,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import type { RepoAnalysis } from '../types';

interface RepoAnalysisViewProps {
  analysis: RepoAnalysis;
  onNavigateToPreview: () => void;
  onNavigateToEndpoints: () => void;
}

export const RepoAnalysisView: React.FC<RepoAnalysisViewProps> = ({
  analysis,
  onNavigateToPreview,
  onNavigateToEndpoints,
}) => {
  const { framework, database, authStrategy, detectedFiles, frontendRecommendation, entities, endpoints } = analysis;

  return (
    <div className="space-y-8">
      {/* Overview Cards (Single-Elevation, clean flat borders) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Backend Framework</span>
          </div>
          <div className="text-lg font-bold text-white">{framework}</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Detected from repository configuration, dependencies, and root structure.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Data Layer & ORM</span>
          </div>
          <div className="text-lg font-bold text-white truncate">{database}</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Schema models extracted for state typing and responsive form validations.
          </p>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Authentication Contract</span>
          </div>
          <div className="text-lg font-bold text-white truncate">{authStrategy}</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ready for Authorization Bearer injection & persistent token management.
          </p>
        </div>
      </div>

      {/* Recommended Frontend Architecture */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
            <Workflow className="w-3.5 h-3.5" />
            <span>STUDIED BLUEPRINT</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Frontend Architecture for this Backend
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Based on the detected routes, data contracts, and data structures in {analysis.metadata.fullName}, here is the recommended frontend blueprint:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Key Frontend Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">
              Recommended Core Views:
            </h4>
            <div className="space-y-2">
              {frontendRecommendation.recommendedViews.map((view, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{view}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Design Mechanisms */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">
              Engineered Mechanisms:
            </h4>
            <div className="space-y-2">
              {frontendRecommendation.keyFeatures.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-slate-300"
                >
                  <span className="text-indigo-400 font-mono text-xs tabular-nums mt-0.5">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onNavigateToPreview}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Launch Interactive Frontend Preview
          </button>
          <button
            onClick={onNavigateToEndpoints}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Inspect API Endpoints ({endpoints.length})
          </button>
        </div>
      </div>

      {/* Discovered Repository Files */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <FileCode className="w-4 h-4 text-slate-400" />
            <span>Key Repository Files Inspected</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {detectedFiles.length} files detected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {detectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg font-mono text-xs text-slate-300 truncate"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{file}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
