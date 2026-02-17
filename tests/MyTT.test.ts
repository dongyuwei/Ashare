/**
 * Unit tests for MyTT Technical Indicators
 */

import {
  COUNT,
  EVERY,
  LAST,
  EXIST,
  BARSLAST,
  SLOPE,
  FORCAST,
  CROSS,
  MACD,
  KDJ,
  RSI,
  WR,
  BIAS,
  BOLL,
  PSY,
  CCI,
  ATR,
  BBI,
  DMI,
  TAQ,
  TRIX,
  VR,
  EMV,
  DPO,
  BRAR,
  DMA,
  MTM,
  ROC
} from '../src/MyTT';

describe('MyTT Technical Indicators', () => {
  const close = [10, 11, 12, 11, 13, 14, 13, 15, 16, 15];
  const high = [11, 12, 13, 12, 14, 15, 14, 16, 17, 16];
  const low = [9, 10, 11, 10, 12, 13, 12, 14, 15, 14];
  const open = [9.5, 10.5, 11.5, 10.5, 12.5, 13.5, 12.5, 14.5, 15.5, 14.5];
  const volume = [1000, 1100, 1200, 1100, 1300, 1400, 1300, 1500, 1600, 1500];

  describe('Level 1 Application Functions', () => {
    describe('COUNT', () => {
      it('should count true values over N periods', () => {
        const boolArr = [true, false, true, true, false];
        const result = COUNT(boolArr, 3);
        expect(isNaN(result[0])).toBe(true);
        expect(isNaN(result[1])).toBe(true);
        expect(result[2]).toBe(2);
        expect(result[4]).toBe(2);
      });
    });

    describe('EVERY', () => {
      it('should check if all values are true over N periods', () => {
        const boolArr = [true, true, true, false, true];
        const result = EVERY(boolArr, 3);
        expect(result[2]).toBe(true);
        expect(result[3]).toBe(false);
      });
    });

    describe('LAST', () => {
      it('should check condition from A to B periods ago', () => {
        const boolArr = [true, true, true, true, true];
        expect(LAST(boolArr, 3, 1)).toBe(true);
      });
    });

    describe('EXIST', () => {
      it('should check if condition exists in last N periods', () => {
        const boolArr = [false, false, true, false, false];
        const result = EXIST(boolArr, 3);
        expect(result[2]).toBe(true);
        expect(result[4]).toBe(true);
      });
    });

    describe('BARSLAST', () => {
      it('should calculate bars since last true condition', () => {
        const boolArr = [true, false, false, false, true, false];
        expect(BARSLAST(boolArr)).toBe(1);
      });

      it('should return -1 if no true condition', () => {
        const boolArr = [false, false, false];
        expect(BARSLAST(boolArr)).toBe(-1);
      });
    });

    describe('SLOPE', () => {
      it('should calculate linear regression slope', () => {
        const data = [1, 2, 3, 4, 5];
        const result = SLOPE(data, 5);
        expect(result.slope).toBeGreaterThan(0);
      });

      it('should return line when RS is true', () => {
        const data = [1, 2, 3, 4, 5];
        const result = SLOPE(data, 5, true);
        expect(result.line).toBeDefined();
        expect(result.line?.length).toBe(5);
      });
    });

    describe('FORCAST', () => {
      it('should forecast next value', () => {
        const data = [1, 2, 3, 4, 5];
        const result = FORCAST(data, 5);
        expect(result).toBeGreaterThan(5);
      });
    });

    describe('CROSS', () => {
      it('should detect crossovers', () => {
        const s1 = [1, 2, 3, 4, 5];
        const s2 = [5, 4, 3, 2, 1];
        const result = CROSS(s1, s2);
        expect(result.some(r => r === true)).toBe(true);
      });
    });
  });

  describe('Level 2 Technical Indicators', () => {
    describe('MACD', () => {
      it('should calculate MACD indicator', () => {
        const result = MACD(close, 12, 26, 9);
        expect(result.dif.length).toBe(close.length);
        expect(result.dea.length).toBe(close.length);
        expect(result.macd.length).toBe(close.length);
      });

      it('should use default parameters', () => {
        const result = MACD(close);
        expect(result.dif.length).toBe(close.length);
      });
    });

    describe('KDJ', () => {
      it('should calculate KDJ indicator', () => {
        const result = KDJ(close, high, low, 9, 3, 3);
        expect(result.k.length).toBe(close.length);
        expect(result.d.length).toBe(close.length);
        expect(result.j.length).toBe(close.length);
      });

      it('should use default parameters', () => {
        const result = KDJ(close, high, low);
        expect(result.k.length).toBe(close.length);
      });
    });

    describe('RSI', () => {
      it('should calculate RSI indicator', () => {
        const result = RSI(close, 24);
        expect(result.length).toBe(close.length);
      });

      it('should use default parameters', () => {
        const result = RSI(close);
        expect(result.length).toBe(close.length);
      });

      it('should return values between 0 and 100', () => {
        const result = RSI(close);
        const validValues = result.filter(v => !isNaN(v));
        validValues.forEach(v => {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        });
      });
    });

    describe('WR (Williams %R)', () => {
      it('should calculate WR indicator', () => {
        const result = WR(close, high, low, 10, 6);
        expect(result.wr.length).toBe(close.length);
        expect(result.wr1.length).toBe(close.length);
      });

      it('should use default parameters', () => {
        const result = WR(close, high, low);
        expect(result.wr.length).toBe(close.length);
      });
    });

    describe('BIAS', () => {
      it('should calculate BIAS indicator', () => {
        const result = BIAS(close, 6, 12, 24);
        expect(result.bias1.length).toBe(close.length);
        expect(result.bias2.length).toBe(close.length);
        expect(result.bias3.length).toBe(close.length);
      });
    });

    describe('BOLL', () => {
      it('should calculate Bollinger Bands', () => {
        const result = BOLL(close, 20, 2);
        expect(result.upper.length).toBe(close.length);
        expect(result.mid.length).toBe(close.length);
        expect(result.lower.length).toBe(close.length);
      });

      it('should have upper >= mid >= lower', () => {
        const result = BOLL(close);
        for (let i = 0; i < close.length; i++) {
          if (!isNaN(result.upper[i])) {
            expect(result.upper[i]).toBeGreaterThanOrEqual(result.mid[i]);
            expect(result.mid[i]).toBeGreaterThanOrEqual(result.lower[i]);
          }
        }
      });
    });

    describe('PSY', () => {
      it('should calculate PSY indicator', () => {
        const result = PSY(close, 12, 6);
        expect(result.psy.length).toBe(close.length);
        expect(result.psyma.length).toBe(close.length);
      });
    });

    describe('CCI', () => {
      it('should calculate CCI indicator', () => {
        const result = CCI(close, high, low, 14);
        expect(result.length).toBe(close.length);
      });
    });

    describe('ATR', () => {
      it('should calculate ATR indicator', () => {
        const result = ATR(close, high, low, 20);
        expect(result.length).toBe(close.length);
      });
    });

    describe('BBI', () => {
      it('should calculate BBI indicator', () => {
        const result = BBI(close, 3, 6, 12, 20);
        expect(result.length).toBe(close.length);
      });
    });

    describe('DMI', () => {
      it('should calculate DMI indicator', () => {
        const result = DMI(close, high, low, 14, 6);
        expect(result.pdi.length).toBe(close.length);
        expect(result.mdi.length).toBe(close.length);
        expect(result.adx.length).toBe(close.length);
        expect(result.adxr.length).toBe(close.length);
      });
    });

    describe('TAQ (Turtle Channel)', () => {
      it('should calculate TAQ indicator', () => {
        const result = TAQ(high, low, 20);
        expect(result.up.length).toBe(high.length);
        expect(result.mid.length).toBe(high.length);
        expect(result.down.length).toBe(high.length);
      });

      it('should have up >= mid >= down', () => {
        const result = TAQ(high, low, 5);
        for (let i = 0; i < high.length; i++) {
          if (!isNaN(result.up[i])) {
            expect(result.up[i]).toBeGreaterThanOrEqual(result.mid[i]);
            expect(result.mid[i]).toBeGreaterThanOrEqual(result.down[i]);
          }
        }
      });
    });

    describe('TRIX', () => {
      it('should calculate TRIX indicator', () => {
        const result = TRIX(close, 12, 20);
        expect(result.trix.length).toBe(close.length);
        expect(result.trma.length).toBe(close.length);
      });
    });

    describe('VR', () => {
      it('should calculate VR indicator', () => {
        const result = VR(close, volume, 26);
        expect(result.length).toBe(close.length);
      });
    });

    describe('EMV', () => {
      it('should calculate EMV indicator', () => {
        const result = EMV(high, low, volume, 14, 9);
        expect(result.emv.length).toBe(high.length);
        expect(result.maemv.length).toBe(high.length);
      });
    });

    describe('DPO', () => {
      it('should calculate DPO indicator', () => {
        const result = DPO(close, 20, 10, 6);
        expect(result.dpo.length).toBe(close.length);
        expect(result.madpo.length).toBe(close.length);
      });
    });

    describe('BRAR', () => {
      it('should calculate BRAR indicator', () => {
        const result = BRAR(open, close, high, low, 26);
        expect(result.ar.length).toBe(close.length);
        expect(result.br.length).toBe(close.length);
      });
    });

    describe('DMA', () => {
      it('should calculate DMA indicator', () => {
        const result = DMA(close, 10, 50, 10);
        expect(result.dif.length).toBe(close.length);
        expect(result.difma.length).toBe(close.length);
      });
    });

    describe('MTM', () => {
      it('should calculate MTM indicator', () => {
        const result = MTM(close, 12, 6);
        expect(result.mtm.length).toBe(close.length);
        expect(result.mtmma.length).toBe(close.length);
      });
    });

    describe('ROC', () => {
      it('should calculate ROC indicator', () => {
        const result = ROC(close, 12, 6);
        expect(result.roc.length).toBe(close.length);
        expect(result.maroc.length).toBe(close.length);
      });
    });
  });
});
