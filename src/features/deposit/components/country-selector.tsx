import { Box, chakra, Flex, Text } from '@chakra-ui/react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COUNTRIES, countryFlag } from '../countries';

type Props = {
    value: string;
    onChange: (country: string) => void;
};

/**
 * Searchable country combobox. Typing filters the ISO 3166-1 list by name or
 * code; the selected alpha-2 code is sent to fetch-psp.
 */
export function CountrySelector({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const activeRef = useRef<HTMLButtonElement>(null);

    const selected = useMemo(() => COUNTRIES.find((c) => c.code === value) ?? null, [value]);
    const selectedLabel = selected
        ? `${countryFlag(selected.code)} ${selected.name} (${selected.code})`
        : '';

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return COUNTRIES;
        return COUNTRIES.filter(
            (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
        );
    }, [query]);

    // Close when clicking outside the widget.
    useEffect(() => {
        function onDocMouseDown(e: MouseEvent) {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, []);

    // Reset the highlight to the top of the list whenever the results change.
    useEffect(() => setActiveIndex(0), [query]);

    // Keep the highlighted option in view while navigating with the keyboard.
    useEffect(() => {
        if (open) activeRef.current?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, open]);

    function openMenu() {
        setQuery('');
        setOpen(true);
    }

    function selectCountry(code: string) {
        onChange(code);
        setQuery('');
        setOpen(false);
        inputRef.current?.blur();
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!open) openMenu();
            else setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const choice = filtered[activeIndex];
            if (choice) selectCountry(choice.code);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    }

    return (
        <Box ref={containerRef} position='relative' minW='220px'>
            <Flex align='center' gap={1.5} mb={1.5}>
                <Globe size={14} />
                <Text fontWeight='medium' fontSize='xs' color='fg.muted'>
                    User country
                </Text>
            </Flex>

            <Flex
                align='center'
                h='36px'
                px={2}
                borderWidth='1px'
                borderColor={open ? 'brand.solid' : 'border'}
                borderRadius='md'
                bg='bg'
                cursor='text'
                onClick={() => {
                    if (!open) openMenu();
                    inputRef.current?.focus();
                }}
            >
                <chakra.input
                    ref={inputRef}
                    value={open ? query : selectedLabel}
                    placeholder={selected ? selectedLabel : 'Search country'}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!open) setOpen(true);
                    }}
                    onFocus={openMenu}
                    onKeyDown={onKeyDown}
                    flex={1}
                    minW={0}
                    h='full'
                    bg='transparent'
                    outline='none'
                    border='none'
                    fontSize='sm'
                />
                <Box color='fg.muted' flexShrink={0}>
                    <ChevronDown size={16} />
                </Box>
            </Flex>

            {open && (
                <Box
                    position='absolute'
                    top='calc(100% + 4px)'
                    left={0}
                    right={0}
                    zIndex={10}
                    maxH='260px'
                    overflowY='auto'
                    borderWidth='1px'
                    borderColor='border'
                    borderRadius='md'
                    bg='bg'
                    boxShadow='md'
                    py={1}
                >
                    {filtered.length === 0 ? (
                        <Text px={3} py={2} fontSize='sm' color='fg.muted'>
                            No countries match “{query}”.
                        </Text>
                    ) : (
                        filtered.map((c, idx) => {
                            const isSelected = c.code === value;
                            const isActive = idx === activeIndex;
                            return (
                                <chakra.button
                                    key={c.code}
                                    ref={isActive ? activeRef : undefined}
                                    type='button'
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    onClick={() => selectCountry(c.code)}
                                    display='flex'
                                    alignItems='center'
                                    gap={2}
                                    w='full'
                                    textAlign='left'
                                    px={3}
                                    py={2}
                                    fontSize='sm'
                                    cursor='pointer'
                                    bg={isActive ? 'bg.muted' : 'transparent'}
                                >
                                    <Text as='span' lineHeight='1'>
                                        {countryFlag(c.code)}
                                    </Text>
                                    <Text as='span' flex={1} minW={0} truncate>
                                        {c.name}
                                    </Text>
                                    <Text as='span' fontSize='xs' color='fg.subtle'>
                                        {c.code}
                                    </Text>
                                    {isSelected && (
                                        <Box color='brand.solid' flexShrink={0}>
                                            <Check size={14} />
                                        </Box>
                                    )}
                                </chakra.button>
                            );
                        })
                    )}
                </Box>
            )}
        </Box>
    );
}
