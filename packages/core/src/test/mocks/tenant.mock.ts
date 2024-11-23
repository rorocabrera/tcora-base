// packages/core/src/test/mocks/tenant.mock.ts

import { 
    TenantSettings, 
    ThemeConfig, 
    FeatureFlags, 
    CustomizationConfig 
  } from '@tcora/config';
  
  import { Tenant } from '../../database/types';
  export const mockThemeConfig: ThemeConfig = {
    primaryColor: '#007AFF',
    secondaryColor: '#5856D6',
    logoUrl: 'https://example.com/logo.png',
  };
  
  export const mockFeatureFlags: FeatureFlags = {
    chat: true,
    ticketing: true,
    billing: false,
  };
  
  export const mockCustomization: CustomizationConfig = {
    emailTemplates: {
      welcome: 'Welcome to {{tenantName}}',
      reset: 'Reset your password for {{tenantName}}',
    },
    whiteLabelEnabled: true,
  };
  
  export const mockTenantSettings: TenantSettings = {
    theme: mockThemeConfig,
    features: mockFeatureFlags,
    customization: mockCustomization,
  };
  
  export const mockTenant: Tenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Tenant',
    domain: 'test.example.com',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    settings: mockTenantSettings,
  };
  
  // Helper function to create a tenant with custom overrides
  export const createMockTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
    ...mockTenant,
    ...overrides,
    settings: {
      ...mockTenant.settings,
      ...(overrides.settings || {}),
    },
  });
  
  // Example usage:
  // const inactiveTenant = createMockTenant({ isActive: false });
  // const customThemedTenant = createMockTenant({ 
  //   settings: { 
  //     ...mockTenantSettings, 
  //     theme: { ...mockThemeConfig, primaryColor: '#FF0000' } 
  //   } 
  // });