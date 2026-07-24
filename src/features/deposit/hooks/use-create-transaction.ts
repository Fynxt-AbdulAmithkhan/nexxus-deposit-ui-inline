import { useMutation } from '@tanstack/react-query';
import { DepositService } from '../services/deposit.service';
import type { CreateTransactionRequest, CreateTransactionResponse } from '../types';

/** Mutation wrapping POST /transactions. */
export function useCreateTransaction() {
    return useMutation<CreateTransactionResponse, Error, CreateTransactionRequest>({
        mutationFn: (body) => DepositService.createTransaction(body),
    });
}
