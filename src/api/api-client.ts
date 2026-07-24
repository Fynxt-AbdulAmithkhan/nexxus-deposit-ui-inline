import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios';
import { createApiError } from './errors';
import type { ApiEnvelope, ApiRequestConfig, ApiResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const API_PREFIX = import.meta.env.VITE_NEXXUS_API_PREFIX ?? '';

/**
 * Auth injected on every non-public request. The brand service resolves the
 * brand + environment from the environment secret token, so a single
 * `x-secret-token` header is all that's required.
 */
function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const secretToken = import.meta.env.VITE_SECRET_TOKEN;
    if (secretToken) headers['x-secret-token'] = secretToken;
    return headers;
}

/** Unwrap the brand-service `{ data, message, status }` envelope when present. */
function unwrap<T>(body: unknown): T {
    if (body && typeof body === 'object' && 'data' in body) {
        return (body as ApiEnvelope<T>).data;
    }
    return body as T;
}

class ApiClient {
    private client: AxiosInstance;

    constructor(baseURL: string = `${BASE_URL}${API_PREFIX}`) {
        this.client = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            const custom = config as InternalAxiosRequestConfig & ApiRequestConfig;
            if (!custom.skipAuth && config.headers) {
                Object.assign(config.headers, authHeaders());
            }
            if (custom.headers && config.headers) {
                Object.assign(config.headers, custom.headers);
            }
            return config;
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => Promise.reject(createApiError(error)),
        );
    }

    async get<T = unknown>(
        url: string,
        config?: AxiosRequestConfig & ApiRequestConfig,
    ): Promise<ApiResponse<T>> {
        const response = await this.client.get(url, config);
        return { data: unwrap<T>(response.data), status: response.status };
    }

    async post<T = unknown, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig & ApiRequestConfig,
    ): Promise<ApiResponse<T>> {
        const response = await this.client.post(url, data, config);
        return { data: unwrap<T>(response.data), status: response.status };
    }
}

export const apiClient = new ApiClient();
export { ApiClient };
