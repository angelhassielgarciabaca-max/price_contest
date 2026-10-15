import React from 'react';
import { Play, Pause, RefreshCw, Activity, ShieldAlert, Bot, Zap } from 'lucide-react';

interface HeaderProps {
  currentPrice: number;
  initialPrice: number;
  bestBid: number;
  bestAsk: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onManualTick: () => void;
  isMmActive?: boolean;
  onToggleMm?: () => void;
  onForceMmBurst?: () => void;
  activeTab: 'market' | 'montecarlo' | 'theory' | 'streamlit';
  setActiveTab: (tab: 'market' | 'montecarlo' | 'theory' | 'streamlit') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPrice,
  initialPrice,
  bestBid,
  bestAsk,
  isPaused,
  onTogglePause,
  onManualTick,
  isMmActive = true,
  onToggleMm,
  onForceMmBurst,
  activeTab,
  setActiveTab
}) => {
  const changePct = ((currentPrice - initialPrice) / initialPrice) * 100;
  const spread = Math.max(0.01, bestAsk - bestBid);
  const isPositive = changePct >= 0;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      {/* Top Ticker Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand & Market Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-black text-sm tracking-tight text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              QUANTMARKET
            </span>
            <span className="text-slate-500 font-normal">TERMINAL</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold">
              QNTM/USD
            </span>
            <span className="text-slate-400">NASDAQ-L2 SIM</span>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="flex items-center gap-4 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">Spot Price</span>
            <span className={`text-base font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${currentPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">24h Change</span>
            <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '+' : ''}{changePct.toFixed(2)}%
            </span>
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">Bid / Ask</span>
            <span className="text-slate-300">
              <span className="text-emerald-400">${bestBid.toFixed(2)}</span>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-rose-400">${bestAsk.toFixed(2)}</span>
            </span>
          </div>

          <div className="hidden lg:flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">Spread</span>
            <span className="text-amber-400 font-semibold">${spread.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Controls: Pause, MM Auto, MM Burst & Manual Tick */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition text-xs shadow-sm ${
              isPaused
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
            }`}
            title={isPaused ? 'Reanudar flujo continuo de mercado' : 'Pausar y fijar S₀'}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Reanudar</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar S₀</span>
              </>
            )}
          </button>

          {/* Market Maker Toggle */}
          {onToggleMm && (
            <button
              onClick={onToggleMm}
              disabled={isPaused}
              className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition border ${
                isMmActive && !isPaused
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              } disabled:opacity-40`}
              title="Activar o desactivar órdenes automáticas de Market Makers"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>MM: {isMmActive && !isPaused ? 'ACTIVO' : 'PAUSA'}</span>
            </button>
          )}

          {/* Market Maker Burst Trigger */}
          {onForceMmBurst && (
            <button
              onClick={onForceMmBurst}
              disabled={isPaused}
              className="px-2 py-1.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 text-xs font-mono flex items-center gap-1 disabled:opacity-40 transition"
              title="Generar ráfaga inmediata de 3 órdenes de Market Makers"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ráfaga MM</span>
            </button>
          )}

          <button
            onClick={onManualTick}
            disabled={isPaused}
            className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition"
            title="Generar tick manual de mercado"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {isPaused ? (
            <div className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/80">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>S₀ FIJADO</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span>EN VIVO</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 flex gap-1 border-t border-slate-900 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'market'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📊 Módulo 1 & 2: Mercado & Bloques de Liquidez</span>
        </button>

        <button
          onClick={() => setActiveTab('montecarlo')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'montecarlo'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🎲 Módulo 3: Monte Carlo (10,000 Trayectorias)</span>
          {isPaused && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'theory'
              ? 'border-purple-500 text-purple-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🎓 Exposición Académica & Fórmulas</span>
        </button>

        <button
          onClick={() => setActiveTab('streamlit')}
          className={`px-4 py-2 text-xs font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'streamlit'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🐍 Código Streamlit (app.py)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60">
            Descargar
          </span>
        </button>
      </div>
    </header>
  );
};
