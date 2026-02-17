/**
 * Demo 2: Advanced Usage with MyTT Technical Indicators
 * 
 * Shows comprehensive technical analysis capabilities
 */

import { getPrice } from './src/Ashare';
import {
  MACD, KDJ, RSI, WR, BOLL, PSY, CCI, ATR, BBI, DMI,
  TAQ, TRIX, VR, EMV, DPO, BRAR, DMA, MTM, ROC
} from './src/MyTT';

async function main() {
  console.log('=== Ashare TypeScript Demo 2: Technical Indicators ===\n');

  try {
    // Fetch data for Maotai (600519)
    console.log('Fetching data for Kweichow Moutai (600519)...');
    const stockData = await getPrice('600519.XSHG', undefined, 120, '1d');
    
    // Extract OHLCV data
    const close = stockData.map(d => d.close);
    const open = stockData.map(d => d.open);
    const high = stockData.map(d => d.high);
    const low = stockData.map(d => d.low);
    const volume = stockData.map(d => d.volume);

    console.log(`\nFetched ${stockData.length} days of data`);
    console.log(`Date range: ${stockData[0].time.toDateString()} to ${stockData[stockData.length - 1].time.toDateString()}`);
    console.log(`Latest close: ${close[close.length - 1]}`);

    // 1. MACD - Moving Average Convergence Divergence
    console.log('\n\n=== 1. MACD Indicator ===');
    const { dif, dea, macd } = MACD(close, 12, 26, 9);
    console.log('MACD Values (Last 5 days):');
    console.table(dif.slice(-5).map((d, i) => ({
      DIF: d.toFixed(2),
      DEA: dea[dif.length - 5 + i].toFixed(2),
      MACD: macd[dif.length - 5 + i].toFixed(2)
    })));

    // 2. KDJ - Stochastic Oscillator
    console.log('\n\n=== 2. KDJ Indicator ===');
    const { k, d, j } = KDJ(close, high, low, 9, 3, 3);
    console.log('KDJ Values (Last 5 days):');
    console.table(k.slice(-5).map((val, i) => ({
      K: val.toFixed(2),
      D: d[k.length - 5 + i].toFixed(2),
      J: j[k.length - 5 + i].toFixed(2)
    })));

    // 3. RSI - Relative Strength Index
    console.log('\n\n=== 3. RSI Indicator ===');
    const rsi = RSI(close, 14);
    console.log('RSI(14) Values (Last 5 days):');
    console.table(rsi.slice(-5).map((val, i) => ({
      Day: i + 1,
      RSI: val.toFixed(2)
    })));

    // 4. BOLL - Bollinger Bands
    console.log('\n\n=== 4. BOLL Indicator ===');
    const { upper, mid, lower } = BOLL(close, 20, 2);
    console.log('Bollinger Bands (Last 5 days):');
    console.table(upper.slice(-5).map((val, i) => ({
      Day: i + 1,
      Upper: val.toFixed(2),
      Middle: mid[upper.length - 5 + i].toFixed(2),
      Lower: lower[upper.length - 5 + i].toFixed(2)
    })));

    // 5. DMI - Directional Movement Index
    console.log('\n\n=== 5. DMI Indicator ===');
    const { pdi, mdi, adx, adxr } = DMI(close, high, low, 14, 6);
    console.log('DMI Values (Last 3 days):');
    console.table(pdi.slice(-3).map((val, i) => ({
      Day: i + 1,
      PDI: val.toFixed(2),
      MDI: mdi[pdi.length - 3 + i].toFixed(2),
      ADX: adx[pdi.length - 3 + i].toFixed(2),
      ADXR: adxr[pdi.length - 3 + i].toFixed(2)
    })));

    // 6. ATR - Average True Range
    console.log('\n\n=== 6. ATR Indicator ===');
    const atr = ATR(close, high, low, 14);
    console.log('ATR(14) - Latest 5 values:');
    console.log(atr.slice(-5).map(v => v.toFixed(2)));

    // 7. TAQ - Turtle Trading Channel
    console.log('\n\n=== 7. TAQ Indicator (Turtle Channel) ===');
    const { up, mid: taqMid, down } = TAQ(high, low, 20);
    console.log('TAQ Channel (Last 3 days):');
    console.table(up.slice(-3).map((val, i) => ({
      Day: i + 1,
      UP: val.toFixed(2),
      MID: taqMid[up.length - 3 + i].toFixed(2),
      DOWN: down[up.length - 3 + i].toFixed(2)
    })));

    // 8. Volume Analysis - VR
    console.log('\n\n=== 8. VR (Volume Ratio) Indicator ===');
    const vr = VR(close, volume, 26);
    console.log('VR(26) - Latest 5 values:');
    console.log(vr.slice(-5).map(v => v.toFixed(2)));

    // 9. Momentum - MTM
    console.log('\n\n=== 9. MTM (Momentum) Indicator ===');
    const { mtm, mtmma } = MTM(close, 12, 6);
    console.log('MTM(12,6) - Last 3 days:');
    console.table(mtm.slice(-3).map((val, i) => ({
      Day: i + 1,
      MTM: val.toFixed(2),
      MTMMA: mtmma[mtm.length - 3 + i].toFixed(2)
    })));

    // 10. Rate of Change - ROC
    console.log('\n\n=== 10. ROC Indicator ===');
    const { roc, maroc } = ROC(close, 12, 6);
    console.log('ROC(12,6) - Latest 5 values:');
    console.table(roc.slice(-5).map((val, i) => ({
      Day: i + 1,
      ROC: val.toFixed(2),
      MAROC: maroc[roc.length - 5 + i].toFixed(2)
    })));

    // Summary
    console.log('\n\n=== Technical Analysis Summary ===');
    console.log(`Latest Close Price: ${close[close.length - 1].toFixed(2)}`);
    console.log(`MACD Trend: ${macd[macd.length - 1] > 0 ? 'Bullish' : 'Bearish'}`);
    console.log(`RSI(14): ${rsi[rsi.length - 1].toFixed(2)} (${rsi[rsi.length - 1] > 70 ? 'Overbought' : rsi[rsi.length - 1] < 30 ? 'Oversold' : 'Neutral'})`);
    console.log(`KDJ J-Value: ${j[j.length - 1].toFixed(2)}`);
    console.log(`ATR(14) Volatility: ${atr[atr.length - 1].toFixed(2)}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the demo
main();
