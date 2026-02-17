/**
 * Fetch real stock data and save to JSON for static HTML chart
 */

import { getPrice } from '../../src/Ashare';
import { BOLL, TAQ } from '../../src/MyTT';
import { StockPriceData } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

async function fetchAndSaveData() {
  console.log('🚀 Fetching real stock data from Ashare API...\n');
  
  try {
    // Fetch Shanghai Composite Index data
    console.log('📊 Fetching 上证指数 (000001) - 60 days daily data...');
    const stockData: StockPriceData[] = await getPrice('sh000001', undefined, 60, '1d');
    
    console.log(`✅ Fetched ${stockData.length} days of data`);
    console.log(`📅 Date range: ${stockData[0].time.toDateString()} to ${stockData[stockData.length - 1].time.toDateString()}`);
    
    // Extract data arrays
    const dates = stockData.map(d => d.time.toISOString().split('T')[0]);
    const open = stockData.map(d => d.open);
    const close = stockData.map(d => d.close);
    const high = stockData.map(d => d.high);
    const low = stockData.map(d => d.low);
    const volume = stockData.map(d => d.volume);
    
    // Calculate BOLL (Bollinger Bands)
    console.log('📈 Calculating BOLL indicator (20, 2)...');
    const boll = BOLL(close, 20, 2);
    
    // Calculate TAQ (Turtle Channel)
    console.log('📈 Calculating TAQ indicator (20)...');
    const taq = TAQ(high, low, 20);
    
    // Prepare candlestick data [open, close, low, high]
    const candleData = stockData.map(d => [d.open, d.close, d.low, d.high]);
    
    // Create data object
    const chartData = {
      metadata: {
        symbol: 'sh000001',
        name: '上证指数',
        fetchedAt: new Date().toISOString(),
        totalDays: stockData.length,
        dateRange: {
          start: dates[0],
          end: dates[dates.length - 1]
        }
      },
      dates,
      candleData,
      volume,
      indicators: {
        BOLL: {
          period: 20,
          multiplier: 2,
          upper: boll.upper,
          mid: boll.mid,
          lower: boll.lower
        },
        TAQ: {
          period: 20,
          up: taq.up,
          mid: taq.mid,
          down: taq.down
        }
      }
    };
    
    // Ensure examples/charts directory exists
    const outputDir = path.join(__dirname);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save to JSON file
    const jsonPath = path.join(outputDir, 'chart-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(chartData, null, 2));
    
    console.log(`\n💾 Data saved to: ${jsonPath}`);
    console.log(`📁 File size: ${(fs.statSync(jsonPath).size / 1024).toFixed(2)} KB`);
    
    // Generate updated HTML file
    generateHTML(chartData, outputDir);
    
    console.log('\n✨ Done! Open BollTaqCharts-Static.html in your browser to view the charts');
    
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    console.log('\n⚠️  Make sure you have internet connection and the Ashare API is accessible');
  }
}

/**
 * Generate static HTML file that loads data from JSON
 */
function generateHTML(data: any, outputDir: string) {
  console.log('\n🎨 Generating static HTML chart...');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>上证指数 - BOLL & TAQ Technical Analysis (Real Data)</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      text-align: center;
      color: #58a6ff;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    .subtitle {
      text-align: center;
      color: #8b949e;
      margin-bottom: 30px;
      font-size: 16px;
    }
    
    .info-bar {
      background: rgba(88, 166, 255, 0.1);
      border: 1px solid rgba(88, 166, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .info-item {
      text-align: center;
    }
    
    .info-label {
      font-size: 12px;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #f0f6fc;
    }
    
    .chart-container {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #f0f6fc;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .chart-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: #58a6ff;
      border-radius: 2px;
    }
    
    .chart-params {
      font-size: 13px;
      color: #8b949e;
      background: #0d1117;
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid #30363d;
    }
    
    .chart {
      width: 100%;
      height: 500px;
    }
    
    .legend {
      display: flex;
      gap: 20px;
      margin-top: 15px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #8b949e;
    }
    
    .legend-color {
      width: 12px;
      height: 3px;
      border-radius: 2px;
    }
    
    .data-source {
      text-align: center;
      color: #6e7681;
      font-size: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #21262d;
    }
    
    .loading {
      text-align: center;
      padding: 50px;
      color: #8b949e;
    }
    
    .error {
      background: rgba(248, 81, 73, 0.1);
      border: 1px solid rgba(248, 81, 73, 0.3);
      color: #f85149;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>上证指数 Technical Analysis</h1>
    <p class="subtitle">BOLL (Bollinger Bands) & TAQ (Turtle Trading Channel) - Real Market Data</p>
    
    <div id="infoBar" class="info-bar" style="display: none;">
      <div class="info-item">
        <div class="info-label">Symbol</div>
        <div class="info-value" id="symbol">-</div>
      </div>
      <div class="info-item">
        <div class="info-label">Data Points</div>
        <div class="info-value" id="dataPoints">-</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date Range</div>
        <div class="info-value" id="dateRange">-</div>
      </div>
      <div class="info-item">
        <div class="info-label">Latest Close</div>
        <div class="info-value" id="latestClose">-</div>
      </div>
    </div>

    <div id="loading" class="loading">Loading chart data...</div>
    <div id="error" class="error" style="display: none;"></div>

    <div id="charts" style="display: none;">
      <div class="chart-container">
        <div class="chart-header">
          <div class="chart-title">BOLL (Bollinger Bands)</div>
          <div class="chart-params">Period: 20 | Multiplier: 2</div>
        </div>
        <div id="bollChart" class="chart"></div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #ff6b6b;"></div>
            <span>Upper Band (Resistance)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #4ecdc4;"></div>
            <span>Middle Band (MA20)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #95e1d3;"></div>
            <span>Lower Band (Support)</span>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <div class="chart-title">TAQ (Turtle Trading Channel)</div>
          <div class="chart-params">Period: 20</div>
        </div>
        <div id="taqChart" class="chart"></div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color" style="background: #ff6b6b;"></div>
            <span>Channel Upper (Breakout Buy)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #feca57;"></div>
            <span>Channel Middle</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: #48dbfb;"></div>
            <span>Channel Lower (Breakout Sell)</span>
          </div>
        </div>
      </div>
    </div>

    <div class="data-source">
      Data Source: Ashare API (Sina/Tencent) • Fetched: ${data.metadata.fetchedAt}
    </div>
  </div>

  <script>
    // Load data from JSON file
    async function loadData() {
      try {
        const response = await fetch('./chart-data.json');
        if (!response.ok) {
          throw new Error('Failed to load chart data');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        throw new Error('Error loading data: ' + error.message);
      }
    }

    // Initialize charts
    async function initCharts() {
      try {
        const data = await loadData();
        
        // Update info bar
        document.getElementById('symbol').textContent = data.metadata.name + ' (' + data.metadata.symbol + ')';
        document.getElementById('dataPoints').textContent = data.metadata.totalDays + ' days';
        document.getElementById('dateRange').textContent = data.metadata.dateRange.start + ' to ' + data.metadata.dateRange.end;
        
        const latestPrice = data.candleData[data.candleData.length - 1][1];
        const prevPrice = data.candleData[data.candleData.length - 2][1];
        const change = ((latestPrice - prevPrice) / prevPrice * 100).toFixed(2);
        const changeColor = change >= 0 ? '#3fb950' : '#f85149';
        const changeSign = change >= 0 ? '+' : '';
        document.getElementById('latestClose').innerHTML = 
          latestPrice.toFixed(2) + ' <span style="color: ' + changeColor + '">(' + changeSign + change + '%)</span>';
        
        document.getElementById('infoBar').style.display = 'flex';
        document.getElementById('loading').style.display = 'none';
        document.getElementById('charts').style.display = 'block';
        
        // Initialize BOLL chart
        const bollChart = echarts.init(document.getElementById('bollChart'));
        const bollOption = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            backgroundColor: 'rgba(22, 27, 34, 0.95)',
            borderColor: '#30363d',
            textStyle: { color: '#c9d1d9' },
            formatter: function(params) {
              let result = '<strong>' + params[0].axisValue + '</strong><br/>';
              params.forEach(function(item) {
                if (item.seriesName === 'K线') {
                  result += 'Open: ' + item.data[1] + '<br/>';
                  result += 'Close: ' + item.data[2] + '<br/>';
                  result += 'Low: ' + item.data[3] + '<br/>';
                  result += 'High: ' + item.data[4] + '<br/>';
                } else {
                  result += item.marker + ' ' + item.seriesName + ': ' + item.data + '<br/>';
                }
              });
              return result;
            }
          },
          legend: {
            data: ['K线', 'Upper Band', 'Middle Band', 'Lower Band'],
            textStyle: { color: '#8b949e' },
            top: 10
          },
          grid: {
            left: '3%',
            right: '3%',
            bottom: '15%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: data.dates,
            axisLine: { lineStyle: { color: '#30363d' } },
            axisLabel: { 
              color: '#8b949e',
              rotate: 45
            }
          },
          yAxis: {
            type: 'value',
            scale: true,
            axisLine: { lineStyle: { color: '#30363d' } },
            axisLabel: { color: '#8b949e' },
            splitLine: { lineStyle: { color: '#21262d' } }
          },
          dataZoom: [
            {
              type: 'inside',
              start: 50,
              end: 100
            },
            {
              type: 'slider',
              start: 50,
              end: 100,
              height: 20,
              bottom: 20,
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
              data: data.candleData,
              itemStyle: {
                color: '#ff6b6b',
                color0: '#4ecdc4',
                borderColor: '#ff6b6b',
                borderColor0: '#4ecdc4'
              }
            },
            {
              name: 'Upper Band',
              type: 'line',
              data: data.indicators.BOLL.upper,
              smooth: true,
              lineStyle: { color: '#ff6b6b', width: 2 },
              symbol: 'none'
            },
            {
              name: 'Middle Band',
              type: 'line',
              data: data.indicators.BOLL.mid,
              smooth: true,
              lineStyle: { color: '#4ecdc4', width: 2 },
              symbol: 'none'
            },
            {
              name: 'Lower Band',
              type: 'line',
              data: data.indicators.BOLL.lower,
              smooth: true,
              lineStyle: { color: '#95e1d3', width: 2 },
              symbol: 'none'
            }
          ]
        };

        // Initialize TAQ chart
        const taqChart = echarts.init(document.getElementById('taqChart'));
        const taqOption = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' },
            backgroundColor: 'rgba(22, 27, 34, 0.95)',
            borderColor: '#30363d',
            textStyle: { color: '#c9d1d9' }
          },
          legend: {
            data: ['Close Price', 'Channel Upper', 'Channel Middle', 'Channel Lower'],
            textStyle: { color: '#8b949e' },
            top: 10
          },
          grid: {
            left: '3%',
            right: '3%',
            bottom: '15%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: data.dates,
            axisLine: { lineStyle: { color: '#30363d' } },
            axisLabel: { 
              color: '#8b949e',
              rotate: 45
            }
          },
          yAxis: {
            type: 'value',
            scale: true,
            axisLine: { lineStyle: { color: '#30363d' } },
            axisLabel: { color: '#8b949e' },
            splitLine: { lineStyle: { color: '#21262d' } }
          },
          dataZoom: [
            {
              type: 'inside',
              start: 50,
              end: 100
            },
            {
              type: 'slider',
              start: 50,
              end: 100,
              height: 20,
              bottom: 20,
              backgroundColor: '#161b22',
              borderColor: '#30363d',
              fillerColor: 'rgba(88, 166, 255, 0.2)',
              handleStyle: { color: '#58a6ff' },
              textStyle: { color: '#8b949e' }
            }
          ],
          series: [
            {
              name: 'Close Price',
              type: 'line',
              data: data.candleData.map(d => d[1]),
              smooth: false,
              lineStyle: { color: '#ffffff', width: 1.5 },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(255, 255, 255, 0.1)' },
                  { offset: 1, color: 'rgba(255, 255, 255, 0)' }
                ])
              },
              symbol: 'none'
            },
            {
              name: 'Channel Upper',
              type: 'line',
              data: data.indicators.TAQ.up,
              smooth: true,
              lineStyle: { color: '#ff6b6b', width: 2, type: 'dashed' },
              symbol: 'none'
            },
            {
              name: 'Channel Middle',
              type: 'line',
              data: data.indicators.TAQ.mid,
              smooth: true,
              lineStyle: { color: '#feca57', width: 1.5 },
              symbol: 'none'
            },
            {
              name: 'Channel Lower',
              type: 'line',
              data: data.indicators.TAQ.down,
              smooth: true,
              lineStyle: { color: '#48dbfb', width: 2, type: 'dashed' },
              symbol: 'none'
            }
          ]
        };

        bollChart.setOption(bollOption);
        taqChart.setOption(taqOption);

        // Handle resize
        window.addEventListener('resize', () => {
          bollChart.resize();
          taqChart.resize();
        });

      } catch (error) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Error: ' + error.message;
        console.error(error);
      }
    }

    // Start loading
    initCharts();
  </script>
</body>
</html>`;
  
  const htmlPath = path.join(outputDir, 'BollTaqCharts-Static.html');
  fs.writeFileSync(htmlPath, html);
  
  console.log(`💾 HTML saved to: ${htmlPath}`);
}

// Run the script
fetchAndSaveData();
