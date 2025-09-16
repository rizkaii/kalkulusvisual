# Overview

This is a calculus visualization web application built with React, TypeScript, and Express. The application provides interactive mathematical tools for visualizing and exploring calculus concepts including derivatives, integrals, and limits. It features a clean Swiss design aesthetic with real-time graphing capabilities using D3.js for mathematical function visualization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript in a Vite-powered development environment. The application follows a component-based architecture with:

- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with CSS custom properties for theming, following Swiss design principles
- **State Management**: React hooks with custom state management for mathematical computations
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack React Query for server state management
- **Mathematical Rendering**: Custom math parser and D3.js for interactive visualizations

The application is structured with clear separation between mathematical computation logic, UI components, and visualization components. The math engine handles expression parsing, derivative calculations, integral approximations, and limit computations.

## Backend Architecture
The backend uses Express.js with TypeScript in ESM mode, providing:

- **API Structure**: RESTful endpoints with `/api` prefix convention
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage) that can be extended to database implementations
- **Development Setup**: Vite integration for hot reloading and development tooling
- **Session Management**: Express session handling with PostgreSQL session store capability
- **Error Handling**: Centralized error handling middleware with structured error responses

The server architecture is designed to be modular and extensible, with clean separation between routing, storage, and business logic.

## Database Design
The application uses Drizzle ORM with PostgreSQL support:

- **Schema Management**: Centralized schema definitions in the shared directory for type safety
- **User Model**: Basic user entity with username/password authentication structure
- **Migration System**: Drizzle Kit for database schema migrations
- **Connection**: Neon Database serverless PostgreSQL integration

The database layer is abstracted through interfaces, allowing for easy swapping between storage implementations.

## Mathematical Engine
The core mathematical functionality includes:

- **Expression Parser**: Custom parser supporting standard mathematical operations, functions (sin, cos, tan, ln, log, sqrt, abs), and constants (e, pi)
- **Numerical Methods**: Implementation of derivative approximation using finite differences, integral calculation using Simpson's rule, Riemann sums, and trapezoidal rule
- **Visualization Data**: Point generation for function plotting with configurable resolution and bounds checking
- **Interactive Features**: Real-time calculation updates, point-of-interest tracking, and dynamic visualization parameters

## Development Tools
The project includes comprehensive development tooling:

- **Type Safety**: Full TypeScript coverage with strict configuration
- **Build System**: Vite for fast development and optimized production builds
- **Code Quality**: ESBuild for server-side bundling
- **Development Experience**: Hot reloading, error overlays, and Replit-specific development plugins

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling and automatic scaling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

## UI and Visualization Libraries
- **Radix UI**: Headless UI primitives for accessible component foundations
- **D3.js**: Data visualization library for mathematical function plotting and interactive charts
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Frontend build tool and development server
- **TanStack React Query**: Server state management and caching
- **Wouter**: Lightweight routing library for single-page application navigation
- **React Hook Form**: Form state management with validation support

## Authentication and Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **bcrypt**: Password hashing (implied from user schema structure)

## Mathematical and Utility Libraries
- **date-fns**: Date manipulation utilities
- **clsx**: Conditional className utility
- **class-variance-authority**: Type-safe CSS class variant management
- **nanoid**: Unique ID generation for components and sessions

The application architecture prioritizes type safety, modularity, and extensibility while maintaining clean separation of concerns between mathematical computation, user interface, and data persistence layers.