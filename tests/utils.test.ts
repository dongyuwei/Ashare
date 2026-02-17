/**
 * Unit tests for utility functions
 */

import {
  RD,
  RET,
  ABS,
  MAX,
  MIN,
  MA,
  REF,
  DIFF,
  STD,
  IF,
  SUM,
  HHV,
  LLV,
  EMA,
  SMA,
  AVEDEV
} from '../src/utils';

describe('Utility Functions', () => {
  const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const testData2 = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  describe('RD (Round)', () => {
    it('should round a single number', () => {
      expect(RD(3.14159, 2)).toBe(3.14);
      expect(RD(3.14159, 3)).toBe(3.142);
    });

    it('should round an array of numbers', () => {
      const result = RD([1.234, 2.567, 3.891], 2);
      expect(result).toEqual([1.23, 2.57, 3.89]);
    });

    it('should default to 3 decimal places', () => {
      expect(RD(3.14159)).toBe(3.142);
    });
  });

  describe('RET (Return N-th value from end)', () => {
    it('should return last value by default', () => {
      expect(RET(testData)).toBe(10);
    });

    it('should return N-th value from end', () => {
      expect(RET(testData, 2)).toBe(9);
      expect(RET(testData, 5)).toBe(6);
    });
  });

  describe('ABS (Absolute value)', () => {
    it('should return absolute value of single number', () => {
      expect(ABS(-5)).toBe(5);
      expect(ABS(5)).toBe(5);
    });

    it('should return absolute values of array', () => {
      expect(ABS([-1, -2, 3, -4])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('MAX (Element-wise maximum)', () => {
    it('should return element-wise maximum', () => {
      const result = MAX(testData, testData2);
      expect(result).toEqual([10, 9, 8, 7, 6, 6, 7, 8, 9, 10]);
    });
  });

  describe('MIN (Element-wise minimum)', () => {
    it('should return element-wise minimum', () => {
      const result = MIN(testData, testData2);
      expect(result).toEqual([1, 2, 3, 4, 5, 5, 4, 3, 2, 1]);
    });
  });

  describe('MA (Moving Average)', () => {
    it('should calculate simple moving average', () => {
      const result = MA(testData, 3);
      // First 2 values should be NaN
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(2);  // avg(1, 2, 3)
      expect(result[3]).toBe(3);  // avg(2, 3, 4)
      expect(result[9]).toBe(9);  // avg(8, 9, 10)
    });

    it('should handle period of 1', () => {
      const result = MA(testData, 1);
      expect(result).toEqual(testData);
    });
  });

  describe('REF (Reference/Shift)', () => {
    it('should shift array by N positions', () => {
      const result = REF(testData, 2);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(1);
      expect(result[9]).toBe(8);
    });

    it('should default to shift of 1', () => {
      const result = REF(testData);
      expect(isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(1);
      expect(result[9]).toBe(9);
    });
  });

  describe('DIFF (Difference)', () => {
    it('should calculate difference between consecutive elements', () => {
      const result = DIFF(testData);
      expect(isNaN(result[0])).toBe(true);
      expect(result[1]).toBe(1);
      expect(result[9]).toBe(1);
    });

    it('should handle custom period', () => {
      const result = DIFF(testData, 2);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(2);
      expect(result[9]).toBe(2);
    });
  });

  describe('STD (Standard Deviation)', () => {
    it('should calculate standard deviation', () => {
      const result = STD(testData, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBeCloseTo(0.8165, 4);
    });
  });

  describe('IF (Conditional)', () => {
    it('should apply conditional logic', () => {
      const cond = [true, false, true, false, true];
      const tVal = [1, 2, 3, 4, 5];
      const fVal = [10, 20, 30, 40, 50];
      const result = IF(cond, tVal, fVal);
      expect(result).toEqual([1, 20, 3, 40, 5]);
    });

    it('should handle constants', () => {
      const cond = [true, false, true];
      const result = IF(cond, 1, 0);
      expect(result).toEqual([1, 0, 1]);
    });
  });

  describe('SUM (Rolling Sum)', () => {
    it('should calculate rolling sum', () => {
      const result = SUM(testData, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(6);
      expect(result[9]).toBe(27);
    });
  });

  describe('HHV (Highest High Value)', () => {
    it('should calculate highest value over N periods', () => {
      const result = HHV(testData, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(3);
      expect(result[9]).toBe(10);
    });
  });

  describe('LLV (Lowest Low Value)', () => {
    it('should calculate lowest value over N periods', () => {
      const result = LLV(testData, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBe(1);
      expect(result[9]).toBe(8);
    });
  });

  describe('EMA (Exponential Moving Average)', () => {
    it('should calculate EMA', () => {
      const result = EMA(testData, 3);
      expect(result[0]).toBe(1);
      expect(result.length).toBe(10);
    });
  });

  describe('SMA (Simple Moving Average)', () => {
    it('should calculate SMA', () => {
      const result = SMA(testData, 3);
      expect(result[0]).toBe(1);
      expect(result.length).toBe(10);
    });
  });

  describe('AVEDEV (Average Deviation)', () => {
    it('should calculate average deviation', () => {
      const result = AVEDEV(testData, 3);
      expect(isNaN(result[0])).toBe(true);
      expect(isNaN(result[1])).toBe(true);
      expect(result[2]).toBeGreaterThan(0);
    });
  });
});
