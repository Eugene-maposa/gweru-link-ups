-- Insert a test job to verify the system is working
INSERT INTO jobs (
  title,
  description,
  location,
  pay_rate,
  pay_type,
  duration,
  status,
  employer_id
) VALUES (
  'Test Construction Job',
  'Sample construction work to test the job posting system',
  'city-center',
  25.00,
  'daily',
  'full-day',
  'open',
  'e7d234ed-531e-4101-bac4-7bae19e56f6b'
);