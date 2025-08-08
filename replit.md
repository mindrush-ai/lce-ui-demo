# Total Landed Costs (TLC) - B2B Cost Management Platform

## Overview

Total Landed Costs (TLC) is a comprehensive B2B platform designed for managing and calculating total landed costs. The application provides a modular cost management solution with user authentication, company management, interactive form sections, and a modern web interface. Built as a full-stack application with a React frontend and Express backend, it offers a scalable foundation for cost management workflows with an intuitive step-by-step user input system.

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
- **Shared Code**: Common TypeScript types and Zod schemas in `/shared` directory including product information schemas
- **Client**: React application in `/client` with component-based architecture including interactive form components
- **Server**: Express API in `/server` with modular route organization
- **Build**: Unified build process outputting to `/dist` for production deployment

### Interactive Form System
- **Collapsible Sections**: Dynamic form sections that collapse when completed to maintain clean UI
- **Progressive Disclosure**: Users work through sections sequentially with visual progress indicators
- **Real-time Validation**: Form validation with formatted input fields (HTS Code formatting)
- **State Management**: Section completion state tracking with summary displays for completed sections
- **User Experience**: Smooth animations and transitions between section states

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