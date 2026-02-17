/**
 * Ashare Stock Data API
 * TypeScript implementation of Ashare stock data retrieval
 * https://github.com/mpquant/Ashare
 * 
 * Dual-core data source: Sina Finance + Tencent Stock
 * Features automatic failover between sources
 */

import axios from 'axios';
import { StockPriceData, Frequency } from './types';

// Tencent API URLs
const TENCENT_DAY_URL = 'http://web.ifzq.gtimg.cn/appstock/app/fqkline/get';
const TENCENT_MIN_URL = 'http://ifzq.gtimg.cn/appstock/app/kline/mkline';

// Sina API URL
const SINA_URL = 'http://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData';

/**
 * Normalize stock code format
 * Supports multiple formats: sh000001, 000001.XSHG, sz399006, etc.
 * @param code - Stock code
 * @returns Normalized code
 */
export function normalizeCode(code: string): string {
  let normalized = code
    .replace('.XSHG', '')
    .replace('.XSHE', '');
  
  if (code.includes('XSHG')) {
    normalized = 'sh' + normalized;
  } else if (code.includes('XSHE')) {
    normalized = 'sz' + normalized;
  }
  
  return normalized;
}

/**
 * Format date to string
 * @param date - Date object or string
 * @returns Formatted date string
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  
  return date.split(' ')[0];
}

/**
 * Get daily/weekly/monthly data from Tencent
 * @param code - Stock code
 * @param endDate - End date
 * @param count - Number of records
 * @param frequency - Data frequency
 * @returns Stock price data array
 */
export async function getPriceDayTx(
  code: string,
  endDate: Date | string = '',
  count: number = 10,
  frequency: Frequency = '1d'
): Promise<StockPriceData[]> {
  const unit = frequency === '1w' ? 'week' : frequency === '1M' ? 'month' : 'day';
  
  let formattedEndDate = formatDate(endDate);
  const today = new Date().toISOString().split('T')[0];
  
  if (formattedEndDate === today) {
    formattedEndDate = '';
  }
  
  const url = `${TENCENT_DAY_URL}?param=${code},${unit},,${formattedEndDate},${count},qfq`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    const stk = data.data[code];
    const ms = 'qfq' + unit;
    const buf = stk[ms] || stk[unit];
    
    if (!buf || !Array.isArray(buf)) {
      throw new Error('Invalid data format from Tencent API');
    }
    
    return buf.map((item: any[]) => ({
      time: new Date(item[0]),
      open: parseFloat(item[1]),
      close: parseFloat(item[2]),
      high: parseFloat(item[3]),
      low: parseFloat(item[4]),
      volume: parseFloat(item[5])
    }));
  } catch (error) {
    throw new Error(`Failed to fetch data from Tencent: ${error}`);
  }
}

/**
 * Get minute-level data from Tencent
 * @param code - Stock code
 * @param endDate - End date
 * @param count - Number of records
 * @param frequency - Data frequency
 * @returns Stock price data array
 */
export async function getPriceMinTx(
  code: string,
  endDate: Date | string = '',
  count: number = 10,
  frequency: Frequency = '1m'
): Promise<StockPriceData[]> {
  const ts = parseInt(frequency.replace('m', '')) || 1;
  
  const url = `${TENCENT_MIN_URL}?param=${code},m${ts},,${count}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    const buf = data.data[code]['m' + ts];
    
    if (!buf || !Array.isArray(buf)) {
      throw new Error('Invalid data format from Tencent API');
    }
    
    const result = buf.map((item: any[]) => ({
      time: new Date(item[0]),
      open: parseFloat(item[1]),
      close: parseFloat(item[2]),
      high: parseFloat(item[3]),
      low: parseFloat(item[4]),
      volume: parseFloat(item[5])
    }));
    
    // Update last close price with real-time data if available
    if (data.data[code].qt && data.data[code].qt[code]) {
      const latestPrice = parseFloat(data.data[code].qt[code][3]);
      if (!isNaN(latestPrice) && result.length > 0) {
        result[result.length - 1].close = latestPrice;
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch minute data from Tencent: ${error}`);
  }
}

/**
 * Get data from Sina Finance API
 * Supports all periods: 1m, 5m, 15m, 30m, 60m, 1d, 1w, 1M
 * @param code - Stock code
 * @param endDate - End date
 * @param count - Number of records
 * @param frequency - Data frequency
 * @returns Stock price data array
 */
export async function getPriceSina(
  code: string,
  endDate: Date | string = '',
  count: number = 10,
  frequency: Frequency = '60m'
): Promise<StockPriceData[]> {
  // Convert frequency to minutes
  const freqMap: Record<string, string> = {
    '1d': '240',
    '1w': '1200',
    '1M': '7200'
  };
  
  const ts = freqMap[frequency] || frequency.replace('m', '');
  
  // Adjust count for daily/weekly/monthly with end date
  let adjustedCount = count;
  if (endDate && ['1d', '1w', '1M'].includes(frequency)) {
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const now = new Date();
    const daysDiff = Math.ceil((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    const unit = frequency === '1w' ? 4 : frequency === '1M' ? 29 : 1;
    adjustedCount = count + Math.floor(daysDiff / unit);
  }
  
  const url = `${SINA_URL}?symbol=${code}&scale=${ts}&ma=5&datalen=${adjustedCount}`;
  
  try {
    const response = await axios.get(url);
    // Sina API returns JSON-like string, need to parse
    let dataStr = response.data;
    
    // Handle Sina's special JSON format
    if (typeof dataStr === 'string') {
      // Fix Sina's non-standard JSON format
      dataStr = dataStr.replace(/'/g, '"');
    }
    
    const data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format from Sina API');
    }
    
    let result = data.map((item: any) => ({
      time: new Date(item.day),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseFloat(item.volume)
    }));
    
    // Filter by end date for daily/weekly/monthly data
    if (endDate && ['1d', '1w', '1M'].includes(frequency)) {
      const end = endDate instanceof Date ? endDate : new Date(endDate);
      result = result.filter(item => item.time <= end);
      result = result.slice(-count);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch data from Sina: ${error}`);
  }
}

/**
 * Main function to get stock price data
 * Provides unified interface with automatic failover
 * @param code - Stock code (supports multiple formats)
 * @param endDate - End date (optional)
 * @param count - Number of records (default: 10)
 * @param frequency - Data frequency (default: '1d')
 * @param fields - Fields to return (optional)
 * @returns Stock price data array
 */
export async function getPrice(
  code: string,
  endDate: Date | string = '',
  count: number = 10,
  frequency: Frequency = '1d',
  fields: string[] = []
): Promise<StockPriceData[]> {
  const xcode = normalizeCode(code);
  
  // Daily, weekly, monthly data
  if (['1d', '1w', '1M'].includes(frequency)) {
    try {
      return await getPriceSina(xcode, endDate, count, frequency);
    } catch (error) {
      console.warn('Sina API failed, trying Tencent...');
      return await getPriceDayTx(xcode, endDate, count, frequency);
    }
  }
  
  // Minute-level data
  if (['1m', '5m', '15m', '30m', '60m'].includes(frequency)) {
    // 1-minute data only available from Tencent
    if (frequency === '1m') {
      return await getPriceMinTx(xcode, endDate, count, frequency);
    }
    
    try {
      return await getPriceSina(xcode, endDate, count, frequency);
    } catch (error) {
      console.warn('Sina API failed, trying Tencent...');
      return await getPriceMinTx(xcode, endDate, count, frequency);
    }
  }
  
  throw new Error(`Unsupported frequency: ${frequency}`);
}

export { StockPriceData, Frequency };
