-- Migration: add nullable password_hash to user table
-- Run this against your Postgres DB before deploying the new code
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS password_hash varchar;

-- Note: column is nullable so existing rows won't be affected.
-- After deployment, you may want to enforce NOT NULL once all users have hashed passwords.
