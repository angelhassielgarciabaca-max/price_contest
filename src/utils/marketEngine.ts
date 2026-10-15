import { Candle, OrderBookLevel, Trade } from '../types/market';

export const MM_BOTS = [
  'MM_Citadel_Securities',
  'Jane_Street_Capital',
  'Virtu_Financial_MM',
  'Optiver_Derivatives',
  'Two_Sigma_Securities',
  'Jump_Trading_HFT',
  'Tower_Research_Capital',
  'Hudson_River_Trading',
  'Flow_Traders_Algo',
  'Renaissance_Tech_Quant',
  'DRW_Holdings_MM',
  'Susquehanna_SIG',
  'XTX_Markets_HFT',
  'IMC_Financial_MM',
  'Wolverine_Trading',
  'Akuna_Capital_Bot',
  'Wintermute_Liquidity',
  'GSA_Capital_Algo',
  'Point72_Quant_Bot',
  'Millennium_Algo_Flow'
];

/**
 * Generates an initial realistic candle history (30 candles)
 */
export function generateInitialCandles(startPrice = 100.0): Candle[] {
  const candles: Candle[] = [];
  let price = startPrice;
  const now = Date.now();

  for (let i = 29; i >= 0; i--) {
    const timestamp = now - i * 3000;
    const timeStr = new Date(timestamp).toLocaleTimeString();
    const open = price;
    const delta = (Math.random() - 0.49) * 0.35;
    const close = Math.round((open + delta) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * 0.2) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * 0.2) * 100) / 100;
    const volume = Math.floor(100 + Math.random() * 400);

    candles.push({
      time: timeStr,
      timestamp,
      open,
      high,
      low,
      close,
      volume
    });
    price = close;
  }
  return candles;
}

/**
 * Generates Level 2 Order Book with automatic Market Makers and Institutional Liquidity Blocks
 */
export function generateOrderBook(
  midPrice: number,
  customBidBlockIdx?: number,
  customAskBlockIdx?: number
): { bids: OrderBookLevel[]; asks: OrderBookLevel[] } {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  // Randomize block placement (levels 2 to 5) to simulate rotating institutional walls
  const specialBidIdx = customBidBlockIdx ?? Math.floor(2 + Math.random() * 4);
  const specialAskIdx = customAskBlockIdx ?? Math.floor(2 + Math.random() * 4);

  let cumBidVol = 0;
  let cumAskVol = 0;

  for (let i = 1; i <= 10; i++) {
    // Bids: descending from mid - 0.05
    const bidPrice = Math.round((midPrice - i * 0.05) * 100) / 100;
    // Asks: ascending from mid + 0.05
    const askPrice = Math.round((midPrice + i * 0.05) * 100) / 100;

    let bidVol = Math.floor(80 + Math.random() * 160);
    let askVol = Math.floor(80 + Math.random() * 160);

    const isBidBlock = i === specialBidIdx;
    const isAskBlock = i === specialAskIdx;

    if (isBidBlock) {
      bidVol = Math.floor(850 + Math.random() * 700); // Muro institucional
    }
    if (isAskBlock) {
      askVol = Math.floor(900 + Math.random() * 700); // Muro institucional
    }

    cumBidVol += bidVol;
    cumAskVol += askVol;

    bids.push({
      price: bidPrice,
      volume: bidVol,
      total: cumBidVol,
      isBlock: isBidBlock
    });

    asks.push({
      price: askPrice,
      volume: askVol,
      total: cumAskVol,
      isBlock: isAskBlock
    });
  }

  // Ensure strict order: bids descending, asks ascending
  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);

  return { bids, asks };
}

/**
 * Simulates active Market Maker & High-Frequency Algo order generation
 * This continuously creates orders, injects liquidity, consumes spreads, and reports trades
 */
export function simulateMarketMakerTick(
  currentPrice: number,
  currentBook: { bids: OrderBookLevel[]; asks: OrderBookLevel[] },
  lastCandle?: Candle
): {
  newPrice: number;
  newBook: { bids: OrderBookLevel[]; asks: OrderBookLevel[] };
  trade: Trade;
  updatedCandle: Candle;
} {
  const botName = MM_BOTS[Math.floor(Math.random() * MM_BOTS.length)];
  const isBuy = Math.random() > 0.49;
  const side: 'BUY' | 'SELL' = isBuy ? 'BUY' : 'SELL';
  const isMarketOrder = Math.random() > 0.30; // 70% market orders, 30% limit updates
  const qty = Math.floor(30 + Math.random() * 220);
  const now = new Date();
  const timeStr = now.toLocaleTimeString();

  // Make sure asks and bids are sorted
  const sortedBids = [...currentBook.bids].sort((a, b) => b.price - a.price);
  const sortedAsks = [...currentBook.asks].sort((a, b) => a.price - b.price);

  let nextPrice = currentPrice;
  let newBook = { bids: sortedBids, asks: sortedAsks };

  if (isMarketOrder) {
    // Taker Order by institutional algo
    // BUY hits best ask; SELL hits best bid
    const bestBid = sortedBids[0]?.price ?? (currentPrice - 0.05);
    const bestAsk = sortedAsks[0]?.price ?? (currentPrice + 0.05);
    const executionPrice = side === 'BUY' ? bestAsk : bestBid;

    // Micro price drift after execution
    const shock = side === 'BUY'
      ? Math.round((Math.random() * 0.08) * 100) / 100
      : -Math.round((Math.random() * 0.08) * 100) / 100;
    nextPrice = Math.max(10, Math.round((currentPrice + shock) * 100) / 100);

    // Refresh book around new price
    newBook = generateOrderBook(nextPrice);

    const trade: Trade = {
      id: `mm-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      time: timeStr,
      trader: botName,
      side,
      price: executionPrice,
      qty,
      orderType: 'MARKET'
    };

    const candleBase = lastCandle || {
      time: timeStr,
      timestamp: Date.now(),
      open: currentPrice,
      close: nextPrice,
      high: Math.max(currentPrice, nextPrice),
      low: Math.min(currentPrice, nextPrice),
      volume: qty
    };

    const updatedCandle: Candle = {
      ...candleBase,
      close: nextPrice,
      high: Math.round(Math.max(candleBase.high, nextPrice) * 100) / 100,
      low: Math.round(Math.min(candleBase.low, nextPrice) * 100) / 100,
      volume: candleBase.volume + qty
    };

    return { newPrice: nextPrice, newBook, trade, updatedCandle };
  } else {
    // Passive Market Maker Limit Order: quotes in the book
    const offset = Math.floor(1 + Math.random() * 3) * 0.05;
    const targetPx = Math.round((side === 'BUY' ? currentPrice - offset : currentPrice + offset) * 100) / 100;
    const isLargeBlock = qty >= 160;

    const trade: Trade = {
      id: `mm-lmt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      time: timeStr,
      trader: botName,
      side,
      price: targetPx,
      qty,
      orderType: 'LIMIT'
    };

    // Update level in book
    const bids = [...sortedBids];
    const asks = [...sortedAsks];

    if (side === 'BUY') {
      const existing = bids.find(b => Math.abs(b.price - targetPx) < 0.02);
      if (existing) {
        existing.volume += qty;
        if (isLargeBlock) existing.isBlock = true;
      }
    } else {
      const existing = asks.find(a => Math.abs(a.price - targetPx) < 0.02);
      if (existing) {
        existing.volume += qty;
        if (isLargeBlock) existing.isBlock = true;
      }
    }

    const candleBase = lastCandle || {
      time: timeStr,
      timestamp: Date.now(),
      open: currentPrice,
      close: currentPrice,
      high: currentPrice,
      low: currentPrice,
      volume: 0
    };

    return {
      newPrice: currentPrice,
      newBook: { bids, asks },
      trade,
      updatedCandle: candleBase
    };
  }
}

/**
 * Simulates a trade execution against the Order Book
 * CRITICAL RULE:
 * - Market BUY executes immediately against the lowest Asks (Best Ask upwards).
 * - Market SELL executes immediately against the highest Bids (Best Bid downwards).
 */
export function processOrderExecution(
  side: 'BUY' | 'SELL',
  orderType: 'MARKET' | 'LIMIT',
  qty: number,
  limitPrice: number | undefined,
  currentPrice: number,
  orderBook: { bids: OrderBookLevel[]; asks: OrderBookLevel[] },
  traderName: string = 'Mi Orden'
): {
  newPrice: number;
  newBook: { bids: OrderBookLevel[]; asks: OrderBookLevel[] };
  trade: Trade;
  message: string;
} {
  const now = new Date();
  const timeStr = now.toLocaleTimeString();
  const tradeId = Math.random().toString(36).substring(2, 9);

  // Guarantee strict sorting
  // Asks: ascending (lowest ask first = Best Ask)
  const asks = [...orderBook.asks].sort((a, b) => a.price - b.price);
  // Bids: descending (highest bid first = Best Bid)
  const bids = [...orderBook.bids].sort((a, b) => b.price - a.price);

  if (orderType === 'MARKET') {
    if (side === 'BUY') {
      // Market BUY: Consumes from lowest Ask upwards!
      let remaining = qty;
      let totalSpent = 0;
      let sharesFilled = 0;
      let lastLevelPrice = asks[0]?.price ?? currentPrice;

      for (let i = 0; i < asks.length && remaining > 0; i++) {
        const take = Math.min(remaining, asks[i].volume);
        totalSpent += take * asks[i].price;
        sharesFilled += take;
        remaining -= take;
        lastLevelPrice = asks[i].price;
        asks[i].volume -= take;
      }

      // If quantity exceeded all displayed asks, execute remaining at last price
      if (remaining > 0) {
        totalSpent += remaining * lastLevelPrice;
        sharesFilled += remaining;
      }

      // Exact Volume-Weighted Average Price
      const vwap = Math.round((totalSpent / Math.max(1, sharesFilled)) * 100) / 100;
      const newSpotPrice = lastLevelPrice;

      const trade: Trade = {
        id: tradeId,
        time: timeStr,
        trader: traderName,
        side: 'BUY',
        price: vwap,
        qty,
        orderType: 'MARKET'
      };

      return {
        newPrice: newSpotPrice,
        newBook: generateOrderBook(newSpotPrice),
        trade,
        message: `Orden de Compra a Mercado ejecutada: ${qty} u. al Mejor Ask ($${vwap.toFixed(2)})`
      };
    } else {
      // Market SELL: Consumes from highest Bid downwards!
      let remaining = qty;
      let totalReceived = 0;
      let sharesFilled = 0;
      let lastLevelPrice = bids[0]?.price ?? currentPrice;

      for (let i = 0; i < bids.length && remaining > 0; i++) {
        const take = Math.min(remaining, bids[i].volume);
        totalReceived += take * bids[i].price;
        sharesFilled += take;
        remaining -= take;
        lastLevelPrice = bids[i].price;
        bids[i].volume -= take;
      }

      // If quantity exceeded all displayed bids, execute remaining at last price
      if (remaining > 0) {
        totalReceived += remaining * lastLevelPrice;
        sharesFilled += remaining;
      }

      // Exact Volume-Weighted Average Price
      const vwap = Math.round((totalReceived / Math.max(1, sharesFilled)) * 100) / 100;
      const newSpotPrice = lastLevelPrice;

      const trade: Trade = {
        id: tradeId,
        time: timeStr,
        trader: traderName,
        side: 'SELL',
        price: vwap,
        qty,
        orderType: 'MARKET'
      };

      return {
        newPrice: newSpotPrice,
        newBook: generateOrderBook(newSpotPrice),
        trade,
        message: `Orden de Venta a Mercado ejecutada: ${qty} u. al Mejor Bid ($${vwap.toFixed(2)})`
      };
    }
  } else {
    // LIMIT ORDER
    const targetPx = limitPrice ?? currentPrice;
    const isBlock = qty >= 400;

    if (side === 'BUY') {
      const bestAsk = asks[0]?.price ?? Infinity;
      if (targetPx >= bestAsk) {
        // Crosses spread => executes immediately as Market
        return processOrderExecution('BUY', 'MARKET', qty, undefined, currentPrice, { bids, asks }, traderName);
      }
      const existing = bids.find(b => Math.abs(b.price - targetPx) < 0.025);
      if (existing) {
        existing.volume += qty;
        if (isBlock) existing.isBlock = true;
      } else {
        bids.push({ price: targetPx, volume: qty, isBlock });
        bids.sort((a, b) => b.price - a.price);
      }
    } else {
      const bestBid = bids[0]?.price ?? 0;
      if (targetPx <= bestBid) {
        // Crosses spread => executes immediately as Market
        return processOrderExecution('SELL', 'MARKET', qty, undefined, currentPrice, { bids, asks }, traderName);
      }
      const existing = asks.find(a => Math.abs(a.price - targetPx) < 0.025);
      if (existing) {
        existing.volume += qty;
        if (isBlock) existing.isBlock = true;
      } else {
        asks.push({ price: targetPx, volume: qty, isBlock });
        asks.sort((a, b) => a.price - b.price);
      }
    }

    const trade: Trade = {
      id: tradeId,
      time: timeStr,
      trader: traderName,
      side,
      price: targetPx,
      qty,
      orderType: 'LIMIT'
    };

    return {
      newPrice: currentPrice,
      newBook: { bids, asks },
      trade,
      message: `Orden Límite registrada en el libro: ${qty} u. a $${targetPx.toFixed(2)} ${isBlock ? '(Bloque Institucional Detectado)' : ''}`
    };
  }
}
