import { Box, Button, Heading, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { lazy, Suspense, useState } from 'react';

// Verbatim the CRM's integration: the published package, same specifier, same
// lazy default-export import.
const TransactionLimitsComponent = lazy(() =>
    import('@nexxus/transaction-component').then((module) => ({
        default: module.TransactionLimitsComponent,
    })),
);

// Empty means same-origin: the request goes to /nexxus/v1 and the Vite dev proxy
// forwards it to VITE_API_TARGET. An absolute domain is sent straight from the
// browser, which the hosted API only permits from an allowed origin.
const DEFAULT_DOMAIN = '';
const DEFAULT_TOKEN = import.meta.env.VITE_SECRET_TOKEN ?? '';

/**
 * Host for the CRM-style embed of the transaction-limits table.
 *
 * The CRM resolves domain / secretToken / brandId / environmentId / flowTypeId
 * from its own session and passes them down; here they are editable so the same
 * component can be pointed at staging, UAT or a local API.
 */
export function TransactionLimitsHost() {
    const [domain, setDomain] = useState(DEFAULT_DOMAIN);
    const [secretToken, setSecretToken] = useState(DEFAULT_TOKEN);
    const [brandId, setBrandId] = useState('');
    const [environmentId, setEnvironmentId] = useState('');
    const [flowTypeId, setFlowTypeId] = useState('');
    const [mountKey, setMountKey] = useState(0);

    return (
        <Box maxW='1200px' mx='auto' p={6}>
            <VStack align='stretch' gap={5}>
                <Box>
                    <Heading size='lg'>Transaction Limits — CRM-style embed</Heading>
                    <Text color='gray.600' fontSize='sm' mt={1}>
                        The same component contract the CRM mounts, driven entirely by props. Leave
                        the domain empty to route through the dev proxy to VITE_API_TARGET.
                    </Text>
                </Box>

                <VStack align='stretch' gap={2}>
                    <HStack gap={3}>
                        <Input
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder='domain (empty = dev proxy to VITE_API_TARGET)'
                            size='sm'
                            value={domain}
                        />
                        <Input
                            onChange={(e) => setSecretToken(e.target.value)}
                            placeholder='secretToken'
                            size='sm'
                            type='password'
                            value={secretToken}
                        />
                    </HStack>
                    <HStack gap={3}>
                        <Input
                            onChange={(e) => setBrandId(e.target.value)}
                            placeholder='brandId (optional)'
                            size='sm'
                            value={brandId}
                        />
                        <Input
                            onChange={(e) => setEnvironmentId(e.target.value)}
                            placeholder='environmentId (optional)'
                            size='sm'
                            value={environmentId}
                        />
                        <Input
                            onChange={(e) => setFlowTypeId(e.target.value)}
                            placeholder='flowTypeId (optional)'
                            size='sm'
                            value={flowTypeId}
                        />
                        <Button onClick={() => setMountKey((k) => k + 1)} size='sm'>
                            Remount
                        </Button>
                    </HStack>
                </VStack>

                {!domain.trim() && (brandId.trim() || environmentId.trim()) && (
                    <Box bg='orange.50' borderRadius='md' p={3}>
                        <Text color='orange.800' fontSize='sm'>
                            With no domain the call goes through the proxy, which only forwards
                            brand and environment when ALLOW_BRAND_OVERRIDE=true is set server-side.
                            Without it the results below are the token's own brand.
                        </Text>
                    </Box>
                )}

                <Suspense fallback={<Text fontSize='sm'>Loading component...</Text>}>
                    <TransactionLimitsComponent
                        brandId={brandId || undefined}
                        domain={domain}
                        environmentId={environmentId || undefined}
                        flowTypeId={flowTypeId || undefined}
                        key={mountKey}
                        secretToken={secretToken}
                    />
                </Suspense>

                <Text color='gray.500' fontSize='xs'>
                    Deposit / Withdrawal show a range when the action is classified, "No limits"
                    only when the row has no actions at all, and "N unlabelled" (hover for detail)
                    when actions exist that could not be classified.
                </Text>
            </VStack>
        </Box>
    );
}
