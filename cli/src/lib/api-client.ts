import axios, { AxiosInstance, AxiosError } from 'axios';
import * as https from 'node:https';
import { Injectable } from '@nestjs/common';
import { NodeSizeDto } from '../../../src/modules/providers/dto/node-size.dto';

/**
 * HTTP client for Flui API communication
 * Handles authentication, error handling, and request/response formatting
 */

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  apiKey?: string;
}

export class ApiError extends Error {
  statusCode?: number;
  details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

@Injectable()
export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  /**
   * Normalize Axios errors to ApiError format
   */
  private normalizeError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any;
      return new ApiError(
        data?.message || error.message,
        error.response.status,
        data,
      );
    } else if (error.request) {
      return new ApiError(
        'API server not reachable. Please check the API URL and network connection.',
        undefined,
        error.message,
      );
    } else {
      return new ApiError(error.message);
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string): Promise<T> {
    const response = await this.client.get<T>(path);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(path, data);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(path: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(path, data);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(path, data);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: { data?: unknown }): Promise<T> {
    const response = await this.client.delete<T>(path, config);
    return response.data;
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get available node sizes/server types for a provider
   */
  async getNodeSizes(
    provider: string,
    region?: string,
    skipCache = false,
  ): Promise<NodeSizeDto[]> {
    const params = new URLSearchParams();
    if (region) {
      params.append('region', region);
    }
    if (skipCache) {
      params.append('skipCache', 'true');
    }

    const queryString = params.toString();
    const qs = queryString ? `?${queryString}` : '';
    const path = `/management/providers/${provider}/node-sizes${qs}`;

    return this.get<NodeSizeDto[]>(path);
  }

  /**
   * Clear node sizes cache for a provider
   */
  async clearNodeSizesCache(provider: string): Promise<void> {
    const path = `/management/cache/providers/${provider}/node-sizes`;
    return this.delete<void>(path);
  }
}
