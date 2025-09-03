# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a forked version of the original wine industry cost management platform, customized to create an early demo for **The Honest Company**. The codebase has been adapted from MGX Beverage Group's wine TLC calculator to handle personal care products (wipes, sanitizing products) with China-specific import duties and business logic.

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

**Customs Duty Calculations (China-specific)**:
- Supported HTS Codes for personal care products: 3401.19.00.00, 5603.92.00.70, 3401.11.50.00, 5603.12.00.10, 5603.14.90.10
- Base duty rates: All supported codes have 0% base duty
- Chapter 99 duties for China imports include:
  - IEEPA China 20% (9903.01.24)
  - IEEPA Reciprocal All Country 10% (9903.01.25)
  - Section 301 duties (7.5% or 25% depending on HTS code)
- Total duty calculation: Base HTS Duty + Chapter 99 Duties

**Freight Calculations**:
- Index rate for China: $6,000 (40-foot containers)
- Origin port: Shanghai (CN)
- Destination port: Long Beach (US)
- Option for custom freight rates

### Development Notes

- Client-side validation ensures data integrity without backend dependency
- Form state persists across sections until submission
- Results display with auto-scroll and responsive design
- Static deployment ready for Cloudflare Pages, Netlify, or Vercel
- The Honest Company branding integration (forked from MGX Beverage Group wine platform)
- Business logic adapted for personal care products (wipes, sanitizing products)
- China-only import calculations with specific Chapter 99 duty structures
- **Scroll Behavior**: Enhanced UX with header-aware scroll positioning for section transitions and results display

### Key Features

**PDF Export System (Refactored)**:
- Professional PDF generation using jsPDF with Trade Facilitators, INC. branding
- New structure: H1 "Trade Facilitators, INC.", H2 "TOTAL LANDED COST", timestamp
- Per-item duty calculations matching current web display logic
- DUTIES - ITEM section with per-item Chapter 99, HMF, and MPF values
- Highlighted sections: Duty Per Item and Freight Per Item with matching styling
- TOTAL LANDED COST as final prominent section
- Automatic page break logic when content exceeds one page
- Filename format: TLC_Calculation_<Name/Description>_Date-Time
- Footer removed for cleaner presentation

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
- Professional styling adapted for Trade Facilitators, INC. demo

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

### Important Business Logic Files
- `business-logic-honest.md` - Complete documentation of The Honest Company specific business logic, HTS codes, and duty calculations
- `client/src/pages/product-input.tsx` - Main form with TLC calculation logic (lines 997-1051)
- `shared/schema.ts` - Zod validation schemas for all form sections
- `client/src/lib/countries.ts` - Country and port mapping data
- `client/src/utils/duties-calculator.ts` - Customs duty calculation utilities

### Recent Changes

**PDF Export System Refactor**:
- Complete overhaul of PDF export functionality with Trade Facilitators, INC. branding
- Converted from total container values to per-item calculations matching current web display
- Enhanced layout with consistent highlighting for Duty Per Item and Freight Per Item sections
- Added automatic page management and removed footer for cleaner presentation
- Updated filename format to include Name/Description and timestamp
- Located in `client/src/pages/product-input.tsx` exportToPDF function

**DUTIES - ITEM Table Updates**:
- Updated first row, first column label from "Number of Units" to "Customs Unit of Measure" in the results calculation table
- This change provides clearer terminology that aligns with customs documentation standards
- Located in `client/src/pages/product-input.tsx` line ~1621

### Key Constraints and Validation Rules

**Supported Products**: Only 5 specific HTS codes for personal care products (see `business-logic-honest.md`)
**Geographic Scope**: China (CN) imports only
**Container Types**: 40-foot containers only
**Unit Cost**: Maximum $999,999.9999 with 4 decimal place precision
**Required Fields**: All sections must be completed before TLC calculation