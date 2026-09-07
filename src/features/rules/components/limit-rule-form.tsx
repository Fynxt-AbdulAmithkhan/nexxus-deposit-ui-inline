import { Box, Button, Flex, SimpleGrid } from '@chakra-ui/react';
import { useState } from 'react';
import { DEMO_CURRENCIES, DEMO_CUSTOMER_TAGS, DEMO_PSPS, DEPOSIT_ACTION_ID } from '../defaults';
import type { DemoTransactionLimit } from '../types';
import { ChipGroup, CountriesInput, Field, Input, Select } from './primitives';

type Props = {
    limit: DemoTransactionLimit;
    onSave: (limit: DemoTransactionLimit) => void;
    onCancel: () => void;
};

const PSP_IDS = DEMO_PSPS.map((psp) => psp.id);
const pspLabel = (id: string) => DEMO_PSPS.find((psp) => psp.id === id)?.name ?? id;

function num(value: string): number | undefined {
    if (value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function LimitRuleForm({ limit, onSave, onCancel }: Props) {
    const [draft, setDraft] = useState<DemoTransactionLimit>(limit);

    const patch = (next: Partial<DemoTransactionLimit>) => setDraft((prev) => ({ ...prev, ...next }));

    const action = draft.actions.find((a) => a.flowActionId === DEPOSIT_ACTION_ID) ?? {
        flowActionId: DEPOSIT_ACTION_ID,
    };

    function patchAction(next: { minAmount?: number; maxAmount?: number }) {
        patch({
            actions: [
                ...draft.actions.filter((a) => a.flowActionId !== DEPOSIT_ACTION_ID),
                { ...action, ...next },
            ],
        });
    }

    const valid = draft.name.trim().length > 0 && draft.pspIds.length > 0;

    return (
        <Box borderWidth='1px' borderColor='brand.emphasized' borderRadius='md' p={4} bg='bg.subtle'>
            <Flex direction='column' gap={3}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                    <Field label='Limit name'>
                        <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
                    </Field>

                    <Field label='Currency' hint='A limit in another currency must not hide the PSP.'>
                        <Select value={draft.currency} onChange={(e) => patch({ currency: e.target.value })}>
                            {DEMO_CURRENCIES.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </SimpleGrid>

                <Field
                    label='Countries'
                    hint='Scope only. A limit configured for other countries must be skipped, not used to reject the PSP.'
                >
                    <CountriesInput value={draft.countries} onChange={(countries) => patch({ countries })} />
                </Field>

                <Field label='Customer tags' hint='Empty means the limit applies to every tag.'>
                    <ChipGroup
                        options={DEMO_CUSTOMER_TAGS}
                        selected={draft.customerTags}
                        onToggle={(tag) =>
                            patch({
                                customerTags: draft.customerTags.includes(tag)
                                    ? draft.customerTags.filter((t) => t !== tag)
                                    : [...draft.customerTags, tag],
                            })
                        }
                    />
                </Field>

                <Field label='PSPs'>
                    <ChipGroup
                        options={PSP_IDS}
                        selected={draft.pspIds}
                        labelFor={pspLabel}
                        onToggle={(id) =>
                            patch({
                                pspIds: draft.pspIds.includes(id)
                                    ? draft.pspIds.filter((p) => p !== id)
                                    : [...draft.pspIds, id],
                            })
                        }
                    />
                </Field>

                <SimpleGrid columns={2} gap={3}>
                    <Field label='Min amount' hint='Blank means no floor.'>
                        <Input
                            type='number'
                            value={action.minAmount == null ? '' : String(action.minAmount)}
                            onChange={(e) => patchAction({ minAmount: num(e.target.value) })}
                        />
                    </Field>
                    <Field label='Max amount' hint='Blank means no ceiling.'>
                        <Input
                            type='number'
                            value={action.maxAmount == null ? '' : String(action.maxAmount)}
                            onChange={(e) => patchAction({ maxAmount: num(e.target.value) })}
                        />
                    </Field>
                </SimpleGrid>

                <Flex gap={2} justify='flex-end' pt={1}>
                    <Button size='sm' variant='ghost' onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button size='sm' colorPalette='brand' disabled={!valid} onClick={() => onSave(draft)}>
                        Save limit
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
}
