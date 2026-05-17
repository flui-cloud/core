/**
 * Prometheus API Response Interfaces
 * Based on Prometheus HTTP API specification
 */

export interface PrometheusInstantQueryResponse {
  status: 'success' | 'error';
  data?: {
    resultType: 'matrix' | 'vector' | 'scalar' | 'string';
    result: PrometheusQueryResult[];
  };
  error?: string;
  errorType?: string;
  warnings?: string[];
}

export interface PrometheusRangeQueryResponse {
  status: 'success' | 'error';
  data?: {
    resultType: 'matrix' | 'vector';
    result: PrometheusQueryResult[];
  };
  error?: string;
  errorType?: string;
  warnings?: string[];
}

export interface PrometheusQueryResult {
  metric: Record<string, string>;
  value?: [number, string]; // [timestamp, value]
  values?: Array<[number, string]>; // For range queries
}

export interface PrometheusTargetsResponse {
  status: 'success' | 'error';
  data?: {
    activeTargets: PrometheusActiveTarget[];
    droppedTargets: PrometheusDroppedTarget[];
  };
}

export interface PrometheusActiveTarget {
  discoveredLabels: Record<string, string>;
  labels: Record<string, string>;
  scrapePool: string;
  scrapeUrl: string;
  globalUrl: string;
  lastError: string;
  lastScrape: string;
  lastScrapeDuration: number;
  health: 'up' | 'down' | 'unknown';
  scrapeInterval: string;
  scrapeTimeout: string;
}

export interface PrometheusDroppedTarget {
  discoveredLabels: Record<string, string>;
}
