import React, { useState } from 'react';
import { Send, TrendingUp, TrendingDown, Info, AlertTriangle, User, Wallet } from 'lucide-react';

interface OrderFormProps {
  currentPrice: number;
  bestBid: number;
  bestAsk: number;
  isPaused: boolean;
  username: string;
  onUpdateUsername: (name: string) => void;
  cash: number;
  shares: number;
  initialCapital: number;
  onExecuteOrder: (side: 'BUY' | 'SELL', orderType: 'MARKET' | 'LIMIT', qty: number, limitPrice?: number) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  currentPrice,
  bestBid,
  bestAsk,
  isPaused,
  username,
  onUpdateUsername,
  cash,
  shares,
  initialCapital,
  onExecuteOrder
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<number>(100);
  const [limitPrice, setLimitPrice] = useState<number>(currentPrice);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(username);

  const effectiveMarketPrice = side === 'BUY' ? bestAsk : bestBid;
  const executionPrice = orderType === 'LIMIT' ? limitPrice : effectiveMarketPrice;
  const notional = executionPrice * quantity;

  const marketValue = shares * currentPrice;
  const netWorth = cash + marketValue;
  const pnlDollar = netWorth - initialCapital;
  const pnlPct = (pnlDollar / initialCapital) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPaused) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Strict Validation
    if (side === 'BUY') {
      if (cash < notional) {
        setErrorMsg(`❌ Capital insuficiente. Requieres $${notional.toFixed(2)}, tienes $${cash.toFixed(2)} disponibles.`);
        return;
      }
    } else {
      // SELL validation
      if (shares < quantity) {
        setErrorMsg(`❌ No posees suficientes posiciones. Tienes ${shares} u., intentas vender ${quantity} u.`);
        return;
      }
    }

    onExecuteOrder(side, orderType, quantity, orderType === 'LIMIT' ? limitPrice : undefined);
    setSuccessMsg(`Orden ${side === 'BUY' ? 'COMPRA' : 'VENTA'} ${orderType} de ${quantity} u. ejecutada exitosamente a $${executionPrice.toFixed(2)}`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex flex-col gap-3.5 font-mono shadow-xl">
      {/* User & Capital Allocation Header */}
      <div className="flex flex-col gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <User className="w-4 h-4 text-cyan-400" />
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-white w-28 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tempName.trim()) {
                      onUpdateUsername(tempName.trim());
                      setIsEditingName(false);
                    }
                  }}
                  className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[10px]"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsEditingName(true)}>
                <span className="font-bold text-white">{username}</span>
                <span className="text-[10px] text-cyan-400 underline">(Editar)</span>
              </div>
            )}
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] border border-emerald-500/30 font-semibold">
            Competencia 30 Usuarios
          </span>
        </div>

        {/* Capital Allocation Box ($20,000 default) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[11px]">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Wallet className="w-3 h-3 text-cyan-400" /> K Disponible (Efectivo)
            </span>
            <span className="font-bold text-cyan-300 font-mono text-sm">
              ${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500">Posiciones (Acciones)</span>
            <span className="font-bold text-amber-400 font-mono text-sm">
              {shares} u. <span className="text-[10px] text-slate-400">($ {marketValue.toFixed(2)})</span>
            </span>
          </div>

          <div className="flex flex-col pt-1 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500">Patrimonio Total (Net Worth)</span>
            <span className="font-bold text-white font-mono">
              ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex flex-col pt-1 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-500">PnL Global</span>
            <span className={`font-bold font-mono ${pnlDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pnlDollar >= 0 ? '+' : ''}{pnlPct.toFixed(2)}% (${pnlDollar.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {isPaused && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>El mercado está pausado. Reanuda arriba para operar en vivo.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2 rounded bg-rose-950/80 border border-rose-700 text-rose-200 text-[11px] font-semibold animate-shake">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-2 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-[11px] font-semibold animate-fadeIn">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
        {/* Buy / Sell Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-2 px-3 rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition ${
              side === 'BUY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>COMPRAR</span>
            </div>
            <span className="text-[10px] opacity-90 font-normal">
              Ask: ${bestAsk.toFixed(2)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-2 px-3 rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition ${
              side === 'SELL'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40 ring-1 ring-rose-400'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>VENDER</span>
            </div>
            <span className="text-[10px] opacity-90 font-normal">
              Bid: ${bestBid.toFixed(2)}
            </span>
          </button>
        </div>

        {/* Order Type Selector */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setOrderType('MARKET')}
            className={`py-1.5 px-2 rounded-md font-semibold transition text-center ${
              orderType === 'MARKET'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-300'
            }`}
          >
            MERCADO (Inmediata)
          </button>
          <button
            type="button"
            onClick={() => {
              setOrderType('LIMIT');
              setLimitPrice(side === 'BUY' ? bestBid : bestAsk);
            }}
            className={`py-1.5 px-2 rounded-md font-semibold transition text-center ${
              orderType === 'LIMIT'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-300'
            }`}
          >
            LÍMITE (Al Libro)
          </button>
        </div>

        {/* Price & Notional Calculation */}
        <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[11px] flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Precio Ejecución Est.:</span>
            <span className={`font-bold font-mono ${side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${executionPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-900 pt-1">
            <span className="text-slate-400">Costo Total Notional:</span>
            <span className="font-bold text-white font-mono">${notional.toFixed(2)}</span>
          </div>
        </div>

        {/* Quantity Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-400 flex justify-between">
            <span>Cantidad de Acciones</span>
            <span className="text-cyan-400">Max Cap: ${(cash / executionPrice).toFixed(0)} u.</span>
          </label>
          <input
            type="number"
            min="1"
            max="10000"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Limit Price Input if LIMIT */}
        {orderType === 'LIMIT' && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-slate-400">Precio Límite ($)</label>
            <input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(parseFloat(e.target.value) || currentPrice)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPaused}
          className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition ${
            isPaused
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{side === 'BUY' ? 'COMPRAR' : 'VENDER'} {quantity} U.</span>
        </button>
      </form>
    </div>
  );
};
