# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a forked version of the original cost management platform, customized to create an early demo for **The Honest Company**. The codebase maintains the same core functionality while being adapted for this specific customer's needs.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (static React SPA)
- `npm run preview` - Preview production build locally
- `npm run check` - Run TypeScript type checking

## Architecture Overview

This is a static React SPA for calculating Total Landed Costs (TLC), customized for The Honest Company demo:

### Tech Stack
- **Frontend**: React 18 + TypeScript, Wouter routing, Shadcn/ui components, Tailwind CSS
- **Styling**: Tailwind CSS with next-themes for dark/light mode
- **Forms**: React Hook Form with Zod validation
- **PDF Export**: jsPDF for professional cost breakdowns
- **Build**: Vite with static deployment optimization

### Project Structure
- `client/` - React SPA source code
- `shared/` - TypeScript types and Zod validation schemas
- `dist/` - Production build output (static files)
- `attached_assets/` - Design assets and screenshots

### Key Architecture Patterns
- Client-side only validation and calculations (no backend dependencies)
- Form state management with React Hook Form and persistence across sections
- Responsive design with mobile-first approach and dark/light theme support

### Key Components

**Product Input System** (`client/src/pages/product-input.tsx`):
- Multi-section form with collapsible completed sections
- Section 1: Product details (Item Number, Name, HTS Code, Country, Unit Cost)
- Section 2: Item details (Number of cases/units for personal care products)
- Section 3: Shipment details (Container, Incoterms, Ports, Freight)
- Dynamic freight rate calculation (index rates or custom input)
- Complete TLC calculation with customs duty business logic
- **Enhanced UX**: Smooth section transitions with proper scroll positioning that avoids sticky header overlap

**Validation Schemas** (`shared/schema.ts`):
- Product input validation with comprehensive field validation
- Form schemas for each section with proper error handling
- TypeScript types shared across components

### Business Logic

**Customs Duty Calculations**:
- EU countries (FR, IT, PT, ES) subject to 15% cumulative duty rate
- HTS Code specific duties:
  - 2204.21.50.40: 6.3 cents per liter
  - 2204.10.00.75: 19.8 cents per liter
- Chapter 99 duty calculation for EU imports

**Freight Calculations**:
- Index rates by country: France ($6,000), Italy ($6,100), Portugal ($6,200), Spain ($6,300)
- Dynamic origin port mapping based on country selection
- Option for custom freight rates

### Development Notes

- Client-side validation ensures data integrity without backend dependency
- Form state persists across sections until submission
- Results display with auto-scroll and responsive design
- Static deployment ready for Cloudflare Pages, Netlify, or Vercel
- The Honest Company branding integration (forked from wine industry platform)
- Business logic adapted for personal care products (wipes, diapers, etc.)
- **Scroll Behavior**: Enhanced UX with header-aware scroll positioning for section transitions and results display

### Key Features

**PDF Export System**:
- Professional PDF generation using jsPDF
- The Honest Company branding and styling
- Detailed cost breakdown with itemized calculations
- Responsive export buttons (top and bottom of results)
- Automatic filename generation with timestamp

**Responsive Design Implementation**:
- Container system: `max-w-6xl` for consistent layout
- Logo sizing: `h-10 sm:h-16 md:h-20` responsive scaling
- Typography: Mobile-first approach with proper breakpoints
- Header: Clickable brand text with center-aligned logo
- Navigation: Icon-only home button for clean interface

**Theme System**:
- Light/dark mode toggle with smooth transitions
- System preference detection and persistence
- Consistent color scheme across all components
- Professional styling adapted for The Honest Company

### Deployment
- Static site optimized for CDN deployment
- No server-side dependencies or environment variables required
- Built files in `dist/` directory ready for upload
- Compatible with all major static hosting platforms

### Build and Deployment Commands
After making changes, always run:
- `npm run check` - Verify TypeScript compilation
- `npm run build` - Generate production static files
- `npm run preview` - Test production build locally

### Path Aliases
- `@/*` - Maps to `client/src/*`
- `@shared/*` - Maps to `shared/*`
- `@assets/*` - Maps to `attached_assets/*`

### Recent Changes

**DUTIES - ITEM Table Updates**:
- Updated first row, first column label from "Number of Units" to "Customs Unit of Measure" in the results calculation table
- This change provides clearer terminology that aligns with customs documentation standards
- Located in `client/src/pages/product-input.tsx` line ~1621