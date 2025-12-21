import { CoinGeckoMarketData, CoinGeckoChartData } from './types';

const COINGECKO_API_KEY = 'CG-2eEwdaNv1dzfgUE4zjRe5Wqe';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Helper function to make API requests using React Native's fetch with retry logic
 */
const makeRequest = async <T>(
  endpoint: string,
  params?: Record<string, string | number>,
  retries: number = 1
): Promise<T> => {
  // Build URL with query parameters
  let url = `${COINGECKO_BASE_URL}${endpoint}`;
  
  if (params) {
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    url += `?${queryString}`;
  }

  console.log(`[CoinGecko] Making request to: ${url.substring(0, 100)}...`);

  let lastError: Error | null = null;
  const timeoutMs = 30000; // 30 seconds - reasonable timeout

  for (let attempt = 0; attempt <= retries; attempt++) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    try {
      if (attempt > 0) {
        console.log(`[CoinGecko] Retry attempt ${attempt}...`);
      }

      // Use AbortController for timeout (more reliable in React Native)
      const controller = new AbortController();
      
      // Set timeout
      timeoutId = setTimeout(() => {
        console.warn(`[CoinGecko] Request timeout after ${timeoutMs}ms`);
        controller.abort();
      }, timeoutMs);

      // Create fetch promise with better error handling
      const startTime = Date.now();
      console.log(`[CoinGecko] Starting fetch at ${new Date().toISOString()}`);
      console.log(`[CoinGecko] Full URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-cg-demo-api-key': COINGECKO_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      const elapsed = Date.now() - startTime;
      console.log(`[CoinGecko] Response received in ${elapsed}ms, status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[CoinGecko] Response error: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      console.log(`[CoinGecko] Request successful, data size: ${JSON.stringify(data).length} bytes`);
      return data as T;
    } catch (error: any) {
      // Clean up timeout if still active
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastError = error;
      const errorMessage = error.name === 'AbortError' ? 'Request timeout' : error.message;
      console.error(`[CoinGecko] Request failed (attempt ${attempt + 1}/${retries + 1}):`, errorMessage);
      console.error(`[CoinGecko] Error details:`, error);
      
      // Don't retry on timeout/abort or if it's the last attempt
      if (error.name === 'AbortError' || errorMessage.includes('timeout') || attempt === retries) {
        throw new Error(errorMessage);
      }

      // Wait before retrying (exponential backoff)
      const waitTime = 2000 * (attempt + 1);
      console.log(`[CoinGecko] Waiting ${waitTime}ms before retry...`);
      await new Promise<void>(resolve => setTimeout(() => resolve(), waitTime));
    }
  }

  throw lastError || new Error('Request failed');
};

/**
 * Fetches market data for a specific coin by ID
 */
export const getCoinMarketData = async (
  coinId: string
): Promise<CoinGeckoMarketData | null> => {
  try {
    console.log(`[CoinGecko] Fetching market data for: ${coinId}`);
    
    // Simplified request - remove price_change_percentage to reduce response time
    const data = await makeRequest<CoinGeckoMarketData[]>(
      '/coins/markets',
      {
        vs_currency: 'usd',
        ids: coinId,
        // Removed price_change_percentage to speed up request
      }
    );

    if (data && data.length > 0) {
      console.log(`[CoinGecko] Market data received for ${coinId}`);
      return data[0];
    }
    console.warn(`[CoinGecko] No market data returned for ${coinId}`);
    return null;
  } catch (error) {
    console.error('[CoinGecko] Error fetching coin market data:', error);
    throw error;
  }
};

/**
 * Fetches historical chart data for a coin within a time range
 */
export const getCoinChartData = async (
  coinId: string,
  from: number,
  to: number
): Promise<CoinGeckoChartData | null> => {
  try {
    const data = await makeRequest<CoinGeckoChartData>(
      `/coins/${coinId}/market_chart/range`,
      {
        vs_currency: 'usd',
        from: String(from),
        to: String(to),
      }
    );

    return data;
  } catch (error) {
    console.error('Error fetching coin chart data:', error);
    // Return null instead of throwing to allow graceful degradation
    return null;
  }
};

/**
 * Gets chart data for a specific time period
 */
export const getChartDataForPeriod = async (
  coinId: string,
  period: '1D' | '1W' | '1M' | '1Y' | 'All'
): Promise<CoinGeckoChartData | null> => {
  const now = Math.floor(Date.now() / 1000);
  let from: number;

  switch (period) {
    case '1D':
      from = now - 24 * 60 * 60;
      break;
    case '1W':
      from = now - 7 * 24 * 60 * 60;
      break;
    case '1M':
      from = now - 30 * 24 * 60 * 60;
      break;
    case '1Y':
      from = now - 365 * 24 * 60 * 60;
      break;
    case 'All':
      from = now - 730 * 24 * 60 * 60; // 2 years
      break;
    default:
      from = now - 30 * 24 * 60 * 60; // Default to 1M
  }

  try {
    return await getCoinChartData(coinId, from, now);
  } catch (error) {
    console.error(`Error fetching chart data for period ${period}:`, error);
    return null;
  }
};

/**
 * Gets chart data for different time periods (optimized - fetches only initial period)
 */
export const getChartDataForPeriods = async (
  coinId: string,
  initialPeriod: '1D' | '1W' | '1M' | '1Y' | 'All' = '1M'
): Promise<{
  '1D': CoinGeckoChartData | null;
  '1W': CoinGeckoChartData | null;
  '1M': CoinGeckoChartData | null;
  '1Y': CoinGeckoChartData | null;
  All: CoinGeckoChartData | null;
}> => {
  try {
    // Only fetch the initial period to avoid timeout
    const initialData = await getChartDataForPeriod(coinId, initialPeriod);

    return {
      '1D': initialPeriod === '1D' ? initialData : null,
      '1W': initialPeriod === '1W' ? initialData : null,
      '1M': initialPeriod === '1M' ? initialData : null,
      '1Y': initialPeriod === '1Y' ? initialData : null,
      All: initialPeriod === 'All' ? initialData : null,
    };
  } catch (error) {
    console.error('Error fetching chart data for periods:', error);
    return {
      '1D': null,
      '1W': null,
      '1M': null,
      '1Y': null,
      All: null,
    };
  }
};

