-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    location text,
    description text,
    status text NOT NULL CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create legal_info table
CREATE TABLE legal_info (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    type text,
    fire_area text,
    building_coverage_ratio numeric,
    building_coverage_ratio2 numeric,
    floor_area_ratio numeric,
    height_district text,
    height_district2 text,
    zone_map text,
    scenic_zone_name text,
    scenic_zone_type text,
    article_48 text,
    appendix_2 text,
    safety_ordinance text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create project_kokuji table
CREATE TABLE project_kokuji (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    kokuji_id text NOT NULL,
    kokuji_text text,
    memo text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create building_calculations table
CREATE TABLE building_calculations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    site_area numeric,
    road_width numeric,
    coverage_ratio numeric,
    floor_area_ratio numeric,
    buildable_area numeric,
    total_floor_area numeric,
    road_width_limit numeric,
    effective_ratio numeric,
    memo text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_info_updated_at
    BEFORE UPDATE ON legal_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_kokuji_updated_at
    BEFORE UPDATE ON project_kokuji
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_building_calculations_updated_at
    BEFORE UPDATE ON building_calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 