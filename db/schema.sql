-- Initial Schema for NeighborNet
-- Compatible with Supabase, Neon, and standard PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Neighbors (Users)
CREATE TABLE neighbors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Admin', 'Resident', 'Board Member')) DEFAULT 'Resident',
    address TEXT,
    avatar TEXT,
    skills TEXT[], -- Array of strings
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT false
);

-- 2. Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT,
    category TEXT CHECK (category IN ('Social', 'HOA', 'Maintenance', 'Security')),
    organizer_id UUID REFERENCES neighbors(id),
    attendees_count INT DEFAULT 0
);

-- 3. Marketplace Items
CREATE TABLE marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    is_negotiable BOOLEAN DEFAULT false,
    images TEXT[],
    status TEXT CHECK (status IN ('Active', 'Sold', 'Expired')) DEFAULT 'Active',
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    seller_id UUID REFERENCES neighbors(id)
);

-- 4. Community Resources
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('Facility', 'Tool', 'Vehicle')),
    capacity INT,
    description TEXT,
    is_reservable BOOLEAN DEFAULT true,
    image_url TEXT
);

-- 5. HOA Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    size TEXT,
    url TEXT,
    uploader_id UUID REFERENCES neighbors(id)
);

-- Row Level Security (RLS) Policies (Examples for Supabase)
-- ALTER TABLE neighbors ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public profiles are viewable by everyone" ON neighbors FOR SELECT USING (true);
