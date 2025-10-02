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
DROP TABLE IF EXISTS experience_faqs;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS itinerary_days;
DROP TABLE IF EXISTS experience_itineraries;
DROP TABLE IF EXISTS experience_images;
DROP TABLE IF EXISTS experiences;
--DROP TABLE IF EXISTS property_images;
--DROP TABLE IF EXISTS properties;
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

-- Drop trigger functions
DROP FUNCTION IF EXISTS check_property_published CASCADE;
DROP FUNCTION IF EXISTS check_experience_published CASCADE;
DROP FUNCTION IF EXISTS prevent_status_change_if_booked CASCADE;

-- Creating ENUM type for status
--CREATE TYPE IF NOT EXISTS listing_status AS ENUM ('draft', 'published', 'pending_review', 'archived');

-- Creating tables
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

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    realtor_id INTEGER NOT NULL,
    title VARCHAR(100),
    speciality VARCHAR(100),
    price DECIMAL(10, 2),
    description TEXT,
    address_id INTEGER,
    amenities JSONB DEFAULT '[]'::jsonb,
    status listing_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
    FOREIGN KEY (realtor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT check_published_properties CHECK (
        status != 'published' OR (
            title IS NOT NULL AND
            speciality IS NOT NULL AND
            price IS NOT NULL AND
            address_id IS NOT NULL
        )
    )
);

CREATE TABLE IF NOT EXISTS property_images (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    url VARCHAR(255) NOT NULL,
    meta_data VARCHAR(255),
    caption TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiences (
    id BIGSERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL,
    title VARCHAR(100),
    brief_bio VARCHAR(225),
    category VARCHAR(50),
    years_of_experience INTEGER,
    professional_title VARCHAR(100),
    price DECIMAL(10, 2),
    group_size_min INTEGER,
    group_size_max INTEGER,
    duration_minutes INTEGER,
    experience_overview TEXT,
    cancellation_policy TEXT,
    address_id INTEGER,
    status listing_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT check_published_experiences CHECK (
        status != 'published' OR (
            title IS NOT NULL AND
            brief_bio IS NOT NULL AND
            category IS NOT NULL AND
            years_of_experience IS NOT NULL AND
            professional_title IS NOT NULL AND
            price IS NOT NULL AND
            group_size_min IS NOT NULL AND
            group_size_max IS NOT NULL AND
            duration_minutes IS NOT NULL AND
            experience_overview IS NOT NULL AND
            address_id IS NOT NULL
        )
    )
);

CREATE TABLE IF NOT EXISTS experience_images (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL,
    url VARCHAR(255) NOT NULL,
    meta_data VARCHAR(255),
    caption TEXT,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experience_itineraries (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL,
    day INTEGER NOT NULL,
    description TEXT NOT NULL,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    CONSTRAINT valid_time_range CHECK (end_time >= start_time OR end_time IS NULL),
    CONSTRAINT unique_day_per_experience UNIQUE (experience_id, day)
);

CREATE TABLE IF NOT EXISTS itinerary_days (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE,
    CONSTRAINT unique_date_per_experience UNIQUE (experience_id, date),
    CONSTRAINT valid_time_range CHECK (end_time >= start_time OR end_time IS NULL)
);

CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
    itinerary_day_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    thumbnail_url VARCHAR(255),
    location VARCHAR(100),
    FOREIGN KEY (itinerary_day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experience_faqs (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
);

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
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images (property_id);
CREATE INDEX IF NOT EXISTS idx_experience_images_experience_id ON experience_images (experience_id);
CREATE INDEX IF NOT EXISTS idx_experience_itineraries_experience_id ON experience_itineraries (experience_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_experience_id ON itinerary_days (experience_id);
CREATE INDEX IF NOT EXISTS idx_activities_itinerary_day_id ON activities (itinerary_day_id);
CREATE INDEX IF NOT EXISTS idx_experience_faqs_experience_id ON experience_faqs (experience_id);
CREATE INDEX IF NOT EXISTS idx_properties_id_status ON properties (id, status);
CREATE INDEX IF NOT EXISTS idx_experiences_id_status ON experiences (id, status);

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

// import { Pool } from "pg";
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