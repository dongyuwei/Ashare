# ECharts Examples for Ashare TypeScript

This folder contains examples of visualizing stock data with technical indicators using Apache ECharts.

## Files

- **BollTaqCharts.html** - Standalone HTML file with mock data (no server needed)
- **BollTaqCharts-Static.html** - Static HTML with real data from JSON file
- **fetchRealData.ts** - Fetches real API data and generates JSON + HTML
- **generateCharts.ts** - TypeScript example that embeds real data in HTML
- **chart-data.json** - Real stock data with BOLL and TAQ indicators

## Quick Start

### Option 1: View Mock Data Charts (Easiest)

Simply open `BollTaqCharts.html` in your web browser:

```bash
# On macOS
open examples/charts/BollTaqCharts.html

# On Linux
xdg-open examples/charts/BollTaqCharts.html

# On Windows
start examples/charts/BollTaqCharts.html
```

Features:
- Interactive BOLL (Bollinger Bands) chart
- Interactive TAQ (Turtle Trading Channel) chart
- Adjustable parameters (period, multiplier)
- Dark theme optimized for trading
- Zoom and pan functionality

### Option 2: View Real Data Charts (Static)

We've already fetched real data for you! Just open:

```bash
open examples/charts/BollTaqCharts-Static.html
```

This version loads data from `chart-data.json` and displays:
- Real Shanghai Composite Index (上证指数) data
- Actual BOLL and TAQ indicators
- Latest price with change percentage
- Professional trading interface

### Option 3: Fetch Fresh Real Data

Run the script to fetch the latest data from Ashare API:

```bash
# Install dependencies first
npm install

# Fetch real data and generate charts
npx ts-node examples/charts/fetchRealData.ts
```

This will:
1. Fetch 60 days of real stock data from Sina/Tencent API
2. Calculate BOLL (20, 2) and TAQ (20) indicators
3. Save data to `chart-data.json`
4. Generate `BollTaqCharts-Static.html`

**Output files:**
- `chart-data.json` - Raw data with indicators (JSON format)
- `BollTaqCharts-Static.html` - Self-contained HTML chart

## Data Format

The `chart-data.json` contains:

```json
{
  "metadata": {
    "symbol": "sh000001",
    "name": "上证指数",
    "fetchedAt": "2026-02-17T03:01:11.501Z",
    "totalDays": 60,
    "dateRange": {
      "start": "2025-11-20",
      "end": "2026-02-13"
    }
  },
  "dates": ["2025-11-20", "2025-11-21", ...],
  "candleData": [[open, close, low, high], ...],
  "volume": [1234567, ...],
  "indicators": {
    "BOLL": {
      "period": 20,
      "multiplier": 2,
      "upper": [...],
      "mid": [...],
      "lower": [...]
    },
    "TAQ": {
      "period": 20,
      "up": [...],
      "mid": [...],
      "down": [...]
    }
  }
}
```

## Chart Features

### BOLL Chart (Bollinger Bands)

- **Upper Band (Red)**: Resistance level (MA + 2σ)
- **Middle Band (Cyan)**: 20-day moving average
- **Lower Band (Green)**: Support level (MA - 2σ)
- **Candlesticks**: Price action visualization
- **Zoom slider**: Focus on specific time periods

### TAQ Chart (Turtle Trading Channel)

- **Upper Channel (Red dashed)**: Buy breakout level
- **Middle Channel (Yellow)**: Channel center
- **Lower Channel (Cyan dashed)**: Sell breakout level
- **Price Line**: Closing price with area fill
- **Info Bar**: Shows latest price and change %

## Integration with Your Project

### Using Static JSON Data

```typescript
// Load pre-calculated data
const response = await fetch('./chart-data.json');
const data = await response.json();

// Use in ECharts
const chart = echarts.init(document.getElementById('chart'));
chart.setOption({
  xAxis: { data: data.dates },
  series: [
    { type: 'candlestick', data: data.candleData },
    { type: 'line', data: data.indicators.BOLL.upper },
    { type: 'line', data: data.indicators.BOLL.mid },
    { type: 'line', data: data.indicators.BOLL.lower }
  ]
});
```

### Real-time API Integration

```typescript
import * as echarts from 'echarts';
import { getPrice, BOLL, TAQ } from 'ashare-typescript';

// Fetch data
const data = await getPrice('sh000001', undefined, 60, '1d');

// Calculate indicators
const close = data.map(d => d.close);
const high = data.map(d => d.high);
const low = data.map(d => d.low);
const { upper, mid, lower } = BOLL(close, 20, 2);
const { up, mid: taqMid, down } = TAQ(high, low, 20);

// Create chart
const chart = echarts.init(document.getElementById('chart'));
chart.setOption({
  xAxis: { data: data.map(d => d.time.toISOString().split('T')[0]) },
  series: [
    { type: 'candlestick', data: data.map(d => [d.open, d.close, d.low, d.high]) },
    { type: 'line', data: upper, name: 'BOLL Upper' },
    { type: 'line', data: mid, name: 'BOLL Mid' },
    { type: 'line', data: lower, name: 'BOLL Lower' }
  ]
});
```

### Backend (Node.js - Generate Images)

```bash
npm install echarts canvas
```

```typescript
import * as echarts from 'echarts';
import { createCanvas } from 'canvas';
import { getPrice, BOLL } from 'ashare-typescript';

// Fetch data
const data = await getPrice('sh000001', undefined, 60, '1d');
const close = data.map(d => d.close);
const { upper, mid, lower } = BOLL(close, 20, 2);

// Create chart on canvas
const canvas = createCanvas(800, 600);
const chart = echarts.init(canvas as any);

chart.setOption({
  // ... chart configuration
});

// Save as PNG
const buffer = canvas.toBuffer('image/png');
require('fs').writeFileSync('chart.png', buffer);
```

## Customization

### Change Color Scheme

```javascript
// In chart configuration
lineStyle: { color: '#your-color', width: 2 }
```

### Add More Indicators

```javascript
// Calculate and add to series
const { k, d, j } = KDJ(close, high, low);

series: [
  // ... existing series
  { name: 'K', type: 'line', data: k },
  { name: 'D', type: 'line', data: d }
]
```

### Responsive Design

```javascript
window.addEventListener('resize', () => {
  chart.resize();
});
```

### Change Stock Symbol

Edit `fetchRealData.ts`:

```typescript
// Change to any supported symbol
const stockData = await getPrice('sh600519', undefined, 60, '1d'); // 贵州茅台
// or
const stockData = await getPrice('sz399006', undefined, 60, '1d'); // 创业板指
```

## More Indicators

ECharts supports many more visualizations:

- **MACD**: Bar + line combination
- **KDJ**: Three-line oscillator
- **RSI**: Range-bound indicator
- **Volume**: Bar chart overlay
- **MA Combinations**: Multiple moving averages

See [ECharts Documentation](https://echarts.apache.org/en/option.html) for more options.

## Resources

- [Apache ECharts](https://echarts.apache.org/)
- [ECharts Examples](https://echarts.apache.org/examples/)
- [Ashare TypeScript](../../README_TYPESCRIPT.md)
