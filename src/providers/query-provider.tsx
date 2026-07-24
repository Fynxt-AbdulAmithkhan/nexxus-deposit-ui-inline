import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
    const queryClient = useMemo(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 5 * 60 * 1000,
                    },
                    mutations: { retry: 0 },
                },
            }),
        [],
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
