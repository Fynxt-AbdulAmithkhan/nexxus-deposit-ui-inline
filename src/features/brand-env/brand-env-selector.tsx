import { Box, chakra, Flex, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BrandService, EnvironmentService } from '@/api/services';
import {
    setBrandEnvSelection,
    useBrandEnvSelection,
} from '@/hooks/brand-environment.store';

const TOKEN_SCOPED = '__token__';

const Select = chakra('select', {
    base: {
        h: '30px',
        px: 1.5,
        fontSize: 'xs',
        bg: 'bg',
        borderWidth: '1px',
        borderColor: 'border',
        borderRadius: 'md',
        cursor: 'pointer',
        outline: 'none',
        maxW: '190px',
        _focus: { borderColor: 'primary.fg' },
    },
});

/**
 * Points the harness at a specific brand and environment.
 *
 * Without a selection every call runs on whatever the secret token resolves to — which is
 * why the rules shown here will not match a different brand's rules in the real CRM.
 * Choosing a brand sends X-BRAND-ID / X-ENV-ID, which the service prefers over the
 * token's own context.
 */
export function BrandEnvSelector() {
    const selection = useBrandEnvSelection();

    const brandsQuery = useQuery({
        queryKey: ['brands'],
        queryFn: async () => (await BrandService.getBrands()).data ?? [],
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const brandId = selection?.brandId ?? '';

    const environmentsQuery = useQuery({
        queryKey: ['environments', brandId],
        queryFn: async () => (await EnvironmentService.getEnvironmentsByBrand(brandId)).data ?? [],
        enabled: Boolean(brandId),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // A brand with no environment chosen yet cannot be queried, so adopt its first one.
    useEffect(() => {
        if (!selection) return;
        const environments = environmentsQuery.data;
        if (!environments || environments.length === 0) return;
        if (environments.some((env) => env.id === selection.environmentId)) return;

        const first = environments[0];
        setBrandEnvSelection({
            ...selection,
            environmentId: first.id,
            environmentName: first.name,
        });
    }, [environmentsQuery.data, selection]);

    function handleBrandChange(nextBrandId: string) {
        if (nextBrandId === TOKEN_SCOPED) {
            setBrandEnvSelection(null);
            return;
        }

        const brand = brandsQuery.data?.find((b) => b.id === nextBrandId);
        if (!brand) return;

        // The environment is filled in by the effect above once its list arrives.
        setBrandEnvSelection({
            brandId: brand.id,
            brandName: brand.name,
            environmentId: '',
            environmentName: '',
        });
    }

    function handleEnvironmentChange(nextEnvId: string) {
        if (!selection) return;
        const env = environmentsQuery.data?.find((e) => e.id === nextEnvId);
        if (!env) return;
        setBrandEnvSelection({ ...selection, environmentId: env.id, environmentName: env.name });
    }

    if (brandsQuery.isLoading) {
        return (
            <Flex align='center' gap={1.5}>
                <Spinner size='xs' />
                <Text fontSize='xs' color='fg.muted'>
                    Loading brands…
                </Text>
            </Flex>
        );
    }

    if (brandsQuery.isError) {
        return (
            <Text fontSize='xs' color='fg.error'>
                Could not load brands
            </Text>
        );
    }

    return (
        <Flex align='center' gap={2}>
            <Box>
                <Select
                    aria-label='Brand'
                    value={selection?.brandId ?? TOKEN_SCOPED}
                    onChange={(e) => handleBrandChange(e.target.value)}
                >
                    <option value={TOKEN_SCOPED}>Token&apos;s own brand</option>
                    {(brandsQuery.data ?? []).map((brand) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </Select>
            </Box>

            {selection && (
                <Box>
                    <Select
                        aria-label='Environment'
                        value={selection.environmentId}
                        onChange={(e) => handleEnvironmentChange(e.target.value)}
                        disabled={environmentsQuery.isLoading}
                    >
                        {environmentsQuery.isLoading && <option value=''>Loading…</option>}
                        {(environmentsQuery.data ?? []).map((env) => (
                            <option key={env.id} value={env.id}>
                                {env.name}
                            </option>
                        ))}
                    </Select>
                </Box>
            )}
        </Flex>
    );
}
