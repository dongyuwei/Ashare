/**
 * Example: Creating BOLL and TAQ Charts with ECharts
 * 
 * This example shows how to integrate Ashare TypeScript data
 * with Apache ECharts for technical analysis visualization.
 */

import { getPrice } from '../src/Ashare';
import { BOLL, TAQ } from '../src/MyTT';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate HTML chart with real stock data
 */
async function generateBollTaqCharts() {
  console.log('Fetching stock data...');
  
  try {
    // Fetch real data using Ashare TypeScript
    const stockData = await getPrice('sh000001', undefined, 60, '1d');
    
    // Extract data
    const dates = stockData.map(d => d.time.toISOString().split('T')[0]);
    const open = stockData.map(d => d.open);
    const close = stockData.map(d => d.close);
    const high = stockData.map(d => d.high);
    const low = stockData.map(d => d.low);
    
    // Calculate BOLL
    const { upper, mid: bollMid, lower } = BOLL(close, 20, 2);
    
    // Calculate TAQ
    const { up: taqUp, mid: taqMid, down: taqDown } = TAQ(high, low, 20);
    
    // Prepare candlestick data
    const candleData = stockData.map(d => [d.open, d.close, d.low, d.high]);
    
    // Generate HTML
    const html = generateHTML(dates, candleData, { upper, mid: bollMid, lower }, { up: taqUp, mid: taqMid, down: taqDown });
    
    // Save to file
    const outputPath = path.join(__dirname, 'BollTaqCharts-RealData.html');
    fs.writeFileSync(outputPath, html);
    
    console.log(`Chart saved to: ${outputPath}`);
    console.log('Open this file in a web browser to view the charts');
    
  } catch (error) {
    console.error('Error generating charts:', error);
  }
}

/**
 * Generate HTML content with ECharts
 */
function generateHTML(
  dates: string[],
  candleData: number[][],
  boll: { upper: number[]; mid: number[]; lower: number[] },
  taq: { up: number[]; mid: number[]; down: number[] }
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ashare BOLL & TAQ Charts - Real Data</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      text-align: center;
      color: #58a6ff;
      margin-bottom: 10px;
    }
    .subtitle {
      text-align: center;
      color: #8b949e;
      margin-bottom: 30px;
    }
    .chart-container {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .chart-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #f0f6fc;
    }
    .chart { width: 100%; height: 500px; }
    .info {
      background: rgba(88, 166, 255, 0.1);
      border-left: 4px solid #58a6ff;
      padding: 15px;
      margin-bottom: 30px;
      border-radius: 0 6px 6px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Ashare Technical Analysis - Real Stock Data</h1>
    <p class="subtitle">Shanghai Composite Index (000001) with BOLL & TAQ Indicators</p>
    
    <div class="info">
      <strong>Data Source:</strong> Ashare TypeScript API (Sina/Tencent)<br>
      <strong>Period:</strong> ${dates.length} trading days<br>
      <strong>Indicators:</strong> BOLL (20, 2) | TAQ (20)
    </div>

    <div class="chart-container">
      <div class="chart-title">BOLL (Bollinger Bands)</div>
      <div id="bollChart" class="chart"></div>
    </div>

    <div class="chart-container">
      <div class="chart-title">TAQ (Turtle Trading Channel)</div>
      <div id="taqChart" class="chart"></div>
    </div>
  </div>

  <script>
    const dates = ${JSON.stringify(dates)};
    const candleData = ${JSON.stringify(candleData)};
    const bollUpper = ${JSON.stringify(boll.upper)};
    const bollMid = ${JSON.stringify(boll.mid)};
    const bollLower = ${JSON.stringify(boll.lower)};
    const taqUp = ${JSON.stringify(taq.up)};
    const taqMid = ${JSON.stringify(taq.mid)};
    const taqDown = ${JSON.stringify(taq.down)};

    // BOLL Chart
    const bollChart = echarts.init(document.getElementById('bollChart'));
    bollChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(22, 27, 34, 0.9)',
        borderColor: '#30363d',
        textStyle: { color: '#c9d1d9' }
      },
      legend: {
        data: ['K线', 'Upper', 'Middle', 'Lower'],
        textStyle: { color: '#8b949e' },
        top: 10
      },
      grid: {
        left: '3%', right: '3%', bottom: '10%', top: '15%', containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#30363d' } },
        axisLabel: { color: '#8b949e' }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: '#30363d' } },
        axisLabel: { color: '#8b949e' },
        splitLine: { lineStyle: { color: '#21262d' } }
      },
      dataZoom: [
        { type: 'inside', start: 50, end: 100 },
        {
          type: 'slider',
          start: 50,
          end: 100,
          backgroundColor: '#161b22',
          borderColor: '#30363d',
          fillerColor: 'rgba(88, 166, 255, 0.2)',
          handleStyle: { color: '#58a6ff' },
          textStyle: { color: '#8b949e' }
        }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: candleData,
          itemStyle: {
            color: '#ff6b6b',
            color0: '#4ecdc4',
            borderColor: '#ff6b6b',
            borderColor0: '#4ecdc4'
          }
        },
        {
          name: 'Upper',
          type: 'line',
          data: bollUpper,
          smooth: true,
          lineStyle: { color: '#ff6b6b', width: 2 },
          symbol: 'none'
        },
        {
          name: 'Middle',
          type: 'line',
          data: bollMid,
          smooth: true,
          lineStyle: { color: '#4ecdc4', width: 2 },
          symbol: 'none'
        },
        {
          name: 'Lower',
          type: 'line',
          data: bollLower,
          smooth: true,
          lineStyle: { color: '#95e1d3', width: 2 },
          symbol: 'none'
        }
      ]
    });

    // TAQ Chart
    const taqChart = echarts.init(document.getElementById('taqChart'));
    taqChart.setOption({
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(22, 27, 34, 0.9)',
        borderColor: '#30363d',
        textStyle: { color: '#c9d1d9' }
      },
      legend: {
        data: ['Price', 'Channel Upper', 'Channel Middle', 'Channel Lower'],
        textStyle: { color: '#8b949e' },
        top: 10
      },
      grid: {
        left: '3%', right: '3%', bottom: '10%', top: '15%', containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#30363d' } },
        axisLabel: { color: '#8b949e' }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { lineStyle: { color: '#30363d' } },
        axisLabel: { color: '#8b949e' },
        splitLine: { lineStyle: { color: '#21262d' } }
      },
      dataZoom: [
        { type: 'inside', start: 50, end: 100 },
        {
          type: 'slider',
          start: 50,
          end: 100,
          backgroundColor: '#161b22',
          borderColor: '#30363d',
          fillerColor: 'rgba(88, 166, 255, 0.2)',
          handleStyle: { color: '#58a6ff' },
          textStyle: { color: '#8b949e' }
        }
      ],
      series: [
        {
          name: 'Price',
          type: 'line',
          data: candleData.map(d => d[1]),
          smooth: false,
          lineStyle: { color: '#ffffff', width: 1.5 },
          symbol: 'none'
        },
        {
          name: 'Channel Upper',
          type: 'line',
          data: taqUp,
          smooth: true,
          lineStyle: { color: '#ff6b6b', width: 2, type: 'dashed' },
          symbol: 'none'
        },
        {
          name: 'Channel Middle',
          type: 'line',
          data: taqMid,
          smooth: true,
          lineStyle: { color: '#feca57', width: 1.5 },
          symbol: 'none'
        },
        {
          name: 'Channel Lower',
          type: 'line',
          data: taqDown,
          smooth: true,
          lineStyle: { color: '#48dbfb', width: 2, type: 'dashed' },
          symbol: 'none'
        }
      ]
    });

    window.addEventListener('resize', () => {
      bollChart.resize();
      taqChart.resize();
    });
  </script>
</body>
</html>`;
}

// Run the example
generateBollTaqCharts();
