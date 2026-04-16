-- Database Setup Script for Seller API
-- PostgreSQL Database Initialization

-- Create database (run as postgres superuser)
-- CREATE DATABASE sellerdb;

-- Connect to the database
\c sellerdb;

-- The tables will be auto-created by Hibernate/JPA when you run the application
-- with spring.jpa.hibernate.ddl-auto=update

-- However, for production, you should use Flyway or Liquibase migrations
-- This script shows the expected schema for reference

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: When running with JPA, tables are created automatically
-- This script is for documentation and manual setup if needed

-- Expected Tables:
-- 1. agents
-- 2. properties
-- 3. property_media
-- 4. inquiries
-- 5. conversation_messages

-- You can verify the schema after running the app with:
-- \dt    (list tables)
-- \d agents    (describe agents table)
-- \d properties    (describe properties table)
-- \d inquiries    (describe inquiries table)

-- Optional: Create a dedicated user for the application
-- CREATE USER sellerapi_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE sellerdb TO sellerapi_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sellerapi_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sellerapi_user;

