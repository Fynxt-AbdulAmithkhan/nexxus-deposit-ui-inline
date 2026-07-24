import { useMutation } from '@tanstack/react-query';
import { DepositService } from '../services/deposit.service';
import type { FetchPspRequest, FetchPspResponse } from '../types';

/** Mutation wrapping POST /requests/fetch-psp. */
export function useFetchPsp() {
    return useMutation<FetchPspResponse, Error, FetchPspRequest>({
        mutationFn: (body) => DepositService.fetchPsp(body),
    });
}
