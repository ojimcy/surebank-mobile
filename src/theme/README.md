# SureBank Design System

A comprehensive design system for building professional financial interfaces with React Native and NativeWind.

## Overview

The SureBank Design System provides a complete set of design tokens, components, and utilities that ensure consistency across all financial interfaces. Built with trust, security, and professional excellence in mind.

## Core Principles

### 🔒 **Trust & Security**
- Professional color palette anchored by SureBank Blue (#0066A1)
- Clean, readable typography optimized for financial data
- Consistent spacing that creates hierarchy and clarity

### 🎯 **Accessibility First**
- WCAG 2.1 AA compliant color contrasts
- Minimum 44px touch targets for mobile
- Screen reader optimized component structure

### 📱 **Mobile Optimized**
- Touch-friendly interactions and spacing
- Responsive typography scale
- Smooth micro-interactions that feel native

## Quick Start

```typescript
import { theme, colors, typography, spacing } from '@/theme';

// Use semantic colors
const primaryColor = colors.primary[500]; // #0066A1
const successColor = colors.success[500]; // #10b981

// Use typography scale
const headingStyle = typography.heading.h1;
const bodyStyle = typography.body.medium;

// Use spacing tokens
const cardPadding = spacing.spacing[4]; // 16px
```

## Design Tokens

### Colors

Our color system is built around semantic meaning and professional trust:

#### Primary Colors (SureBank Blue)
- `primary[500]`: #0066A1 - Main brand color
- `primary[600]`: #005580 - Hover states
- `primary[700]`: #004466 - Active states

#### Semantic Colors
- `success[500]`: #10b981 - Profits, positive values
- `warning[500]`: #f59e0b - Pending states, alerts
- `error[500]`: #dc2626 - Losses, errors
- `gray[*]`: Complete neutral scale

#### Financial Context Colors
```typescript
import { semanticColors } from '@/theme';

// Automatically get appropriate color for financial values
const balanceColor = semanticColors.financial(1500); // Returns success green
const lossColor = semanticColors.financial(-200);    // Returns error red
```

### Typography

Professional typography scale optimized for financial interfaces:

#### Font Families
- **Primary**: SF Pro Display (iOS) / Roboto (Android)
- **Monospace**: SF Mono / Roboto Mono (for financial numbers)

#### Typography Variants
```typescript
// Display headings
typography.display.large    // 48px, bold
typography.display.medium   // 36px, bold  
typography.display.small    // 30px, semibold

// Section headings
typography.heading.h1       // 24px, bold
typography.heading.h2       // 20px, semibold
typography.heading.h3       // 18px, semibold

// Body text
typography.body.large       // 18px, normal
typography.body.medium      // 16px, normal
typography.body.small       // 14px, normal

// Financial numbers (monospace)
typography.financial.large  // 24px, bold, mono
typography.financial.medium // 20px, semibold, mono
typography.financial.small  // 16px, medium, mono
```

### Spacing

Consistent 4px-based spacing system:

```typescript
spacing.spacing[1]   // 4px
spacing.spacing[2]   // 8px  
spacing.spacing[4]   // 16px - Base unit
spacing.spacing[6]   // 24px
spacing.spacing[8]   // 32px

// Component-specific spacing
spacing.componentSpacing.button.medium  // Button padding
spacing.componentSpacing.card.padding   // Card padding
spacing.semanticSpacing.contentGap      // Content spacing
```

## Component Variants

Pre-built component styling with consistent variants:

### Buttons
```typescript
import { buttonVariants } from '@/theme/components';

// Usage with class-variance-authority
const buttonClass = buttonVariants({
  variant: 'primary',    // primary, secondary, outline, ghost
  size: 'md',           // sm, md, lg, xl, icon
  fullWidth: true       // boolean
});
```

### Cards
```typescript
import { cardVariants } from '@/theme/components';

const cardClass = cardVariants({
  variant: 'elevated',   // default, elevated, outlined, filled
  padding: 'lg',        // none, sm, md, lg, xl
  hoverable: true       // boolean
});
```

### Financial Values
```typescript
import { financialValueVariants } from '@/theme/components';

const valueClass = financialValueVariants({
  variant: 'positive',   // neutral, positive, negative, pending
  size: 'xl',           // sm, md, lg, xl, 2xl, 3xl
  emphasis: 'high'      // low, medium, high
});
```

## Usage Examples

### Creating a Professional Card
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { cardVariants, typography, colors } from '@/theme';

const BalanceCard = ({ balance }: { balance: number }) => {
  const cardStyles = cardVariants({
    variant: 'elevated',
    padding: 'lg',
    hoverable: true
  });
  
  const balanceColor = balance >= 0 ? colors.success[500] : colors.error[500];
  
  return (
    <View className={cardStyles}>
      <Text style={typography.body.small} className="text-gray-500">
        Available Balance
      </Text>
      <Text 
        style={[typography.financial.large, { color: balanceColor }]}
        className="mt-1"
      >
        ₦{balance.toLocaleString()}
      </Text>
    </View>
  );
};
```

### Consistent Button Styling
```typescript
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { buttonVariants } from '@/theme';

const PrimaryButton = ({ title, onPress, loading }) => {
  const buttonClass = buttonVariants({
    variant: 'primary',
    size: 'lg',
    fullWidth: true
  });
  
  return (
    <TouchableOpacity 
      className={buttonClass}
      onPress={onPress}
      disabled={loading}
    >
      <Text className="text-white font-semibold">
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};
```

## Animations

Subtle, professional animations that enhance UX:

```typescript
import { animations, durations, easings } from '@/theme';

// Smooth entrance animations
const fadeIn = animations.fadeIn;
const slideInUp = animations.slideInUp;

// Financial-specific animations
const balanceReveal = animations.financialAnimations.balanceReveal;
const moneySuccess = animations.financialAnimations.moneySuccess;

// Custom timing
const customAnimation = {
  duration: durations.normal, // 250ms
  easing: easings.gentle,     // Smooth curve
};
```

## Dark Mode Support

Full dark mode support with semantic color switching:

```typescript
import { themeConfig, colors } from '@/theme';

// Automatically switches based on system preference
const backgroundColor = colors.light.background; // Light mode
const darkBackground = colors.dark.background;   // Dark mode

// Use theme config for automatic switching
const currentTheme = themeConfig.light; // or themeConfig.dark
```

## Accessibility Features

Built-in accessibility support:

```typescript
import { a11y } from '@/theme';

// Minimum touch target
const touchableHeight = a11y.minTouchTarget; // 44px

// Contrast-safe text colors
const textColor = a11y.getTextColor('#0066A1'); // Returns white or black

// High contrast mode
const highContrastColors = a11y.highContrast.light;
```

## Best Practices

### ✅ Do
- Use semantic color tokens (`colors.success[500]` instead of `#10b981`)
- Apply consistent spacing from the scale
- Use appropriate typography variants for content hierarchy
- Test with both light and dark modes
- Ensure minimum touch targets for interactive elements

### ❌ Don't
- Use arbitrary color values outside the system
- Skip spacing tokens for custom pixel values
- Mix typography scales inconsistently
- Forget to test accessibility compliance
- Override theme values without good reason

## Contributing

When extending the design system:

1. **Colors**: Add new colors to the appropriate semantic category
2. **Typography**: Ensure new variants fit the professional hierarchy
3. **Components**: Use class-variance-authority for consistent variants
4. **Spacing**: Stay within the 4px grid system
5. **Animations**: Keep transitions subtle and professional

## Integration with NativeWind

This design system is built specifically for NativeWind v4:

```typescript
// tailwind.config.js automatically includes all theme tokens
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#0066A1', // From theme/colors.ts
          // ... all other tokens
        }
      }
    }
  }
};
```

Use with className prop:
```typescript
<View className="bg-primary-500 p-4 rounded-xl shadow-card">
  <Text className="text-white font-semibold">SureBank</Text>
</View>
```

---

**SureBank Design System v1.0.0**  
*Building trust through consistent, professional design*