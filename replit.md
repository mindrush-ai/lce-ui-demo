# Total Landed Costs (TLC) - B2B Cost Management Platform

## Overview

Total Landed Costs (TLC) is a comprehensive B2B platform designed for managing and calculating total landed costs. The application provides a modular cost management solution with user authentication, company management, interactive product input forms, and a modern web interface. Built as a full-stack application with a React frontend and Express backend, it offers a scalable foundation for cost management workflows.

## Recent Changes (January 2025)

### Interactive Product Input System
- Added Item Number field at the start of Product Details section for alphanumeric inputs
- Changed "Product Name/ID" to "Item Name/Description" for clearer labeling
- Converted HTS Code to dropdown with specific options: 2204.21.50.40 and 2204.10.00.75
- HTS Code Description field displays dynamic text based on selected code:
  - 2204.21.50.40: "Wine > Red > Not Certified Organic"
  - 2204.10.00.75: "Wine > Sparkling"
- Integrated complete country selection with ISO codes and flag display using native HTML select
- Added unit cost input with USD currency formatting (4 decimal places)
- Created interactive sectioned form that collapses completed sections
- Enhanced form validation using Zod schemas for all product fields
- Fixed form field alignment and consistent 50px height across all inputs
- Replaced custom dropdown with reliable native select element for better UX

### Authentication System
- Fixed signup redirection with complete session management using express-session
- Added useAuth hook and authentication-based routing for proper login/logout state management
- Implemented mocked Google Sign Up and Google Login functionality for testing purposes
- Auto-login users after successful signup with proper authentication state refresh

### Section 3 - Shipment Details
- Added Section 3 with four required fields: Container Size, Incoterms, Origin Port, Destination Port
- Container Size dropdown with "40 Feet" option
- Updated Incoterms field with new options:
  - FCA (Supplier Facility)
  - FCA (Port of Loading)
- Changed Incoterms helper text to "Select Incoterms Rule"
- Dynamic Origin Port field that automatically populates based on Country of Origin selection:
  - France → Le Havre (FR)
  - Italy → Livorno (IT)
  - Portugal → Leixões (PT)
  - Spain → Barcelona (ES)
- Destination Port dropdown with New York (US), New Jersey (US)
- Maintains consistent 50px field height and sectioned form behavior
- Enhanced countries.ts with port mapping for automatic origin port selection

### Freight Charges Subsection (Section 3 Update)
- Added horizontal line separator and "Freight Charges" heading in Section 3
- Replaced toggle switch with radio button selection for freight rate method:
  - "Use Index Rates" - shows predefined country rates
  - "Use My Rate" - provides custom freight input field
- Index rates by country: France ($6,000), Italy ($6,100), Portugal ($6,200), Spain ($6,300)
- Dynamic rate display shows selected rate based on Country of Origin
- Custom freight input field when "Use My Rate" is selected
- Updated validation to require either Index Rates or custom freight cost
- Freight charges integrated into shipment details form validation

### Calculate Total Landed Costs Feature
- Added "Calculate Total Landed Costs" button that appears after all three sections are completed
- Button uses emerald gradient styling to distinguish it as the primary action
- Only displays when all sections have been marked as completed
- Positioned prominently below the form sections with centered alignment

### Landed Costs Results Display
- Results section displays after clicking Calculate Total Landed Costs button
- Reorganized layout with full-width hero box and two-column layout for detail boxes
- Box 1 (HERO): "ITEM LANDED COST" - full width, emerald gradient styling, USD currency display
- Box 2 (Customs): Updated field labels:
  - "Unit of Measure" (previously Customs Units)
  - "Entered Value" (previously Customs Value) 
  - "Duty per Item" (previously Custom Duty per Item)
- Box 3 (Freight): Updated routing display format:
  - Changed from port codes to full country names: "France to United States"
  - Maintains total freight costs and freight per item calculations
- Auto-scroll to results section with smooth scrolling behavior
- Fully responsive design with mobile-first approach

### MGX Branding Integration
- Added MGX Beverage Group logo to header center on all pages (home and product-input)
- Logo displays at consistent 40px height for professional branding
- Responsive positioning maintains visual balance across different screen sizes

### Visual Enhancement - Wine Cases Background
- Created custom SVG wine cases illustration for product input page background
- Positioned wine cases in bottom-right corner with 15% opacity for subtle branding
- Fixed positioning ensures background doesn't interfere with form functionality
- Maintains professional appearance while adding thematic wine industry context

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing 
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark/light theme support
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for robust API development
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: bcrypt for password hashing with planned Google OAuth integration
- **Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Development**: Hot module replacement with Vite middleware integration

### Data Storage
- **Database**: PostgreSQL configured via Drizzle with Neon Database serverless connection
- **Schema**: Users table with support for email/password and Google authentication
- **Migrations**: Drizzle migrations managed in `/migrations` directory
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Local Auth**: Email/password authentication with bcrypt password hashing
- **OAuth**: Google authentication infrastructure prepared but not implemented
- **Session Management**: Designed for cookie-based sessions (infrastructure ready)
- **Registration Flow**: Two-step signup process collecting user and company information

### Project Structure
- **Monorepo Layout**: Unified codebase with separate client, server, and shared directories
- **Shared Code**: Common TypeScript types and Zod schemas in `/shared` directory
- **Client**: React application in `/client` with component-based architecture
- **Server**: Express API in `/server` with modular route organization
- **Build**: Unified build process outputting to `/dist` for production deployment

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tooling
- **express**: Web application framework for the backend API

### Frontend UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight routing library for React
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **esbuild**: JavaScript bundler for backend build process

### Authentication and Validation
- **bcrypt**: Password hashing for secure authentication
- **zod**: Schema validation library for type-safe data validation
- **@hookform/resolvers**: React Hook Form integration with Zod validation

### Styling and Theming
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx & tailwind-merge**: Conditional class name utilities
- **autoprefixer**: CSS vendor prefix automation