export interface ApiErrorResponse {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
    error?: string;
}

/**
 * The brand service wraps every response in an envelope:
 * `{ status, message, data, ... }`. `T` is the shape of `data`.
 */
export interface ApiEnvelope<T = unknown> {
    data: T;
    message?: string;
    status?: number | string;
    success?: boolean;
}

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: number;
}

export interface ApiRequestConfig {
    headers?: Record<string, string>;
    /** Skip attaching the Authorization / brand / env headers (public endpoints). */
    skipAuth?: boolean;
    timeout?: number;
}
