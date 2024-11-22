// packages/core/src/services/tenant.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TenantService } from '../tenant.service';
import { NotFoundException } from '@nestjs/common';
import { Tenant } from '../../database/types';

// Simple mock of pg Pool
const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockConnect = jest.fn().mockImplementation(() => ({
  query: mockQuery,
  release: mockRelease,
}));

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: mockConnect
  }))
}));

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('validateTenant', () => {
    it('should return tenant when valid', async () => {
      const mockTenant = {
        id: '123',
        name: 'Test Tenant',
        domain: 'test.com',
        isActive: true,
      };
      
      mockQuery.mockResolvedValueOnce({ rows: [mockTenant] });

      const result = await service.validateTenant('123');
      expect(result).toEqual(mockTenant);
      expect(mockRelease).toHaveBeenCalled();
    });

    it('should throw when tenant not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.validateTenant('invalid'))
        .rejects
        .toThrow(NotFoundException);
      
      expect(mockRelease).toHaveBeenCalled();
    });

    it('should throw when tenant is inactive', async () => {
      const testId = '123';
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ id: testId, isActive: false }] 
      });

      await expect(service.validateTenant(testId))
        .rejects
        .toThrow(`Tenant ${testId} is not active`);
      
      expect(mockRelease).toHaveBeenCalled();
    });
  });
});