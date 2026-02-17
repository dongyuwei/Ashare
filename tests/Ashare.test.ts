/**
 * Unit tests for Ashare Stock Data API
 */

import {
  normalizeCode,
  getPriceDayTx,
  getPriceMinTx,
  getPriceSina,
  getPrice
} from '../src/Ashare';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Ashare Stock Data API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeCode', () => {
    it('should handle XSHG suffix', () => {
      expect(normalizeCode('000001.XSHG')).toBe('sh000001');
      expect(normalizeCode('600519.XSHG')).toBe('sh600519');
    });

    it('should handle XSHE suffix', () => {
      expect(normalizeCode('000001.XSHE')).toBe('sz000001');
      expect(normalizeCode('000858.XSHE')).toBe('sz000858');
    });

    it('should handle already normalized codes', () => {
      expect(normalizeCode('sh000001')).toBe('sh000001');
      expect(normalizeCode('sz399006')).toBe('sz399006');
    });
  });

  describe('getPriceDayTx', () => {
    it('should fetch daily data from Tencent', async () => {
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              day: [
                ['2024-01-01', 3500, 3600, 3700, 3400, 1000000],
                ['2024-01-02', 3600, 3650, 3750, 3550, 1200000]
              ]
            }
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPriceDayTx('sh000001', '', 2, '1d');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        time: new Date('2024-01-01'),
        open: 3500,
        close: 3600,
        high: 3700,
        low: 3400,
        volume: 1000000
      });
    });

    it('should handle weekly data', async () => {
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              week: [
                ['2024-01-01', 3500, 3600, 3700, 3400, 5000000]
              ]
            }
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPriceDayTx('sh000001', '', 1, '1w');

      expect(result).toHaveLength(1);
    });

    it('should handle end date parameter', async () => {
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              day: [
                ['2024-01-01', 3500, 3600, 3700, 3400, 1000000]
              ]
            }
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const endDate = new Date('2024-01-01');
      await getPriceDayTx('sh000001', endDate, 1, '1d');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('2024-01-01')
      );
    });

    it('should throw error on invalid data', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: { 'sh000001': {} } }
      });

      await expect(getPriceDayTx('sh000001', '', 1, '1d')).rejects.toThrow();
    });
  });

  describe('getPriceMinTx', () => {
    it('should fetch minute data from Tencent', async () => {
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              m5: [
                ['2024-01-01 10:00', 3500, 3600, 3700, 3400, 100000, 0, 0],
                ['2024-01-01 10:05', 3600, 3650, 3750, 3550, 120000, 0, 0]
              ],
              qt: {
                'sh000001': ['', '', '', 3650]
              }
            }
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPriceMinTx('sh000001', '', 2, '5m');

      expect(result).toHaveLength(2);
      expect(result[0].open).toBe(3500);
    });

    it('should update last price with real-time data', async () => {
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              m1: [
                ['2024-01-01 10:00', 3500, 3600, 3700, 3400, 100000, 0, 0]
              ],
              qt: {
                'sh000001': ['', '', '', 3700]
              }
            }
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPriceMinTx('sh000001', '', 1, '1m');

      expect(result[0].close).toBe(3700);
    });
  });

  describe('getPriceSina', () => {
    it('should fetch data from Sina', async () => {
      const mockResponse = {
        data: [
          { day: '2024-01-01 10:00:00', open: '3500', high: '3700', low: '3400', close: '3600', volume: '1000000' },
          { day: '2024-01-01 10:05:00', open: '3600', high: '3750', low: '3550', close: '3650', volume: '1200000' }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPriceSina('sh000001', '', 2, '60m');

      expect(result).toHaveLength(2);
      expect(result[0].open).toBe(3500);
      expect(result[0].close).toBe(3600);
    });

    it('should handle string response', async () => {
      const mockResponse = {
        data: '[{"day":"2024-01-01 10:00:00","open":"3500","high":"3700","low":"3400","close":"3600","volume":"1000000"}]'
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPriceSina('sh000001', '', 1, '60m');

      expect(result).toHaveLength(1);
    });

    it('should filter by end date for daily data', async () => {
      const mockResponse = {
        data: [
          { day: '2024-01-01 00:00:00', open: '3500', high: '3700', low: '3400', close: '3600', volume: '1000000' },
          { day: '2024-01-02 00:00:00', open: '3600', high: '3800', low: '3500', close: '3700', volume: '1100000' },
          { day: '2024-01-03 00:00:00', open: '3700', high: '3900', low: '3600', close: '3800', volume: '1200000' }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const endDate = new Date('2024-01-02');
      const result = await getPriceSina('sh000001', endDate, 2, '1d');

      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getPrice', () => {
    it('should fetch daily data from Sina first', async () => {
      const mockResponse = {
        data: [
          { day: '2024-01-01 00:00:00', open: '3500', high: '3700', low: '3400', close: '3600', volume: '1000000' }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPrice('sh000001', '', 1, '1d');

      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should fallback to Tencent when Sina fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Sina API error'));
      
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              day: [
                ['2024-01-01', 3500, 3600, 3700, 3400, 1000000]
              ]
            }
          }
        }
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPrice('sh000001', '', 1, '1d');

      expect(result).toHaveLength(1);
    });

    it('should handle 1-minute data from Tencent', async () => {
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              m1: [
                ['2024-01-01 10:00', 3500, 3600, 3700, 3400, 100000, 0, 0]
              ],
              qt: { 'sh000001': ['', '', '', 3600] }
            }
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPrice('sh000001', '', 1, '1m');

      expect(result).toHaveLength(1);
    });

    it('should handle minute data with failover', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Sina API error'));
      
      const mockResponse = {
        data: {
          data: {
            'sh000001': {
              m5: [
                ['2024-01-01 10:00', 3500, 3600, 3700, 3400, 100000, 0, 0]
              ],
              qt: { 'sh000001': ['', '', '', 3600] }
            }
          }
        }
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getPrice('sh000001', '', 1, '5m');

      expect(result).toHaveLength(1);
    });

    it('should normalize code before fetching', async () => {
      const mockResponse = {
        data: [
          { day: '2024-01-01 00:00:00', open: '3500', high: '3700', low: '3400', close: '3600', volume: '1000000' }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await getPrice('000001.XSHG', '', 1, '1d');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('sh000001')
      );
    });

    it('should throw error for unsupported frequency', async () => {
      await expect(getPrice('sh000001', '', 1, 'invalid' as any)).rejects.toThrow('Unsupported frequency');
    });
  });
});
