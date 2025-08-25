# MGX TLC Platform Design Guide

## Overview
This design guide documents the visual design system for the MGX Beverage Group Total Landed Cost (TLC) platform. It provides guidelines for maintaining consistency across the application's UI components, typography, colors, and user interactions.

## Brand Identity

### Logo Usage
- **Primary Logo**: `tfi-2024-logo.svg` (MGX Beverage Group branding)
- **Usage**: Centered in headers with hover scale effect (105%)
- **Size**: `h-20 w-auto` standard, responsive scaling
- **Shadow**: `drop-shadow-md` for elevation

### Brand Colors
- **Primary Brand**: Deep blue theme representing trust and professionalism
- **Application**: TLC (Total Landed Cost Engine) text branding

## Color System

### Light Theme (Default)
```css
/* Primary Colors */
--primary: hsl(212 81% 28%)           /* Deep Blue */
--primary-foreground: hsl(210 40% 98%) /* White */

/* Background Colors */
--background: hsl(0 0% 100%)          /* Pure White */
--card: hsl(0 0% 100%)               /* White */
--foreground: hsl(212 81% 27%)       /* Dark Blue Text */

/* Secondary Colors */
--secondary: hsl(210 40% 96%)         /* Light Gray */
--muted: hsl(210 40% 96%)            /* Light Gray */
--accent: hsl(210 40% 96%)           /* Light Gray */

/* Interaction Colors */
--destructive: hsl(0 84.2% 60.2%)    /* Red for errors */
--border: hsl(214.3 31.8% 91.4%)     /* Light Border */
--input: hsl(214.3 31.8% 91.4%)      /* Input Border */
--ring: hsl(212 81% 28%)             /* Focus Ring */
```

### Dark Theme
```css
/* Primary Colors */
--primary: hsl(212 81% 35%)           /* Lighter Blue */
--primary-foreground: hsl(210 40% 98%) /* White */

/* Background Colors */
--background: hsl(215.4 16.3% 6.9%)   /* Very Dark */
--card: hsl(222.2 10.4% 12.9%)       /* Dark Card */
--foreground: hsl(210 40% 98%)       /* White Text */

/* Secondary Colors */
--secondary: hsl(217.2 32.6% 17.5%)   /* Dark Gray */
--muted: hsl(217.2 32.6% 17.5%)      /* Dark Gray */
--accent: hsl(217.2 32.6% 17.5%)     /* Dark Gray */

/* Interaction Colors */
--destructive: hsl(0 62.8% 30.6%)    /* Dark Red */
--border: hsl(217.2 32.6% 17.5%)     /* Dark Border */
--input: hsl(217.2 32.6% 17.5%)      /* Dark Input */
--ring: hsl(212 81% 35%)             /* Focus Ring */
```

### Chart Colors
- Chart 1: `hsl(12 76% 61%)` - Orange
- Chart 2: `hsl(173 58% 39%)` - Teal
- Chart 3: `hsl(197 37% 24%)` - Dark Blue
- Chart 4: `hsl(43 74% 66%)` - Yellow
- Chart 5: `hsl(27 87% 67%)` - Orange-Red

## Typography

### Font Family
```css
font-family: 'Poppins', system-ui, sans-serif;
```
- **Primary Font**: Poppins (Google Fonts)
- **Weights Available**: 300, 400, 500, 600, 700
- **Fallback**: system-ui, sans-serif

### Typography Scale
- **Hero Text**: `text-4xl md:text-6xl font-bold` (48px/96px)
- **Card Title**: `text-2xl font-semibold` (24px)
- **Section Headers**: `text-xl font-semibold` (20px)
- **Body Text**: `text-base` (16px)
- **Small Text**: `text-sm` (14px)
- **Labels**: `text-sm font-medium` (14px, medium weight)

### Text Colors
- **Primary Text**: `text-foreground`
- **Secondary Text**: `text-muted-foreground`
- **Brand Text**: `text-primary`
- **Custom Blue**: `#0E4A7E` - Deep blue used for labels, icons, and accent elements

## Layout & Spacing

### Container System
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: > 768px
- **Large Desktop**: > 1024px

### Border Radius
```css
--radius: 1.3rem;  /* Large radius for modern look */
```
- **Large**: `rounded-lg` (var(--radius))
- **Medium**: `rounded-md` (calc(var(--radius) - 2px))
- **Small**: `rounded-sm` (calc(var(--radius) - 4px))

## Component Patterns

### Buttons

#### Primary Button
```tsx
<Button className="bg-primary hover:bg-primary/90 text-white">
  Primary Action
</Button>
```

#### Button Variants
- **Default**: Primary blue with white text
- **Secondary**: Light gray background
- **Outline**: Border with transparent background
- **Ghost**: No background, hover effects
- **Destructive**: Red for dangerous actions

#### Button Sizes
- **Default**: `h-10 px-4 py-2`
- **Small**: `h-9 px-3`
- **Large**: `h-11 px-8`
- **Icon**: `h-10 w-10`

### Cards

#### Standard Card
```tsx
<Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Descriptive text</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Card Patterns
- **Shadow**: `shadow-sm` for subtle elevation
- **Padding**: `p-6` standard, `pt-0` for content after header
- **Background**: Adapts to theme (white/dark slate)

### Form Elements

#### Input Fields
```tsx
<Input className="h-10 rounded-md border border-input bg-background" />
```

#### Labels
```tsx
<Label className="text-sm font-medium">Field Label</Label>
```

#### Select Dropdowns
- Consistent with input styling
- ChevronDown icon for dropdown indicator
- Custom scrollbar styling

### Navigation

#### Header Structure
- Fixed height with backdrop blur
- Logo centered with brand text left, actions right
- Theme toggle and logout functionality
- Responsive design with mobile adaptations

## Interactive States

### Hover Effects
- **Buttons**: 10% opacity reduction (`/90`)
- **Cards**: Subtle scale or shadow increase
- **Logo**: 5% scale increase (`scale-105`)

### Focus States
- **Ring**: 2px focus ring using `--ring` color
- **Ring Offset**: 2px offset for visibility
- **Outline**: None (custom ring implementation)

### Transitions
- **Default**: `transition-colors` for color changes
- **Transform**: `transition-transform duration-200` for scaling
- **Animation Duration**: 200ms standard

## Animations

### Custom Animations
```css
/* Fade In */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

/* Slide Up */
.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

/* Gentle Bounce */
.animate-bounce-gentle {
  animation: bounceGentle 0.6s ease-out;
}

/* Error Pulse */
.animate-pulse-error {
  animation: pulseError 2s ease-in-out infinite;
}

/* Shake */
.animate-shake {
  animation: shake 0.5s ease-in-out;
}
```

### Accordion Animations
- **Down**: `accordion-down 0.2s ease-out`
- **Up**: `accordion-up 0.2s ease-out`

## Theme Support

### Theme Toggle
- Moon/Sun icons (Lucide React)
- Smooth color transitions
- System preference detection
- Persistent theme storage

### Dark Mode Considerations
- All components support both themes
- Automatic color adaptation
- Contrast compliance
- Background gradients adapt appropriately

## Accessibility

### Focus Management
- Visible focus indicators
- Keyboard navigation support
- Screen reader compatibility
- Proper semantic HTML

### Color Contrast
- WCAG AA compliant contrast ratios
- Dark mode accessibility
- Error state clarity

## Icon System

### Icon Library
**Lucide React** - Consistent, minimal icon set

### Common Icons
- **ChevronDown/ChevronRight**: Navigation and collapsible sections
- **Check**: Success states and form validation
- **Moon/Sun**: Theme toggle
- **Package/Archive**: Product and shipping context
- **LogOut**: Authentication actions
- **AlertTriangle/XCircle**: Error and warning states
- **Calculator/BarChart3/Clock/Shield**: Feature representations

### Icon Sizing
- **Standard**: `h-4 w-4` (16px)
- **Large**: `h-8 w-8` (32px)
- **Icon Buttons**: `h-10 w-10` (40px)

## Scrollbar Styling

### Custom Scrollbars
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}
```

## Form Patterns

### Multi-Section Forms
- Collapsible sections with completion indicators
- Progressive disclosure
- Validation feedback
- Error state management
- Auto-save functionality

### Validation
- Real-time validation with Zod schemas
- Error message positioning
- Success state indicators
- Field-level error handling

## Background Patterns

### Gradients
- **Landing**: `from-white via-white to-blue-50`
- **Dark Landing**: `from-slate-900 via-slate-900 to-slate-800`
- **Subtle**: Minimal gradient overlays for depth

### Backdrop Effects
- **Header**: `backdrop-blur-sm` with semi-transparent backgrounds
- **Overlays**: Consistent blur effects for modals and dropdowns

## Implementation Guidelines

### CSS Architecture
- **Tailwind CSS**: Utility-first approach
- **CSS Variables**: Theme-aware color system
- **Component Classes**: Minimal custom CSS
- **Responsive Design**: Mobile-first methodology

### Component Structure
- **Shadcn/ui**: Base component library
- **Radix UI**: Accessibility-first primitives
- **Class Variance Authority**: Type-safe variant management
- **React Hook Form**: Form state management

### File Organization
- Components in `/components/ui/`
- Pages in `/pages/`
- Shared schemas in `/shared/`
- Assets in `/assets/`

## Best Practices

### Performance
- Lazy loading for images
- Efficient re-renders
- Minimal bundle size
- Optimized fonts loading

### Maintainability
- Consistent naming conventions
- Reusable component patterns
- Type-safe implementations
- Comprehensive error handling

### User Experience
- Loading states
- Error boundaries
- Optimistic updates
- Responsive design
- Accessibility compliance

## Recent Changes

### UI Refinements - 21st Iteration (Completed)
- **Date**: August 25, 2025
- **Commit**: `e40d819` - UI Refinements - 21st Iteration: Replace text-blue-500 with custom hex color #0E4A7E
- **Status**: Successfully committed
- **Change**: Replaced all instances of `text-blue-500` Tailwind class with custom hex color `#0E4A7E`
- **Scope**: Updated labels, icons, interactive elements, and accent colors across all pages
- **Implementation**: Used inline `style={{color: '#0E4A7E'}}` for consistent custom color application
- **Fixes**: Resolved duplicate className attributes in product-input.tsx
- **Files Modified**:
  - `client/src/pages/product-input.tsx`
  - `client/src/pages/signup.tsx`
  - `client/src/pages/login.tsx`
  - `client/src/pages/home.tsx`
  - `client/src/components/signup/signup-step-2.tsx`
  - `DESIGN_GUIDE.md` (new file)

### Previous UI Refinements - Iterations 19-20
- **Last Commit**: `b7a2a62` - Update documentation for UI refinements iterations 19-20
- **Previous Commit**: `0f3a496` - Update UI branding and text colors across all pages
- **Status**: These changes are committed and documented

---

This design guide should be referenced when implementing new features or modifying existing components to ensure visual and functional consistency across the MGX TLC platform.