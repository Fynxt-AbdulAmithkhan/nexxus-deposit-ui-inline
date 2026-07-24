import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CUSTOMER_PROFILE, NEXXUS_METHOD, REQUEST_CONTEXT, WALLETS } from './config';
import { CountrySelector } from './components/country-selector';
import { DepositForm } from './components/deposit-form';
import { IframePayment } from './components/iframe-payment';
import { PspList } from './components/psp-list';
import { WalletSelector } from './components/wallet-selector';
import { useCreateTransaction } from './hooks/use-create-transaction';
import { useCurrencies } from './hooks/use-currencies';
import { useFetchPsp } from './hooks/use-fetch-psp';
import type { CreateTransactionRequest, FetchPspRequest, PspInfo } from './types';
import { convert, getRate } from './utils/conversion';

/** Debounce (ms) before an amount/currency change triggers a fetch-psp call. */
const AUTO_FETCH_DEBOUNCE = 500;

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <Flex
            align='center'
            gap={2}
            mt={4}
            p={3}
            borderWidth='1px'
            borderColor='border.error'
            bg='error.subtle'
            borderRadius='md'
        >
            <Box color='fg.error'>
                <AlertTriangle size={16} />
            </Box>
            <Text fontSize='sm' color='fg.error'>
                {message}
            </Text>
        </Flex>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return (
        <Box borderWidth='1px' borderColor='border' borderRadius='lg' p={5} bg='bg'>
            {children}
        </Box>
    );
}

export function DepositPage() {
    const [walletId, setWalletId] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('');
    const [country, setCountry] = useState<string>(REQUEST_CONTEXT.country);

    const [requestId, setRequestId] = useState<string | null>(null);
    const [psps, setPsps] = useState<PspInfo[]>([]);
    const [selectedPspId, setSelectedPspId] = useState<string | null>(null);
    const [sessionUrl, setSessionUrl] = useState<string | null>(null);
    const [debouncePending, setDebouncePending] = useState(false);

    const wallet = useMemo(() => WALLETS.find((w) => w.id === walletId) ?? null, [walletId]);
    const { currencies, usingFallback } = useCurrencies(wallet?.supportedCurrencies ?? []);

    const fetchPsp = useFetchPsp();
    const createTransaction = useCreateTransaction();

    // Keep the selection valid. Preserve an already-valid choice; otherwise, if the
    // wallet's own currency is among the supported options, auto-select it. Fall back
    // to the "Select currency" placeholder when neither applies.
    useEffect(() => {
        if (!wallet) return;
        const options = currencies.length > 0 ? currencies : wallet.supportedCurrencies;
        setCurrency((prev) => {
            if (prev && options.includes(prev)) return prev;
            if (options.includes(wallet.currency)) return wallet.currency;
            return '';
        });
    }, [wallet, currencies]);

    // On wallet change, if the newly-picked wallet's currency is supported, select it
    // immediately (overriding any previous choice) so the dropdown mirrors the wallet.
    function handleWalletChange(id: string) {
        setWalletId(id);
        const nextWallet = WALLETS.find((w) => w.id === id);
        if (!nextWallet) return;
        const options = currencies.length > 0 ? currencies : nextWallet.supportedCurrencies;
        if (options.includes(nextWallet.currency)) setCurrency(nextWallet.currency);
    }

    const amountNum = Number(amount);
    const convertedAmount = useMemo(() => {
        if (!wallet || !currency || !(amountNum > 0)) return 0;
        return round2(convert(amountNum, wallet.currency, currency));
    }, [wallet, currency, amountNum]);

    const authConfigured =
        Boolean(import.meta.env.VITE_SECRET_TOKEN) ||
        import.meta.env.VITE_AUTH_VIA_PROXY === 'true';
    const canFetch = Boolean(wallet && currency && amountNum > 0 && convertedAmount > 0);

    // Auto-fetch PSPs whenever the wallet, currency, or (converted) amount changes.
    // Any input change clears the current PSP selection.
    useEffect(() => {
        setSelectedPspId(null);

        if (!canFetch || !wallet) {
            setDebouncePending(false);
            setPsps([]);
            setRequestId(null);
            return;
        }

        const payload: FetchPspRequest = {
            amount: convertedAmount,
            currency,
            actionId: REQUEST_CONTEXT.actionId,
            country,
            customerId: REQUEST_CONTEXT.customerId,
            customerTag: REQUEST_CONTEXT.customerTag,
            customerAccountType: REQUEST_CONTEXT.customerAccountType,
        };

        setDebouncePending(true);
        const timer = setTimeout(() => {
            fetchPsp.mutate(payload, {
                onSuccess: (res) => {
                    setRequestId(res.requestId);
                    setPsps(res.psps ?? []);
                },
                onError: () => {
                    setPsps([]);
                    setRequestId(null);
                },
                onSettled: () => setDebouncePending(false),
            });
        }, AUTO_FETCH_DEBOUNCE);

        return () => clearTimeout(timer);
        // fetchPsp.mutate is stable; re-run only when the inputs change.
    }, [walletId, currency, convertedAmount, country]);

    // Only the Submit button triggers the transaction API.
    async function handleSubmit() {
        const psp = psps.find((p) => p.id === selectedPspId);
        if (!requestId || !wallet || !psp || createTransaction.isPending) return;

        const now = Date.now();
        const externalRequestId = `extn_${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
        const conversionRate = getRate(wallet.currency, psp.currency);

        const payload: CreateTransactionRequest = {
            requestId,
            pspId: psp.id,
            flowActionId: psp.flowActionId ?? REQUEST_CONTEXT.actionId,
            flowTargetId: psp.flowTarget?.flowTargetId,
            flowDefinitionId: psp.flowDefinitionId ?? psp.flowDefintionId,
            externalRequestId,
            transactionType: REQUEST_CONTEXT.transactionType,
            txnCurrency: psp.currency,
            txnAmount: psp.totalAmount,
            txnFee: psp.appliedFeeAmount ?? 0,
            executePayload: {
                body: {
                    order: {
                        id: String(now),
                        money: { amount: psp.totalAmount, currency: psp.currency },
                        crmData: { amount: amountNum, currency: wallet.currency, conversionRate },
                        timestamp: String(now),
                    },
                    customer: {
                        id: CUSTOMER_PROFILE.id,
                        firstName: CUSTOMER_PROFILE.firstName,
                        lastName: CUSTOMER_PROFILE.lastName,
                        email: CUSTOMER_PROFILE.email,
                        phone: CUSTOMER_PROFILE.phone,
                        address: CUSTOMER_PROFILE.address,
                    },
                    language: CUSTOMER_PROFILE.language,
                    customAttributes: {},
                },
            },
        };
        try {
            const res = await createTransaction.mutateAsync(payload);
            if (res.sessionUrl) {
                setSessionUrl(res.sessionUrl);
                // The requestId (fetch-psp token) is single-use. Reset the form in the
                // background so the next deposit runs a fresh fetch-psp for a new one.
                setAmount('');
                setCurrency('');
                setPsps([]);
                setRequestId(null);
                setSelectedPspId(null);
            }
        } catch {
            /* surfaced via createTransaction.error */
        }
    }

    const loadingPsps = fetchPsp.isPending || debouncePending;

    return (
        <Box position='relative' minH='100vh'>
            <Box
                position='absolute'
                top={{ base: 4, md: 6 }}
                right={{ base: 4, md: 6 }}
                zIndex={1}
            >
                <CountrySelector value={country} onChange={setCountry} />
            </Box>

            <Flex minH='100vh' direction='column' align='center' py={{ base: 6, md: 12 }} px={4}>
            <Box w='full' maxW='560px'>
                <Heading size='xl' mb={1}>
                    Deposit
                </Heading>
                <Text color='fg.muted' mb={6}>
                    Fund your account with {NEXXUS_METHOD.name}. Pick a wallet and amount — providers update
                    as you change the currency.
                </Text>

                {!authConfigured && (
                    <Flex
                        align='flex-start'
                        gap={2}
                        mb={6}
                        p={3}
                        borderWidth='1px'
                        borderColor='border'
                        bg='bg.muted'
                        borderRadius='md'
                    >
                        <Box color='fg.muted' mt='2px'>
                            <ShieldCheck size={16} />
                        </Box>
                        <Text fontSize='xs' color='fg.muted'>
                            No secret token configured. Set <b>VITE_SECRET_TOKEN</b> in <b>.env</b> to reach the
                            backend — the UI works, but API calls will be rejected until then.
                        </Text>
                    </Flex>
                )}

                <VStack align='stretch' gap={5}>
                    <Card>
                        <WalletSelector wallets={WALLETS} value={walletId} onChange={handleWalletChange} />
                    </Card>

                    {wallet && (
                        <Card>
                            <DepositForm
                                wallet={wallet}
                                currencies={currencies}
                                currency={currency}
                                onCurrencyChange={setCurrency}
                                amount={amount}
                                onAmountChange={setAmount}
                                convertedAmount={convertedAmount}
                                usingFallbackCurrencies={usingFallback}
                            />
                        </Card>
                    )}

                    {canFetch && (
                        <Box>
                            <PspList
                                psps={psps}
                                loading={loadingPsps}
                                selectedPspId={selectedPspId}
                                onSelect={(psp) => setSelectedPspId(psp.id)}
                            />

                            {psps.length > 0 && (
                                <Button
                                    colorPalette='brand'
                                    size='lg'
                                    w='full'
                                    mt={4}
                                    loading={createTransaction.isPending}
                                    disabled={!selectedPspId}
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </Button>
                            )}

                            {fetchPsp.isError && <ErrorBanner message={fetchPsp.error.message} />}
                            {createTransaction.isError && (
                                <ErrorBanner message={createTransaction.error.message} />
                            )}
                        </Box>
                    )}
                </VStack>
            </Box>

            <IframePayment
                isOpen={Boolean(sessionUrl)}
                url={sessionUrl ?? ''}
                onClose={() => setSessionUrl(null)}
            />
            </Flex>
        </Box>
    );
}
