import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { CandlestickChart } from './components/CandlestickChart';
import { DepthChart } from './components/DepthChart';
import { OrderBookTable } from './components/OrderBookTable';
import { OrderForm } from './components/OrderForm';
import { MonteCarloView } from './components/MonteCarloView';
import { TheoryGuide } from './components/TheoryGuide';
import { LeaderboardView, Participant } from './components/LeaderboardView';
import {
  generateInitialCandles,
  generateOrderBook,
  processOrderExecution,
  simulateMarketMakerTick
} from './utils/marketEngine';
import { Candle, OrderBookLevel, Trade } from './types/market';

// Initial 30 participants for multiplayer competition
const INITIAL_PARTICIPANTS: Participant[] = [
  { id: 'usr-1', name: 'AlphaQuant_Pro', cash: 20500, shares: 120 },
  { id: 'usr-2', name: 'Citadel_MM', cash: 19800, shares: 250 },
  { id: 'usr-3', name: 'Jane_Street_Alg', cash: 21200, shares: 80 },
  { id: 'usr-4', name: 'Sigma_Capital', cash: 19500, shares: 300 },
  { id: 'usr-5', name: 'Quant_Vortex', cash: 20100, shares: 150 },
  { id: 'usr-6', name: 'Apex_Trader', cash: 18900, shares: 400 },
  { id: 'usr-7', name: 'Deep_Value_Fund', cash: 22000, shares: 50 },
  { id: 'usr-8', name: 'Stochastic_Flow', cash: 20000, shares: 200 },
  { id: 'usr-9', name: 'Arbitrage_Hawk', cash: 20350, shares: 100 },
  { id: 'usr-10', name: 'BlackRock_AI', cash: 19200, shares: 350 },
  { id: 'usr-11', name: 'Turtles_Trading', cash: 20000, shares: 180 },
  { id: 'usr-12', name: 'HighFreq_Ghost', cash: 20800, shares: 90 },
  { id: 'usr-13', name: 'Macro_Bull', cash: 18500, shares: 450 },
  { id: 'usr-14', name: 'Bear_Stark', cash: 21500, shares: 60 },
  { id: 'usr-15', name: 'Quant_Matrix', cash: 20000, shares: 210 },
  { id: 'usr-16', name: 'Vertex_Capital', cash: 19700, shares: 280 },
  { id: 'usr-17', name: 'Omega_Fund', cash: 20200, shares: 140 },
  { id: 'usr-18', name: 'Delta_Hedge', cash: 20000, shares: 190 },
  { id: 'usr-19', name: 'Gamma_Squeeze', cash: 18800, shares: 380 },
  { id: 'usr-20', name: 'Theta_Decay', cash: 21000, shares: 70 },
  { id: 'usr-21', name: 'Volatility_Arb', cash: 20000, shares: 220 },
  { id: 'usr-22', name: 'Momentum_King', cash: 19100, shares: 320 },
  { id: 'usr-23', name: 'Arbitrage_Bot_1', cash: 20400, shares: 110 },
  { id: 'usr-24', name: 'Trend_Follower', cash: 19900, shares: 230 },
  { id: 'usr-25', name: 'Boll_Bandit', cash: 20600, shares: 130 },
  { id: 'usr-26', name: 'RSI_Master', cash: 19400, shares: 290 },
  { id: 'usr-27', name: 'MACD_Wizard', cash: 20150, shares: 160 },
  { id: 'usr-28', name: 'OrderBook_Sniper', cash: 20050, shares: 175 },
  { id: 'usr-29', name: 'Liquidity_Provider', cash: 20000, shares: 200 },
  { id: 'usr-30', name: 'Quant_Student_X', cash: 20000, shares: 0, isUser: true },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'market' | 'leaderboard' | 'montecarlo' | 'theory'>('market');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMmActive, setIsMmActive] = useState<boolean>(true);

  const [currentPrice, setCurrentPrice] = useState<number>(100.00);
  const [initialPrice] = useState<number>(100.00);
  const [frozenS0, setFrozenS0] = useState<number>(100.00);

  const [candles, setCandles] = useState<Candle[]>(() => generateInitialCandles(100.00));
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookLevel[]; asks: OrderBookLevel[] }>(() =>
    generateOrderBook(100.00)
  );

  // User State ($20,000 default starting capital)
  const [username, setUsername] = useState<string>('Quant_Student_X');
  const [userCash, setUserCash] = useState<number>(20000);
  const [userShares, setUserShares] = useState<number>(0);
  const initialCapital = 20000;

  // Participants registry
  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: 'init-1',
      time: new Date(Date.now() - 6000).toLocaleTimeString(),
      trader: 'MM_Citadel',
      side: 'BUY',
      price: 100.05,
      qty: 150,
      orderType: 'MARKET'
    },
    {
      id: 'init-2',
      time: new Date(Date.now() - 3000).toLocaleTimeString(),
      trader: 'Quant_Flow',
      side: 'SELL',
      price: 99.95,
      qty: 80,
      orderType: 'LIMIT'
    }
  ]);

  // Keep refs for interval execution
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isMmActiveRef = useRef(isMmActive);
  isMmActiveRef.current = isMmActive;

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  const orderBookRef = useRef(orderBook);
  orderBookRef.current = orderBook;

  const candlesRef = useRef(candles);
  candlesRef.current = candles;

  // Toggle Pause handler
  const handleTogglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (next) {
        setFrozenS0(currentPriceRef.current);
      }
      return next;
    });
  };

  const handleToggleMm = () => {
    setIsMmActive((prev) => !prev);
  };

  // Run single Market Maker tick & update bots stochastic cash/shares
  const runSingleMmTick = useCallback(() => {
    if (isPausedRef.current) return;

    const lastCandle = candlesRef.current[candlesRef.current.length - 1];
    const result = simulateMarketMakerTick(
      currentPriceRef.current,
      orderBookRef.current,
      lastCandle
    );

    setCurrentPrice(result.newPrice);
    setOrderBook(result.newBook);
    setTrades((prev) => [result.trade, ...prev.slice(0, 29)]);

    // Slightly fluctuate bot participants for realistic competition leaderboard
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.isUser) {
          return { ...p, cash: userCash, shares: userShares, name: username };
        }
        const drift = (Math.random() - 0.49) * 15;
        const newCash = Math.max(5000, p.cash + drift);
        return { ...p, cash: newCash };
      })
    );
  }, [userCash, userShares, username]);

  // Market Maker & Price Live Ticker interval (1.2s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused && isMmActive) {
        runSingleMmTick();
      }
    }, 1200);
    return () => clearInterval(timer);
  }, [isPaused, isMmActive, runSingleMmTick]);

  // Execute User Order with strict Cash & Position validation
  const handleExecuteOrder = (
    side: 'BUY' | 'SELL',
    orderType: 'MARKET' | 'LIMIT',
    qty: number,
    limitPrice?: number
  ) => {
    const effectivePx = orderType === 'LIMIT' && limitPrice ? limitPrice : (side === 'BUY' ? orderBook.asks[0]?.price || currentPrice : orderBook.bids[0]?.price || currentPrice);
    const notional = effectivePx * qty;

    if (side === 'BUY') {
      if (userCash < notional) return;
      setUserCash((prev) => prev - notional);
      setUserShares((prev) => prev + qty);
    } else {
      if (userShares < qty) return;
      setUserCash((prev) => prev + notional);
      setUserShares((prev) => prev - qty);
    }

    // Process order against order book engine
    const res = processOrderExecution(side, orderType, qty, limitPrice, currentPrice, orderBook, username);
    setCurrentPrice(res.newPrice);
    setOrderBook(res.newBook);

    // Update candles with latest trade
    const lastCandle = candles[candles.length - 1];
    const updatedCandles = [...candles];
    if (lastCandle) {
      updatedCandles[updatedCandles.length - 1] = {
        ...lastCandle,
        close: res.newPrice,
        high: Math.max(lastCandle.high, res.newPrice),
        low: Math.min(lastCandle.low, res.newPrice),
        volume: lastCandle.volume + qty
      };
    }
    setCandles(updatedCandles);

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      trader: username,
      side,
      price: effectivePx,
      qty,
      orderType
    };
    setTrades((prev) => [newTrade, ...prev.slice(0, 29)]);

    setParticipants((prev) =>
      prev.map((p) => (p.isUser ? { ...p, cash: userCash - (side === 'BUY' ? notional : -notional), shares: userShares + (side === 'BUY' ? qty : -qty), name: username } : p))
    );
  };

  const bestBid = orderBook.bids[0]?.price || currentPrice - 0.05;
  const bestAsk = orderBook.asks[0]?.price || currentPrice + 0.05;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-mono select-none">
      {/* Top Header */}
      <Header
        currentPrice={currentPrice}
        initialPrice={initialPrice}
        bestBid={bestBid}
        bestAsk={bestAsk}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onManualTick={runSingleMmTick}
        isMmActive={isMmActive}
        onToggleMm={handleToggleMm}
        activeTab={activeTab as any}
        setActiveTab={setActiveTab as any}
      />

      {/* Navigation Sub-bar */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'market'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            📈 Terminal L2 & Trading
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 Leaderboard (Traders & Bots)
          </button>
          <button
            onClick={() => setActiveTab('montecarlo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'montecarlo'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Simulador Monte Carlo (10,000 Trayectorias)
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'theory'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            📚 Fórmulas y Teoría Cuántica
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>20 Market Makers en Vivo</span>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[98%] w-full mx-auto p-4">
        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left/Center: Charts & Order Book (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xl">
                <CandlestickChart candles={candles} currentPrice={currentPrice} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xl">
                  <DepthChart bids={orderBook.bids} asks={orderBook.asks} currentPrice={currentPrice} />
                </div>
                <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-xl">
                  <OrderBookTable bids={orderBook.bids} asks={orderBook.asks} trades={trades} currentPrice={currentPrice} />
                </div>
              </div>
            </div>

            {/* Right Column: User Order Form & Capital Allocation (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <OrderForm
                currentPrice={currentPrice}
                bestBid={bestBid}
                bestAsk={bestAsk}
                isPaused={isPaused}
                username={username}
                onUpdateUsername={setUsername}
                cash={userCash}
                shares={userShares}
                initialCapital={initialCapital}
                onExecuteOrder={handleExecuteOrder}
              />

              {/* Quick Leaderboard Preview Widget */}
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-slate-200">
                  <span>🏆 Top 3 Competencia</span>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="text-cyan-400 text-[10px] hover:underline"
                  >
                    Ver Todos &rarr;
                  </button>
                </div>
                {participants
                  .map((p) => ({
                    ...p,
                    netWorth: p.cash + (p.shares * currentPrice),
                  }))
                  .sort((a, b) => b.netWorth - a.netWorth)
                  .slice(0, 3)
                  .map((p, idx) => (
                    <div key={p.id} className="flex justify-between items-center text-[11px]">
                      <span className={p.isUser ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                        #{idx + 1} {p.name} {p.isUser ? '(Tú)' : ''}
                      </span>
                      <span className="font-bold text-emerald-400 font-mono">
                        ${(p.cash + (p.shares * currentPrice)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView participants={participants} currentPrice={currentPrice} />
        )}

        {activeTab === 'montecarlo' && (
          <MonteCarloView
            frozenS0={isPaused ? frozenS0 : currentPrice}
            isPaused={isPaused}
            onPauseMarket={handleTogglePause}
          />
        )}

        {activeTab === 'theory' && <TheoryGuide />}
      </main>
    </div>
  );
}
