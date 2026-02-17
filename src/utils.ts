/**
 * Utility functions for data processing
 */

/**
 * Round numbers to specified decimal places
 * @param n - Number or array of numbers to round
 * @param d - Decimal places (default: 3)
 * @returns Rounded number or array
 */
export function RD(n: number | number[], d: number = 3): number | number[] {
  if (Array.isArray(n)) {
    return n.map(val => Math.round(val * Math.pow(10, d)) / Math.pow(10, d));
  }
  return Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
}

/**
 * Get the N-th value from the end of a sequence
 * @param s - Array of numbers
 * @param n - Position from end (default: 1)
 * @returns The N-th value from the end
 */
export function RET(s: number[], n: number = 1): number {
  return s[s.length - n];
}

/**
 * Calculate absolute values
 * @param s - Number or array of numbers
 * @returns Absolute value(s)
 */
export function ABS(s: number | number[]): number | number[] {
  if (Array.isArray(s)) {
    return s.map(val => Math.abs(val));
  }
  return Math.abs(s);
}

/**
 * Element-wise maximum of two arrays or numbers
 * @param s1 - First number or array
 * @param s2 - Second number or array
 * @returns Element-wise maximum
 */
export function MAX(s1: number[], s2: number[]): number[] {
  return s1.map((val, i) => Math.max(val, s2[i]));
}

/**
 * Element-wise minimum of two arrays or numbers
 * @param s1 - First number or array
 * @param s2 - Second number or array
 * @returns Element-wise minimum
 */
export function MIN(s1: number[], s2: number[]): number[] {
  return s1.map((val, i) => Math.min(val, s2[i]));
}

/**
 * Element-wise maximum of an array with a constant
 * @param s - Array of numbers
 * @param n - Constant number
 * @returns Element-wise maximum
 */
export function MAX_CONST(s: number[], n: number): number[] {
  return s.map(val => Math.max(val, n));
}

/**
 * Element-wise minimum of an array with a constant
 * @param s - Array of numbers
 * @param n - Constant number
 * @returns Element-wise minimum
 */
export function MIN_CONST(s: number[], n: number): number[] {
  return s.map(val => Math.min(val, n));
}

/**
 * Calculate simple moving average
 * @param s - Array of numbers
 * @param n - Period
 * @returns Simple moving average array
 */
export function MA(s: number[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (i < n - 1) {
      result.push(NaN);
    } else {
      const sum = s.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / n);
    }
  }
  return result;
}

/**
 * Reference (shift) function - shift array by N positions
 * @param s - Array of numbers
 * @param n - Shift amount (default: 1)
 * @returns Shifted array
 */
export function REF(s: number[], n: number = 1): number[] {
  const result: number[] = new Array(s.length).fill(NaN);
  for (let i = n; i < s.length; i++) {
    result[i] = s[i - n];
  }
  return result;
}

/**
 * Calculate difference between consecutive elements
 * @param s - Array of numbers
 * @param n - Difference period (default: 1)
 * @returns Difference array
 */
export function DIFF(s: number[], n: number = 1): number[] {
  const result: number[] = new Array(s.length).fill(NaN);
  for (let i = n; i < s.length; i++) {
    result[i] = s[i] - s[i - n];
  }
  return result;
}

/**
 * Calculate standard deviation
 * @param s - Array of numbers
 * @param n - Period
 * @returns Standard deviation array
 */
export function STD(s: number[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (i < n - 1) {
      result.push(NaN);
    } else {
      const slice = s.slice(i - n + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / n;
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
      result.push(Math.sqrt(variance));
    }
  }
  return result;
}

/**
 * Conditional function - element-wise if-else
 * @param sBool - Boolean condition array
 * @param sTrue - Value if true (array or constant)
 * @param sFalse - Value if false (array or constant)
 * @returns Result array
 */
export function IF(sBool: boolean[], sTrue: number[] | number, sFalse: number[] | number): number[] {
  const trueArr = Array.isArray(sTrue) ? sTrue : new Array(sBool.length).fill(sTrue);
  const falseArr = Array.isArray(sFalse) ? sFalse : new Array(sBool.length).fill(sFalse);
  return sBool.map((cond, i) => cond ? trueArr[i] : falseArr[i]);
}

/**
 * Calculate rolling sum
 * @param s - Array of numbers
 * @param n - Period
 * @returns Rolling sum array
 */
export function SUM(s: number[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (i < n - 1) {
      result.push(NaN);
    } else {
      result.push(s.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0));
    }
  }
  return result;
}

/**
 * Calculate highest high value over N periods
 * @param s - Array of numbers
 * @param n - Period
 * @returns Highest high array
 */
export function HHV(s: number[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (i < n - 1) {
      result.push(NaN);
    } else {
      result.push(Math.max(...s.slice(i - n + 1, i + 1)));
    }
  }
  return result;
}

/**
 * Calculate lowest low value over N periods
 * @param s - Array of numbers
 * @param n - Period
 * @returns Lowest low array
 */
export function LLV(s: number[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (i < n - 1) {
      result.push(NaN);
    } else {
      result.push(Math.min(...s.slice(i - n + 1, i + 1)));
    }
  }
  return result;
}

/**
 * Calculate exponential moving average
 * @param s - Array of numbers
 * @param n - Period
 * @returns EMA array
 */
export function EMA(s: number[], n: number): number[] {
  const result: number[] = [];
  const k = 2 / (n + 1);
  
  for (let i = 0; i < s.length; i++) {
    if (i === 0) {
      result.push(s[i]);
    } else {
      result.push(s[i] * k + result[i - 1] * (1 - k));
    }
  }
  return result;
}

/**
 * Calculate simple moving average (Chinese SMA)
 * @param s - Array of numbers
 * @param n - Period
 * @param m - Smoothing factor (default: 1)
 * @returns SMA array
 */
export function SMA(s: number[], n: number, m: number = 1): number[] {
  const result: number[] = [];
  const alpha = m / n;
  
  for (let i = 0; i < s.length; i++) {
    if (i === 0) {
      result.push(s[i]);
    } else {
      result.push(s[i] * alpha + result[i - 1] * (1 - alpha));
    }
  }
  return result;
}

/**
 * Calculate average deviation
 * @param s - Array of numbers
 * @param n - Period
 * @returns Average deviation array
 */
export function AVEDEV(s: number[], n: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < s.length; i++) {
    if (i < n - 1) {
      result.push(NaN);
    } else {
      const slice = s.slice(i - n + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / n;
      const avgDev = slice.reduce((sum, val) => sum + Math.abs(val - mean), 0) / n;
      result.push(avgDev);
    }
  }
  return result;
}
