import type { ReactNode } from 'react';
import { ChakraProvider } from './chakra-provider';
import { QueryProvider } from './query-provider';

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <QueryProvider>
            <ChakraProvider>{children}</ChakraProvider>
        </QueryProvider>
    );
}
