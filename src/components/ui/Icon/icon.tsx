import { Box } from '@chakra-ui/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Info,
    MoreVertical,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
    type LucideIcon,
} from 'lucide-react';
import type { IconProps } from './icon.type';

/**
 * Drop-in replacement for the CRM's FontAwesome `Icon`.
 *
 * The CRM resolves icons through a private FontAwesome kit (`@awesome.me/kit-…`) that
 * can't be installed here, so the FontAwesome names the copied screens use are mapped
 * onto lucide-react. The props API is unchanged, so those screens need no edits.
 */
const ICONS: Record<string, LucideIcon> = {
    check: Check,
    'chevron-left': ChevronLeft,
    'chevron-right': ChevronRight,
    'circle-check': CircleCheck,
    'circle-info': Info,
    edit: Pencil,
    'ellipsis-v': MoreVertical,
    'magnifying-glass': Search,
    plus: Plus,
    times: X,
    trash: Trash2,
    x: X,
};

/** FontAwesome's relative sizes, in pixels. */
const SIZES: Record<string, number> = {
    '2xs': 10,
    xs: 12,
    sm: 14,
    '1x': 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '2x': 32,
    '3x': 48,
    '4x': 64,
    '5x': 80,
    '6x': 96,
    '7x': 112,
    '8x': 128,
    '9x': 144,
    '10x': 160,
};

export const Icon = ({ name, size, color, className, style, ...props }: IconProps) => {
    const LucideGlyph = ICONS[name];

    if (!LucideGlyph) {
        return null;
    }

    // Wrapped in a Box so Chakra colour tokens ("fg.subtle", "blue.600") resolve; the
    // glyph inherits currentColor.
    return (
        <Box
            as='span'
            display='inline-flex'
            alignItems='center'
            color={color}
            className={className}
            style={style}
            {...props}
        >
            <LucideGlyph size={size ? SIZES[size] : 16} />
        </Box>
    );
};

export default Icon;
