# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (frontend + backend)
- `npm start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes to PostgreSQL

## Architecture Overview

This is a full-stack B2B cost management platform for calculating Total Landed Costs (TLC) with the following structure:

### Tech Stack
- **Frontend**: React 18 + TypeScript, Wouter routing, Shadcn/ui components, Tailwind CSS
- **Backend**: Express.js + TypeScript with session-based authentication
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations
- **Validation**: Zod schemas shared between client and server
- **Build**: Vite for frontend, esbuild for backend

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common TypeScript types and Zod validation schemas
- `migrations/` - Drizzle database migrations

### Authentication System
- Session-based authentication using express-session with MemoryStore
- User registration with two-step signup (credentials + company info)
- Authentication state managed via useAuth hook with TanStack Query
- Routes are conditionally rendered based on authentication status

### Key Components

**Product Input System** (`client/src/pages/product-input.tsx`):
- Multi-section form with collapsible completed sections
- Section 1: Product details (Item Number, Name, HTS Code, Country, Unit Cost)
- Section 2: Item details (Number of wine cases)
- Section 3: Shipment details (Container, Incoterms, Ports, Freight)
- Dynamic freight rate calculation (index rates or custom input)
- Complete TLC calculation with customs duty business logic

**Database Schema** (`shared/schema.ts`):
- Users table with email/password authentication
- Companies table linked to users
- Product validation schemas with comprehensive field validation
- Authentication schemas for login/signup flows

**Backend Routes** (`server/routes.ts`):
- `/api/auth/*` - Authentication endpoints
- `/api/user` - User profile management
- Database operations via Drizzle ORM

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

- Shared validation schemas ensure consistency between frontend and backend
- Authentication redirects properly handle login/logout state
- Form state persists across sections until submission
- Results display with auto-scroll and responsive design
- Theme support (light/dark) throughout the application
- MGX Beverage Group branding integration

### Environment Setup
- Requires `DATABASE_URL` environment variable for PostgreSQL connection
- Session secret configured via `SESSION_SECRET` environment variable
- Development runs on port 5000 (configurable via `PORT` env var)