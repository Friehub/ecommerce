-- Connect to ecom database
\c ecom;

-- Set up statement timeouts for everyone by default
ALTER DATABASE ecom SET statement_timeout = '5000ms';

-- Revoke all permissions to the public schema to prevent any leakage
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Create ecom_api user with limited permissions (if it doesn't already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ecom_api') THEN
        CREATE ROLE ecom_api WITH LOGIN PASSWORD 'api_secret_fallback_123';
    END IF;
END
$$;

-- Grant DML only (SELECT, INSERT, UPDATE, DELETE)
GRANT USAGE ON SCHEMA public TO ecom_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ecom_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ecom_api;

-- Strip any schema creation or metadata modification from ecom_api
REVOKE CREATE, ALTER, DROP ON SCHEMA public FROM ecom_api;
