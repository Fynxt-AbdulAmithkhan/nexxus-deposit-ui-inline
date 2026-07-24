import type { ApiErrorResponse } from './types';

export class ApiError extends Error {
    public statusCode: number;
    public response?: ApiErrorResponse;
    public originalError?: unknown;

    constructor(
        message: string,
        statusCode = 500,
        response?: ApiErrorResponse,
        originalError?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.response = response;
        this.originalError = originalError;
    }

    getErrorMessage(): string {
        return this.response?.message || this.response?.error || this.message || 'An unknown error occurred';
    }

    getValidationErrors(): Record<string, string[]> | null {
        return this.response?.errors || null;
    }

    isAuthError(): boolean {
        return this.statusCode === 401;
    }

    isForbiddenError(): boolean {
        return this.statusCode === 403;
    }

    isNetworkError(): boolean {
        return this.statusCode === 0;
    }
}

export function createApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
        const axiosLike = error as {
            isAxiosError?: boolean;
            code?: string;
            message?: string;
            response?: { status?: number; data?: ApiErrorResponse; statusText?: string };
        };

        if (axiosLike.isAxiosError) {
            const hasResponse = typeof axiosLike.response === 'object' && axiosLike.response !== null;
            if (!hasResponse) {
                const message = axiosLike.code === 'ECONNABORTED' ? 'Request timed out' : 'Network error';
                return new ApiError(message, 0, undefined, error);
            }
            const statusCode = axiosLike.response?.status || 500;
            const response = axiosLike.response?.data;
            const message =
                response?.message ||
                response?.error ||
                axiosLike.response?.statusText ||
                axiosLike.message ||
                'An error occurred';
            return new ApiError(message, statusCode, response, error);
        }
    }

    if (error instanceof Error) {
        return new ApiError(error.message, 500, undefined, error);
    }

    return new ApiError('An unknown error occurred', 500, undefined, error);
}
