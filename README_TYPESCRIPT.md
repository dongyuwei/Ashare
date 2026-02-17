# Ashare TypeScript

TypeScript implementation of Ashare stock data API with comprehensive technical indicators support.

This is a TypeScript port of the [Ashare Python library](https://github.com/mpquant/Ashare) and [MyTT](https://github.com/mpquant/MyTT), providing real-time A-share stock data retrieval and technical analysis capabilities.

## Features

- **Dual-core data source**: Sina Finance + Tencent Stock APIs with automatic failover
- **Multiple timeframes**: Daily (1d), weekly (1w), monthly (1M), minute (1m, 5m, 15m, 30m, 60m)
- **40+ technical indicators**: MACD, KDJ, RSI, BOLL, DMI, ATR, and many more
- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Well-tested**: Unit tests for all utility functions and indicators
- **Lightweight**: Minimal dependencies, only requires axios for HTTP requests

## Installation

```bash
npm install
```

## Usage

### Basic Stock Data Retrieval

```typescript
import { getPrice, MA, BOLL } from 'ashare-typescript';

// Fetch daily data
const data = await getPrice('sh000001', undefined, 10, '1d');
console.log(data);
// Output: [{ time: Date, open: number, close: number, high: number, low: number, volume: number }, ...]

// Calculate 5-day moving average
const closePrices = data.map(d => d.close);
const ma5 = MA(closePrices, 5);

// Calculate Bollinger Bands
const { upper, mid, lower } = BOLL(closePrices, 20, 2);
```

### Technical Indicators

```typescript
import { MACD, KDJ, RSI, ATR } from 'ashare-typescript';

// MACD Indicator
const { dif, dea, macd } = MACD(closePrices, 12, 26, 9);

// KDJ Indicator
const { k, d, j } = KDJ(closePrices, highPrices, lowPrices, 9, 3, 3);

// RSI Indicator
const rsi = RSI(closePrices, 14);

// ATR (Volatility)
const atr = ATR(closePrices, highPrices, lowPrices, 14);
```

### Stock Code Formats

The API supports multiple stock code formats:

```typescript
// All of these are valid
await getPrice('sh000001');        // Shanghai Composite Index
await getPrice('000001.XSHG');     // Same as above
await getPrice('sz399006');        // ChiNext Index
await getPrice('399006.XSHE');     // Same as above
await getPrice('600519.XSHG');     // Kweichow Moutai
```

## Available Functions

### Stock Data API

- `getPrice(code, endDate?, count?, frequency?, fields?)` - Main function to retrieve stock data
- `getPriceDayTx(code, endDate?, count?, frequency?)` - Tencent daily/weekly/monthly data
- `getPriceMinTx(code, endDate?, count?, frequency?)` - Tencent minute data
- `getPriceSina(code, endDate?, count?, frequency?)` - Sina Finance data
- `normalizeCode(code)` - Normalize stock code format

### Utility Functions (Level 0)

- `RD(n, d?)` - Round to decimal places
- `RET(s, n?)` - Get N-th value from end
- `ABS(s)` - Absolute value
- `MAX(s1, s2)` - Element-wise maximum
- `MIN(s1, s2)` - Element-wise minimum
- `MA(s, n)` - Simple moving average
- `REF(s, n?)` - Shift array
- `DIFF(s, n?)` - Difference
- `STD(s, n)` - Standard deviation
- `IF(bool, t, f)` - Conditional
- `SUM(s, n)` - Rolling sum
- `HHV(s, n)` - Highest high value
- `LLV(s, n)` - Lowest low value
- `EMA(s, n)` - Exponential moving average
- `SMA(s, n, m?)` - Simple moving average (Chinese style)
- `AVEDEV(s, n)` - Average deviation

### Technical Indicators (Level 2)

- `MACD(close, short?, long?, m?)` - MACD indicator
- `KDJ(close, high, low, n?, m1?, m2?)` - Stochastic oscillator
- `RSI(close, n?)` - Relative strength index
- `WR(close, high, low, n?, n1?)` - Williams %R
- `BIAS(close, l1?, l2?, l3?)` - Bias ratio
- `BOLL(close, n?, p?)` - Bollinger bands
- `PSY(close, n?, m?)` - Psychological line
- `CCI(close, high, low, n?)` - Commodity channel index
- `ATR(close, high, low, n?)` - Average true range
- `BBI(close, m1?, m2?, m3?, m4?)` - Bull and bear index
- `DMI(close, high, low, m1?, m2?)` - Directional movement index
- `TAQ(high, low, n)` - Turtle trading channel
- `TRIX(close, m1?, m2?)` - Triple exponential average
- `VR(close, vol, m1?)` - Volume ratio
- `EMV(high, low, vol, n?, m?)` - Ease of movement
- `DPO(close, m1?, m2?, m3?)` - Detrended price oscillator
- `BRAR(open, close, high, low, m1?)` - Sentiment indicator
- `DMA(close, n1?, n2?, m?)` - Different of moving average
- `MTM(close, n?, m?)` - Momentum
- `ROC(close, n?, m?)` - Rate of change

### Application Functions (Level 1)

- `COUNT(sBool, n)` - Count true values
- `EVERY(sBool, n)` - Check if all values are true
- `LAST(sBool, a, b)` - Check condition from A to B periods ago
- `EXIST(sBool, n?)` - Check if condition exists
- `BARSLAST(sBool)` - Bars since last true condition
- `SLOPE(s, n, rs?)` - Linear regression slope
- `FORCAST(s, n)` - Forecast next value
- `CROSS(s1, s2)` - Detect crossovers

## Running Examples

```bash
# Demo 1: Basic usage
npm run dev

# Demo 2: Advanced indicators
npx ts-node Demo2.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
Ashare/
├── src/
│   ├── index.ts          # Main exports
│   ├── Ashare.ts         # Stock data retrieval
│   ├── MyTT.ts           # Technical indicators
│   ├── utils.ts          # Utility functions
│   └── types.ts          # Type definitions
├── tests/
│   ├── utils.test.ts     # Utility function tests
│   ├── MyTT.test.ts      # Indicator tests
│   └── Ashare.test.ts    # Stock API tests
├── Demo1.ts              # Basic usage example
├── Demo2.ts              # Advanced indicators example
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Data Sources

This library uses two data sources with automatic failover:

1. **Sina Finance** (Primary): `money.finance.sina.com.cn`
2. **Tencent** (Backup): `web.ifzq.gtimg.cn`

If one source fails, the library automatically falls back to the other.

## License

MIT

## Acknowledgments

- Original Python implementation: [mpquant/Ashare](https://github.com/mpquant/Ashare)
- Technical indicators: [mpquant/MyTT](https://github.com/mpquant/MyTT)
