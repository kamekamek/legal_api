-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Legal information table
CREATE TABLE legal_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    zone_type VARCHAR(100) NOT NULL,
    fire_prevention VARCHAR(100),
    coverage_ratio INTEGER,
    floor_area_ratio INTEGER,
    height_district VARCHAR(100),
    area_classification VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Building restrictions table
CREATE TABLE building_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_info_id UUID REFERENCES legal_info(id) ON DELETE CASCADE,
    restriction_type VARCHAR(100),
    allowed_uses JSONB,
    restrictions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Regulations table
CREATE TABLE regulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_info_id UUID REFERENCES legal_info(id) ON DELETE CASCADE,
    regulation_type VARCHAR(100),
    content TEXT,
    effective_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_info_updated_at
    BEFORE UPDATE ON legal_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON projects
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON projects
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON projects
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Enable read access for all users" ON legal_info
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON legal_info
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON legal_info
    FOR UPDATE
    USING (auth.role() = 'authenticated'); 