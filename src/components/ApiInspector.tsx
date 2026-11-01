import React, { useState } from 'react';
import { Send, Play, CheckCircle, Terminal, Key, Copy, Check } from 'lucide-react';
import type { EndpointDefinition, RepoAnalysis } from '../types';

interface ApiInspectorProps {
  analysis: RepoAnalysis;
}

export const ApiInspector: React.FC<ApiInspectorProps> = ({ analysis }) => {
  const { endpoints } = analysis;
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(
    endpoints[0]?.id || ''
  );
  const [authToken, setAuthToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const selectedEndpoint =
    endpoints.find((ep) => ep.id === selectedEndpointId) || endpoints[0];

  const handleSimulateRequest = () => {
    setIsSimulating(true);
    setLastResponse(null);
    setTimeout(() => {
      setIsSimulating(false);
      setLastResponse({
        status: 200,
        statusText: 'OK',
        timeMs: 42,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
        data: selectedEndpoint?.responseSample || { message: 'Success' },
      });
    }, 280);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
      case 'POST':
        return 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60';
      case 'PUT':
      case 'PATCH':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      case 'DELETE':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  const copySampleResponse = () => {
    if (selectedEndpoint) {
      navigator.clipboard.writeText(
        JSON.stringify(selectedEndpoint.responseSample, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!selectedEndpoint) {
    return (
      <div className="p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
        No API endpoints detected for this repository.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>REST API Contracts</span>
            <span aria-hidden="true">·</span>
            <span>{endpoints.length} routes found</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Backend Endpoint & Schema Inspector
          </h2>
        </div>

        {/* Token injector bar */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Key className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Bearer Token"
            className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List (Left column) */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-semibold text-slate-400 px-1 mb-2">
            Discovered Route Handlers:
          </div>
          {endpoints.map((ep) => {
            const isSelected = ep.id === selectedEndpointId;
            return (
              <button
                key={ep.id}
                onClick={() => {
                  setSelectedEndpointId(ep.id);
                  setLastResponse(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getMethodColor(
                    ep.method
                  )}`}
                >
                  {ep.method}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-slate-200 truncate font-medium">
                    {ep.path}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    {ep.summary}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Endpoint Detail & Request Sandbox (Right column) */}
        <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getMethodColor(
                  selectedEndpoint.method
                )}`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="font-mono text-sm font-semibold text-white">
                {selectedEndpoint.path}
              </span>
            </div>

            <button
              onClick={handleSimulateRequest}
              disabled={isSimulating}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Sending Request...' : 'Simulate API Call'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-300">
            <span className="text-slate-400">Endpoint Summary:</span>{' '}
            <span className="font-medium text-slate-200">{selectedEndpoint.summary}</span>
          </div>

          {/* Parameters if present */}
          {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">Query / Path Parameters:</h4>
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                {selectedEndpoint.parameters.map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-2.5 text-xs">
                    <span className="font-mono text-indigo-400 font-medium">{p.name}</span>
                    <span className="text-slate-400">({p.in} - {p.type})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Payload if POST/PUT */}
          {selectedEndpoint.requestBody && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">Request Body Payload:</h4>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto">
                {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Payload */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400">
                {lastResponse ? 'Live Simulated Response:' : 'Expected Response Schema:'}
              </h4>
              <button
                onClick={copySampleResponse}
                className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            {lastResponse && (
              <div className="flex items-center gap-3 text-xs mb-2">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Status 200 OK
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-mono tabular-nums text-slate-400">
                  Latency: {lastResponse.timeMs}ms
                </span>
              </div>
            )}

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-72">
              {JSON.stringify(
                lastResponse ? lastResponse.data : selectedEndpoint.responseSample,
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
