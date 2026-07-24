import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * Self-contained Chakra v3 system. Uses Chakra defaults plus a `brand` palette
 * (deep-blue scale borrowed from the nexxus widget) wired as the default
 * `colorPalette`, so components can use `colorPalette="brand"` and semantic
 * tokens like `brand.solid` / `brand.fg`.
 */
const config = defineConfig({
    cssVarsPrefix: 'nx',
    globalCss: {
        'html, body, #root': {
            margin: 0,
            padding: 0,
            minHeight: '100%',
            fontFamily: 'body',
            bg: 'bg.subtle',
            color: 'fg',
        },
        '*, *::before, *::after': {
            boxSizing: 'border-box',
        },
    },
    theme: {
        tokens: {
            fonts: {
                heading: { value: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
                body: { value: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' },
            },
            colors: {
                brand: {
                    50: { value: '#f6f9ff' },
                    100: { value: '#ecf2ff' },
                    200: { value: '#dde9ff' },
                    300: { value: '#c6daff' },
                    400: { value: '#a7c6ff' },
                    500: { value: '#528fff' },
                    600: { value: '#2d77ff' },
                    700: { value: '#1165ff' },
                    800: { value: '#0040b3' },
                    900: { value: '#002666' },
                    950: { value: '#001a4d' },
                },
            },
        },
        semanticTokens: {
            colors: {
                brand: {
                    solid: { value: '{colors.brand.700}' },
                    contrast: { value: '{colors.white}' },
                    fg: { value: { base: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
                    muted: { value: { base: '{colors.brand.100}', _dark: '{colors.brand.900}' } },
                    subtle: { value: { base: '{colors.brand.50}', _dark: '{colors.brand.950}' } },
                    emphasized: { value: { base: '{colors.brand.200}', _dark: '{colors.brand.800}' } },
                    focusRing: { value: '{colors.brand.600}' },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);
