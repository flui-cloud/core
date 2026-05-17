/**
 * Loki API Response Interfaces
 * Based on Loki HTTP API specification
 */

export interface LokiQueryResponse {
  status: 'success' | 'error';
  data?: {
    resultType: 'matrix' | 'streams';
    result: LokiStream[];
    stats?: LokiStats;
  };
  error?: string;
  errorType?: string;
}

export interface LokiStream {
  stream: Record<string, string>; // Label set (streams query)
  values: Array<[string, string]>; // [timestamp_ns, log_line]
}

// Loki metric query result (count_over_time, rate, etc.)
export interface LokiMetricResult {
  metric: Record<string, string>; // Group-by label set
  values: Array<[number, string]>; // [timestamp_seconds, value]
}

export interface LokiStats {
  summary: {
    bytesProcessedPerSecond: number;
    linesProcessedPerSecond: number;
    totalBytesProcessed: number;
    totalLinesProcessed: number;
    execTime: number;
    queueTime: number;
    subqueries: number;
  };
  querier: any;
  ingester: any;
  cache: any;
}

export interface LokiLabelsResponse {
  status: 'success' | 'error';
  data?: string[];
}

export interface LokiLabelValuesResponse {
  status: 'success' | 'error';
  data?: string[];
}
