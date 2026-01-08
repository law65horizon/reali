import { Pool } from "pg";
import { env } from "./env.js";

const pool = new Pool({
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    database: env.DB_DATABASE,
});

// -- View for slow queries monitoring
// CREATE OR REPLACE VIEW slow_queries AS
// SELECT 
//   query,
//   calls,
//   total_time,
//   mean_time,
//   max_time,
//   rows
// FROM pg_stat_statements
// WHERE mean_time > 100 -- queries taking > 100ms on average
// ORDER BY mean_time DESC
// LIMIT 50;
const dropTableQuery = `
-- Drop ENUM type first
--DROP TYPE IF EXISTS listing_status;

-- Drop tables in reverse order of dependencies to avoid FK issues
--DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS experience_reviews;
--DROP TABLE IF EXISTS property_reviews;
DROP TABLE IF EXISTS experience_bookings;
--DROP TABLE IF EXISTS property_bookings;
--DROP TABLE IF EXISTS experience_faqs;
--DROP TABLE IF EXISTS activities;
--DROP TABLE IF EXISTS itinerary_days;
--DROP TABLE IF EXISTS experience_itineraries;
--DROP TABLE IF EXISTS experience_images;
--DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS property_bookings;
DROP TABLE IF EXISTS property_reviews;
DROP TABLE IF EXISTS apartment_details;
DROP TABLE IF EXISTS house_details;
DROP TABLE IF EXISTS hotel_details;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_units;
DROP TABLE IF EXISTS room_pricing_rules;
DROP TABLE IF EXISTS room_duration_discounts;
DROP TABLE IF EXISTS rate_calendar;
DROP TABLE IF EXISTS room_blocks;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS properties;
--DROP TABLE IF EXISTS users;
--DROP TABLE IF EXISTS addresses;
--DROP TABLE IF EXISTS cities;
--DROP TABLE IF EXISTS countries;
`;


const createTableQuery = `
-- ============================================
-- PRODUCTION-READY DATABASE IMPROVEMENTS
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS btree_gist; -- For exclusion constraints

-- ============================================
-- ENUM TYPES (Create these first)
-- ============================================

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('draft', 'published', 'pending_review', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sale_status AS ENUM ('rent', 'sale', 'sold');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('apartment', 'house', 'hotel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- IMPROVED ADDRESSES TABLE WITH GEOSPATIAL
-- ============================================

ALTER TABLE addresses 
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude,
  ADD COLUMN IF NOT EXISTS geom GEOGRAPHY(Point, 4326);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_addresses_geom ON addresses USING GIST(geom);

-- Function to update geom from lat/lng
CREATE OR REPLACE FUNCTION update_address_geom() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.geom IS NULL THEN
        -- If geom is not set, we can't proceed (you should set it from lat/lng in application)
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- IMPROVED PROPERTIES TABLE
-- ============================================

-- Add audit columns
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

-- Add full-text search
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_properties_search 
  ON properties USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION properties_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.speciality, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_search_vector_trigger
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION properties_search_vector_update();

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_status_created 
  ON properties(status, created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_properties_realtor_status 
  ON properties(realtor_id, status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_properties_type_status 
  ON properties(property_type, sale_status, status) 
  WHERE deleted_at IS NULL AND status = 'published';

-- ============================================
-- IMPROVED ROOM TYPES
-- ============================================

ALTER TABLE room_types
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS min_nights INTEGER DEFAULT 1 CHECK (min_nights > 0),
  ADD COLUMN IF NOT EXISTS max_nights INTEGER CHECK (max_nights IS NULL OR max_nights >= min_nights);

-- Index for active room types
CREATE INDEX IF NOT EXISTS idx_room_types_active 
  ON room_types(property_id, is_active) 
  WHERE deleted_at IS NULL AND is_active = true;

-- ============================================
-- IMPROVED BOOKINGS WITH EXCLUSION CONSTRAINT
-- ============================================

-- Prevent double bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_bookings;

ALTER TABLE bookings 
  ADD CONSTRAINT no_overlapping_bookings 
  EXCLUDE USING gist (
    unit_id WITH =,
    daterange(check_in, check_out, '[]') WITH &&
  )
  WHERE (status IN ('pending', 'confirmed'));

-- Indexes for booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_guest_dates 
  ON bookings(guest_id, check_out DESC) 
  WHERE status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_bookings_property_dates 
  ON bookings USING btree(unit_id, check_in, check_out)
  WHERE status IN ('pending', 'confirmed');

-- ============================================
-- IMPROVED RATE CALENDAR
-- ============================================

-- Partition rate_calendar by month for better performance
-- Note: This requires data migration
-- CREATE TABLE rate_calendar_partitioned (
--   LIKE rate_calendar INCLUDING ALL
-- ) PARTITION BY RANGE (date);

-- Add derived columns for faster queries
ALTER TABLE rate_calendar
  ADD COLUMN IF NOT EXISTS is_weekend BOOLEAN 
    GENERATED ALWAYS AS (EXTRACT(DOW FROM date) IN (0, 6)) STORED;

-- Index for availability queries
CREATE INDEX IF NOT EXISTS idx_rate_calendar_available 
  ON rate_calendar(room_type_id, date, is_blocked)
  WHERE is_blocked = false;

-- ============================================
-- PAYMENT TRACKING IMPROVEMENTS
-- ============================================

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10,2),
  ADD CONSTRAINT check_refund_amount 
    CHECK (refunded_amount IS NULL OR refunded_amount <= amount);

-- Index for payment reconciliation
CREATE INDEX IF NOT EXISTS idx_payments_status_created 
  ON payments(status, created_at DESC);

-- ============================================
-- AUDIT TRAIL TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id BIGINT NOT NULL,
  action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  changed_by INTEGER REFERENCES users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record 
  ON audit_log(table_name, record_id, changed_at DESC);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := row_to_json(OLD)::JSONB;
    INSERT INTO audit_log (table_name, record_id, action, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, old_data);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := row_to_json(OLD)::JSONB;
    new_data := row_to_json(NEW)::JSONB;
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, old_data, new_data);
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    new_data := row_to_json(NEW)::JSONB;
    INSERT INTO audit_log (table_name, record_id, action, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, new_data);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_properties ON properties;
CREATE TRIGGER audit_properties
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_bookings ON bookings;
CREATE TRIGGER audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================


-- ============================================
-- MATERIALIZED VIEW FOR PROPERTY STATS
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS property_stats AS
SELECT 
  p.id,
  p.realtor_id,
  COUNT(DISTINCT rt.id) as room_type_count,
  COUNT(DISTINCT ru.id) as total_units,
  COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
  AVG(pr.rating) as avg_rating,
  COUNT(pr.id) as review_count,
  MIN(rt.base_price) as min_price,
  MAX(rt.base_price) as max_price
FROM properties p
LEFT JOIN room_types rt ON rt.property_id = p.id
LEFT JOIN room_units ru ON ru.room_type_id = rt.id
LEFT JOIN bookings b ON b.unit_id = ru.id
LEFT JOIN property_reviews pr ON pr.property_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.realtor_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_stats_id 
  ON property_stats(id);

-- Refresh function (call periodically via cron)
CREATE OR REPLACE FUNCTION refresh_property_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY property_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Clean up old rate calendar entries
CREATE OR REPLACE FUNCTION cleanup_old_rate_calendar()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_calendar 
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes 
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Clean up old refresh tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATABASE MAINTENANCE FUNCTIONS
-- ============================================

-- Analyze tables for query planner
CREATE OR REPLACE FUNCTION analyze_critical_tables()
RETURNS void AS $$
BEGIN
  ANALYZE properties;
  ANALYZE room_types;
  ANALYZE bookings;
  ANALYZE rate_calendar;
  ANALYZE addresses;
END;
$$ LANGUAGE plpgsql;

-- Vacuum critical tables
CREATE OR REPLACE FUNCTION vacuum_critical_tables()
RETURNS void AS $$
BEGIN
  VACUUM ANALYZE properties;
  VACUUM ANALYZE room_types;
  VACUUM ANALYZE bookings;
  VACUUM ANALYZE rate_calendar;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RECOMMENDED CRON JOBS (pg_cron extension)
-- ============================================

-- Install pg_cron if not already:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup jobs
-- SELECT cron.schedule('cleanup-codes', '0 2 * * *', 'SELECT cleanup_expired_codes()');
-- SELECT cron.schedule('cleanup-tokens', '0 3 * * *', 'SELECT cleanup_expired_tokens()');
-- SELECT cron.schedule('cleanup-calendar', '0 4 * * 0', 'SELECT cleanup_old_rate_calendar()');
-- SELECT cron.schedule('refresh-stats', '*/15 * * * *', 'SELECT refresh_property_stats()');
-- SELECT cron.schedule('analyze-tables', '0 5 * * *', 'SELECT analyze_critical_tables()');
`
export const connectDB = async (): Promise<void> => {
    try {
        await pool.connect();
        console.log('Database connected successfully');
        // await pool.query(createTableQuery);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error connecting to database or creating tables:', error);
        throw error;
    }
};

export default pool;

// import { env } from "./env.js";

// const pool = new Pool({
//     user: env.DB_USER,
//     password: env.DB_PASSWORD,
//     host: env.DB_HOST,
//     port: Number(env.DB_PORT),
//     database: env.DB_DATABASE,
// })

// // const dropTableQuery = `
// // DROP TABLE IF EXISTS properties CASCADE;
// // DROP TABLE IF EXISTS addresses CASCADE;
// // DROP TABLE IF EXISTS images CASCADE;
// // DROP TABLE IF EXISTS users CASCADE;
// // `

// const dropTableQuery = `
// -- Drop tables in reverse order of dependencies to avoid FK issues
// DROP TABLE IF EXISTS messages;
// DROP TABLE IF EXISTS experience_reviews;
// DROP TABLE IF EXISTS property_reviews;
// DROP TABLE IF EXISTS experience_bookings;
// DROP TABLE IF EXISTS property_bookings;
// DROP TABLE IF EXISTS experience_faqs;
// DROP TABLE IF EXISTS activities;
// DROP TABLE IF EXISTS itinerary_days;
// DROP TABLE IF EXISTS experience_itineraries;
// DROP TABLE IF EXISTS experience_images;
// DROP TABLE IF EXISTS experiences;
// DROP TABLE IF EXISTS property_images;
// DROP TABLE IF EXISTS images;
// DROP TABLE IF EXISTS reviews;
// DROP TABLE IF EXISTS properties;
// -- DROP TABLE IF EXISTS users;
// -- DROP TABLE IF EXISTS addresses;
// -- DROP TABLE IF EXISTS cities;
// -- DROP TABLE IF EXISTS countries;

// `

// const createTableQuery = `
            
//             CREATE TABLE IF NOT EXISTS addresses (
//                 id SERIAL PRIMARY KEY,
//                 street VARCHAR(255) NOT NULL,
//                 city VARCHAR(100) NOT NULL,
//                 postal_code VARCHAR(20),
//                 country VARCHAR(100) NOT NULL,
//                 latitude DECIMAL(9,6),
//                 longitude DECIMAL(9,6),
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             );
//             CREATE TABLE IF NOT EXISTS users(
//                 id SERIAL PRIMARY KEY,
//                 name VARCHAR(100) NOT NULL,
//                 email VARCHAR(100) UNIQUE NOT NULL,
//                 uid VARCHAR(100) NOT NULL,
//                 phone VARCHAR(20),
//                 description TEXT,
//                 address_id INTEGER,
//                 password VARCHAR(200),
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL ON UPDATE CASCADE
//             );
//             CREATE TABLE IF NOT EXISTS properties (
//                 id SERIAL PRIMARY KEY,
//                 realtor_id INTEGER NOT NULL,
//                 title VARCHAR(100) NOT NULL,
//                 speciality VARCHAR(100) NOT NULL,
//                 price DECIMAL(10, 2) NOT NULL,
//                 description TEXT,
//                 address_id INTEGER NOT NULL REFERENCES addresses(id) on DELETE RESTRICT,
//                 amenities JSONB DEFAULT '[]'::jsonb, -- New column for ameniies,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (realtor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
//             );
//             CREATE TABLE IF NOT EXISTS images (
//                 id SERIAL PRIMARY KEY,
//                 property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
//                 image_url TEXT NOT NULL,
//                 meta_data TEXT,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             );
//             CREATE TABLE IF NOT EXISTS bookings (
//                 id SERIAL PRIMARY KEY,
//                 property_id INTEGER NOT NULL,
//                 user_id INTEGER NOT NULL,
//                 start_date DATE NOT NULL,
//                 end_date DATE NOT NULL,
//                 status VARCHAR(20) DEFAULT 'pending',
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
//                 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
//             );
//             CREATE TABLE IF NOT EXISTS messages (
//                 id SERIAL PRIMARY KEY,
//                 chat_id VARCHAR(50) NOT NULL,
//                 sender_id INTEGER NOT NULL,
//                 content TEXT NOT NULL,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
//             );
//             CREATE TABLE IF NOT EXISTS reviews (
//                 id SERIAL PRIMARY KEY,
//                 property_id INTEGER NOT NULL,
//                 user_id INTEGER NOT NULL,
//                 rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
//                 comment TEXT,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//                 FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
//                 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
//             );
//         `

// export const connectDB = async (): Promise<void> => {
//     try {
//         await pool.connect()
//         console.log('Database connected successfully')

//         const createTableQuery = `
//           -- Creating ENUM type for status
// CREATE TYPE listing_status AS ENUM ('draft', 'published', 'pending_review', 'archived');

// -- Creating tables
// CREATE TABLE IF NOT EXISTS countries (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100) NOT NULL UNIQUE,
//     code CHAR(2) NOT NULL UNIQUE  -- e.g., 'US', 'FR'
// );

// CREATE TABLE IF NOT EXISTS cities (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100) NOT NULL,
//     country_id INT NOT NULL,
//     CONSTRAINT fk_country FOREIGN KEY (country_id) REFERENCES countries(id),
//     CONSTRAINT unique_city_country UNIQUE (name, country_id)
// );

// CREATE TABLE IF NOT EXISTS addresses (
//     id SERIAL PRIMARY KEY,
//     street VARCHAR(255) NOT NULL,
//     city_id INT NOT NULL,
//     postal_code VARCHAR(20),
//     latitude DECIMAL(9,6),
//     longitude DECIMAL(9,6),
//     CONSTRAINT fk_city FOREIGN KEY (city_id) REFERENCES cities(id),
//     CONSTRAINT unique_address UNIQUE (street, city_id, postal_code)
// );

// CREATE TABLE IF NOT EXISTS users(
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100) NOT NULL,
//     email VARCHAR(100) UNIQUE NOT NULL,
//     uid VARCHAR(100) NOT NULL,
//     phone VARCHAR(20),
//     description TEXT,
//     address_id INTEGER,
//     password VARCHAR(200),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL ON UPDATE CASCADE
// );

// CREATE TABLE IF NOT EXISTS properties (
//     id SERIAL PRIMARY KEY,
//     realtor_id INTEGER NOT NULL,
//     title VARCHAR(100), -- Removed NOT NULL
//     speciality VARCHAR(100), -- Removed NOT NULL
//     price DECIMAL(10, 2), -- Removed NOT NULL
//     description TEXT,
//     address_id INTEGER, -- Removed NOT NULL
//     amenities JSONB DEFAULT '[]'::jsonb,
//     status listing_status NOT NULL DEFAULT 'draft',
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
//     FOREIGN KEY (realtor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
//     CONSTRAINT check_published_properties CHECK (
//         status != 'published' OR (
//             title IS NOT NULL AND
//             speciality IS NOT NULL AND
//             price IS NOT NULL AND
//             address_id IS NOT NULL
//         )
//     )
// );

// CREATE TABLE IF NOT EXISTS property_images (
//     id BIGSERIAL PRIMARY KEY,
//     property_id BIGINT NOT NULL,
//     url VARCHAR(255) NOT NULL,
//     meta_data VARCHAR(255),
//     caption TEXT,
//     FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
// );

// CREATE TABLE IF NOT EXISTS experiences(
//     id BIGSERIAL PRIMARY KEY,
//     host_id INTEGER NOT NULL,
//     title VARCHAR(100), -- Removed NOT NULL
//     brief_bio VARCHAR(225), -- Removed NOT NULL
//     category VARCHAR(50), -- Removed NOT NULL
//     years_of_experience INTEGER, -- Removed NOT NULL
//     professional_title VARCHAR(100), -- Removed NOT NULL
//     price DECIMAL(10, 2), -- Removed NOT NULL
//     group_size_min INTEGER, -- Removed NOT NULL
//     group_size_max INTEGER, -- Removed NOT NULL
//     duration_minutes INTEGER, -- Removed NOT NULL
//     experience_overview TEXT, -- Removed NOT NULL
//     cancellation_policy TEXT,
//     address_id INTEGER, -- Removed NOT NULL
//     status listing_status NOT NULL DEFAULT 'draft',
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
//     FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
//     CONSTRAINT check_published_experiences CHECK (
//         status != 'published' OR (
//             title IS NOT NULL AND
//             brief_bio IS NOT NULL AND
//             category IS NOT NULL AND
//             years_of_experience IS NOT NULL AND
//             professional_title IS NOT NULL AND
//             price IS NOT NULL AND
//             group_size_min IS NOT NULL AND
//             group_size_max IS NOT NULL AND
//             duration_minutes IS NOT NULL AND
//             experience_overview IS NOT NULL AND
//             address_id IS NOT NULL
//         )
//     )
// );

// CREATE TABLE IF NOT EXISTS experience_images (
//     id BIGSERIAL PRIMARY KEY,
//     experience_id BIGINT NOT NULL,
//     url VARCHAR(255) NOT NULL,
//     meta_data VARCHAR(255),
//     caption TEXT,
//     FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
// );

// CREATE TABLE IF NOT EXISTS experience_itineraries (
//     id BIGSERIAL PRIMARY KEY,
//     experience_id BIGINT NOT NULL,
//     day INTEGER NOT NULL,
//     description TEXT NOT NULL,
//     start_time TIME,
//     end_time TIME,
//     FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
//     CONSTRAINT valid_time_range CHECK (end_time >= start_time OR end_time IS NULL),
//     CONSTRAINT unique_day_per_experience UNIQUE (experience_id, day)
// );

// CREATE TABLE IF NOT EXISTS itinerary_days (
//     id BIGSERIAL PRIMARY KEY,
//     experience_id BIGINT NOT NULL,
//     date DATE NOT NULL,
//     FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
//     CONSTRAINT unique_date_per_experience UNIQUE (experience_id, date)
// );

// CREATE TABLE IF NOT EXISTS activities (
//     id BIGSERIAL PRIMARY KEY,
//     itinerary_day_id BIGINT NOT NULL,
//     title VARCHAR(100) NOT NULL,
//     description TEXT,
//     start_time TIME,
//     end_time TIME,
//     url VARCHAR(255),
//     location VARCHAR(100),
//     FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE,
//     CONSTRAINT valid_time_range CHECK (end_time >= start_time OR end_time IS NULL)
// );

// CREATE TABLE IF NOT EXISTS experience_faqs (
//     id BIGSERIAL PRIMARY KEY,
//     experience_id BIGINT NOT NULL,
//     question VARCHAR(255) NOT NULL,
//     answer TEXT NOT NULL,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
// );

// CREATE TABLE IF NOT EXISTS property_bookings (
//     id BIGSERIAL PRIMARY KEY,
//     property_id BIGINT NOT NULL,
//     user_id INTEGER NOT NULL,
//     start_date DATE NOT NULL,
//     end_date DATE NOT NULL,
//     status VARCHAR(20) DEFAULT 'pending',
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
//     CONSTRAINT valid_date_range CHECK (end_date >= start_date),
//     CONSTRAINT check_published_property CHECK (
//         EXISTS (SELECT 1 FROM properties WHERE id = property_id AND status = 'published')
//     )
// );

// CREATE TABLE IF NOT EXISTS experience_bookings (
//     id BIGSERIAL PRIMARY KEY,
//     experience_id BIGINT NOT NULL,
//     user_id INTEGER NOT NULL,
//     start_date DATE NOT NULL,
//     end_date DATE NOT NULL,
//     status VARCHAR(20) DEFAULT 'pending',
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE RESTRICT,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
//     CONSTRAINT valid_date_range CHECK (end_date >= start_date),
//     CONSTRAINT check_published_experience CHECK (
//         EXISTS (SELECT 1 FROM experiences WHERE id = experience_id AND status = 'published')
//     )
// );

// CREATE TABLE IF NOT EXISTS property_reviews (
//     id BIGSERIAL PRIMARY KEY,
//     property_id BIGINT NOT NULL,
//     user_id INTEGER NOT NULL,
//     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
//     comment TEXT,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
// );

// CREATE TABLE IF NOT EXISTS experience_reviews (
//     id BIGSERIAL PRIMARY KEY,
//     experience_id BIGINT NOT NULL,
//     user_id INTEGER NOT NULL,
//     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
//     comment TEXT,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE RESTRICT,
//     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
// );

// CREATE TABLE IF NOT EXISTS messages (
//     id SERIAL PRIMARY KEY,
//     chat_id VARCHAR(50) NOT NULL,
//     sender_id INTEGER NOT NULL,
//     content TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
// );

// -- Additional Indexes for Performance
// CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status, realtor_id);
// CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences (status, host_id);
// CREATE INDEX IF NOT EXISTS idx_properties_published ON properties (address_id, price) WHERE status = 'published';
// CREATE INDEX IF NOT EXISTS idx_experiences_published ON experiences (address_id, price) WHERE status = 'published';
// CREATE INDEX IF NOT EXISTS idx_property_bookings_property_id ON property_bookings (property_id);
// CREATE INDEX IF NOT EXISTS idx_experience_bookings_experience_id ON experience_bookings (experience_id);
// CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews (property_id);
// CREATE INDEX IF NOT EXISTS idx_experience_reviews_experience_id ON experience_reviews (experience_id);
// CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images (property_id);
// CREATE INDEX IF NOT EXISTS idx_experience_images_experience_id ON experience_images (experience_id);
// CREATE INDEX IF NOT EXISTS idx_experience_itineraries_experience_id ON experience_itineraries (experience_id);
// CREATE INDEX IF NOT EXISTS idx_itinerary_days_experience_id ON itinerary_days (experience_id);
// CREATE INDEX IF NOT EXISTS idx_activities_itinerary_day_id ON activities (itinerary_day_id);
// CREATE INDEX IF NOT EXISTS idx_experience_faqs_experience_id ON experience_faqs (experience_id);
//         `

//         // const createTableQuery = `
          
//         //     CREATE TABLE IF NOT EXISTS countries (
//         //         id SERIAL PRIMARY KEY,
//         //         name VARCHAR(100) NOT NULL UNIQUE,
//         //         code CHAR(2) NOT NULL UNIQUE  -- e.g., 'US', 'FR'
//         //     );

//         //     CREATE TABLE IF NOT EXISTS cities (
//         //         id SERIAL PRIMARY KEY,
//         //         name VARCHAR(100) NOT NULL,
//         //         country_id INT NOT NULL,
//         //         CONSTRAINT fk_country FOREIGN KEY (country_id) REFERENCES countries(id),
//         //         CONSTRAINT unique_city_country UNIQUE (name, country_id)
//         //     );

//         //     CREATE TABLE IF NOT EXISTS addresses (
//         //         id SERIAL PRIMARY KEY,
//         //         street VARCHAR(255) NOT NULL,
//         //         city_id INT NOT NULL,
//         //         postal_code VARCHAR(20),
//         //         latitude DECIMAL(9,6),
//         //         longitude DECIMAL(9,6),
//         //         CONSTRAINT fk_city FOREIGN KEY (city_id) REFERENCES cities(id),
//         //         CONSTRAINT unique_address UNIQUE (street, city_id, postal_code)
//         //     );
//         //     CREATE TABLE IF NOT EXISTS users(
//         //         id SERIAL PRIMARY KEY,
//         //         name VARCHAR(100) NOT NULL,
//         //         email VARCHAR(100) UNIQUE NOT NULL,
//         //         uid VARCHAR(100) NOT NULL,
//         //         phone VARCHAR(20),
//         //         description TEXT,
//         //         address_id INTEGER,
//         //         password VARCHAR(200),
//         //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL ON UPDATE CASCADE
//         //     );
            
//         //     CREATE TABLE IF NOT EXISTS properties (
//         //         id SERIAL PRIMARY KEY,
//         //         realtor_id INTEGER NOT NULL,
//         //         title VARCHAR(100) NOT NULL,
//         //         speciality VARCHAR(100) NOT NULL,
//         //         price DECIMAL(10, 2) NOT NULL,
//         //         description TEXT,
//         //         address_id INTEGER NOT NULL,
//         //         amenities JSONB DEFAULT '[]'::jsonb, -- New column for ameniies
//         //         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
//         //         FOREIGN KEY (realtor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
//         //     );

//         //     CREATE TABLE IF NOT EXISTS property_images (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         property_id BIGINT NOT NULL,
//         //         url VARCHAR(255) NOT NULL,
//         //         meta_data VARCHAR(255),
//         //         caption TEXT,
//         //         FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
//         //     );

//         //     CREATE TABLE IF NOT EXISTS experiences(
//         //         id BIGSERIAL PRIMARY KEY,
//         //         host_id INTEGER NOT NULL,
//         //         title VARCHAR(100) NOT NULL,
//         //         brief_bio VARCHAR(225) NOT NULL,
//         //         category VARCHAR(50) NOT NULL,
//         //         years_of_experience INTEGER NOT NULL,
//         //         professional_title VARCHAR(100) NOT NULL,
//         //         price DECIMAL(10, 2) NOT NULL,
//         //         group_size_min INTEGER NOT NULL,
//         //         group_size_max INTEGER NOT NULL,
//         //         duration_minutes INTEGER NOT NULL,  -- Replaced INTERVAL with INTEGER (minutes)
//         //         experience_overview TEXT NOT NULL,
//         //         cancellation_policy TEXT,
//         //         address_id INTEGER NOT NULL,
//         //         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
//         //         FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
//         //     );

//         //     CREATE TABLE IF NOT EXISTS experience_images (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         experience_id BIGINT NOT NULL,
//         //         url VARCHAR(255) NOT NULL,
//         //         meta_data VARCHAR(255),  -- Made non-nullable for accessibility
//         //         caption TEXT,
//         //         FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
//         //     );

//         //     CREATE TABLE IF NOT EXISTS experience_itineraries (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         experience_id BIGINT NOT NULL,
//         //         day INTEGER NOT NULL,
//         //         description TEXT NOT NULL,
//         //         start_time TIME,
//         //         end_time TIME,
//         //         FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
//         //         CONSTRAINT valid_time_range CHECK (end_time >= start_time OR end_time IS NULL),
//         //         CONSTRAINT unique_day_per_experience UNIQUE (experience_id, day)
//         //     );

//         //     CREATE TABLE IF NOT EXISTS itinerary_days (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         experience_id BIGINT NOT NULL,
//         //         date DATE NOT NULL,
//         //         FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
//         //         CONSTRAINT unique_date_per_experience UNIQUE (experience_id, date)
//         //     );

//         //     CREATE TABLE IF NOT EXISTS activities (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         itinerary_day_id BIGINT NOT NULL,
//         //         title VARCHAR(100) NOT NULL,
//         //         description TEXT,
//         //         start_time TIME,
//         //         end_time TIME,
//         //         url VARCHAR(255),
//         //         location VARCHAR(100),
//         //         FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE,
//         //         CONSTRAINT valid_time_range CHECK (end_time >= start_time OR end_time IS NULL)
//         //     );

//         //     CREATE TABLE IF NOT EXISTS experience_faqs (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         experience_id BIGINT NOT NULL,
//         //         question VARCHAR(255) NOT NULL,
//         //         answer TEXT NOT NULL,
//         //         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
//         //     );

//         //     CREATE TABLE IF NOT EXISTS property_bookings (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         property_id BIGINT NOT NULL,
//         //         user_id INTEGER NOT NULL,
//         //         start_date DATE NOT NULL,
//         //         end_date DATE NOT NULL,
//         //         status VARCHAR(20) DEFAULT 'pending',
//         //         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
//         //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
//         //         CONSTRAINT valid_date_range CHECK (end_date >= start_date)
//         //     );

//         //     CREATE TABLE IF NOT EXISTS experience_bookings (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         experience_id BIGINT NOT NULL,
//         //         user_id INTEGER NOT NULL,
//         //         start_date DATE NOT NULL,
//         //         end_date DATE NOT NULL,
//         //         status VARCHAR(20) DEFAULT 'pending',
//         //         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE RESTRICT,
//         //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
//         //         CONSTRAINT valid_date_range CHECK (end_date >= start_date)
//         //     );

//         //     CREATE TABLE IF NOT EXISTS property_reviews (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         property_id BIGINT NOT NULL,
//         //         user_id INTEGER NOT NULL,
//         //         rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
//         //         comment TEXT,
//         //         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
//         //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
//         //     );

//         //     CREATE TABLE IF NOT EXISTS experience_reviews (
//         //         id BIGSERIAL PRIMARY KEY,
//         //         experience_id BIGINT NOT NULL,
//         //         user_id INTEGER NOT NULL,
//         //         rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
//         //         comment TEXT,
//         //         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE RESTRICT,
//         //         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
//         //     );

//         //     CREATE TABLE IF NOT EXISTS messages (
//         //         id SERIAL PRIMARY KEY,
//         //         chat_id VARCHAR(50) NOT NULL,
//         //         sender_id INTEGER NOT NULL,
//         //         content TEXT NOT NULL,
//         //         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         //         FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
//         //     );

//         //     -- Additional Indexes for Performance
//         //     CREATE INDEX IF NOT EXISTS idx_property_bookings_property_id ON property_bookings (property_id);
//         //     CREATE INDEX IF NOT EXISTS idx_experience_bookings_experience_id ON experience_bookings (experience_id);
//         //     CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews (property_id);
//         //     CREATE INDEX IF NOT EXISTS idx_experience_reviews_experience_id ON experience_reviews (experience_id);
//         //     CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images (property_id);
//         //     CREATE INDEX IF NOT EXISTS idx_experience_images_experience_id ON experience_images (experience_id);
//         //     CREATE INDEX IF NOT EXISTS idx_experience_itineraries_experience_id ON experience_itineraries (experience_id);
//         //     CREATE INDEX IF NOT EXISTS idx_itinerary_days_experience_id ON itinerary_days (experience_id);
//         //     CREATE INDEX IF NOT EXISTS idx_activities_itinerary_day_id ON activities (itinerary_day_id);
//         //     CREATE INDEX IF NOT EXISTS idx_experience_faqs_experience_id ON experience_faqs (experience_id);
//         // `

//         await pool.query(createTableQuery)
//         console.log('Tables created successfully')
//     } catch (error) {
//         console.error('Error connecting to database or creating tables:', error)
//         throw error;
//     }
// }


// export default pool;