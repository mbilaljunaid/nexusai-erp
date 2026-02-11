-- Migration: Create permit_types table
-- Purpose: Store work permit type configurations for Safety, Environmental, and Operational permits
-- Module: Maintenance - Quality & Safety Management

CREATE TABLE IF NOT EXISTS permit_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- 'SAFETY', 'ENVIRONMENTAL', 'OPERATIONAL'
    requires_approval BOOLEAN DEFAULT true,
    approval_levels INTEGER DEFAULT 1,
    validity_hours INTEGER DEFAULT 8,
    required_documents JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Create index for faster searches
CREATE INDEX idx_permit_types_category ON permit_types(category);
CREATE INDEX idx_permit_types_active ON permit_types(is_active);

-- Insert default permit types
INSERT INTO permit_types (name, description, category, approval_levels, validity_hours, required_documents) VALUES
('Hot Work Permit', 'Required for welding, cutting, grinding, or any work involving open flames', 'SAFETY', 2, 8, 
 '["Fire extinguisher check", "Gas detector reading", "Hot work equipment inspection"]'::jsonb),
 
('Confined Space Entry', 'Required for entering tanks, vessels, or other confined spaces', 'SAFETY', 3, 4, 
 '["Atmospheric testing", "Rescue plan", "Entry checklist", "Communication equipment check"]'::jsonb),
 
('Lock-Out Tag-Out (LOTO)', 'Required for equipment isolation and energy control', 'SAFETY', 1, 24, 
 '["Energy source identification", "Lock inventory", "Authorized personnel list"]'::jsonb),
 
('Working at Height', 'Required for work above 2 meters', 'SAFETY', 1, 8, 
 '["Fall protection equipment", "Scaffold inspection", "Rescue plan"]'::jsonb),
 
('Excavation Permit', 'Required for digging, trenching, or ground penetration work', 'SAFETY', 2, 8, 
 '["Underground utilities map", "Shoring plan", "Soil stability assessment"]'::jsonb),
 
('Electrical Work Permit', 'Required for electrical installations, modifications, or repairs', 'SAFETY', 2, 8, 
 '["Lockout verification", "Voltage testing", "Arc flash assessment"]'::jsonb),
 
('Crane/Lifting Operations', 'Required for crane operations or heavy lifting', 'SAFETY', 2, 8, 
 '["Load calculation", "Rigging inspection", "Lift plan", "Ground conditions assessment"]'::jsonb),
 
('Chemical Handling Permit', 'Required for handling hazardous chemicals', 'ENVIRONMENTAL', 2, 24, 
 '["SDS review", "Spill kit availability", "PPE verification", "Disposal plan"]'::jsonb);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_permit_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_permit_types_updated_at
    BEFORE UPDATE ON permit_types
    FOR EACH ROW
    EXECUTE FUNCTION update_permit_types_updated_at();

-- Add comment for documentation
COMMENT ON TABLE permit_types IS 'Work permit type configurations for maintenance quality and safety management';
COMMENT ON COLUMN permit_types.approval_levels IS 'Number of approval levels required before permit becomes active';
COMMENT ON COLUMN permit_types.validity_hours IS 'Duration in hours for which the permit remains valid once approved';
COMMENT ON COLUMN permit_types.required_documents IS 'JSON array of required documentation/checks before permit approval';
