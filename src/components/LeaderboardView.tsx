import React, { useState } from 'react';
import { Trophy, Award, TrendingUp, Users, Filter, Bot, User } from 'lucide-react';

export interface Participant {
  id: string;
  name: string;
  cash: number;
  shares: number;
  isUser?: boolean;
}

interface LeaderboardViewProps {
  participants: Participant[];
  currentPrice: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ participants, currentPrice }) => {
  const [showBots, setShowBots] = useState<boolean>(false);

  // Filter participants based on showBots toggle
  const filteredParticipants = participants.filter(p => showBots || p.isUser);

  // Calculate net worth and sort descending
  const ranked = filteredParticipants
    .map(p => {
      const netWorth = p.cash + (p.shares * currentPrice);
      const initialCapital = 20000;
      const pnlDollar = netWorth - initialCapital;
      const pnlPct = (pnlDollar / initialCapital) * 100;
      return { ...p, netWorth, pnlDollar, pnlPct };
    })
    .sort((a, b) => b.netWorth - a.netWorth);

  const top10 = ranked.slice(0, 10);
  const maxNetWorth = Math.max(...top10.map(p => p.netWorth), 25000);

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 font-mono text-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-slate-200 text-sm">
            {showBots ? 'LEADERBOARD MULTIJUGADOR (Top 30 Competidores & Bots HFT)' : 'RANKING DE USUARIOS (Traders Reales)'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBots(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              showBots
                ? 'bg-purple-950/60 border-purple-700/60 text-purple-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {showBots ? <Bot className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{showBots ? 'Ocultar Bots HFT' : 'Mostrar Bots HFT'}</span>
          </button>
          <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
            <Users className="w-4 h-4" />
            <span>{showBots ? `${participants.length} Activos` : `${participants.filter(p => p.isUser).length} Usuario(s)`}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Participante / Perfil</th>
              <th className="py-2 px-3 text-right">K Disponible</th>
              <th className="py-2 px-3 text-right">Posiciones</th>
              <th className="py-2 px-3 text-right">Patrimonio ($)</th>
              <th className="py-2 px-3 text-right">PnL (%)</th>
            </tr>
          </thead>
          <tbody>
            {top10.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500">
                  No hay usuarios para mostrar con los filtros actuales. Activa "Mostrar Bots HFT" si deseas ver los competidores automáticos.
                </td>
              </tr>
            ) : (
              top10.map((p, idx) => {
                const isLeader = idx === 0;
                const isProfitable = p.pnlDollar >= 0;
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-800/60 transition ${
                      p.isUser ? 'bg-cyan-950/40 border-cyan-700/50' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                      {idx === 0 && <Award className="w-4 h-4 text-amber-400" />}
                      {idx === 1 && <Award className="w-4 h-4 text-slate-300" />}
                      {idx === 2 && <Award className="w-4 h-4 text-amber-700" />}
                      <span className={isLeader ? 'text-amber-400 font-extrabold' : 'text-slate-400'}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200 flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isUser ? (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] border border-cyan-500/40">
                          TÚ (HUMANO)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] border border-purple-500/40">
                          BOT HFT
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-mono">
                      ${p.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-mono">
                      {p.shares} u.
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white font-mono">
                      ${p.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold font-mono ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfitable ? '+' : ''}{p.pnlPct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Capital Comparison Bar Chart (Neon CSS Bars) */}
      {top10.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Comparativa Gráfica de Capital (Patrimonio Neto)</span>
          </span>
          <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            {top10.map((p, idx) => {
              const widthPct = Math.max(8, Math.min(100, (p.netWorth / maxNetWorth) * 100));
              return (
                <div key={p.id} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className={`font-semibold ${p.isUser ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
                      #{idx + 1} {p.name} {p.isUser ? '(Tú)' : '(Bot)'}
                    </span>
                    <span className="text-white font-mono font-bold">
                      ${p.netWorth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        p.isUser
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-400'
                          : idx === 0
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
