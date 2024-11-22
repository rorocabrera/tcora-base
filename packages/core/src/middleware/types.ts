// packages/core/src/middleware/types.ts
export interface TenantMiddlewareConfig {
    validateTenant: boolean;
    requireActive: boolean;
    allowedPaths?: string[];
  }
  
  export interface RequestMetadata {
    tenantId?: string;
    userId?: string;
    requestId: string;
    timestamp: Date;
  }