/**
 * Type definitions for Ashare stock data API
 */

/**
 * Stock price data for a single time period
 */
export interface StockPriceData {
  time: Date;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

/**
 * Stock data returned by get_price function
 */
export interface StockDataFrame {
  data: StockPriceData[];
}

/**
 * Frequency options for stock data retrieval
 */
export type Frequency = '1m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1w' | '1M';

/**
 * Configuration options for get_price function
 */
export interface GetPriceOptions {
  code: string;
  endDate?: Date | string;
  count: number;
  frequency: Frequency;
  fields?: string[];
}

/**
 * Technical indicator return types
 */
export interface MACDResult {
  dif: number[];
  dea: number[];
  macd: number[];
}

export interface KDJResult {
  k: number[];
  d: number[];
  j: number[];
}

export interface BOLLResult {
  upper: number[];
  mid: number[];
  lower: number[];
}

export interface WMRResult {
  wr: number[];
  wr1: number[];
}

export interface BIASResult {
  bias1: number[];
  bias2: number[];
  bias3: number[];
}

export interface DMIResult {
  pdi: number[];
  mdi: number[];
  adx: number[];
  adxr: number[];
}

export interface TAQResult {
  up: number[];
  mid: number[];
  down: number[];
}

export interface TRIXResult {
  trix: number[];
  trma: number[];
}

export interface EMVResult {
  emv: number[];
  maemv: number[];
}

export interface DPOResult {
  dpo: number[];
  madpo: number[];
}

export interface BRARResult {
  ar: number[];
  br: number[];
}

export interface DMAResult {
  dif: number[];
  difma: number[];
}

export interface MTMResult {
  mtm: number[];
  mtmma: number[];
}

export interface ROCResult {
  roc: number[];
  maroc: number[];
}

export interface PSYResult {
  psy: number[];
  psyma: number[];
}

export interface SlopeResult {
  slope: number;
  line?: number[];
}
