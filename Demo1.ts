/**
 * Demo 1: Basic Usage of Ashare TypeScript
 * 
 * Shows how to fetch stock data and use technical indicators
 */

import { getPrice, MA, BOLL } from './src';

async function main() {
  console.log('=== Ashare TypeScript Demo 1 ===\n');

  try {
    // Example 1: Fetch daily data for Shanghai Composite Index
    console.log('Fetching Shanghai Composite Index daily data...');
    const dailyData = await getPrice('sh000001', undefined, 10, '1d');
    
    console.log('\nShanghai Composite Index Daily Data (Last 10 days):');
    console.table(dailyData.map(d => ({
      Date: d.time.toISOString().split('T')[0],
      Open: d.open,
      Close: d.close,
      High: d.high,
      Low: d.low,
      Volume: d.volume
    })));

    // Example 2: Fetch minute data
    console.log('\n\nFetching 15-minute data...');
    const minData = await getPrice('000001.XSHG', undefined, 5, '15m');
    
    console.log('\n15-Minute Data (Last 5 periods):');
    console.table(minData.map(d => ({
      Time: d.time.toISOString(),
      Open: d.open,
      Close: d.close,
      High: d.high,
      Low: d.low,
      Volume: d.volume
    })));

    // Example 3: Fetch with end date
    console.log('\n\nFetching historical data with end date...');
    const endDate = new Date('2024-01-01');
    const historicalData = await getPrice('sh000001', endDate, 5, '1d');
    
    console.log('\nHistorical Data (up to 2024-01-01):');
    console.table(historicalData.map(d => ({
      Date: d.time.toISOString().split('T')[0],
      Close: d.close
    })));

    // Example 4: Calculate technical indicators
    console.log('\n\n=== Technical Indicators ===\n');
    const closePrices = dailyData.map(d => d.close);
    
    // Calculate 5-day Moving Average
    const ma5 = MA(closePrices, 5);
    console.log('5-Day Moving Average (Last 5 values):');
    console.log(ma5.slice(-5));
    
    // Calculate Bollinger Bands
    const { upper, mid, lower } = BOLL(closePrices, 20, 2);
    console.log('\nBollinger Bands (Last value):');
    console.log({
      Upper: upper[upper.length - 1],
      Middle: mid[mid.length - 1],
      Lower: lower[lower.length - 1]
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the demo
main();
