import type { CSSProperties } from 'react';

/**
 * Same shape as the CRM's IconProps, minus the FontAwesome coupling. The CRM renders
 * these through a private FontAwesome kit; this project maps the handful of names it
 * actually uses onto lucide-react (see icon.tsx).
 */
export interface IconProps {
    name: string;
    prefix?: 'fas' | 'far' | 'fal' | 'fat' | 'fad' | 'fab';
    size?:
        | '2xs'
        | 'xs'
        | 'sm'
        | 'lg'
        | 'xl'
        | '2xl'
        | '1x'
        | '2x'
        | '3x'
        | '4x'
        | '5x'
        | '6x'
        | '7x'
        | '8x'
        | '9x'
        | '10x';
    color?: string;
    className?: string;
    style?: CSSProperties;
    'aria-hidden'?: boolean | 'true' | 'false';
}
