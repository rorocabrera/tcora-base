3.2 Authentication Service 📝
- Database schema ✅
- JWT implementation 🔄
  - Multiple user types identified:
    1. Platform Administrators (Super Admins)
       - Full system access
       - Impersonation capabilities
       - Platform-wide analytics
       - White-label configuration
    2. Tenant Administrators
       - Tenant-specific administration
       - User management within tenant
       - Tenant analytics
    3. End Users (Client Users)
       - Service access within tenant
       - Profile management
    4. Resellers
       - Limited platform access
       - Tenant management capabilities
  - Authentication requirements:
    - JWT-based token system
    - Access tokens (15min expiry)
    - Refresh tokens (7 days)
    - Redis for token management
    - Tenant context in tokens
    - Role-based authorization
    - Impersonation support for Platform Admins
- Core features to implement:
  1. User authentication flow
  2. Token management system
  3. Role-based authorization
  4. Multi-tenant support
  5. Impersonation capabilities
  6. Session management
  7. Password management
  8. Security features:
     - Token blacklisting
     - Refresh token rotation
     - Audit logging
     - Secure session handling

[Rest of the sections remain unchanged]

## 8. Authentication Implementation Plan

### 8.1 Core Components Needed
```sql
-- Additional Schema Requirements
ALTER TABLE users ADD COLUMN role VARCHAR(50);
ALTER TABLE users ADD COLUMN permissions JSONB;
ALTER TABLE users ADD COLUMN reseller_id UUID;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
8.2 Implementation Steps
User entity and database setup
JWT service implementation
Authentication service
Role-based guards
Tenant context integration
Impersonation service
Session management
Audit logging
8.3 Security Considerations
Token storage strategy
Refresh token security
Tenant isolation
Role hierarchy enforcement
Impersonation safety measures
Session tracking
8.4 API Endpoints Required

current ./Services file system 

── api
│   ├── .env
│   ├── db
│   │   └── packages
│   │       └── core
│   │           └── src
│   │               └── index.ts //empty
│   ├── package.json
│   ├── src
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── tsconfig.json
└── websocket
    ├── .env
    ├── package.json
    ├── src
    │   ├── main.ts
    │   ├── ws.controller.ts
    │   └── ws.module.ts
    └── tsconfig.json



├── config         (To be implemented)
│   ├── package.json
│   ├── src
│   │   ├── auth
│   │   │   ├── jwt.ts
│   │   │   └── types.ts
│   │   ├── constants.ts
│   │   ├── environment.ts
│   │   ├── index.ts
│   │   └── tsconfig.base.json
│   └── tsconfig.base.json
├── core
│   ├── jest.config.ts
│   ├── package.json
│   ├── src
│   │   ├── auth     (To be implemented)
│   │   │   ├── auth.controller.ts
│   │   │   ├── guards.ts
│   │   │   ├── jwt.ts
│   │   │   └── types.ts
│   │   ├── database
│   │   │   ├── connection.ts
│   │   │   ├── test-connection.ts
│   │   │   └── types.ts (Already in use)
│   │   ├── index.ts
│   │   ├── middleware (Tested)
│   │   │   ├── __tests__
│   │   │   │   └── tenant.middleware.spec.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   └── types.ts
│   │   ├── services   (Tested)
│   │   │   ├── __tests__
│   │   │   │   └── tenant.service.spec.ts
│   │   │   ├── tenant.module.ts
│   │   │   └── tenant.service.ts
│   │   ├── test
│   │   │   ├── mocks
│   │   │   │   └── tenant.mock.ts
│   │   │   └── setup.ts
│   │   ├── types (In use)
│   │   │   └── express.ts
│   │   └── utils
│   │       └── logger.ts
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── tsup.config.ts
└── ui   (Empty)
    ├── package.json
    └── src