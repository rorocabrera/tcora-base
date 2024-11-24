# TCora Platform Architecture Document

## 1. System Overview

### 1.1 Applications

#### Platform Admin (@tcora/platform)
- **Technology**: React + Vite (Changed from Next.js)
- **Purpose**: Platform administration and tenant management
- **Users**: Platform administrators and resellers
- **Key Functions**:
  - Tenant registration and management
  - License and subscription management
  - Platform-wide analytics
  - Multi-tenant data administration
  - White-label configuration
  - System health monitoring
- **Status**: Basic authentication implementation ✅

#### Admin Portal (@tcora/admin)
- **Technology**: REACT.JS
- **Purpose**: Tenant-level administration
- **Users**: Tenant administrators
- **Key Functions**:
  - User management (CRUD)
  - Role-based access control
  - Subscription management
  - System configuration
  - Analytics dashboard
  - Communication management
- **Status**: Not started 📝

#### Client Application (@tcora/client)
- **Technology**: React Native Web
- **Purpose**: End-user application interface
- **Users**: End users
- **Key Functions**:
  - User authentication
  - Profile management
  - Service access
  - Real-time communication
  - Subscription handling
- **Status**: Not started 📝

### 1.2 Technical Stack

```plaintext
Backend Services:
├── API Service (NestJS, Port 3000)
│   ├── Authentication
│   ├── Multi-tenancy
│   └── Core Business Logic
├── WebSocket Service (Port 3001)
│   ├── Real-time Events
│   └── Notifications
├── Database
│   ├── PostgreSQL (tcora_db)
│   └── Multi-schema Architecture
└── Cache Layer
    └── Redis
        ├── Session Management
        ├── Token Storage
        └── Real-time Data

Frontend Applications:
├── Platform Admin (React + Vite)
│   ├── Build: Vite
│   ├── UI: TailwindCSS + Shadcn
│   ├── State: React Query + Context
│   ├── Router: React Router v6
│   └── HTTP: Axios
├── Admin Portal (Next.js)
└── Client App (React Native Web)
```

## 2. Project Structure

```plaintext
@tcora/
├├── .env
├── .vscode
│   └── launch.json
├── apps
│   ├── tcora-admin
│   ├── tcora-client
│   └── tcora-platform
│       ├── .gitignore
│       ├── README.md
│       ├── components.json
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── public
│       │   └── vite.svg
│       ├── src
│       │   ├── App.css
│       │   ├── App.tsx
│       │   ├── assets
│       │   │   └── react.svg
│       │   ├── components
│       │   │   └── ui
│       │   │       ├── button.tsx
│       │   │       ├── card.tsx
│       │   │       ├── header.tsx
│       │   │       ├── index.tsx
│       │   │       ├── layout
│       │   │       ├── loading-screen.tsx
│       │   │       ├── sidebar.tsx
│       │   │       ├── spinner.tsx
│       │   │       └── table.tsx
│       │   ├── contexts
│       │   │   └── auth.tsx
│       │   ├── hooks
│       │   ├── index.css
│       │   ├── lib
│       │   │   ├── api
│       │   │   │   ├── auth.ts
│       │   │   │   ├── axios.ts
│       │   │   │   └── index.ts
│       │   │   └── utils.ts
│       │   ├── main.tsx
│       │   ├── pages
│       │   │   ├── auth
│       │   │   │   └── login.tsx
│       │   │   ├── dashboard
│       │   │   │   └── index.tsx
│       │   │   ├── settings
│       │   │   │   └── index.tsx
│       │   │   └── tenants
│       │   │       └── index.tsx
│       │   ├── providers
│       │   │   └── auth-provider.tsx
│       │   ├── routes
│       │   │   ├── ProtectedRoute.tsx
│       │   │   └── index.tsx
│       │   ├── types
│       │   │   ├── api.ts
│       │   │   ├── auth.ts
│       │   │   ├── index.ts
│       │   │   └── tenant.ts
│       │   └── vite-env.d.ts
│       ├── tailwind.config.js
│       ├── tsconfig.app.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       └── vite.config.ts
├── commands-guide.md
├── docker
│   ├── development
│   │   ├── Dockerfile
│   │   └── postgres
│   │       ├── Dockerfile
│   │       └── postgresql.conf
│   ├── init
│   │   └── 01-schema.sql
│   └── production
│       └── Dockerfile
├── docker-compose.test.yml
├── docker-compose.yml
├── docker-test.sh
│       └── README.md
├── package-lock.json
├── package.json
├── packages
│   ├── config
│   │   ├── dist
│   │   │   ├── index.d.mts
│   │   │   ├── index.d.ts
│   │   │   ├── index.js
│   │   │   └── index.mjs
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── auth
│   │   │   │   ├── jwt.ts
│   │   │   │   └── types.ts
│   │   │   ├── constants.ts
│   │   │   ├── environment.ts
│   │   │   ├── index.ts
│   │   │   └── tsconfig.base.json
│   │   ├── tsconfig.base.json
│   │   └── tsconfig.json
│   ├── core
│   │   ├── jest.config.ts
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── auth
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── guards.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   └── types.ts
│   │   │   ├── database
│   │   │   │   ├── connection.ts
│   │   │   │   ├── test-connection.ts
│   │   │   │   └── types.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware
│   │   │   │   ├── __tests__
│   │   │   │   │   └── tenant.middleware.spec.ts
│   │   │   │   ├── tenant.middleware.ts
│   │   │   │   └── types.ts
│   │   │   ├── services
│   │   │   │   ├── __tests__
│   │   │   │   │   └── tenant.service.spec.ts
│   │   │   │   ├── redis.module.ts
│   │   │   │   ├── redis.service.ts
│   │   │   │   ├── tenant.module.ts
│   │   │   │   ├── tenant.service.ts
│   │   │   │   ├── user.module.ts
│   │   │   │   └── user.service.ts
│   │   │   ├── test
│   │   │   │   ├── mocks
│   │   │   │   │   └── tenant.mock.ts
│   │   │   │   └── setup.ts
│   │   │   ├── types
│   │   │   │   └── express.ts
│   │   │   └── utils
│   │   │       └── logger.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.test.json
│   │   └── tsup.config.ts
│   └── ui
│       ├── package.json
│       └── src
├── scripts
│   └── verify-db.js
├── services
│   ├── api
│   │   ├── .env
│   │   ├── db
│   │   │   └── packages
│   │   │       └── core
│   │   │           └── src
│   │   │               └── index.ts
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── tsconfig.json
│   └── websocket
│       ├── .env
│       ├── package.json
│       ├── src
│       │   ├── main.ts
│       │   ├── ws.controller.ts
│       │   └── ws.module.ts
│       └── tsconfig.json
├── test-env.sh
├── tests
│   ├── 01-zetgeist1.md
│   ├── e2e
│   ├── integration
│   └── unit
├── tsconfig.base.json
└── turbo.json
## 3. Implementation Status

### 3.1 Backend Services

#### Multi-tenancy Service ✅
= Turbo-Repo 
- Docker Configured
- Tenant middleware implementation
- Database schema isolation
- Request context handling
- Resource quotas
- Integration tests

#### Authentication Service 🔄
- Database schema ✅
- JWT implementation 🔄
- Token management ✅
- Session handling ✅
- Role-based authorization ✅

#### Core Features Implementation
- User entity and database setup ✅
- Authorization guards 🔄
- Tenant isolation 🔄
- Token blacklisting ✅
- Audit logging 📝



### 3.2 Frontend Implementation (Platform Admin)

#### Authentication ✅
```typescript
// Core Features
- Context and hooks setup
- Protected routes
- Token management
- Login interface
- Session persistence

// API Integration
├── Axios configuration
├── Interceptors for tokens
├── Error handling
└── Type-safe endpoints

// Routes
├── /login
├── /dashboard
├── /tenants
└── /settings
```

#### State Management ✅
```typescript
// Authentication State
interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
}

// API Integration
- React Query for data fetching
- Context for global state
- Local state for UI
```

## 4. Type System

### 4.1 Shared Types (packages/config)
```typescript
// User Roles
enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  END_USER = 'END_USER',
  RESELLER = 'RESELLER'
}

// Auth Types
interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  resellerId?: string;
  impersonating?: {
    originalUserId: string;
    originalRole: UserRole;
  };
}

// Entity Types
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Settings Types
interface TenantSettings {
  theme: ThemeConfig;
  features: FeatureFlags;
  customization: CustomizationConfig;
}
```

### 4.2 Database Schema
```sql
-- Core Tables
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  domain VARCHAR(255),
  is_active BOOLEAN,
  settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50),
  is_active BOOLEAN,
  permissions JSONB,
  reseller_id UUID,
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

## 5. Security Implementation

### 5.1 Authentication Flow
```typescript
// Token Management
- Access tokens (15min expiry)
- Refresh tokens (7 days)
- Token blacklisting
- Refresh token rotation

// Session Handling
- Redis-based session store
- Secure cookie configuration
- CSRF protection
```

### 5.2 Authorization
```typescript
// Role-based Access
- Guard implementation
- Permission checking
- Tenant isolation
- Resource ownership

// Security Features
- Token validation
- Request sanitization
- Rate limiting
- Audit logging
```

## 6. Next Steps

### 6.1 Backend Priority
1. Complete authentication service
2. Implement tenant isolation
3. Add WebSocket support
4. Set up audit logging

### 6.2 Frontend Priority
1. Complete dashboard implementation
2. Add tenant management
3. Implement user management
4. Set up monitoring




### 7.1 Code Organization
- Feature-based structure
- Clear separation of concerns
- Type-safe implementations
- Comprehensive testing

### 7.2 Best Practices
- TypeScript strict mode
- Error handling
- Performance optimization
- Security considerations

### 7.3 Process
- Feature branch workflow
- Code review requirements
- Testing standards
- Documentation updates