-- Insert sample events into the events table
-- Run this in Supabase SQL Editor after creating the schema

INSERT INTO events (title, description, date, fee, spots, status) VALUES
(
  'AI & Machine Learning Workshop',
  'Hands-on introduction to ML concepts',
  '2025-01-15',
  299.00,
  50,
  'upcoming'
),
(
  'Web Development Bootcamp',
  'Build modern websites using React',
  '2025-01-20',
  199.00,
  50,
  'upcoming'
),
(
  'Competitive Programming Contest',
  'Test your problem-solving skills',
  '2025-01-25',
  99.00,
  50,
  'upcoming'
)
ON CONFLICT DO NOTHING;

-- View the inserted events
SELECT id, title, date, fee, status FROM events ORDER BY date;
