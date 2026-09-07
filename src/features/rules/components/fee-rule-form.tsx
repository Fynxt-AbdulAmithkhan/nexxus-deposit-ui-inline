import { Box, Button, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DEMO_CURRENCIES, DEMO_PSPS } from '../defaults';
import type { ChargeFeeType, DemoFeeComponent, DemoFeeRule } from '../types';
import { ChipGroup, CountriesInput, Field, Input, Select } from './primitives';

type Props = {
    rule: DemoFeeRule;
    onSave: (rule: DemoFeeRule) => void;
    onCancel: () => void;
};

const PSP_IDS = DEMO_PSPS.map((psp) => psp.id);
const pspLabel = (id: string) => DEMO_PSPS.find((psp) => psp.id === id)?.name ?? id;

/** Parse a numeric input, treating blank as "not set". */
function num(value: string): number | undefined {
    if (value.trim() === '') return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export function FeeRuleForm({ rule, onSave, onCancel }: Props) {
    const [draft, setDraft] = useState<DemoFeeRule>(rule);

    const patch = (next: Partial<DemoFeeRule>) => setDraft((prev) => ({ ...prev, ...next }));

    function patchComponent(index: number, next: Partial<DemoFeeComponent>) {
        setDraft((prev) => {
            const components = [...prev.components];
            components[index] = { ...components[index], ...next };
            return { ...prev, components };
        });
    }

    function addComponent() {
        patch({ components: [...draft.components, { type: 'PERCENTAGE', amount: 1 }] });
    }

    function removeComponent(index: number) {
        patch({ components: draft.components.filter((_, i) => i !== index) });
    }

    const valid = draft.name.trim().length > 0 && draft.pspIds.length > 0 && draft.components.length > 0;

    return (
        <Box borderWidth='1px' borderColor='brand.emphasized' borderRadius='md' p={4} bg='bg.subtle'>
            <Flex direction='column' gap={3}>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                    <Field label='Rule name'>
                        <Input value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
                    </Field>

                    <Field label='Charge type'>
                        <Select
                            value={draft.chargeFeeType}
                            onChange={(e) => patch({ chargeFeeType: e.target.value as ChargeFeeType })}
                        >
                            <option value='INCLUSIVE'>INCLUSIVE (deducted)</option>
                            <option value='EXCLUSIVE'>EXCLUSIVE (added)</option>
                        </Select>
                    </Field>

                    <Field label='Currency'>
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
                    hint='The rule is only charged when it covers the customer country. This is the field bug 98223 was about.'
                >
                    <CountriesInput value={draft.countries} onChange={(countries) => patch({ countries })} />
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

                <Box>
                    <Flex align='center' justify='space-between' mb={1.5}>
                        <Text fontSize='xs' fontWeight='medium' color='fg.muted'>
                            Components
                        </Text>
                        <Button size='xs' variant='outline' onClick={addComponent}>
                            <Plus size={12} /> Add
                        </Button>
                    </Flex>

                    <Flex direction='column' gap={2}>
                        {draft.components.map((component, index) => (
                            <Flex key={index} align='flex-end' gap={2}>
                                <Box flex='0 0 130px'>
                                    <Field label='Type'>
                                        <Select
                                            value={component.type}
                                            onChange={(e) =>
                                                patchComponent(index, {
                                                    type: e.target.value as DemoFeeComponent['type'],
                                                })
                                            }
                                        >
                                            <option value='PERCENTAGE'>PERCENTAGE</option>
                                            <option value='FIXED'>FIXED</option>
                                        </Select>
                                    </Field>
                                </Box>

                                <Box flex={1}>
                                    <Field label={component.type === 'PERCENTAGE' ? 'Rate %' : 'Amount'}>
                                        <Input
                                            type='number'
                                            value={String(component.amount)}
                                            onChange={(e) =>
                                                patchComponent(index, { amount: num(e.target.value) ?? 0 })
                                            }
                                        />
                                    </Field>
                                </Box>

                                {component.type === 'PERCENTAGE' && (
                                    <>
                                        <Box flex={1}>
                                            <Field label='Min %'>
                                                <Input
                                                    type='number'
                                                    value={component.minValue == null ? '' : String(component.minValue)}
                                                    onChange={(e) =>
                                                        patchComponent(index, { minValue: num(e.target.value) })
                                                    }
                                                />
                                            </Field>
                                        </Box>
                                        <Box flex={1}>
                                            <Field label='Max %'>
                                                <Input
                                                    type='number'
                                                    value={component.maxValue == null ? '' : String(component.maxValue)}
                                                    onChange={(e) =>
                                                        patchComponent(index, { maxValue: num(e.target.value) })
                                                    }
                                                />
                                            </Field>
                                        </Box>
                                    </>
                                )}

                                <Button
                                    size='xs'
                                    variant='ghost'
                                    colorPalette='red'
                                    onClick={() => removeComponent(index)}
                                    disabled={draft.components.length === 1}
                                >
                                    <Trash2 size={12} />
                                </Button>
                            </Flex>
                        ))}
                    </Flex>

                    <Text fontSize='2xs' color='fg.subtle' mt={1.5}>
                        Min/Max clamp a percentage component, and the backend applies them as percentages of the
                        transaction amount — not as currency floors or ceilings on the fee.
                    </Text>
                </Box>

                <Flex gap={2} justify='flex-end' pt={1}>
                    <Button size='sm' variant='ghost' onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button size='sm' colorPalette='brand' disabled={!valid} onClick={() => onSave(draft)}>
                        Save rule
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
}
