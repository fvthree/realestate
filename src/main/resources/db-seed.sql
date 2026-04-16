-- Database Seeding Script for Seller API
-- Creates a single agent account for the solo agent system

-- Insert agent account
-- Password: "password123" (hashed with BCrypt)
INSERT INTO agents (id, email, password_hash, name, phone, bio, prc_license_no, service_areas, avatar_url, facebook_url, instagram_url, website_url, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'agent@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- BCrypt hash of "password123"
    'Juan Dela Cruz',
    '+639171234567',
    'Licensed real estate broker specializing in Cavite properties. 10+ years experience in residential sales.',
    'PRC-12345',
    'Cavite (Imus, Bacoor, Dasmariñas), Metro Manila South',
    'https://ui-avatars.com/api/?name=Juan+Dela+Cruz&size=256',
    'https://facebook.com/juanagent',
    'https://instagram.com/juanagent',
    'https://juandelacruz-realestate.com',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Optional: Insert sample property (DRAFT)
INSERT INTO properties (id, agent_id, title, description, price_php, property_type, bedrooms, bathrooms, floor_area_sqm, lot_area_sqm, region, province, city_municipality, barangay, postal_code, street_address, latitude, longitude, status, created_at, updated_at)
SELECT
    gen_random_uuid(),
    id,
    '2BR Condo in Imus City',
    'Modern 2-bedroom condominium unit near SM City Imus. Fully furnished with balcony view. Walking distance to schools, malls, and public transport.',
    3500000.00,
    'CONDO',
    2,
    1,
    45.0,
    NULL,
    'CALABARZON',
    'Cavite',
    'Imus',
    'Anabu I-B',
    '4103',
    'Tower A, Unit 1205, Bria Homes',
    14.4297,
    120.9367,
    'DRAFT',
    NOW(),
    NOW()
FROM agents WHERE email = 'agent@example.com'
ON CONFLICT DO NOTHING;

-- Optional: Insert sample property (PUBLISHED)
INSERT INTO properties (id, agent_id, title, description, price_php, property_type, bedrooms, bathrooms, floor_area_sqm, lot_area_sqm, region, province, city_municipality, barangay, postal_code, street_address, latitude, longitude, status, published_at, created_at, updated_at)
SELECT
    gen_random_uuid(),
    id,
    '3BR House and Lot in Bacoor',
    'Brand new 3-bedroom house and lot in gated subdivision. 100sqm floor area, 120sqm lot. Near Aguinaldo Highway.',
    5500000.00,
    'HOUSE',
    3,
    2,
    100.0,
    120.0,
    'CALABARZON',
    'Cavite',
    'Bacoor',
    'Molino III',
    '4102',
    'Block 5 Lot 12, Vista Verde Subdivision',
    14.4564,
    120.9644,
    'PUBLISHED',
    NOW(),
    NOW(),
    NOW()
FROM agents WHERE email = 'agent@example.com'
ON CONFLICT DO NOTHING;

-- Print confirmation
DO $$
BEGIN
    RAISE NOTICE 'Seeding complete!';
    RAISE NOTICE 'Agent email: agent@example.com';
    RAISE NOTICE 'Agent password: password123';
    RAISE NOTICE 'Login endpoint: POST http://localhost:8080/api/auth/login';
END $$;

