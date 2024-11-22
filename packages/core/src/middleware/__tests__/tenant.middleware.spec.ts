// packages/core/src/middleware/tenant.middleware.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { TenantMiddleware } from '../tenant.middleware';
import { TenantService } from '../../services/tenant.service';
import { Tenant, UserRole } from '../../database/types';
import { Request, Response } from 'express';

// Extend the Express Request type as defined in our express.ts
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
      currentUser?: {
        id: string;
        tenantId: string;
        role: UserRole;
      };
    }
  }
}

const mockTenant: Tenant = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Tenant',
  domain: 'test.example.com',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  settings: {
    theme: {
      primaryColor: '#007AFF',
      secondaryColor: '#5856D6',
    },
    features: {
      chat: true,
      ticketing: true,
      billing: false,
    },
    customization: {
      emailTemplates: {},
      whiteLabelEnabled: true,
    },
  },
};

describe('TenantMiddleware', () => {
  let middleware: TenantMiddleware;
  let mockTenantService: jest.Mocked<TenantService>;

  beforeEach(async () => {
    mockTenantService = {
      validateTenant: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMiddleware,
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
  });

  const createMockRequest = (path: string, tenantId: string | null): Partial<Request> => {
    const req: Partial<Request> = {
      path,
      header: jest.fn().mockReturnValue(tenantId),
    };
    return req;
  };

  it('should pass for health check endpoints', async () => {
    const req = createMockRequest('/health', null);
    const res = {} as Response;
    const next = jest.fn();

    await middleware.use(req as Request, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });

  it('should pass for public API endpoints', async () => {
    const req = createMockRequest('/api/public', null);
    const res = {} as Response;
    const next = jest.fn();

    await middleware.use(req as Request, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });

  it('should throw UnauthorizedException when no tenant ID provided', async () => {
    const req = createMockRequest('/api/users', null);
    const res = {} as Response;
    const next = jest.fn();

    await middleware.use(req as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });

  it('should attach tenant to request when valid tenant ID provided', async () => {
    const req = createMockRequest('/api/users', mockTenant.id);
    const res = {} as Response;
    const next = jest.fn();

    mockTenantService.validateTenant.mockResolvedValueOnce(mockTenant);

    await middleware.use(req as Request, res, next);

    // Type assertion for test purposes
    const typedReq = req as Request & { tenant?: Tenant };
    expect(typedReq.tenant).toEqual(mockTenant);
    expect(next).toHaveBeenCalledWith();
  });

  it('should throw UnauthorizedException when tenant validation fails', async () => {
    const req = createMockRequest('/api/users', 'invalid-id');
    const res = {} as Response;
    const next = jest.fn();

    mockTenantService.validateTenant.mockRejectedValueOnce(new Error('Invalid tenant'));

    await middleware.use(req as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });
});