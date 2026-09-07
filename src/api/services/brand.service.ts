import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../endpoints';
import type { Brand, Environment } from '../service.types';
import type { ApiResponse } from '../types';

/**
 * Brand and environment lookups, so the harness can be pointed at a specific brand
 * rather than only the one the secret token belongs to.
 */
export const BrandService = {
    getBrands: (): Promise<ApiResponse<Brand[]>> =>
        apiClient.get<Brand[]>(API_ENDPOINTS.brands.list(), { skipBrandEnv: true }),
};

export const EnvironmentService = {
    getEnvironmentsByBrand: (brandId: string): Promise<ApiResponse<Environment[]>> =>
        apiClient.get<Environment[]>(API_ENDPOINTS.environments.listByBrand(brandId), {
            skipBrandEnv: true,
        }),
};
