# TCora Platform Architecture

## 1. High-Level Architecture

### 1.1 Applications

#### Platform (@tcora/platform)
- **Purpose**: Platform administration and tenant management
- **Users**: Platform administrators and resellers
- **Key Functions**:
  - Tenant registration and management
  - License and subscription management
  - Platform-wide analytics
  - Multi-tenant data administration
  - White-label configuration
  - System health monitoring

#### Admin (@tcora/admin)
- **Purpose**: Tenant-level administration
- **Users**: Tenant administrators
- **Key Functions**:
  - User management (CRUD)
  - Role-based access control
  - Subscription management
  - System configuration
  - Analytics dashboard
  - Communication management

#### Client (@tcora/client)
- **Purpose**: End-user application interface
- **Platform**: Web + Mobile (React Native Web)
- **Key Functions**:
  - User authentication
  - Profile management
  - Service access
  - Real-time communication
  - Subscription handling

### 1.2 Technical Stack

```
Backend Services:
├── NestJS API Service (Port 3000)
├── WebSocket Service (Port 3001)
├── PostgreSQL (tcora_db)
└── Redis Cache

Frontend Applications:
├── @tcora/platform (Next.js)
├── @tcora/admin (Next.js)
└── @tcora/client (React Native Web)
```

## 2. Project Structure

```
@tcora/
├── apps/
│   ├── tcora-platform/          # Platform administration
│   ├── tcora-admin/            # Tenant administration
│   └── tcora-client/           # End-user application
├── packages/
│   ├── config/           # Shared configuration
│   ├── core/             # Core business logic
│   └── ui/               # Shared components
└── services/
    ├── api/             # Main API service
    └── websocket/       # Real-time service
```

## 3. Core Services Implementation

### 3.1 Multi-tenancy Service ✅
- Tenant middleware implemented
- Tenant service with DB integration
- Request context typing
- Tenant isolation testing
- Resource quotas

### 3.2 Authentication Service 🔄
- Database schema
- JWT implementation
- Role-based guards
- Session management
- Token refresh flow

### 3.3 Communication Service 📝
- WebSocket setup
- Real-time events
- Notification system
- Chat implementation

### 3.4 Authorization & Access Control 🔒
- Basic role definitions
- User context in requests
- Permission system
- Role hierarchy

## 4. Database Design

### 4.1 Core Tables (Public Schema)
```sql
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
  role VARCHAR(50),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

## 5. Implementation Guidelines

### 5.1 Multi-tenancy
- Each tenant gets isolated schema
- Schema naming convention: `tenant_{uuid}`
- Resource isolation at database level
- Tenant context in all requests

### 5.2 Authentication
- JWT-based authentication
- Separate admin/user tokens
- Role-based access control
- Session management with Redis

### 5.3 Development Process
- Feature branches from development
- PR review required
- Automated testing
- Infrastructure as code

## 6. Current Status

### 6.1 Completed (✅)
- Docker environment setup
- Database schema initialization
- Tenant middleware implementation
- Core service infrastructure

### 6.2 In Progress (🔄)
- JWT authentication implementation
- User management endpoints
- Frontend application scaffolding
- Integration testing setup

## 7. Next Steps

1. Complete authentication service implementation
2. Set up basic admin interface
3. Implement user management
4. Add tenant isolation testing
5. Set up monitoring and logging
6. Implement WebSocket service