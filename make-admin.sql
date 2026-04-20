-- Make a user admin
-- Replace 'your-email@example.com' with the actual email you used to sign up

-- First, check if the user exists
SELECT id, email, "displayName", role FROM "User" WHERE email = 'your-email@example.com';

-- Update the user to admin role
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';

-- Verify the change
SELECT id, email, "displayName", role FROM "User" WHERE email = 'your-email@example.com';
