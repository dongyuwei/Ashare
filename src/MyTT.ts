/**
 * MyTT Technical Indicators Library
 * TypeScript implementation of MyTT (麦语言-通达信-同花顺指标)
 * https://github.com/mpquant/MyTT
 * 
 * V2.1 2021-6-6 Added BARSLAST function
 * V2.2 2021-6-8 Added SLOPE, FORCAST linear regression functions
 * V2.3 2025-8-2 Improved SMA function, speed improved 15x
 */

import {
  RD, RET, ABS, MAX, MIN, MA, REF, DIFF, STD, IF, SUM,
  HHV, LLV, EMA, SMA, AVEDEV
} from './utils';

export { RD, RET, ABS, MAX, MIN, MA, REF, DIFF, STD, IF, SUM, HHV, LLV, EMA, SMA, AVEDEV };

// ================== Level 1: Application Layer Functions ==================

/**
 * Count number of True values over N periods
 * COUNT(CLOSE>O, N): Count days satisfying condition in last N days
 * @param sBool - Boolean array
 * @param n - Period
 * @returns Count array
 */
export function COUNT(sBool: boolean[], n: number): number[] {
  return SUM(sBool.map(b => b ? 1 : 0), n);
}

/**
 * Check if condition is true for all N periods
 * EVERY(CLOSE>O, 5): Check if condition is true for all last 5 days
 * @param sBool - Boolean array
 * @param n - Period
 * @returns Boolean array
 */
export function EVERY(sBool: boolean[], n: number): boolean[] {
  const r = SUM(sBool.map(b => b ? 1 : 0), n);
  return r.map(val => val === n);
}

/**
 * Check if condition was true from A days ago to B days ago
 * @param sBool - Boolean array
 * @param a - Start period (A > B)
 * @param b - End period
 * @returns Boolean
 */
export function LAST(sBool: boolean[], a: number, b: number): boolean {
  if (a < b) a = b;
  const slice = sBool.slice(-a, -b || undefined);
  return slice.reduce((sum, val) => sum + (val ? 1 : 0), 0) === (a - b);
}

/**
 * Check if condition exists in last N periods
 * EXIST(CLOSE>3010, N=5): Check if close > 3010 exists in last 5 days
 * @param sBool - Boolean array
 * @param n - Period (default: 5)
 * @returns Boolean array
 */
export function EXIST(sBool: boolean[], n: number = 5): boolean[] {
  const r = SUM(sBool.map(b => b ? 1 : 0), n);
  return r.map(val => val > 0);
}

/**
 * Calculate bars since last condition was true
 * BARSLAST(CLOSE/REF(CLOSE)>=1.1): Days since last limit up
 * @param sBool - Boolean array
 * @returns Number of bars since last true condition
 */
export function BARSLAST(sBool: boolean[]): number {
  const indices: number[] = [];
  sBool.forEach((val, idx) => {
    if (val) indices.push(idx);
  });
  if (indices.length === 0) return -1;
  return sBool.length - indices[indices.length - 1] - 1;
}

/**
 * Calculate linear regression slope and line
 * @param s - Array of numbers
 * @param n - Period
 * @param rs - Return line if true
 * @returns Slope and optionally the regression line
 */
export function SLOPE(s: number[], n: number, rs: boolean = false): { slope: number; line?: number[] } {
  const m = s.slice(-n);
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < m.length; i++) {
    x.push(i);
    y.push(m[i]);
  }
  
  // Simple linear regression
  const xMean = x.reduce((a, b) => a + b, 0) / x.length;
  const yMean = y.reduce((a, b) => a + b, 0) / y.length;
  
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < x.length; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }
  
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  
  if (rs) {
    const line = x.map(xi => slope * xi + intercept);
    return { slope: line[line.length - 1] - line[0], line };
  }
  
  return { slope };
}

/**
 * Forecast next value using linear regression
 * @param s - Array of numbers
 * @param n - Period
 * @returns Forecasted value
 */
export function FORCAST(s: number[], n: number): number {
  const { slope, line } = SLOPE(s, n, true);
  if (!line) return NaN;
  return line[line.length - 1] + slope;
}

/**
 * Detect crossover between two series
 * CROSS(MA(C,5),MA(C,10)): Detect when MA5 crosses above MA10
 * @param s1 - First series
 * @param s2 - Second series
 * @returns Boolean array indicating crossover
 */
export function CROSS(s1: number[], s2: number[]): boolean[] {
  const crossBool = IF(s1.map((val, i) => val > s2[i]), 1, 0);
  const count2 = SUM(crossBool, 2);
  return count2.map(val => val === 1);
}

// ================== Level 2: Technical Indicator Functions ==================

/**
 * MACD indicator
 * @param close - Close prices
 * @param short - Short period (default: 12)
 * @param long - Long period (default: 26)
 * @param m - Signal period (default: 9)
 * @returns DIF, DEA, MACD arrays
 */
export function MACD(
  close: number[],
  short: number = 12,
  long: number = 26,
  m: number = 9
): { dif: number[]; dea: number[]; macd: number[] } {
  const emaShort = EMA(close, short);
  const emaLong = EMA(close, long);
  const dif = emaShort.map((val, i) => val - emaLong[i]);
  const dea = EMA(dif, m);
  const macd = dif.map((val, i) => (val - dea[i]) * 2);
  
  return {
    dif: RD(dif, 2) as number[],
    dea: RD(dea, 2) as number[],
    macd: RD(macd, 2) as number[]
  };
}

/**
 * KDJ indicator
 * @param close - Close prices
 * @param high - High prices
 * @param low - Low prices
 * @param n - Period (default: 9)
 * @param m1 - K smoothing (default: 3)
 * @param m2 - D smoothing (default: 3)
 * @returns K, D, J arrays
 */
export function KDJ(
  close: number[],
  high: number[],
  low: number[],
  n: number = 9,
  m1: number = 3,
  m2: number = 3
): { k: number[]; d: number[]; j: number[] } {
  const llvLow = LLV(low, n);
  const hhvHigh = HHV(high, n);
  const rsv = close.map((val, i) => {
    const denominator = hhvHigh[i] - llvLow[i];
    return denominator === 0 ? 0 : (val - llvLow[i]) / denominator * 100;
  });
  
  const k = EMA(rsv, m1 * 2 - 1);
  const d = EMA(k, m2 * 2 - 1);
  const j = k.map((val, i) => val * 3 - d[i] * 2);
  
  return { k, d, j };
}

/**
 * RSI indicator
 * @param close - Close prices
 * @param n - Period (default: 24)
 * @returns RSI array
 */
export function RSI(close: number[], n: number = 24): number[] {
  const dif = DIFF(close, 1).map(val => (isNaN(val) ? 0 : val));
  const maxDif = dif.map(val => Math.max(val, 0));
  const absDif = dif.map(val => Math.abs(val));
  
  const smaMax = SMA(maxDif, n);
  const smaAbs = SMA(absDif, n);
  
  return RD(smaMax.map((val, i) => (smaAbs[i] === 0 ? 0 : val / smaAbs[i] * 100)), 2) as number[];
}

/**
 * Williams %R indicator
 * @param close - Close prices
 * @param high - High prices
 * @param low - Low prices
 * @param n - Period (default: 10)
 * @param n1 - Second period (default: 6)
 * @returns WR and WR1 arrays
 */
export function WR(
  close: number[],
  high: number[],
  low: number[],
  n: number = 10,
  n1: number = 6
): { wr: number[]; wr1: number[] } {
  const hhvN = HHV(high, n);
  const llvN = LLV(low, n);
  const wr = close.map((val, i) => {
    const denominator = hhvN[i] - llvN[i];
    return denominator === 0 ? 0 : (hhvN[i] - val) / denominator * 100;
  });
  
  const hhvN1 = HHV(high, n1);
  const llvN1 = LLV(low, n1);
  const wr1 = close.map((val, i) => {
    const denominator = hhvN1[i] - llvN1[i];
    return denominator === 0 ? 0 : (hhvN1[i] - val) / denominator * 100;
  });
  
  return {
    wr: RD(wr, 2) as number[],
    wr1: RD(wr1, 2) as number[]
  };
}

/**
 * BIAS (Deviation) indicator
 * @param close - Close prices
 * @param l1 - Short period (default: 6)
 * @param l2 - Medium period (default: 12)
 * @param l3 - Long period (default: 24)
 * @returns BIAS1, BIAS2, BIAS3 arrays
 */
export function BIAS(
  close: number[],
  l1: number = 6,
  l2: number = 12,
  l3: number = 24
): { bias1: number[]; bias2: number[]; bias3: number[] } {
  const maL1 = MA(close, l1);
  const maL2 = MA(close, l2);
  const maL3 = MA(close, l3);
  
  const bias1 = close.map((val, i) => (maL1[i] === 0 ? 0 : (val - maL1[i]) / maL1[i] * 100));
  const bias2 = close.map((val, i) => (maL2[i] === 0 ? 0 : (val - maL2[i]) / maL2[i] * 100));
  const bias3 = close.map((val, i) => (maL3[i] === 0 ? 0 : (val - maL3[i]) / maL3[i] * 100));
  
  return {
    bias1: RD(bias1, 2) as number[],
    bias2: RD(bias2, 2) as number[],
    bias3: RD(bias3, 2) as number[]
  };
}

/**
 * BOLL (Bollinger Bands) indicator
 * @param close - Close prices
 * @param n - Period (default: 20)
 * @param p - Multiplier (default: 2)
 * @returns Upper, Mid, Lower bands
 */
export function BOLL(
  close: number[],
  n: number = 20,
  p: number = 2
): { upper: number[]; mid: number[]; lower: number[] } {
  const mid = MA(close, n);
  const std = STD(close, n);
  
  const upper = mid.map((val, i) => val + std[i] * p);
  const lower = mid.map((val, i) => val - std[i] * p);
  
  return {
    upper: RD(upper, 2) as number[],
    mid: RD(mid, 2) as number[],
    lower: RD(lower, 2) as number[]
  };
}

/**
 * PSY (Psychological Line) indicator
 * @param close - Close prices
 * @param n - Period (default: 12)
 * @param m - MA period (default: 6)
 * @returns PSY and PSYMA arrays
 */
export function PSY(
  close: number[],
  n: number = 12,
  m: number = 6
): { psy: number[]; psyma: number[] } {
  const refClose = REF(close, 1);
  const cond = close.map((val, i) => val > refClose[i]);
  const count = SUM(cond.map(b => b ? 1 : 0), n);
  const psy = count.map(val => val / n * 100);
  const psyma = MA(psy, m);
  
  return {
    psy: RD(psy, 2) as number[],
    psyma: RD(psyma, 2) as number[]
  };
}

/**
 * CCI (Commodity Channel Index) indicator
 * @param close - Close prices
 * @param high - High prices
 * @param low - Low prices
 * @param n - Period (default: 14)
 * @returns CCI array
 */
export function CCI(
  close: number[],
  high: number[],
  low: number[],
  n: number = 14
): number[] {
  const tp = close.map((val, i) => (val + high[i] + low[i]) / 3);
  const maTp = MA(tp, n);
  const aveDev = AVEDEV(tp, n);
  
  return tp.map((val, i) => {
    const denominator = 0.015 * aveDev[i];
    return denominator === 0 ? 0 : (val - maTp[i]) / denominator;
  });
}

/**
 * ATR (Average True Range) indicator
 * @param close - Close prices
 * @param high - High prices
 * @param low - Low prices
 * @param n - Period (default: 20)
 * @returns ATR array
 */
export function ATR(
  close: number[],
  high: number[],
  low: number[],
  n: number = 20
): number[] {
  const refClose = REF(close, 1);
  const tr = high.map((val, i) => {
    const diff1 = val - low[i];
    const diff2 = Math.abs(refClose[i] - val);
    const diff3 = Math.abs(refClose[i] - low[i]);
    return Math.max(Math.max(diff1, diff2), diff3);
  });
  
  return MA(tr, n);
}

/**
 * BBI (Bull and Bear Index) indicator
 * @param close - Close prices
 * @param m1 - Short period (default: 3)
 * @param m2 - Medium-short period (default: 6)
 * @param m3 - Medium period (default: 12)
 * @param m4 - Long period (default: 20)
 * @returns BBI array
 */
export function BBI(
  close: number[],
  m1: number = 3,
  m2: number = 6,
  m3: number = 12,
  m4: number = 20
): number[] {
  const ma1 = MA(close, m1);
  const ma2 = MA(close, m2);
  const ma3 = MA(close, m3);
  const ma4 = MA(close, m4);
  
  return ma1.map((val, i) => (val + ma2[i] + ma3[i] + ma4[i]) / 4);
}

/**
 * DMI (Directional Movement Index) indicator
 * @param close - Close prices
 * @param high - High prices
 * @param low - Low prices
 * @param m1 - Period (default: 14)
 * @param m2 - ADX period (default: 6)
 * @returns PDI, MDI, ADX, ADXR arrays
 */
export function DMI(
  close: number[],
  high: number[],
  low: number[],
  m1: number = 14,
  m2: number = 6
): { pdi: number[]; mdi: number[]; adx: number[]; adxr: number[] } {
  const refClose = REF(close, 1);
  const refHigh = REF(high, 1);
  const refLow = REF(low, 1);
  
  const tr = SUM(
    high.map((val, i) => {
      const diff1 = val - low[i];
      const diff2 = Math.abs(val - refClose[i]);
      const diff3 = Math.abs(low[i] - refClose[i]);
      return Math.max(Math.max(diff1, diff2), diff3);
    }),
    m1
  );
  
  const hd = high.map((val, i) => val - refHigh[i]);
  const ld = refLow.map((val, i) => val - low[i]);
  
  const dmp = SUM(
    hd.map((val, i) => (val > 0 && val > ld[i] ? val : 0)),
    m1
  );
  
  const dmm = SUM(
    ld.map((val, i) => (val > 0 && val > hd[i] ? val : 0)),
    m1
  );
  
  const pdi = dmp.map((val, i) => (tr[i] === 0 ? 0 : val * 100 / tr[i]));
  const mdi = dmm.map((val, i) => (tr[i] === 0 ? 0 : val * 100 / tr[i]));
  
  const adx = MA(
    mdi.map((val, i) => {
      const denominator = pdi[i] + val;
      return denominator === 0 ? 0 : Math.abs(val - pdi[i]) / denominator * 100;
    }),
    m2
  );
  
  const refAdx = REF(adx, m2);
  const adxr = adx.map((val, i) => (val + refAdx[i]) / 2);
  
  return { pdi, mdi, adx, adxr };
}

/**
 * TAQ (Turtle Trading) channel indicator
 * @param high - High prices
 * @param low - Low prices
 * @param n - Period
 * @returns UP, MID, DOWN channels
 */
export function TAQ(
  high: number[],
  low: number[],
  n: number
): { up: number[]; mid: number[]; down: number[] } {
  const up = HHV(high, n);
  const down = LLV(low, n);
  const mid = up.map((val, i) => (val + down[i]) / 2);
  
  return { up, mid, down };
}

/**
 * TRIX (Triple Exponential Moving Average) indicator
 * @param close - Close prices
 * @param m1 - Period (default: 12)
 * @param m2 - Signal period (default: 20)
 * @returns TRIX and TRMA arrays
 */
export function TRIX(
  close: number[],
  m1: number = 12,
  m2: number = 20
): { trix: number[]; trma: number[] } {
  const ema1 = EMA(close, m1);
  const ema2 = EMA(ema1, m1);
  const tr = EMA(ema2, m1);
  const refTr = REF(tr, 1);
  
  const trix = tr.map((val, i) => {
    const denominator = refTr[i];
    return denominator === 0 ? 0 : (val - denominator) / denominator * 100;
  });
  
  const trma = MA(trix, m2);
  
  return { trix, trma };
}

/**
 * VR (Volume Ratio) indicator
 * @param close - Close prices
 * @param vol - Volume
 * @param m1 - Period (default: 26)
 * @returns VR array
 */
export function VR(
  close: number[],
  vol: number[],
  m1: number = 26
): number[] {
  const lc = REF(close, 1);
  const upVol = SUM(
    close.map((val, i) => (val > lc[i] ? vol[i] : 0)),
    m1
  );
  const downVol = SUM(
    close.map((val, i) => (val <= lc[i] ? vol[i] : 0)),
    m1
  );
  
  return upVol.map((val, i) => (downVol[i] === 0 ? 0 : val / downVol[i] * 100));
}

/**
 * EMV (Ease of Movement) indicator
 * @param high - High prices
 * @param low - Low prices
 * @param vol - Volume
 * @param n - Period (default: 14)
 * @param m - Signal period (default: 9)
 * @returns EMV and MAEMV arrays
 */
export function EMV(
  high: number[],
  low: number[],
  vol: number[],
  n: number = 14,
  m: number = 9
): { emv: number[]; maemv: number[] } {
  const maVol = MA(vol, n);
  const refHighLow = REF(high.map((val, i) => val + low[i]), 1);
  const highLowSum = high.map((val, i) => val + low[i]);
  const volume = maVol.map((val, i) => val / vol[i]);
  const mid = highLowSum.map((val, i) => 100 * (val - refHighLow[i]) / val);
  const highLowDiff = high.map((val, i) => val - low[i]);
  const maHighLowDiff = MA(highLowDiff, n);
  
  const emv = mid.map((val, i) => {
    const denominator = maHighLowDiff[i];
    return denominator === 0 ? 0 : val * volume[i] * highLowDiff[i] / denominator;
  });
  
  const emvMa = MA(emv, n);
  const maemv = MA(emvMa, m);
  
  return { emv: emvMa, maemv };
}

/**
 * DPO (Detrended Price Oscillator) indicator
 * @param close - Close prices
 * @param m1 - Long MA period (default: 20)
 * @param m2 - Shift period (default: 10)
 * @param m3 - Signal period (default: 6)
 * @returns DPO and MADPO arrays
 */
export function DPO(
  close: number[],
  m1: number = 20,
  m2: number = 10,
  m3: number = 6
): { dpo: number[]; madpo: number[] } {
  const maClose = MA(close, m1);
  const refMa = REF(maClose, m2);
  const dpo = close.map((val, i) => val - refMa[i]);
  const madpo = MA(dpo, m3);
  
  return { dpo, madpo };
}

/**
 * BRAR (Sentiment Indicator) indicator
 * @param open - Open prices
 * @param close - Close prices
 * @param high - High prices
 * @param low - Low prices
 * @param m1 - Period (default: 26)
 * @returns AR and BR arrays
 */
export function BRAR(
  open: number[],
  close: number[],
  high: number[],
  low: number[],
  m1: number = 26
): { ar: number[]; br: number[] } {
  const ar = SUM(
    high.map((val, i) => val - open[i]),
    m1
  ).map((val, i) => {
    const denominator = SUM(open.map((o, j) => o - low[j]), m1)[i];
    return denominator === 0 ? 0 : val / denominator * 100;
  });
  
  const refClose = REF(close, 1);
  const br = SUM(
    high.map((val, i) => Math.max(0, val - refClose[i])),
    m1
  ).map((val, i) => {
    const denominator = SUM(
      low.map((val, i) => Math.max(0, refClose[i] - val)),
      m1
    )[i];
    return denominator === 0 ? 0 : val / denominator * 100;
  });
  
  return { ar, br };
}

/**
 * DMA (Different of Moving Average) indicator
 * @param close - Close prices
 * @param n1 - Short MA period (default: 10)
 * @param n2 - Long MA period (default: 50)
 * @param m - Signal period (default: 10)
 * @returns DIF and DIFMA arrays
 */
export function DMA(
  close: number[],
  n1: number = 10,
  n2: number = 50,
  m: number = 10
): { dif: number[]; difma: number[] } {
  const ma1 = MA(close, n1);
  const ma2 = MA(close, n2);
  const dif = ma1.map((val, i) => val - ma2[i]);
  const difma = MA(dif, m);
  
  return { dif, difma };
}

/**
 * MTM (Momentum) indicator
 * @param close - Close prices
 * @param n - Period (default: 12)
 * @param m - Signal period (default: 6)
 * @returns MTM and MTMMA arrays
 */
export function MTM(
  close: number[],
  n: number = 12,
  m: number = 6
): { mtm: number[]; mtmma: number[] } {
  const refClose = REF(close, n);
  const mtm = close.map((val, i) => val - refClose[i]);
  const mtmma = MA(mtm, m);
  
  return { mtm, mtmma };
}

/**
 * ROC (Rate of Change) indicator
 * @param close - Close prices
 * @param n - Period (default: 12)
 * @param m - Signal period (default: 6)
 * @returns ROC and MAROC arrays
 */
export function ROC(
  close: number[],
  n: number = 12,
  m: number = 6
): { roc: number[]; maroc: number[] } {
  const refClose = REF(close, n);
  const roc = close.map((val, i) => {
    const denominator = refClose[i];
    return denominator === 0 ? 0 : 100 * (val - denominator) / denominator;
  });
  const maroc = MA(roc, m);
  
  return { roc, maroc };
}
