/** Domain types mirroring the nexxus brand-service DTOs used by the deposit flow. */

export interface Wallet {
    /** Internal key. */
    id: string;
    /** Display account id shown on the card (e.g. "42911"). */
    accountId: string;
    label: string;
    /** Currency the customer holds (RequestInputDto.walletCurrency), e.g. "USD". */
    currency: string;
    balance: number;
    /** Emoji flag/icon shown on the card. */
    flag: string;
    /** Fallback list of PSP-supported currencies if GET /psps/currencies is unavailable. */
    supportedCurrencies: string[];
}

/** Body for POST /requests/fetch-psp (RequestInputDto). */
export interface FetchPspRequest {
    amount: number;
    /** PSP-supported currency; optional when walletCurrency is provided. */
    currency?: string;
    /** Wallet currency; mapped server-side to a supported currency. */
    walletCurrency?: string;
    actionId: string;
    country: string;
    customerId: string;
    customerTag: string;
    customerAccountType: string;
}

export interface FlowTargetData {
    flowTargetId: string;
    inputSchema?: string;
}

/** One entry of RequestOutputDto.psps. */
export interface PspInfo {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    brandId?: string;
    environmentId?: string;
    flowActionId?: string;
    /** NOTE: backend spells this "flowDefintionId" (typo preserved on the wire). */
    flowDefintionId?: string;
    flowDefinitionId?: string;
    currency: string;
    originalAmount: number;
    appliedFeeAmount?: number;
    totalAmount: number;
    netAmountToUser?: number;
    inclusiveFeeAmount?: number;
    exclusiveFeeAmount?: number;
    /** Wire field is `feeApplied` (Lombok/Jackson drops the `is` prefix). */
    feeApplied?: boolean;
    flowTarget?: FlowTargetData;
}

/** RequestOutputDto. */
export interface FetchPspResponse {
    requestId: string;
    psps: PspInfo[];
}

/** Body for POST /transactions (TransactionDto). */
export interface CreateTransactionRequest {
    requestId: string;
    pspId: string;
    flowActionId?: string;
    flowTargetId?: string;
    flowDefinitionId?: string;
    externalRequestId?: string;
    transactionType?: string;
    txnCurrency?: string;
    txnFee?: number;
    txnAmount?: number;
    executePayload?: Record<string, unknown>;
    customData?: Record<string, unknown>;
}

/** TransactionResponseDto. */
export interface CreateTransactionResponse {
    txnId: string;
    txnSuccess?: boolean;
    txnMeta?: unknown;
    txnError?: string;
    /** Full URL to the hosted payment widget: `${widgetUrl}/${sessionToken}`. */
    sessionUrl?: string;
}
