-- Manually confirm the admin user's email so they can log in.
-- Run this in your Supabase SQL Editor.

UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin.lassna@gmail.com';
