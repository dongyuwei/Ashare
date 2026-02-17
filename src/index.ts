/**
 * Ashare TypeScript - Stock Data API with Technical Indicators
 * 
 * A lightweight TypeScript implementation of stock data retrieval
 * and technical analysis indicators for A-share market.
 * 
 * @example
 * ```typescript
 * import { getPrice, MACD, BOLL } from 'ashare-typescript';
 * 
 * // Fetch stock data
 * const data = await getPrice('sh000001', undefined, 10, '1d');
 * 
 * // Calculate technical indicators
 * const closes = data.map(d => d.close);
 * const { dif, dea, macd } = MACD(closes);
 * const { upper, mid, lower } = BOLL(closes);
 * ```
 */

// Export types
export * from './types';

// Export utility functions
export * from './utils';

// Export technical indicators
export * from './MyTT';

// Export stock data API
export * from './Ashare';
