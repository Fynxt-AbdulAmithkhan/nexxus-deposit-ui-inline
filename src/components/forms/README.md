# Form Components with Floating Labels

This directory contains form components that support floating labels, providing a modern and elegant user interface.

## Components

### Input Component
- **Location**: `input/input.tsx`
- **Features**: Floating labels, icons, validation, help text
- **Props**: All standard input props plus `shouldFloat?: boolean`

### Select Component  
- **Location**: `select/select.tsx`
- **Features**: Floating labels, search functionality, icons, validation
- **Props**: All standard select props plus `shouldFloat?: boolean`

### MultiSelect Component
- **Location**: `multi-select/multi-select.tsx`
- **Features**: Floating labels, multiple selection, badge display, search
- **Props**: All standard multi-select props plus `shouldFloat?: boolean`

## Floating Label Feature

The floating label feature is controlled by the `shouldFloat` prop:

- **`shouldFloat={true}`** (default): Label floats above the input when focused or has value
- **`shouldFloat={false}`**: Traditional label positioned above the input field

### Styling

The floating labels use consistent styling defined in `floatingLabelStyles`:

```typescript
const floatingLabelStyles = defineStyle({
  pos: 'absolute',
  bg: 'bg',
  top: '-6',
  transition: 'position',
  color: 'fg.muted',
  fontFamily: 'heading',
  fontSize: '2xs',
  fontWeight: 'regular',
  zIndex: 1,
  '&[data-float]': {
    top: '-2.5',
    insetStart: '2',
    color: 'fg.muted',
    fontFamily: 'heading',
    fontSize: '2xs',
    fontWeight: 'regular',
  },
});
```

## Usage Examples

### Basic Input with Floating Label
```tsx
<Input
  label="Email Address"
  placeholder="Enter your email"
  type="email"
  required
  shouldFloat
/>
```

### Select with Floating Label
```tsx
<Select
  label="Country"
  placeholder="Select a country"
  options={countryOptions}
  required
  shouldFloat
/>
```

### MultiSelect with Floating Label
```tsx
<MultiSelect
  label="Skills"
  placeholder="Select your skills"
  options={skillOptions}
  maxVisible={2}
  required
  shouldFloat
/>
```

### Traditional Labels (Non-Floating)
```tsx
<Input
  label="Traditional Label"
  placeholder="This has a traditional label"
  shouldFloat={false}
/>
```

## Demo

See `demo.tsx` for a complete example showcasing all components with floating labels.