-- Add HVAC and Roofing niches to database
INSERT INTO niches (slug, name, description, is_active, display_order) VALUES 
  ('hvac', 'HVAC', 'Premium HVAC growth content - AC maintenance, heating systems, and seasonal campaigns', true, 2),
  ('roofing', 'Roofing', 'Premium roofing growth content - storm damage, inspections, and replacement campaigns', true, 3)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;
