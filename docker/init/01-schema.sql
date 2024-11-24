-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create platform schema
CREATE SCHEMA platform_schema;
SET search_path TO platform_schema, public;

-- Create types for better type safety
CREATE TYPE subscription_status_enum AS ENUM (
    'active', 
    'trial', 
    'expired', 
    'cancelled',
    'suspended'
);

CREATE TYPE user_type_enum AS ENUM (
    'platform_admin',
    'reseller',
    'tenant_admin',
    'end_user'
);

CREATE TYPE audit_action_enum AS ENUM (
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'impersonate'
);

-- Create platform tables
CREATE TABLE platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    commission_rate DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    features JSONB NOT NULL DEFAULT '{}',
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    reseller_id UUID REFERENCES resellers(id),
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    subscription_status subscription_status_enum NOT NULL DEFAULT 'trial',
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE TABLE platform_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL,
    actor_type user_type_enum NOT NULL,
    action audit_action_enum NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_type user_type_enum NOT NULL,
    token_type VARCHAR(50) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

-- Create function to create tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_id UUID)
RETURNS void AS $$
DECLARE
    schema_name TEXT;
BEGIN
    schema_name := 'tenant_' || replace(tenant_id::text, '-', '_');
    
    EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || schema_name;
    
    -- Create tenant-specific tables in the new schema
    EXECUTE 'CREATE TABLE ' || schema_name || '.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        permissions JSONB DEFAULT ''{}''::jsonb,
        metadata JSONB DEFAULT ''{}''::jsonb,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )';
    
    EXECUTE 'CREATE TABLE ' || schema_name || '.user_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES ' || schema_name || '.users(id),
        profile_data JSONB DEFAULT ''{}''::jsonb,
        preferences JSONB DEFAULT ''{}''::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )';
    
    EXECUTE 'CREATE TABLE ' || schema_name || '.audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        details JSONB DEFAULT ''{}''::jsonb,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_tenant_schema(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_tenant_schema_on_insert
    AFTER INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION create_tenant_schema_trigger();

-- Indexes
CREATE INDEX idx_tenant_admins_tenant_id ON tenant_admins(tenant_id);
CREATE INDEX idx_platform_audit_logs_actor_id ON platform_audit_logs(actor_id);
CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_token_hash ON auth_tokens(token_hash);

-- Initial data
INSERT INTO subscription_plans (name, code, description, features, price_monthly, price_yearly)
VALUES 
('Basic', 'basic', 'Basic features for small teams', 
 '{"max_users": 10, "features": ["basic_reporting", "email_support"]}',
 29.99, 299.99),
('Professional', 'pro', 'Advanced features for growing teams',
 '{"max_users": 50, "features": ["advanced_reporting", "priority_support", "custom_branding"]}',
 99.99, 999.99),
('Enterprise', 'enterprise', 'Full feature set for large organizations',
 '{"max_users": -1, "features": ["unlimited_everything", "dedicated_support", "custom_development"]}',
 299.99, 2999.99);

-- Create initial platform admin
INSERT INTO platform_admins (
    email, 
    password_hash,
    first_name,
    last_name
) VALUES (
    'admin@tcora.com',
    -- This is a bcrypt hash for 'admin123' - CHANGE IN PRODUCTION!
    '$2b$10$3GXzz.K8NJ8ylZ8.uj.Km.E3DhD9gmZ0gDBxP/c5sFAvK5tE4rEfq',
    'System',
    'Administrator'
);

-- Utility functions for managing tenant schemas

-- Function to get tenant schema name
CREATE OR REPLACE FUNCTION get_tenant_schema_name(tenant_id UUID)
RETURNS text AS $
BEGIN
    RETURN 'tenant_' || replace(tenant_id::text, '-', '_');
END;
$ LANGUAGE plpgsql;

-- Function to validate tenant access
CREATE OR REPLACE FUNCTION validate_tenant_access(p_tenant_id UUID, p_user_id UUID)
RETURNS boolean AS $
DECLARE
    v_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM platform_schema.tenant_admins 
        WHERE tenant_id = p_tenant_id 
        AND id = p_user_id 
        AND is_active = true
    ) INTO v_exists;
    
    RETURN v_exists;
END;
$ LANGUAGE plpgsql;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_actor_id UUID,
    p_actor_type user_type_enum,
    p_action audit_action_enum,
    p_entity_type VARCHAR(50),
    p_entity_id UUID,
    p_details JSONB,
    p_ip_address VARCHAR(45)
)
RETURNS void AS $
BEGIN
    INSERT INTO platform_schema.platform_audit_logs (
        actor_id,
        actor_type,
        action,
        entity_type,
        entity_id,
        details,
        ip_address
    ) VALUES (
        p_actor_id,
        p_actor_type,
        p_action,
        p_entity_type,
        p_entity_id,
        p_details,
        p_ip_address
    );
END;
$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies

-- Enable RLS on tenant_admins
ALTER TABLE tenant_admins ENABLE ROW LEVEL SECURITY;

-- Policy for platform admins (can see all)
CREATE POLICY tenant_admins_platform_admin_policy ON tenant_admins
    TO platform_admin
    USING (true);

-- Policy for tenant admins (can only see their own tenant)
CREATE POLICY tenant_admins_tenant_policy ON tenant_admins
    TO tenant_admin
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Function to switch tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID)
RETURNS void AS $
BEGIN
    PERFORM set_config('app.current_tenant_id', tenant_id::text, false);
END;
$ LANGUAGE plpgsql;