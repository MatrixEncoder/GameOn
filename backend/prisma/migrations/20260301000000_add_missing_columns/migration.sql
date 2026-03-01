-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP(3);

-- Add missing column to posts table
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "image" TEXT;
