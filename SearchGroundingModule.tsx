import React, { useState } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Sparkles,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Scale,
  Truck,
  Building,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

interface GroundingResponse {
  success: boolean;
  model: string;
  text: string;
  groundingChunks: GroundingChunk[];
  searchQueries: string[];
  timestamp: string;
}

const PRESET_TOPICS = [
  {
    id: 'rbi-fpc',
    title: 'RBI Recovery Fair Practices Code (2025/2026)',
    icon: Scale,
    query: 'RBI Fair Practices Code latest guidelines for loan recovery agents repossession rules calling timings and non-harassment regulations India',
    desc: 'Authorized calling windows (8 AM to 7 PM), strict prohibition of verbal abuse or physical coercion, and agency liability.',
  },
  {
    id: 'sarfaesi-rules',
    title: 'SARFAESI Act Vehicle Repossession & Police Rules',
    icon: ShieldCheck,
    query: 'SARFAESI Act Section 13(4) procedure for hypothecated commercial vehicle repossession by NBFC and police intimation letter format India',
    desc: 'Notice requirements, inventory list protocol, and post-possession intimation to local police station.',
  },
  {
    id: 'vahan-gujarat',
    title: 'Gujarat RTO & Vahan Vehicle Verification',
    icon: Truck,
    query: 'Parivahan Gujarat RTO Dahod GJ-20 hypothecation termination and vehicle registration verification rules',
    desc: 'Checking Form 34/35 hypothecation endorsement, fitness certificate validity, and road tax arrears.',
  },
  {
    id: 'market-valuation',
    title: 'Commercial Vehicle Gujarat Resale Valuations',
    icon: Building,
    query: 'Gujarat commercial vehicle resale market prices Tata Ace Mahindra Bolero Pickup Ashok Leyland Dost repo auction valuations 2025 2026',
    desc: 'Current yard auction benchmark rates and salvage values for commercial vehicles in western India.',
  },
];

export const SearchGroundingModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GroundingResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleExecuteSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSearchQuery(queryToSearch);

    try {
      const response = await fetch('/api/search/grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSearch }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve search grounded data');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Grounding search error:', err);
      setErrorMessage(err.message || 'Network request failed or search error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Helper to extract clean domain name from URL
  const getDomainFromUrl = (url?: string) => {
    if (!url) return 'Web Source';
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'Web Source';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded border border-blue-500/40 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                Google Search Grounding
              </span>
              <span className="text-xs font-mono text-slate-400">
                Model: <strong className="text-slate-200">gemini-3.5-flash</strong> (with googleSearch tool)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Recovery &amp; Legal Intelligence Search</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                Live Web Verified
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time regulatory and legal intelligence grounded with Google Search data. Query up-to-date RBI circulars, SARFAESI repossession case laws, Gujarat RTO standards, and commercial vehicle auction prices.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'Can a recovery agent seize a commercial vehicle without police memo in Gujarat?')"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching Web...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Grounded Search</span>
              </>
            )}
          </button>
        </form>

        {/* Preset Topic Cards */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            Quick Intelligence Topics:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_TOPICS.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleExecuteSearch(topic.query)}
                  disabled={isLoading}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                      {topic.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-100">Search Grounding Failed</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Search Grounding Results Panel */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Answer Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Grounded Intelligence Briefing</h2>
              </div>
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                title="Copy Briefing Text"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Answer Content */}
            <div className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-3">
              {result.text}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Grounded via Google Search • {result.groundingChunks.length} web sources cited</span>
              <span>Generated at {new Date(result.timestamp).toLocaleTimeString('en-IN')}</span>
            </div>
          </div>

          {/* Sources and Query Metadata Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Google Search Queries Executed */}
            {result.searchQueries && result.searchQueries.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Search className="w-4 h-4 text-blue-400" />
                  <span>Google Search Queries</span>
                </div>
                <div className="space-y-1.5">
                  {result.searchQueries.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 font-mono flex items-start gap-2"
                    >
                      <span className="text-blue-400 font-bold shrink-0">#{idx + 1}</span>
                      <span className="break-all">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grounding Sources / Citations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Verified Web Sources</span>
                </div>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-mono">
                  {result.groundingChunks.length} Citations
                </span>
              </div>

              {result.groundingChunks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No direct URL citations returned for this query.</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {result.groundingChunks.map((chunk, idx) => {
                    const web = chunk.web;
                    if (!web) return null;
                    return (
                      <a
                        key={idx}
                        href={web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all flex flex-col gap-1 group block"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-blue-400 font-bold truncate">
                            {getDomainFromUrl(web.uri)}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0" />
                        </div>
                        <span className="text-xs font-medium text-slate-200 group-hover:text-white line-clamp-2">
                          {web.title || web.uri}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
