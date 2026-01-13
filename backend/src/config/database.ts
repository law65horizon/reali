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
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;


DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('draft','published','pending_review','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sale_status AS ENUM ('rent','sale','sold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('apartment','house','hotel');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending','confirmed','cancelled','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid','partial','paid','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code CHAR(2) UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_countries_name
ON countries (name);

CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country_id INT NOT NULL REFERENCES countries(id),
  UNIQUE(name, country_id)
);

CREATE INDEX IF NOT EXISTS idx_cities_name_trgm
ON cities USING GIN (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  street VARCHAR(255) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id),
  postal_code VARCHAR(20),
  geom GEOGRAPHY(Point, 4326),
  UNIQUE(street, city_id, postal_code)
);

CREATE INDEX IF NOT EXISTS idx_addresses_street_trgm
ON addresses USING GIN (street gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_addresses_geom
ON addresses USING GIST(geom);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  uid VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  description TEXT,
  address_id INT REFERENCES addresses(id) ON DELETE SET NULL,
  password VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  realtor_id INT NOT NULL REFERENCES users(id),
  title VARCHAR(100),
  speciality VARCHAR(100),
  property_type property_type NOT NULL,
  sale_status sale_status NOT NULL,
  price DECIMAL(10,2),
  description TEXT,
  address_id INT REFERENCES addresses(id),
  amenities JSONB DEFAULT '[]',
  status listing_status DEFAULT 'draft',
  search_vector TSVECTOR,
  deleted_at TIMESTAMPTZ,
  updated_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_properties_search
ON properties USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_properties_active
ON properties(status, created_at DESC)
WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION properties_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.speciality,'')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description,'')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_properties_search ON properties;

CREATE TRIGGER trg_properties_search
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION properties_search_vector_update();

CREATE TABLE IF NOT EXISTS room_types (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INT,
  bed_count INT,
  bathroom_count INT,
  size_sqft INT,
  base_price DECIMAL(10,2),
  weekly_rate DECIMAL(10,2),
  monthly_rate DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  amenities JSONB DEFAULT '[]',
  min_nights INT DEFAULT 1 CHECK (min_nights > 0),
  max_nights INT CHECK (max_nights IS NULL OR max_nights >= min_nights),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_units (
  id SERIAL PRIMARY KEY,
  room_type_id INT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  unit_code VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('active','maintenance','inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  unit_id INT NOT NULL REFERENCES room_units(id) ON DELETE CASCADE,
  guest_id INT NOT NULL REFERENCES users(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10,2),
  status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
  ALTER TABLE bookings
  ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING GIST (
    unit_id WITH =,
    daterange(check_in, check_out, '[]') WITH &&
  )
  WHERE (status IN ('pending','confirmed'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS rate_calendar (
  id SERIAL PRIMARY KEY,
  room_type_id INT REFERENCES room_types(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  nightly_rate DECIMAL(10,2) NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  is_weekend BOOLEAN GENERATED ALWAYS AS (
    EXTRACT(DOW FROM date) IN (0,6)
  ) STORED,
  UNIQUE(room_type_id, date)
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  booking_id INT REFERENCES bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status payment_status DEFAULT 'unpaid',
  refunded_amount DECIMAL(10,2),
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CHECK (refunded_amount IS NULL OR refunded_amount <= amount)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(table_name,record_id,action,old_data)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log(table_name,record_id,action,old_data,new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSE
    INSERT INTO audit_log(table_name,record_id,action,new_data)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_properties ON properties;
CREATE TRIGGER audit_properties
AFTER INSERT OR UPDATE OR DELETE ON properties
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_bookings ON bookings;
CREATE TRIGGER audit_bookings
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

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
