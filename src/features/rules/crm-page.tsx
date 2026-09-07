import { Badge, Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { AlertTriangle, Pencil, Plus, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { countryFlag } from '../deposit/countries';
import { DEMO } from '../deposit/demo';
import { FeeRuleForm } from './components/fee-rule-form';
import { LimitRuleForm } from './components/limit-rule-form';
import { DEPOSIT_ACTION_ID, pspName } from './defaults';
import {
    deleteFeeRule,
    deleteTransactionLimit,
    newId,
    resetRules,
    saveFeeRule,
    saveTransactionLimit,
    setBehaviourMode,
    useRulesState,
} from './store';
import type { DemoFeeRule, DemoTransactionLimit } from './types';

function countriesLabel(countries: string[]): string {
    if (countries.length === 0) return 'all countries';
    return countries.map((code) => countryFlag(code) + ' ' + code).join(', ');
}

function feeSummary(rule: DemoFeeRule): string {
    const components = rule.components
        .map((c) => (c.type === 'PERCENTAGE' ? c.amount + '%' : c.amount + ' ' + rule.currency))
        .join(' + ');
    return [rule.currency, countriesLabel(rule.countries), rule.pspIds.map(pspName).join(', '), components]
        .filter(Boolean)
        .join('  ·  ');
}

function limitSummary(limit: DemoTransactionLimit): string {
    const action = limit.actions.find((a) => a.flowActionId === DEPOSIT_ACTION_ID);
    const band = action
        ? 'min ' +
          (action.minAmount == null ? '-' : action.minAmount) +
          ' / max ' +
          (action.maxAmount == null ? '-' : action.maxAmount)
        : 'no band for the deposit action';
    const tags = limit.customerTags.length === 0 ? 'all tags' : limit.customerTags.join(', ');
    return [limit.currency, countriesLabel(limit.countries), tags, limit.pspIds.map(pspName).join(', '), band].join(
        '  ·  ',
    );
}

function emptyFeeRule(): DemoFeeRule {
    return {
        id: newId('fee'),
        name: '',
        chargeFeeType: 'INCLUSIVE',
        currency: 'USD',
        countries: [],
        pspIds: [],
        components: [{ type: 'PERCENTAGE', amount: 1 }],
        enabled: true,
    };
}

function emptyLimit(): DemoTransactionLimit {
    return {
        id: newId('limit'),
        name: '',
        currency: 'USD',
        countries: [],
        customerTags: [],
        pspIds: [],
        actions: [{ flowActionId: DEPOSIT_ACTION_ID, minAmount: undefined, maxAmount: undefined }],
        enabled: true,
    };
}

function RuleRow({
    title,
    summary,
    enabled,
    onEdit,
    onDelete,
    onToggle,
}: {
    title: string;
    summary: string;
    enabled: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) {
    return (
        <Flex
            align='center'
            gap={3}
            borderWidth='1px'
            borderColor='border'
            borderRadius='md'
            px={3}
            py={2.5}
            bg='bg'
            opacity={enabled ? 1 : 0.55}
        >
            <Box flex={1} minW={0}>
                <Flex align='center' gap={2}>
                    <Text fontSize='sm' fontWeight='semibold' truncate>
                        {title || '(unnamed)'}
                    </Text>
                    {!enabled && (
                        <Badge size='sm' colorPalette='gray'>
                            disabled
                        </Badge>
                    )}
                </Flex>
                <Text fontSize='xs' color='fg.muted' truncate>
                    {summary}
                </Text>
            </Box>

            <Button size='xs' variant='ghost' onClick={onToggle}>
                {enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button size='xs' variant='ghost' onClick={onEdit}>
                <Pencil size={12} />
            </Button>
            <Button size='xs' variant='ghost' colorPalette='red' onClick={onDelete}>
                <Trash2 size={12} />
            </Button>
        </Flex>
    );
}

function Section({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description: string;
    action: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Box borderWidth='1px' borderColor='border' borderRadius='lg' p={5} bg='bg'>
            <Flex align='flex-start' justify='space-between' gap={3} mb={3}>
                <Box>
                    <Heading size='sm'>{title}</Heading>
                    <Text fontSize='xs' color='fg.muted' mt={0.5}>
                        {description}
                    </Text>
                </Box>
                {action}
            </Flex>
            <VStack align='stretch' gap={2}>
                {children}
            </VStack>
        </Box>
    );
}

export function CrmPage() {
    const { config, mode } = useRulesState();
    const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
    const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
    const [draftFee, setDraftFee] = useState<DemoFeeRule | null>(null);
    const [draftLimit, setDraftLimit] = useState<DemoTransactionLimit | null>(null);

    const legacy = mode === 'legacy';

    return (
        <Flex direction='column' align='center' py={{ base: 6, md: 10 }} px={4}>
            <Box w='full' maxW='860px'>
                <Heading size='xl' mb={1}>
                    Transaction Rules
                </Heading>
                <Text color='fg.muted' mb={6}>
                    Demo stand-in for CRM &gt; Payment &gt; Transaction Rule. Rules saved here drive the deposit
                    flow in the CP tab.
                </Text>

                {!DEMO && (
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
                            <AlertTriangle size={16} />
                        </Box>
                        <Text fontSize='xs' color='fg.muted'>
                            <b>Live mode.</b> The deposit flow is calling the real brand service, so the rules
                            below are not used — they only drive the flow when <b>VITE_DEMO=true</b>. To change
                            live behaviour, configure the real rules in CRM &gt; Payment &gt; Transaction Rule.
                        </Text>
                    </Flex>
                )}

                <Box
                    borderWidth='1px'
                    borderColor={legacy ? 'border.error' : 'brand.emphasized'}
                    bg={legacy ? 'error.subtle' : 'brand.subtle'}
                    borderRadius='md'
                    p={4}
                    mb={6}
                >
                    <Flex align='flex-start' gap={2} mb={3}>
                        <Box color={legacy ? 'fg.error' : 'brand.fg'} mt='2px'>
                            {legacy ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                        </Box>
                        <Box>
                            <Text fontSize='sm' fontWeight='semibold' color={legacy ? 'fg.error' : 'brand.fg'}>
                                Engine behaviour: {legacy ? 'legacy (bug 98223)' : 'fixed'}
                            </Text>
                            <Text fontSize='xs' color={legacy ? 'fg.error' : 'brand.fg'} mt={0.5}>
                                {legacy
                                    ? 'Reproduces what is deployed today: fees ignore their configured countries, and a limit outside its scope removes the PSP entirely.'
                                    : 'Matches the NEX-98223 fix: a rule outside its configured country, currency or tag scope is skipped, and only the amount can reject a transaction.'}
                            </Text>
                        </Box>
                    </Flex>

                    <Flex gap={2}>
                        <Button
                            size='xs'
                            colorPalette={legacy ? 'gray' : 'brand'}
                            variant={legacy ? 'outline' : 'solid'}
                            onClick={() => setBehaviourMode('fixed')}
                        >
                            Fixed behaviour
                        </Button>
                        <Button
                            size='xs'
                            colorPalette={legacy ? 'red' : 'gray'}
                            variant={legacy ? 'solid' : 'outline'}
                            onClick={() => setBehaviourMode('legacy')}
                        >
                            Legacy behaviour
                        </Button>
                        <Box flex={1} />
                        <Button size='xs' variant='ghost' onClick={resetRules}>
                            <RotateCcw size={12} /> Reset rules
                        </Button>
                    </Flex>
                </Box>

                <VStack align='stretch' gap={5}>
                    <Section
                        title='Fees management'
                        description='Charged on top of (exclusive) or out of (inclusive) the deposit amount.'
                        action={
                            <Button
                                size='xs'
                                colorPalette='brand'
                                onClick={() => {
                                    setDraftFee(emptyFeeRule());
                                    setEditingFeeId(null);
                                }}
                            >
                                <Plus size={12} /> Add fee
                            </Button>
                        }
                    >
                        {draftFee && (
                            <FeeRuleForm
                                rule={draftFee}
                                onCancel={() => setDraftFee(null)}
                                onSave={(rule) => {
                                    saveFeeRule(rule);
                                    setDraftFee(null);
                                }}
                            />
                        )}

                        {config.feeRules.length === 0 && !draftFee && (
                            <Text fontSize='sm' color='fg.muted'>
                                No fee rules configured.
                            </Text>
                        )}

                        {config.feeRules.map((rule) =>
                            editingFeeId === rule.id ? (
                                <FeeRuleForm
                                    key={rule.id}
                                    rule={rule}
                                    onCancel={() => setEditingFeeId(null)}
                                    onSave={(next) => {
                                        saveFeeRule(next);
                                        setEditingFeeId(null);
                                    }}
                                />
                            ) : (
                                <RuleRow
                                    key={rule.id}
                                    title={rule.name + '  [' + rule.chargeFeeType + ']'}
                                    summary={feeSummary(rule)}
                                    enabled={rule.enabled}
                                    onEdit={() => setEditingFeeId(rule.id)}
                                    onDelete={() => deleteFeeRule(rule.id)}
                                    onToggle={() => saveFeeRule({ ...rule, enabled: !rule.enabled })}
                                />
                            ),
                        )}
                    </Section>

                    <Section
                        title='Transaction limits'
                        description='Min/max bands per PSP. Currency, country and tag are scope only — they must never reject a deposit on their own.'
                        action={
                            <Button
                                size='xs'
                                colorPalette='brand'
                                onClick={() => {
                                    setDraftLimit(emptyLimit());
                                    setEditingLimitId(null);
                                }}
                            >
                                <Plus size={12} /> Add limit
                            </Button>
                        }
                    >
                        {draftLimit && (
                            <LimitRuleForm
                                limit={draftLimit}
                                onCancel={() => setDraftLimit(null)}
                                onSave={(limit) => {
                                    saveTransactionLimit(limit);
                                    setDraftLimit(null);
                                }}
                            />
                        )}

                        {config.transactionLimits.length === 0 && !draftLimit && (
                            <Text fontSize='sm' color='fg.muted'>
                                No transaction limits configured.
                            </Text>
                        )}

                        {config.transactionLimits.map((limit) =>
                            editingLimitId === limit.id ? (
                                <LimitRuleForm
                                    key={limit.id}
                                    limit={limit}
                                    onCancel={() => setEditingLimitId(null)}
                                    onSave={(next) => {
                                        saveTransactionLimit(next);
                                        setEditingLimitId(null);
                                    }}
                                />
                            ) : (
                                <RuleRow
                                    key={limit.id}
                                    title={limit.name}
                                    summary={limitSummary(limit)}
                                    enabled={limit.enabled}
                                    onEdit={() => setEditingLimitId(limit.id)}
                                    onDelete={() => deleteTransactionLimit(limit.id)}
                                    onToggle={() =>
                                        saveTransactionLimit({ ...limit, enabled: !limit.enabled })
                                    }
                                />
                            ),
                        )}
                    </Section>
                </VStack>
            </Box>
        </Flex>
    );
}
