-- ============================================================
-- KithGrid Full Seed (paste into Supabase SQL Editor)
-- 3 communities, HOA officers, all tables populated
--
-- IMPORTANT: Before running, find-and-replace these placeholders:
--   YOUR_ADMIN_EMAIL  → your real super admin email
--   YOUR_ADMIN_NAME   → your full name
--   YOUR_PASSWORD      → a secure password
-- ============================================================

BEGIN;

-- ── Wipe existing data (order matters for FK constraints) ────
DELETE FROM forum_likes;
DELETE FROM forum_comments;
DELETE FROM event_rsvps;
DELETE FROM direct_messages;
DELETE FROM reservations;
DELETE FROM forum_posts;
DELETE FROM invitations;
DELETE FROM events;
DELETE FROM marketplace_items;
DELETE FROM service_providers;
DELETE FROM local_places;
DELETE FROM resources;
DELETE FROM documents;
DELETE FROM announcements;
DELETE FROM neighbors;
-- Don't delete users so Supabase Auth accounts survive
-- DELETE FROM users;
DELETE FROM communities;

-- ── Super Admin user ─────────────────────────────────────────
INSERT INTO users (id, email, password, name, avatar)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'YOUR_ADMIN_EMAIL', 'YOUR_PASSWORD', 'YOUR_ADMIN_NAME', 'SA'
)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar;

-- ── Communities ──────────────────────────────────────────────
INSERT INTO communities (id, name, slug, plan_tuple, max_homes, is_active,
  primary_color, secondary_color, accent_color,
  has_marketplace, has_resources, has_events, has_documents,
  has_forum, has_messages, has_service_pros, has_local_guide, has_emergency,
  hoa_dues_amount, hoa_dues_frequency, hoa_dues_date, hoa_contact_email,
  emergency_access_code, emergency_instructions, plan_status)
VALUES
  ('c0000000-0000-0000-0000-000000000001',
   'Valley Cove HOA', 'valley-cove', 'growth_250', 250, true,
   '#4f46e5', '#1e1b4b', '#f59e0b',
   true, true, true, true, true, true, true, true, true,
   250.00, 'Monthly', '1st', 'board@valleycove.com',
   'VC-911', 'Call gate house at 555-0100, then 911. AED located at clubhouse entrance.', 'active'),

  ('c0000000-0000-0000-0000-000000000002',
   'Maple Grove Estates', 'maple-grove', 'pro_500', 500, true,
   '#10b981', '#064e3b', '#fbbf24',
   true, true, true, true, true, true, true, true, true,
   425.00, 'Quarterly', '15th', 'hoa@maplegrove.org',
   'MG-2024', 'Emergency contact: Property Manager at 555-0200. Fire extinguishers in each building lobby.', 'active'),

  ('c0000000-0000-0000-0000-000000000003',
   'Sunset Ridge', 'sunset-ridge', 'starter_100', 100, true,
   '#f59e0b', '#78350f', '#ef4444',
   true, true, true, true, true, true, true, true, true,
   150.00, 'Monthly', '1st', 'board@sunsetridge.net',
   'SR-HELP', 'Neighborhood watch captain: Tom at 555-0300. Storm shelter at community center.', 'active');

-- ── Users ────────────────────────────────────────────────────
INSERT INTO users (id, email, password, name, avatar) VALUES
  -- Valley Cove users
  ('u0000000-0000-0000-0001-000000000001', 'janet@valleycove.com',    'password123', 'Janet Morrison',    'JM'),
  ('u0000000-0000-0000-0001-000000000002', 'marcus@valleycove.com',   'password123', 'Marcus Chen',       'MC'),
  ('u0000000-0000-0000-0001-000000000003', 'lisa@valleycove.com',     'password123', 'Lisa Patel',        'LP'),
  ('u0000000-0000-0000-0001-000000000004', 'derek@valleycove.com',    'password123', 'Derek Washington',  'DW'),
  ('u0000000-0000-0000-0001-000000000005', 'sofia@valleycove.com',    'password123', 'Sofia Reyes',       'SR'),
  -- Maple Grove users
  ('u0000000-0000-0000-0002-000000000001', 'robert@maplegrove.org',   'password123', 'Robert Kim',        'RK'),
  ('u0000000-0000-0000-0002-000000000002', 'angela@maplegrove.org',   'password123', 'Angela Torres',     'AT'),
  ('u0000000-0000-0000-0002-000000000003', 'james@maplegrove.org',    'password123', 'James O''Brien',    'JO'),
  ('u0000000-0000-0000-0002-000000000004', 'priya@maplegrove.org',    'password123', 'Priya Sharma',      'PS'),
  ('u0000000-0000-0000-0002-000000000005', 'tom@maplegrove.org',      'password123', 'Tom Bradley',       'TB'),
  ('u0000000-0000-0000-0002-000000000006', 'nina@maplegrove.org',     'password123', 'Nina Volkov',       'NV'),
  -- Sunset Ridge users
  ('u0000000-0000-0000-0003-000000000001', 'carlos@sunsetridge.net',  'password123', 'Carlos Mendez',     'CM'),
  ('u0000000-0000-0000-0003-000000000002', 'diane@sunsetridge.net',   'password123', 'Diane Foster',      'DF'),
  ('u0000000-0000-0000-0003-000000000003', 'kevin@sunsetridge.net',   'password123', 'Kevin Nguyen',      'KN'),
  ('u0000000-0000-0000-0003-000000000004', 'megan@sunsetridge.net',   'password123', 'Megan Clark',       'MC')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar;

-- ── Neighbors (Members) ─────────────────────────────────────
-- Super Admin in all 3 communities
INSERT INTO neighbors (id, user_id, community_id, role, roles, hoa_position, address, is_online) VALUES
  ('n0000000-0000-0000-0001-000000000000', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Admin', '{Admin,"Board Member"}', 'Super Admin', '1 Admin Way', true),
  ('n0000000-0000-0000-0002-000000000000', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Admin', '{Admin,"Board Member"}', 'Super Admin', '1 Admin Way', true),
  ('n0000000-0000-0000-0003-000000000000', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Admin', '{Admin,"Board Member"}', 'Super Admin', '1 Admin Way', true);

-- Valley Cove members
INSERT INTO neighbors (id, user_id, community_id, role, roles, hoa_position, address, skills, equipment) VALUES
  ('n0000000-0000-0000-0001-000000000001', 'u0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'Admin', '{Admin,"Board Member"}', 'President', '101 Valley Cove Dr',
   '{"Project Management","Budgeting"}', '[{"name":"Projector","available":true}]'),
  ('n0000000-0000-0000-0001-000000000002', 'u0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0000-000000000001',
   'Board Member', '{"Board Member"}', 'Treasurer', '204 Valley Cove Dr',
   '{"Accounting","Excel"}', '[]'),
  ('n0000000-0000-0000-0001-000000000003', 'u0000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0000-000000000001',
   'Event Manager', '{"Event Manager"}', NULL, '312 Valley Cove Dr',
   '{"Event Planning","Photography"}', '[{"name":"Folding Tables (4)","available":true}]'),
  ('n0000000-0000-0000-0001-000000000004', 'u0000000-0000-0000-0001-000000000004', 'c0000000-0000-0000-0000-000000000001',
   'Resident', '{Resident}', NULL, '415 Valley Cove Dr',
   '{"Plumbing","Carpentry"}', '[{"name":"Power Washer","available":true},{"name":"Ladder 24ft","available":true}]'),
  ('n0000000-0000-0000-0001-000000000005', 'u0000000-0000-0000-0001-000000000005', 'c0000000-0000-0000-0000-000000000001',
   'Resident', '{Resident}', NULL, '523 Valley Cove Dr',
   '{"Gardening","First Aid"}', '[]');

-- Maple Grove members
INSERT INTO neighbors (id, user_id, community_id, role, roles, hoa_position, address, skills, equipment) VALUES
  ('n0000000-0000-0000-0002-000000000001', 'u0000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0000-000000000002',
   'Admin', '{Admin,"Board Member"}', 'President', '10 Maple Lane',
   '{"Law","Negotiation"}', '[]'),
  ('n0000000-0000-0000-0002-000000000002', 'u0000000-0000-0000-0002-000000000002', 'c0000000-0000-0000-0000-000000000002',
   'Board Member', '{"Board Member"}', 'Secretary', '22 Maple Lane',
   '{"Writing","Organization"}', '[{"name":"PA System","available":true}]'),
  ('n0000000-0000-0000-0002-000000000003', 'u0000000-0000-0000-0002-000000000003', 'c0000000-0000-0000-0000-000000000002',
   'Board Member', '{"Board Member"}', 'Vice President', '35 Oak Circle',
   '{"Construction","Landscaping"}', '[{"name":"Chainsaw","available":false},{"name":"Truck","available":true}]'),
  ('n0000000-0000-0000-0002-000000000004', 'u0000000-0000-0000-0002-000000000004', 'c0000000-0000-0000-0000-000000000002',
   'Resident', '{Resident}', NULL, '48 Oak Circle',
   '{"IT Support","Networking"}', '[]'),
  ('n0000000-0000-0000-0002-000000000005', 'u0000000-0000-0000-0002-000000000005', 'c0000000-0000-0000-0000-000000000002',
   'Resident', '{Resident}', NULL, '61 Birch Ct',
   '{"Cooking","Grilling"}', '[{"name":"Commercial Grill","available":true}]'),
  ('n0000000-0000-0000-0002-000000000006', 'u0000000-0000-0000-0002-000000000006', 'c0000000-0000-0000-0000-000000000002',
   'Resident', '{Resident}', NULL, '74 Birch Ct',
   '{"Yoga Instruction","CPR"}', '[]');

-- Sunset Ridge members
INSERT INTO neighbors (id, user_id, community_id, role, roles, hoa_position, address, skills, equipment) VALUES
  ('n0000000-0000-0000-0003-000000000001', 'u0000000-0000-0000-0003-000000000001', 'c0000000-0000-0000-0000-000000000003',
   'Admin', '{Admin,"Board Member"}', 'President', '5 Ridge Rd',
   '{"Leadership","Conflict Resolution"}', '[]'),
  ('n0000000-0000-0000-0003-000000000002', 'u0000000-0000-0000-0003-000000000002', 'c0000000-0000-0000-0000-000000000003',
   'Board Member', '{"Board Member"}', 'Treasurer', '12 Ridge Rd',
   '{"Finance","Spreadsheets"}', '[]'),
  ('n0000000-0000-0000-0003-000000000003', 'u0000000-0000-0000-0003-000000000003', 'c0000000-0000-0000-0000-000000000003',
   'Resident', '{Resident}', NULL, '19 Sunset Blvd',
   '{"Electrical","Solar Panels"}', '[{"name":"Multimeter","available":true}]'),
  ('n0000000-0000-0000-0003-000000000004', 'u0000000-0000-0000-0003-000000000004', 'c0000000-0000-0000-0000-000000000003',
   'Resident', '{Resident}', NULL, '26 Sunset Blvd',
   '{"Pet Sitting","Dog Training"}', '[]');

-- ── Events ───────────────────────────────────────────────────
-- Valley Cove events
INSERT INTO events (id, community_id, title, description, date, time, location, category, organizer_id, attendees_count) VALUES
  ('e0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'Annual HOA Meeting', 'Review budget, elect new board members, and discuss 2026 improvement plans.',
   '2026-04-12', '18:00:00', 'Clubhouse Main Hall', 'HOA', 'n0000000-0000-0000-0001-000000000001', 12),
  ('e0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0000-000000000001',
   'Spring Pool Party', 'Kick off pool season! Bring a dish to share.',
   '2026-05-23', '14:00:00', 'Community Pool', 'Social', 'n0000000-0000-0000-0001-000000000003', 25),
  ('e0000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0000-000000000001',
   'Parking Lot Reseal', 'Lot A will be closed for resurfacing. Park in Lot B.',
   '2026-06-05', '07:00:00', 'Parking Lot A', 'Maintenance', 'n0000000-0000-0000-0001-000000000001', 0),
  ('e0000000-0000-0000-0001-000000000004', 'c0000000-0000-0000-0000-000000000001',
   'Neighborhood Watch Kickoff', 'Meet your block captains and learn safety tips.',
   '2026-03-20', '19:00:00', 'Clubhouse Room B', 'Security', 'n0000000-0000-0000-0001-000000000000', 8);

-- Maple Grove events
INSERT INTO events (id, community_id, title, description, date, time, location, category, organizer_id, attendees_count) VALUES
  ('e0000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0000-000000000002',
   'Board Meeting - Q2', 'Quarterly board meeting. Open to all residents.',
   '2026-04-01', '19:00:00', 'Community Center', 'HOA', 'n0000000-0000-0000-0002-000000000001', 15),
  ('e0000000-0000-0000-0002-000000000002', 'c0000000-0000-0000-0000-000000000002',
   'Summer BBQ & Movie Night', 'Burgers, hot dogs, and an outdoor movie for the kids.',
   '2026-07-04', '17:00:00', 'Central Park Pavilion', 'Social', 'n0000000-0000-0000-0002-000000000005', 40),
  ('e0000000-0000-0000-0002-000000000003', 'c0000000-0000-0000-0000-000000000002',
   'Tree Trimming Day', 'Arborist will trim common area trees. Please move cars.',
   '2026-05-10', '08:00:00', 'Common Areas', 'Maintenance', 'n0000000-0000-0000-0002-000000000003', 0);

-- Sunset Ridge events
INSERT INTO events (id, community_id, title, description, date, time, location, category, organizer_id, attendees_count) VALUES
  ('e0000000-0000-0000-0003-000000000001', 'c0000000-0000-0000-0000-000000000003',
   'HOA Budget Review', 'Presenting next year''s proposed budget.',
   '2026-03-28', '18:30:00', 'Community Center', 'HOA', 'n0000000-0000-0000-0003-000000000001', 10),
  ('e0000000-0000-0000-0003-000000000002', 'c0000000-0000-0000-0000-000000000003',
   'Block Party', 'Live music, food trucks, and bounce house for kids!',
   '2026-06-14', '15:00:00', 'Ridge Park', 'Social', 'n0000000-0000-0000-0003-000000000000', 30),
  ('e0000000-0000-0000-0003-000000000003', 'c0000000-0000-0000-0000-000000000003',
   'Security Camera Installation', 'New cameras being installed at entrances.',
   '2026-04-20', '09:00:00', 'Main Entrance & Back Gate', 'Security', 'n0000000-0000-0000-0003-000000000001', 0);

-- ── Event RSVPs ──────────────────────────────────────────────
INSERT INTO event_rsvps (event_id, neighbor_id, status, guest_count) VALUES
  -- Valley Cove HOA Meeting
  ('e0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000000', 'Going', 1),
  ('e0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000001', 'Going', 1),
  ('e0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000002', 'Going', 1),
  ('e0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000003', 'Going', 2),
  ('e0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000004', 'Maybe', 1),
  ('e0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000005', 'Going', 2),
  -- Valley Cove Pool Party
  ('e0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000003', 'Going', 3),
  ('e0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000004', 'Going', 4),
  ('e0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000005', 'Going', 2),
  ('e0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000000', 'Maybe', 1),
  -- Maple Grove Board Meeting
  ('e0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000000', 'Going', 1),
  ('e0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000001', 'Going', 1),
  ('e0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000002', 'Going', 1),
  ('e0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000003', 'Going', 1),
  ('e0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000004', 'Maybe', 1),
  -- Maple Grove BBQ
  ('e0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000004', 'Going', 3),
  ('e0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000005', 'Going', 4),
  ('e0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000006', 'Going', 2),
  ('e0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000000', 'Going', 2),
  -- Sunset Ridge Budget Review
  ('e0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000000', 'Going', 1),
  ('e0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000001', 'Going', 1),
  ('e0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000002', 'Going', 1),
  ('e0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000003', 'Maybe', 2),
  -- Sunset Ridge Block Party
  ('e0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000001', 'Going', 3),
  ('e0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000002', 'Going', 2),
  ('e0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000003', 'Going', 2),
  ('e0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000004', 'Going', 4);

-- ── Marketplace Items ────────────────────────────────────────
INSERT INTO marketplace_items (community_id, title, description, price, is_free, is_negotiable, status, seller_id) VALUES
  -- Valley Cove
  ('c0000000-0000-0000-0000-000000000001', 'Mountain Bike - Trek', '2024 Trek Marlin 7, excellent condition. Ridden maybe 10 times.', 450.00, false, true, 'Active', 'n0000000-0000-0000-0001-000000000004'),
  ('c0000000-0000-0000-0000-000000000001', 'Free Moving Boxes', 'About 20 large and medium boxes, free to a good home.', 0, true, false, 'Active', 'n0000000-0000-0000-0001-000000000005'),
  ('c0000000-0000-0000-0000-000000000001', 'Patio Dining Set', 'Glass table with 6 wicker chairs. Small chip on one chair.', 275.00, false, true, 'Active', 'n0000000-0000-0000-0001-000000000003'),
  -- Maple Grove
  ('c0000000-0000-0000-0000-000000000002', 'Weber Gas Grill', '4-burner Weber Genesis. Works great, upgrading to built-in.', 350.00, false, true, 'Active', 'n0000000-0000-0000-0002-000000000005'),
  ('c0000000-0000-0000-0000-000000000002', 'Kids Swing Set', 'Wooden swing set, must disassemble and haul. Free!', 0, true, false, 'Active', 'n0000000-0000-0000-0002-000000000004'),
  ('c0000000-0000-0000-0000-000000000002', 'Lawn Mower - Honda', 'Self-propelled Honda mower, 2 years old.', 200.00, false, false, 'Active', 'n0000000-0000-0000-0002-000000000006'),
  ('c0000000-0000-0000-0000-000000000002', 'Snow Blower', 'Toro Power Clear, used 3 seasons.', 175.00, false, true, 'Active', 'n0000000-0000-0000-0002-000000000003'),
  -- Sunset Ridge
  ('c0000000-0000-0000-0000-000000000003', 'Baby Crib + Mattress', 'Graco convertible crib in white. Mattress included.', 120.00, false, true, 'Active', 'n0000000-0000-0000-0003-000000000004'),
  ('c0000000-0000-0000-0000-000000000003', 'Free Firewood', 'Half cord of seasoned oak. You haul.', 0, true, false, 'Active', 'n0000000-0000-0000-0003-000000000003');

-- ── Forum Posts ──────────────────────────────────────────────
INSERT INTO forum_posts (id, community_id, author_id, content, category, likes) VALUES
  -- Valley Cove
  ('f0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0000-000000000001', 'n0000000-0000-0000-0001-000000000004',
   'Has anyone else noticed the streetlight on Valley Cove Dr near #300 is out? Should we report it to the city or does the HOA handle that?', 'Maintenance', 3),
  ('f0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0000-000000000001', 'n0000000-0000-0000-0001-000000000005',
   'Just a reminder - please pick up after your dogs on the walking trails. I''ve seen a lot more messes lately.', 'General', 5),
  ('f0000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0000-000000000001', 'n0000000-0000-0000-0001-000000000003',
   'Would anyone be interested in starting a weekend running group? Thinking Saturday mornings at 7am from the clubhouse.', 'Social', 4),
  -- Maple Grove
  ('f0000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0000-000000000002', 'n0000000-0000-0000-0002-000000000004',
   'The new landscaping around the entrance looks amazing! Great job to the board for getting that approved.', 'General', 7),
  ('f0000000-0000-0000-0002-000000000002', 'c0000000-0000-0000-0000-000000000002', 'n0000000-0000-0000-0002-000000000005',
   'Heads up - there was a package theft on Oak Circle yesterday afternoon. Keep an eye out and maybe get a doorbell camera.', 'Safety', 6),
  ('f0000000-0000-0000-0002-000000000003', 'c0000000-0000-0000-0000-000000000002', 'n0000000-0000-0000-0002-000000000006',
   'Anyone know a good electrician? Need some outdoor outlets installed.', 'Recommendations', 2),
  -- Sunset Ridge
  ('f0000000-0000-0000-0003-000000000001', 'c0000000-0000-0000-0000-000000000003', 'n0000000-0000-0000-0003-000000000001',
   'The community garden plots are available for signup! See the board at the community center.', 'General', 4),
  ('f0000000-0000-0000-0003-000000000002', 'c0000000-0000-0000-0000-000000000003', 'n0000000-0000-0000-0003-000000000003',
   'Coyote spotted near the back gate around dusk. Keep small pets indoors.', 'Safety', 5);

-- ── Forum Comments ───────────────────────────────────────────
INSERT INTO forum_comments (post_id, author_id, content) VALUES
  -- Valley Cove streetlight post
  ('f0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000001', 'The HOA handles common area lighting. I''ll submit a work order today.'),
  ('f0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000002', 'Thanks Janet! That light has been out for about a week now.'),
  -- Valley Cove dog post
  ('f0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000001', 'Great reminder. We''ll add more waste stations along the trails.'),
  ('f0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000003', 'Thank you! The area near the pond has been especially bad.'),
  -- Valley Cove running group
  ('f0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000004', 'I''m in! I usually do 3-4 miles on Saturdays anyway.'),
  ('f0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000005', 'Count me in too. Can we also do a walking group for those of us who are slower?'),
  -- Maple Grove landscaping post
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000001', 'Thanks! The landscaping committee put a lot of work into the design.'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000002', 'The new flower beds are gorgeous. Who''s the landscaping company?'),
  -- Maple Grove package theft
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000001', 'This is concerning. I''ll look into getting more security cameras at the entrances.'),
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000006', 'I have a Ring doorbell and caught someone on camera. Happy to share the footage with the police.'),
  -- Maple Grove electrician
  ('f0000000-0000-0000-0002-000000000003', 'n0000000-0000-0000-0002-000000000003', 'I used Bright Spark Electric last year - they did a great job and were reasonably priced.'),
  -- Sunset Ridge garden
  ('f0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000003', 'How big are the plots this year?'),
  ('f0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000004', 'I''d love one! Is there a waitlist if they fill up?'),
  -- Sunset Ridge coyote
  ('f0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000001', 'Thanks for the heads up. I''ll contact animal control and update everyone.'),
  ('f0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000002', 'Saw it too! It was near the dumpsters. We should make sure lids are always closed.');

-- ── Forum Likes ──────────────────────────────────────────────
INSERT INTO forum_likes (post_id, member_id) VALUES
  ('f0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000001'),
  ('f0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000002'),
  ('f0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000005'),
  ('f0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000000'),
  ('f0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000001'),
  ('f0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000003'),
  ('f0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000004'),
  ('f0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000005'),
  ('f0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000004'),
  ('f0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000005'),
  ('f0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000000'),
  ('f0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000002'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000000'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000002'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000003'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000005'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000006'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000004'),
  ('f0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000001'),
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000001'),
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000004'),
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000006'),
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000003'),
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000002'),
  ('f0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000000'),
  ('f0000000-0000-0000-0002-000000000003', 'n0000000-0000-0000-0002-000000000003'),
  ('f0000000-0000-0000-0002-000000000003', 'n0000000-0000-0000-0002-000000000005'),
  ('f0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000003'),
  ('f0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000004'),
  ('f0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000000'),
  ('f0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000002'),
  ('f0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000001'),
  ('f0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000002'),
  ('f0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000004'),
  ('f0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000000'),
  ('f0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000003');

-- ── Service Providers ────────────────────────────────────────
INSERT INTO service_providers (community_id, name, category, phone, description, rating, recommended_by) VALUES
  -- Valley Cove
  ('c0000000-0000-0000-0000-000000000001', 'Valley Plumbing Co.', 'Plumbing', '555-0111', 'Licensed & insured. Fast response for emergencies.', 4.8, 'Janet Morrison'),
  ('c0000000-0000-0000-0000-000000000001', 'Green Scene Landscaping', 'Landscaping', '555-0112', 'Weekly mowing, seasonal cleanup, and irrigation.', 4.5, 'Derek Washington'),
  ('c0000000-0000-0000-0000-000000000001', 'SafeHome Security', 'Security', '555-0113', 'Camera installation, alarm systems, and monitoring.', 4.9, 'Marcus Chen'),
  -- Maple Grove
  ('c0000000-0000-0000-0000-000000000002', 'Bright Spark Electric', 'Electrical', '555-0211', 'Residential electrical work. Panel upgrades a specialty.', 4.7, 'James O''Brien'),
  ('c0000000-0000-0000-0000-000000000002', 'Maple Tree Service', 'Tree Care', '555-0212', 'Trimming, removal, and stump grinding.', 4.6, 'Robert Kim'),
  ('c0000000-0000-0000-0000-000000000002', 'CleanPro Janitorial', 'Cleaning', '555-0213', 'House cleaning and move-in/move-out deep cleans.', 4.4, 'Angela Torres'),
  -- Sunset Ridge
  ('c0000000-0000-0000-0000-000000000003', 'Ridge HVAC Solutions', 'HVAC', '555-0311', 'AC repair, furnace maintenance, duct cleaning.', 4.8, 'Carlos Mendez'),
  ('c0000000-0000-0000-0000-000000000003', 'Handy Dan', 'Handyman', '555-0312', 'Drywall, painting, minor repairs. No job too small.', 4.9, 'Diane Foster');

-- ── Local Places ─────────────────────────────────────────────
INSERT INTO local_places (community_id, name, category, address, description, rating) VALUES
  -- Valley Cove
  ('c0000000-0000-0000-0000-000000000001', 'Valley Brew Coffee', 'Coffee Shop', '1200 Main St', 'Best lattes in the area. Free wifi.', 4.7),
  ('c0000000-0000-0000-0000-000000000001', 'Cove Pizza', 'Restaurant', '1205 Main St', 'NY style pizza. Great for families.', 4.5),
  ('c0000000-0000-0000-0000-000000000001', 'Valley Cove Park', 'Park', '800 Park Ave', 'Playground, walking trails, and dog park.', 4.8),
  -- Maple Grove
  ('c0000000-0000-0000-0000-000000000002', 'Maple Leaf Diner', 'Restaurant', '500 Grove Blvd', 'Classic American diner. Breakfast all day.', 4.3),
  ('c0000000-0000-0000-0000-000000000002', 'Grove Fitness Center', 'Gym', '510 Grove Blvd', 'Full gym, pool, group classes. Resident discount!', 4.6),
  ('c0000000-0000-0000-0000-000000000002', 'Paws & Claws Vet', 'Veterinarian', '520 Grove Blvd', 'Friendly staff. Walk-ins welcome for emergencies.', 4.9),
  -- Sunset Ridge
  ('c0000000-0000-0000-0000-000000000003', 'Sunset Scoops', 'Ice Cream', '300 Ridge Center', 'Homemade ice cream. Seasonal flavors.', 4.8),
  ('c0000000-0000-0000-0000-000000000003', 'Ridge Hardware', 'Hardware Store', '310 Ridge Center', 'Old school hardware store. Staff knows everything.', 4.7);

-- ── Resources ────────────────────────────────────────────────
INSERT INTO resources (id, community_id, name, type, capacity, description, is_reservable) VALUES
  -- Valley Cove
  ('r0000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Clubhouse Main Hall', 'Facility', 100, 'Large event space with kitchen access. Tables and chairs included.', true),
  ('r0000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Community Pool', 'Facility', 50, 'Heated pool open May-September. Lifeguard on duty weekends.', false),
  ('r0000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Pressure Washer', 'Tool', NULL, '3000 PSI gas pressure washer. 24-hour checkout.', true),
  -- Maple Grove
  ('r0000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Community Center', 'Facility', 200, 'Full-size gymnasium and meeting rooms. AV equipment available.', true),
  ('r0000000-0000-0000-0002-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Tennis Courts (2)', 'Facility', 4, 'Lighted courts, open 6am-10pm. Reserve 1-hour blocks.', true),
  ('r0000000-0000-0000-0002-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Utility Trailer', 'Vehicle', NULL, '6x10 enclosed trailer. Must have valid license and insurance.', true),
  ('r0000000-0000-0000-0002-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Party Supplies Kit', 'Tool', NULL, 'Folding tables, chairs, canopy tent. For community events.', true),
  -- Sunset Ridge
  ('r0000000-0000-0000-0003-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Community Center', 'Facility', 75, 'Meeting room with projector. Small kitchen.', true),
  ('r0000000-0000-0000-0003-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Fire Pit Area', 'Facility', 20, 'Outdoor fire pit with seating. Firewood provided.', true);

-- ── Reservations ─────────────────────────────────────────────
INSERT INTO reservations (community_id, resource_id, user_id, date, start_time, end_time, status) VALUES
  -- Valley Cove: Derek reserved the clubhouse
  ('c0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000004', '2026-04-05', '10:00:00', '14:00:00', 'Confirmed'),
  -- Valley Cove: Lisa reserved pressure washer
  ('c0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000003', '2026-03-22', '08:00:00', '17:00:00', 'Confirmed'),
  -- Maple Grove: Priya reserved community center
  ('c0000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000004', '2026-04-10', '18:00:00', '21:00:00', 'Confirmed'),
  -- Maple Grove: Tom reserved tennis courts
  ('c0000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000005', '2026-03-15', '09:00:00', '10:00:00', 'Confirmed'),
  -- Maple Grove: James reserved trailer (pending)
  ('c0000000-0000-0000-0000-000000000002', 'r0000000-0000-0000-0002-000000000003', 'n0000000-0000-0000-0002-000000000003', '2026-04-18', '06:00:00', '18:00:00', 'Pending'),
  -- Sunset Ridge: Kevin reserved fire pit
  ('c0000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0003-000000000002', 'n0000000-0000-0000-0003-000000000003', '2026-04-12', '18:00:00', '22:00:00', 'Confirmed'),
  -- Sunset Ridge: Megan reserved community center
  ('c0000000-0000-0000-0000-000000000003', 'r0000000-0000-0000-0003-000000000001', 'n0000000-0000-0000-0003-000000000004', '2026-05-01', '10:00:00', '12:00:00', 'Pending');

-- ── Documents ────────────────────────────────────────────────
INSERT INTO documents (community_id, name, category, size, url, uploader_id) VALUES
  -- Valley Cove
  ('c0000000-0000-0000-0000-000000000001', 'CC&Rs - Valley Cove HOA', 'Governing Documents', '2.4 MB', '/docs/valley-cove-ccrs.pdf', 'n0000000-0000-0000-0001-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', '2026 Annual Budget', 'Financial', '850 KB', '/docs/valley-cove-budget-2026.pdf', 'n0000000-0000-0000-0001-000000000002'),
  ('c0000000-0000-0000-0000-000000000001', 'Pool Rules & Hours', 'Rules', '320 KB', '/docs/valley-cove-pool-rules.pdf', 'n0000000-0000-0000-0001-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'Architectural Review Guidelines', 'Governing Documents', '1.1 MB', '/docs/valley-cove-arch-guidelines.pdf', 'n0000000-0000-0000-0001-000000000001'),
  -- Maple Grove
  ('c0000000-0000-0000-0000-000000000002', 'Bylaws - Maple Grove Estates', 'Governing Documents', '3.1 MB', '/docs/maple-grove-bylaws.pdf', 'n0000000-0000-0000-0002-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Q1 2026 Financial Report', 'Financial', '620 KB', '/docs/maple-grove-q1-2026.pdf', 'n0000000-0000-0000-0002-000000000002'),
  ('c0000000-0000-0000-0000-000000000002', 'Noise Policy', 'Rules', '180 KB', '/docs/maple-grove-noise-policy.pdf', 'n0000000-0000-0000-0002-000000000001'),
  -- Sunset Ridge
  ('c0000000-0000-0000-0000-000000000003', 'HOA Rules & Regulations', 'Governing Documents', '1.8 MB', '/docs/sunset-ridge-rules.pdf', 'n0000000-0000-0000-0003-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', '2025 Annual Meeting Minutes', 'Meeting Minutes', '440 KB', '/docs/sunset-ridge-minutes-2025.pdf', 'n0000000-0000-0000-0003-000000000002');

-- ── Announcements ────────────────────────────────────────────
INSERT INTO announcements (community_id, title, content, author_id) VALUES
  -- Valley Cove
  ('c0000000-0000-0000-0000-000000000001',
   'Pool Opens May 1st!',
   'The community pool will open for the season on May 1st. Hours: 10am-8pm weekdays, 9am-9pm weekends. All residents must have updated pool passes.',
   'n0000000-0000-0000-0001-000000000001'),
  ('c0000000-0000-0000-0000-000000000001',
   'HOA Dues Increase Notice',
   'After board review, monthly dues will increase from $225 to $250 effective April 1st, 2026. This covers rising insurance and landscaping costs. Details at the next board meeting.',
   'n0000000-0000-0000-0001-000000000000'),
  -- Maple Grove
  ('c0000000-0000-0000-0000-000000000002',
   'New Trash Collection Schedule',
   'Starting April 1st, trash pickup moves to Tuesdays and Fridays. Recycling remains on Wednesdays. Please have bins out by 7am.',
   'n0000000-0000-0000-0002-000000000001'),
  ('c0000000-0000-0000-0000-000000000002',
   'Welcome New Board Members',
   'Please welcome Angela Torres (Secretary) and James O''Brien (Vice President) to the board! They were elected at the February meeting.',
   'n0000000-0000-0000-0002-000000000000'),
  ('c0000000-0000-0000-0000-000000000002',
   'Parking Garage Maintenance',
   'The underground parking garage will be power washed on March 15-16. Please remove vehicles by 6am. Temporary parking available in Lot C.',
   'n0000000-0000-0000-0002-000000000001'),
  -- Sunset Ridge
  ('c0000000-0000-0000-0000-000000000003',
   'Community Garden Signups Open',
   'We have 12 garden plots available this year. $25 per season. Sign up at the community center or email board@sunsetridge.net.',
   'n0000000-0000-0000-0003-000000000001');

-- ── Direct Messages ──────────────────────────────────────────
INSERT INTO direct_messages (sender_id, recipient_id, content, is_read) VALUES
  -- Valley Cove conversations
  ('n0000000-0000-0000-0001-000000000004', 'n0000000-0000-0000-0001-000000000003', 'Hey Lisa! Are you coming to the HOA meeting Thursday?', true),
  ('n0000000-0000-0000-0001-000000000003', 'n0000000-0000-0000-0001-000000000004', 'Yes! Want to grab coffee beforehand?', true),
  ('n0000000-0000-0000-0001-000000000004', 'n0000000-0000-0000-0001-000000000003', 'Sounds great! Meet at Valley Brew at 5:30?', true),
  ('n0000000-0000-0000-0001-000000000005', 'n0000000-0000-0000-0001-000000000004', 'Hi Derek, I saw your power washer listing. Could I borrow it this weekend?', false),
  ('n0000000-0000-0000-0001-000000000001', 'n0000000-0000-0000-0001-000000000002', 'Marcus, can you have the Q1 financials ready for the board meeting?', true),
  ('n0000000-0000-0000-0001-000000000002', 'n0000000-0000-0000-0001-000000000001', 'Already on it. I''ll have them to you by Wednesday.', true),
  -- Maple Grove conversations
  ('n0000000-0000-0000-0002-000000000004', 'n0000000-0000-0000-0002-000000000005', 'Tom, are you bringing the grill to the BBQ?', true),
  ('n0000000-0000-0000-0002-000000000005', 'n0000000-0000-0000-0002-000000000004', 'You bet! I''ll need help setting up around 3pm though.', true),
  ('n0000000-0000-0000-0002-000000000004', 'n0000000-0000-0000-0002-000000000005', 'I''ll be there. I can bring an extra folding table too.', false),
  ('n0000000-0000-0000-0002-000000000001', 'n0000000-0000-0000-0002-000000000002', 'Angela, could you draft the meeting minutes from last week?', true),
  ('n0000000-0000-0000-0002-000000000002', 'n0000000-0000-0000-0002-000000000001', 'Sure, I''ll have them ready by tomorrow afternoon.', false),
  -- Sunset Ridge conversations
  ('n0000000-0000-0000-0003-000000000003', 'n0000000-0000-0000-0003-000000000004', 'Megan, I saw the coyote again near your street. Just wanted to give you a heads up since you walk Biscuit in the evenings.', true),
  ('n0000000-0000-0000-0003-000000000004', 'n0000000-0000-0000-0003-000000000003', 'Thanks Kevin! I''ll keep him on a short leash. Should we tell the HOA?', true),
  ('n0000000-0000-0000-0003-000000000003', 'n0000000-0000-0000-0003-000000000004', 'I already posted in the forum. Carlos said he''ll contact animal control.', false);

-- ── Invitations (pending) ────────────────────────────────────
INSERT INTO invitations (community_id, code, email, invited_name, role, hoa_position, status, created_by) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'VC2026A', 'newresident1@email.com', 'Alex Thompson', 'Resident', NULL, 'pending', 'n0000000-0000-0000-0001-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'VC2026B', 'newresident2@email.com', 'Rachel Green', 'Resident', NULL, 'pending', 'n0000000-0000-0000-0001-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'MG2026A', 'newboard@email.com', 'Sam Wilson', 'Board Member', 'At-Large Member', 'pending', 'n0000000-0000-0000-0002-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'SR2026A', 'newresident3@email.com', 'Jordan Lee', 'Resident', NULL, 'pending', 'n0000000-0000-0000-0003-000000000001');

COMMIT;

-- ════════════════════════════════════════════════════════════
-- SEED COMPLETE!
-- ════════════════════════════════════════════════════════════
-- Super Admin: YOUR_ADMIN_EMAIL (password: YOUR_PASSWORD)
--   -> Admin in Valley Cove, Maple Grove, and Sunset Ridge
--
-- Valley Cove HOA (/valley-cove) - $250/mo
--   Janet Morrison  - Admin / President
--   Marcus Chen     - Board Member / Treasurer
--   Lisa Patel      - Event Manager
--   Derek Washington- Resident
--   Sofia Reyes     - Resident
--
-- Maple Grove Estates (/maple-grove) - $425/quarterly
--   Robert Kim      - Admin / President
--   Angela Torres   - Board Member / Secretary
--   James O'Brien   - Board Member / Vice President
--   Priya Sharma    - Resident
--   Tom Bradley     - Resident
--   Nina Volkov     - Resident
--
-- Sunset Ridge (/sunset-ridge) - $150/mo
--   Carlos Mendez   - Admin / President
--   Diane Foster    - Board Member / Treasurer
--   Kevin Nguyen    - Resident
--   Megan Clark     - Resident
--
-- All regular users password: password123
-- ════════════════════════════════════════════════════════════
