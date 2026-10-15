import React from 'react';
import { BookOpen, Layers, Cpu, ShieldCheck, Sigma, FunctionSquare as Function } from 'lucide-react';

export const TheoryGuide: React.FC = () => {
  return (
    <div className="flex flex-col gap-5 text-slate-300 font-sans">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-cyan-950/65 via-indigo-950/45 to-slate-900 border border-cyan-800/40 rounded-xl p-5">
        <div className="flex items-center gap-2.5 text-cyan-300 font-mono font-bold text-base mb-1">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>FORMULARIO Y CONCEPTOS CUANTITATIVOS (FINANZAS & MICROESTRUCTURA)</span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Guía rigurosa de fórmulas matemáticas, ecuaciones diferenciales estocásticas y modelos de microestructura 
          utilizados en la plataforma QuantMarket Terminal y el simulador de Monte Carlo.
        </p>
      </div>

      {/* Grid of Formulas & Quantitative Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1: Microestructura & Libro de Órdenes */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>1. Microestructura de Mercado y Spread Bid-Ask</span>
          </div>
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              El libro de órdenes límite centralizado (CLOB) determina el precio de compensación instantáneo mediante la interacción entre compradores (bids) y vendedores (asks).
            </p>
            <div className="p-3 rounded bg-slate-950 font-mono text-emerald-300 border border-slate-800 flex flex-col gap-1.5 text-center">
              <div>Spread = Ask_1 - Bid_1</div>
              <div className="text-[11px] text-slate-400">Mid-Price (Precio Medio): P_mid = (Ask_1 + Bid_1) / 2</div>
            </div>
            <p className="text-[11px] text-slate-400">
              <strong>Impacto de Precio (Slippage):</strong> Cuando una orden de mercado consume múltiples niveles del libro, el precio de ejecución efectivo se desvía en función de la profundidad disponible.
            </p>
          </div>
        </div>

        {/* Section 2: Movimiento Geométrico Browniano (MGB) */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>2. Movimiento Geométrico Browniano & Lema de Itô</span>
          </div>
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              La trayectoria de precios estocástica S_t se modela mediante la SDE:
            </p>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-cyan-300 border border-slate-800 text-center">
              dS_t = mu * S_t * dt + sigma * S_t * dW_t
            </div>
            <p>
              Aplicando el Lema de Itô para resolver el logaritmo del precio:
            </p>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-cyan-300 border border-slate-800 text-center text-[11px]">
              S_t = S_0 * exp( (mu - 0.5 * sigma^2)*t + sigma * W_t )
            </div>
            <p className="text-[11px] text-slate-400">
              Donde mu es la deriva (drift), sigma la volatilidad anualizada y dW_t ~ N(0, dt).
            </p>
          </div>
        </div>

        {/* Section 3: Valoración de Portafolio, PnL & Apalancamiento */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
            <Sigma className="w-4 h-4 text-amber-400" />
            <span>3. PnL y Valoración de Portafolio Multijugador</span>
          </div>
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              El patrimonio neto total (Net Worth) de cada participante se calcula en tiempo real con el precio actual del activo:
            </p>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-amber-300 border border-slate-800 text-center">
              Net Worth = Cash + (Shares * P_t)
            </div>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-amber-300 border border-slate-800 text-center text-[11px]">
              PnL (%) = ((Net Worth - K_0) / K_0) * 100
            </div>
            <p className="text-[11px] text-slate-400">
              Donde K_0 = $20,000.00 USD es el capital inicial asignado a cada trader en la competencia.
            </p>
          </div>
        </div>

        {/* Section 4: Simulación de Monte Carlo, VaR & CVaR */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-sm">
            <Function className="w-4 h-4 text-purple-400" />
            <span>4. Value at Risk (VaR) & Expected Shortfall (CVaR)</span>
          </div>
          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              A partir de N = 10,000 trayectorias simuladas al horizonte temporal T, se extrae la distribución empírica de precios terminales S_T:
            </p>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-purple-300 border border-slate-800 text-center text-[11px]">
              VaR_95% = S_0 - Percentil_5(S_T)
            </div>
            <div className="p-2.5 rounded bg-slate-950 font-mono text-purple-300 border border-slate-800 text-center text-[11px]">
              CVaR_95% = -E[S_T | S_T &lt;= Percentil_5(S_T)]
            </div>
            <p className="text-[11px] text-slate-400">
              El VaR mide la pérdida máxima esperada con un 95% de confianza, mientras que el CVaR promedia las pérdidas en el peor 5% de los escenarios extremos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
