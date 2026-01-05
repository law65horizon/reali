import { Pool } from "pg";
import { env } from "./env.js";

const pool = new Pool({
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    database: env.DB_DATABASE,
});

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
-- Drop triggers
DROP TRIGGER IF EXISTS trg_check_property_published ON property_bookings;
DROP TRIGGER IF EXISTS trg_check_experience_published ON experience_bookings;
DROP TRIGGER IF EXISTS trg_prevent_status_change_properties ON properties;
DROP TRIGGER IF EXISTS trg_prevent_status_change_experiences ON experiences;
DROP TRIGGER IF EXISTS validate_property_details ON properties;
DROP TRIGGER IF EXISTS trg_unblock_dates_after_cancel ON bookings;
DROP TRIGGER IF EXISTS trg_block_dates_after_booking ON bookings;

-- Drop trigger functions
DROP FUNCTION IF EXISTS check_property_published CASCADE;
DROP FUNCTION IF EXISTS check_experience_published CASCADE;
DROP FUNCTION IF EXISTS prevent_status_change_if_booked CASCADE;
DROP FUNCTION IF EXISTS enforce_property_details_match CASCADE;

CREATE EXTENSION IF NOT EXISTS postgis;

-- Creating ENUM type for status
--CREATE TYPE IF NOT EXISTS listing_status AS ENUM ('draft', 'published', 'pending_review', 'archived');
--CREATE TYPE sale_status AS ENUM ('rent', 'sale', 'sold');
--CREATE TYPE property_type AS ENUM ('apartment', 'house', 'hotel');

-- Creating tables

CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code CHAR(2) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_id INT NOT NULL,
    CONSTRAINT fk_country FOREIGN KEY (country_id) REFERENCES countries(id),
    CONSTRAINT unique_city_country UNIQUE (name, country_id)
);

CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city_id INT NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    CONSTRAINT fk_city FOREIGN KEY (city_id) REFERENCES cities(id),
    CONSTRAINT unique_address UNIQUE (street, city_id, postal_code)
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    uid VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    description TEXT,
    address_id INTEGER,
    password VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =========================
--  PROPERTIES
-- =========================
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    realtor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    title VARCHAR(100),
    speciality VARCHAR(100),
    property_type property_type NOT NULL,           -- e.g. 'hotel', 'apartment', 'house'
    sale_status sale_status NOT NULL,               -- e.g. 'for_rent', 'for_sale'
    price DECIMAL(10, 2),
    description TEXT,
    address_id INTEGER REFERENCES addresses(id) ON DELETE RESTRICT,
    amenities JSONB DEFAULT '[]'::jsonb,
    status listing_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_published_properties CHECK (
        status != 'published' OR (
            title IS NOT NULL AND
            speciality IS NOT NULL AND
            price IS NOT NULL AND
            address_id IS NOT NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_properties_realtor_id ON properties(realtor_id);
CREATE INDEX IF NOT EXISTS idx_properties_address_id ON properties(address_id);


-- =========================
--  ROOM TYPES
-- =========================
CREATE TABLE IF NOT EXISTS room_types (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,                -- e.g. "Deluxe Room"
    description TEXT,
    capacity INTEGER,
    bed_count INTEGER,
    bathroom_count INTEGER,
    size_sqft INTEGER,
    base_price DECIMAL(10,2),                 -- default nightly rate
    weekly_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    amenities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_types_property_id ON room_types(property_id);


-- =========================
--  ROOM UNITS
-- =========================
CREATE TABLE IF NOT EXISTS room_units (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    unit_code VARCHAR(50),        -- e.g. "Room 101"
    floor_number INTEGER,
    status VARCHAR(20) CHECK (status IN ('active','maintenance','inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_units_type_id ON room_units(room_type_id);


-- =========================
--  ROOM PRICING RULES
-- =========================
CREATE TABLE IF NOT EXISTS room_pricing_rules (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    nightly_rate DECIMAL(10,2),
    min_stay INTEGER DEFAULT 1,
    max_stay INTEGER,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_pricing_rules_date ON room_pricing_rules(room_type_id, start_date, end_date);


-- =========================
--  ROOM DURATION DISCOUNTS
-- =========================
CREATE TABLE IF NOT EXISTS room_duration_discounts (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    stay_type VARCHAR(20) CHECK (stay_type IN ('weekly','monthly')),
    discount_percent DECIMAL(5,2) CHECK (discount_percent >= 0 AND discount_percent <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =========================
--  PROPERTY IMAGES
-- =========================
CREATE TABLE IF NOT EXISTS property_images (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    meta_data VARCHAR(255),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);

CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    imageable_type VARCHAR(20) NOT NULL,
    imageable_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    meta_data VARCHAR(255),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_images_imageable ON images (imageable_type, imageable_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_checkout_session_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) CHECK (status IN ('pending','processing','succeeded','failed','cancelled','refunded')) DEFAULT 'pending',
    payment_method VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Payment refunds table
CREATE TABLE IF NOT EXISTS payment_refunds (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    stripe_refund_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) CHECK (status IN ('pending','succeeded','failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON payment_refunds(payment_id);


-- =========================
--  BOOKINGS
-- =========================
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES room_units(id) ON DELETE CASCADE,
    guest_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10,2),
    guest_count INTEGER,
    payment_status VARCHAR(20) CHECK (
      payment_status IN ('unpaid', 'partial', 'paid', 'refunded')
    ) DEFAULT 'unpaid',
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) CHECK (status IN ('pending','confirmed','cancelled')),
    source VARCHAR(50), -- e.g. 'website', 'booking.com'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_unit_id ON bookings(unit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(check_in, check_out);


-- =========================
--  RATE CALENDAR
-- =========================
CREATE TABLE IF NOT EXISTS rate_calendar (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    nightly_rate DECIMAL(10,2) NOT NULL,
    min_stay INTEGER DEFAULT 1,
    is_blocked BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (room_type_id, date)
);

CREATE INDEX IF NOT EXISTS idx_rate_calendar_date ON rate_calendar(room_type_id, date);


-- =========================
--  ROOM BLOCKS
-- =========================
CREATE TABLE IF NOT EXISTS room_blocks (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_blocks_date ON room_blocks(room_type_id, start_date, end_date);


CREATE TABLE IF NOT EXISTS property_bookings (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS experience_bookings (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS property_reviews (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS experience_reviews (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(50) NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Additional Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status, realtor_id);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON experiences (status, host_id);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties (address_id, price) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_experiences_published ON experiences (address_id, price) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_property_bookings_property_id ON property_bookings (property_id);
CREATE INDEX IF NOT EXISTS idx_experience_bookings_experience_id ON experience_bookings (experience_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON property_reviews (property_id);
CREATE INDEX IF NOT EXISTS idx_experience_reviews_experience_id ON experience_reviews (experience_id);
-- CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images (property_id);
CREATE INDEX IF NOT EXISTS idx_experience_images_experience_id ON experience_images (experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_itineraries_experience_id ON experience_itineraries (experience_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_experience_id ON itinerary_days (experience_id);
CREATE INDEX IF NOT EXISTS idx_activities_itinerary_day_id ON activities (itinerary_day_id);
CREATE INDEX IF NOT EXISTS idx_experience_faqs_experience_id ON experience_faqs (experience_id);
CREATE INDEX IF NOT EXISTS idx_properties_id_status ON properties (id, status);
CREATE INDEX IF NOT EXISTS idx_experiences_id_status ON experiences (id, status);

CREATE INDEX IF NOT EXISTS idx_verification_email_code ON verification_codes(email, code);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON verification_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_user_id ON refresh_tokens(user_id);

-- Cleanup function for expired codes (run as cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes 
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Trigger functions and triggers to enforce published status on bookings
CREATE OR REPLACE FUNCTION check_property_published() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM properties WHERE id = NEW.property_id AND status = 'published') THEN
        RAISE EXCEPTION 'Cannot book property: it must be in published status';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_property_published
BEFORE INSERT OR UPDATE ON property_bookings
FOR EACH ROW EXECUTE FUNCTION check_property_published();

CREATE OR REPLACE FUNCTION check_experience_published() RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM experiences WHERE id = NEW.experience_id AND status = 'published') THEN
        RAISE EXCEPTION 'Cannot book experience: it must be in published status';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_experience_published
BEFORE INSERT OR UPDATE ON experience_bookings
FOR EACH ROW EXECUTE FUNCTION check_experience_published();

-- Trigger to prevent invalid status transitions
CREATE OR REPLACE FUNCTION prevent_status_change_if_booked() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'published' AND NEW.status != 'published' THEN
        IF EXISTS (SELECT 1 FROM property_bookings WHERE property_id = OLD.id AND status = 'confirmed') THEN
            RAISE EXCEPTION 'Cannot change status from published: active bookings exist';
        END IF;
        IF EXISTS (SELECT 1 FROM experience_bookings WHERE experience_id = OLD.id AND status = 'confirmed') THEN
            RAISE EXCEPTION 'Cannot change status from published: active bookings exist';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_status_change_properties
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION prevent_status_change_if_booked();

CREATE TRIGGER trg_prevent_status_change_experiences
BEFORE UPDATE ON experiences
FOR EACH ROW EXECUTE FUNCTION prevent_status_change_if_booked();

-- CREATE OR REPLACE FUNCTION enforce_property_details_match()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     IF NEW.property_type = 'apartment' AND
--        NOT EXISTS (SELECT 1 FROM apartment_details WHERE property_id = NEW.id) THEN
--         RAISE EXCEPTION 'Apartment details missing for property %', NEW.id;
--     ELSIF NEW.property_type = 'house' AND
--        NOT EXISTS (SELECT 1 FROM house_details WHERE property_id = NEW.id) THEN
--         RAISE EXCEPTION 'House details missing for property %', NEW.id;
--     ELSIF NEW.property_type = 'hotel' AND
--        NOT EXISTS (SELECT 1 FROM hotel_details WHERE property_id = NEW.id) THEN
--         RAISE EXCEPTION 'Hotel details missing for property %', NEW.id;
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER validate_property_details
-- BEFORE UPDATE OR INSERT ON properties
-- FOR EACH ROW
-- EXECUTE FUNCTION enforce_property_details_match();

CREATE OR REPLACE FUNCTION calculate_nights(check_in DATE, check_out DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN (check_out - check_in);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION refresh_rate_calendar(
    p_room_type_id INT,
    p_start_date DATE,
    p_end_date DATE
) RETURNS VOID AS $$
DECLARE
    d DATE;
    base_price DECIMAL(10,2);
    rule RECORD;
BEGIN
    -- Get default base price for the room type
    SELECT rt.base_price INTO base_price
    FROM room_types rt
    WHERE rt.id = p_room_type_id;

    IF base_price IS NULL THEN
        RAISE EXCEPTION 'Room type % has no base price', p_room_type_id;
    END IF;

    -- Loop through each date in the range
    FOR d IN SELECT generate_series(p_start_date, p_end_date, interval '1 day')::DATE LOOP
        -- Check if any pricing rule applies to this date
        SELECT * INTO rule
        FROM room_pricing_rules rpr
        WHERE rpr.room_type_id = p_room_type_id
          AND d BETWEEN rpr.start_date AND rpr.end_date
        LIMIT 1;

        -- Insert or update rate_calendar
        INSERT INTO rate_calendar (room_type_id, date, nightly_rate, min_stay, is_blocked)
        VALUES (
            p_room_type_id,
            d,
            COALESCE(rule.nightly_rate, base_price),
            COALESCE(rule.min_stay, 1),
            FALSE
        )
        ON CONFLICT (room_type_id, date)
        DO UPDATE SET
            nightly_rate = EXCLUDED.nightly_rate,
            min_stay = EXCLUDED.min_stay,
            updated_at = CURRENT_TIMESTAMP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION apply_duration_discounts(p_room_type_id INT)
RETURNS VOID AS $$
DECLARE
    disc RECORD;
BEGIN
    FOR disc IN SELECT * FROM room_duration_discounts WHERE room_type_id = p_room_type_id LOOP
        UPDATE rate_calendar
        SET nightly_rate = nightly_rate * (1 - (disc.discount_percent / 100))
        WHERE room_type_id = p_room_type_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION block_booked_dates()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE rate_calendar
    SET is_blocked = TRUE
    WHERE room_type_id IN (
        SELECT room_type_id FROM room_units WHERE id = NEW.unit_id
    )
    AND date >= NEW.check_in AND date < NEW.check_out;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_dates_after_booking
AFTER INSERT OR UPDATE OF status ON bookings
FOR EACH ROW
WHEN (NEW.status = 'confirmed')
EXECUTE FUNCTION block_booked_dates();

CREATE OR REPLACE FUNCTION unblock_cancelled_dates()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE rate_calendar
    SET is_blocked = FALSE
    WHERE room_type_id IN (
        SELECT room_type_id FROM room_units WHERE id = OLD.unit_id
    )
    AND date >= OLD.check_in AND date < OLD.check_out;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_unblock_dates_after_cancel
AFTER UPDATE OF status ON bookings
FOR EACH ROW
WHEN (NEW.status = 'cancelled')
EXECUTE FUNCTION unblock_cancelled_dates();


`;

export const connectDB = async (): Promise<void> => {
    try {
        await pool.connect();
        console.log('Database connected successfully');
        await pool.query(createTableQuery);
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