# The Honest Company TLC Platform Design Guide

## Overview
This design guide documents the visual design system for The Honest Company Total Landed Cost (TLC) platform. This is a static React application optimized for calculating landed costs for wipes and personal care products. It provides guidelines for maintaining consistency across the application's UI components, typography, colors, and user interactions.

## Brand Identity

### Logo Usage
- **Primary Logo**: `tfi-2024-logo.svg` (Trade Facilitators, Inc. branding)
- **Usage**: Absolutely centered in headers with hover scale effect (105%)
- **Responsive Sizing**: 
  - Mobile: `h-10 w-auto` (40px height)
  - Tablet: `h-16 w-auto` (64px height) 
  - Desktop: `h-20 w-auto` (80px height)
- **Shadow**: `drop-shadow-md` for elevation
- **Positioning**: `absolute left-1/2 transform -translate-x-1/2`

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
**Header/Footer Containers:**
```css
.max-w-6xl {
  max-width: 72rem; /* 1152px */
  margin: 0 auto;
  padding: 0 1rem; /* px-4 sm:px-6 lg:px-8 */
}
```

**Content Containers:**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

**Responsive Padding:**
- Mobile: `px-4` (16px)
- Small: `px-6` (24px) 
- Large: `px-8` (32px)

### Responsive Breakpoints
**Tailwind CSS Standard Breakpoints:**
- **Mobile**: < 640px (base styles, mobile-first approach)
- **Small (sm)**: 640px+ (small tablets and up)
- **Medium (md)**: 768px+ (tablets and up)  
- **Large (lg)**: 1024px+ (laptops and up)
- **Extra Large (xl)**: 1280px+ (desktop and up)

**Application Usage:**
- Header responsive scaling uses `sm` (640px) and `md` (768px) breakpoints
- Text visibility controls use `md` (768px) for "Total Landed Cost Engine"
- Form layouts transition to two-column at `lg` (1024px)

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
- Fixed position with backdrop blur (`backdrop-blur-sm`)
- Three-column layout: brand text (left), centered logo, actions (right)
- Theme toggle and navigation functionality (Home icon or Start Calculator button)
- Fully responsive design with mobile-first adaptations

#### Responsive Header System
**Mobile (< 640px):**
- Small logo: `h-10` (40px height)
- Compact text: `text-xl` for "TLC"
- Hidden secondary text: "Total Landed Cost Engine" hidden until medium screens
- Condensed spacing: `space-x-2` between action buttons
- Smaller icons: `w-4 h-4` for theme toggle
- Abbreviated button text: "Start" instead of "Start Calculator"
- Reduced padding: `py-4`

**Tablet (640px - 768px):**
- Medium logo: `h-16` (64px height) 
- Standard text: `text-2xl` for "TLC"
- Full button text: "Start Calculator" displays
- Standard spacing: `space-x-4`
- Standard icons: `w-5 h-5`
- Medium padding: `py-8`

**Desktop (768px+):**
- Large logo: `h-20` (80px height)
- Full branding: "Total Landed Cost Engine" visible (`hidden md:inline`)
- Complete button text and full spacing
- Full padding and standard interactions

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
- **Home**: Navigation back to home page (replaces text-based "Back to Home")
- **Package/Archive**: Product and shipping context
- **AlertTriangle/XCircle**: Error and warning states
- **Calculator/BarChart3/Clock/Shield**: Feature representations
- **Download**: Export and PDF generation functionality

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

## New Features

### PDF Export System (Current)
- **Date**: August 28, 2025
- **Status**: Implemented
- **Features**:
  - **jsPDF Integration**: Client-side PDF generation with professional styling
  - **The Honest Company Branding**: Custom header with company information
  - **Detailed Breakdown**: Complete cost analysis with itemized calculations
  - **Export Buttons**: Top and bottom placement for user convenience
  - **Automatic Naming**: Timestamped filename generation
  - **Responsive Layout**: PDF adapts to different data configurations
- **Implementation**:
  ```tsx
  // PDF Export Function
  const exportToPDF = () => {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    // Professional formatting with company branding
    // Detailed calculation breakdown
    // Automatic file naming
  };
  ```

### Landing Page Implementation (Current)
- **Date**: August 28, 2025
- **Status**: Implemented
- **Features**:
  - **Professional Marketing**: Hero section with compelling value proposition
  - **Feature Showcase**: Cards highlighting key platform benefits
  - **The Honest Company Branding**: Adapted content and messaging
  - **Responsive Design**: Mobile-first approach with smooth transitions
  - **Theme Integration**: Full light/dark mode support
- **Route**: `/` (default landing page)

### Static Architecture Migration (Completed)
- **Date**: August 28, 2025
- **Status**: Completed
- **Changes**:
  - **Database Removal**: Eliminated PostgreSQL and Drizzle ORM dependencies
  - **Authentication Removal**: Removed session-based auth system
  - **Server Elimination**: Converted to static React SPA
  - **Business Logic Preservation**: Maintained all TLC calculation logic
  - **Deployment Ready**: Optimized for Cloudflare Pages, Netlify, Vercel

### Responsive Header System (Completed)
- **Date**: August 28, 2025
- **Status**: Implemented and refined
- **Changes**:
  - **Container Standardization**: Updated to `max-w-6xl` across all components
  - **Responsive Logo Scaling**: Progressive sizing (`h-10` → `h-16` → `h-20`)
  - **Icon Navigation**: Clean Home icon replacing text-based navigation
  - **Adaptive Typography**: "Total Landed Cost Engine" hidden until medium screens
  - **Mobile Optimization**: Condensed spacing and button text for small screens
  - **Clickable Branding**: TLC text links to home page for intuitive navigation

## Implementation Updates

### Business Logic Adaptation
- **Product Focus**: Adapted from wine calculations to wipes/personal care products
- **Container Logic**: Specialized for consumer goods packaging
- **Duty Calculations**: Updated for HTS Code 3401.11.00.00 (wipes)
- **Freight Rates**: China-specific shipping calculations

### Component Architecture
- **Static Deployment**: No server-side dependencies
- **Client-side Validation**: Zod schemas for form validation
- **Theme System**: Persistent light/dark mode with system detection
- **Responsive Design**: Mobile-first implementation with consistent breakpoints

---

This design guide should be referenced when implementing new features or modifying existing components to ensure visual and functional consistency across The Honest Company TLC platform.