# AGENTS.md - Development Guidelines for AI Agents

This document provides comprehensive guidelines for AI agents working on the MERN Assessment Platform codebase. Follow these conventions to maintain code quality and consistency.

## Build/Lint/Test Commands

### Full Application Commands (Root Level)
- **Install all dependencies**: `pnpm run install-all`
- **Start development servers**: `pnpm run dev` (starts MongoDB, server, and client)
- **Start production servers**: `pnpm run start`
- **Start server only**: `pnpm run server`
- **Start client only**: `pnpm run client`

### Client (React/TypeScript) Commands
- **Install dependencies**: `pnpm --filter client install`
- **Start development**: `pnpm --filter client start`
- **Build for production**: `pnpm --filter client run build`
- **Run tests**: `pnpm --filter client run test`
- **Run specific test file**: `pnpm --filter client run test -- --testPathPattern=ComponentName.test.tsx --watchAll=false`
- **Run single test**: `pnpm --filter client run test -- --testNamePattern="should render correctly" --watchAll=false`
- **Lint**: `npx eslint src/ --ext .ts,.tsx` (ESLint config extends react-app)

### Server (Node.js/Express) Commands
- **Install dependencies**: `pnpm --filter server install`
- **Start development**: `pnpm --filter server run dev` (nodemon)
- **Start production**: `pnpm --filter server run start`
- **No tests configured** (currently outputs "Error: no test specified")

### Docker Commands
- **Start all services**: `docker compose up`
- **Start in background**: `docker compose up -d`
- **Stop services**: `docker compose down`
- **View logs**: `docker compose logs -f`

## Code Style Guidelines

### General Principles
- **Consistency**: Follow existing patterns in the codebase
- **Type Safety**: Use TypeScript types and interfaces for all data structures
- **Error Handling**: Implement proper try-catch blocks and meaningful error messages
- **Security**: Never log or expose sensitive data (passwords, secrets, keys)
- **Performance**: Optimize renders and avoid unnecessary re-computations

### Naming Conventions
- **Components**: PascalCase (e.g., `AdminDashboard`, `TakeAssessment`)
- **Functions/Methods**: camelCase (e.g., `handleSubmit`, `fetchAssessments`)
- **Variables**: camelCase (e.g., `userName`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase with 'I' prefix for interfaces (e.g., `IAssessment`, `IQuestion`)
- **Files**: PascalCase for components (e.g., `AdminDashboard.tsx`), camelCase for utilities (e.g., `apiService.ts`)
- **Directories**: lowercase (e.g., `components`, `services`, `types`)

### Import Organization
- **React imports first**: `import React, { useState } from 'react';`
- **Third-party libraries second**: `import axios from 'axios';`
- **Relative imports last**: `import { API_BASE_URL } from '../config';`
- **Group by empty line**: Separate groups with blank lines
- **No unused imports**: Remove any unused imports before committing
- **Prefer named imports**: `import { Button } from '@mui/material';` over `import Button from '@mui/material/Button';`

### TypeScript Usage
- **Strict mode enabled**: All code must pass strict TypeScript checks
- **Interface definitions**: Define interfaces for API responses and component props
- **Type assertions**: Use `as` sparingly, prefer proper typing
- **Generic types**: Use generics for reusable components and hooks
- **Union types**: Use for multiple possible types (e.g., `string | null`)

### React Component Patterns
- **Functional components**: Prefer over class components
- **Hooks**: Use built-in hooks (useState, useEffect, useMemo, useCallback)
- **Custom hooks**: Extract reusable logic into custom hooks
- **Props interface**: Define props interfaces for all components
- **Default props**: Use default parameters instead of defaultProps
- **Conditional rendering**: Use ternary operators or && for simple conditions

### Material-UI Usage
- **Theme provider**: Use existing theme context for consistent styling
- **sx prop**: Prefer sx prop over styled components for simple styles
- **Theme values**: Use theme.palette and theme.spacing
- **Responsive design**: Use theme.breakpoints for responsive layouts

### API Communication
- **Axios instance**: Use centralized axios configuration
- **Error handling**: Handle API errors gracefully with user feedback
- **Loading states**: Show loading indicators during API calls
- **Type safety**: Define response types for all API endpoints

### Server-Side Patterns (Node.js/Express)
- **Middleware**: Use appropriate middleware for CORS, JSON parsing, authentication
- **Route organization**: Group related routes in separate files
- **Error handling**: Use try-catch in async routes, send appropriate HTTP status codes
- **Validation**: Validate input data before processing
- **Environment variables**: Use dotenv for configuration, never hardcode secrets

### Database (MongoDB/Mongoose)
- **Schema definitions**: Define clear schemas with validation
- **Model naming**: Use singular nouns for model names
- **Indexing**: Add appropriate indexes for query performance
- **Population**: Use populate for relational data
- **Error handling**: Handle database connection and query errors

### Testing Guidelines
- **Component testing**: Use React Testing Library for component tests
- **Test file location**: Place test files next to component files
- **Test naming**: Use descriptive test names starting with "should"
- **Mock external dependencies**: Mock API calls and external libraries
- **Coverage**: Aim for meaningful test coverage, focus on critical paths

### File Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── admin/      # Admin-specific components
│   │   ├── assessment/ # Assessment-related components
│   │   └── layout/     # Layout and navigation
│   ├── services/       # API service functions
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
server/
├── routes/             # API route definitions
├── models/             # Mongoose models
├── controllers/        # Route handlers
├── middleware/         # Express middleware
└── config/             # Configuration files
```

### Commit Guidelines
- **Descriptive messages**: Write clear, concise commit messages
- **Atomic commits**: Each commit should contain related changes
- **Prefix conventions**: Use prefixes like "feat:", "fix:", "docs:", "refactor:"
- **No secrets**: Never commit environment files or sensitive data

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] ESLint passes with no errors
- [ ] Tests are written/updated for new functionality
- [ ] Naming conventions are followed
- [ ] Imports are organized correctly
- [ ] Error handling is implemented
- [ ] Security best practices are followed
- [ ] Performance considerations addressed
- [ ] Documentation updated if needed

### Environment Setup
- **Node.js**: v18.0 or higher
- **pnpm**: v8.0 or higher (package manager)
- **MongoDB**: v5.0+ (database)
- **Docker**: For containerized development/deployment

### Security Considerations
- **Input validation**: Validate all user inputs on client and server
- **XSS prevention**: Sanitize user-generated content
- **CSRF protection**: Implement CSRF tokens for state-changing operations
- **Rate limiting**: Implement rate limiting on API endpoints
- **HTTPS**: Use HTTPS in production
- **Environment variables**: Store secrets in environment variables only

### Performance Optimization
- **Lazy loading**: Use React.lazy for route-based code splitting
- **Memoization**: Use useMemo and useCallback for expensive computations
- **Bundle analysis**: Regularly check bundle sizes
- **Image optimization**: Use appropriate image formats and sizes
- **Database queries**: Optimize database queries and use indexes

### Accessibility (a11y)
- **Semantic HTML**: Use proper semantic elements
- **ARIA labels**: Add aria-labels where needed
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Color contrast**: Maintain proper color contrast ratios
- **Screen readers**: Test with screen reader tools

Following these guidelines ensures high-quality, maintainable code that aligns with modern web development best practices.</content>
<parameter name="filePath">/Users/srajasimman/Projects/Personal/mern-assessment-app/AGENTS.md