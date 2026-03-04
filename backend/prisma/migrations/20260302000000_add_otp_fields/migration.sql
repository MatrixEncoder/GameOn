-- Add OTP fields for email-based OTP password reset
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otp_code" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "otp_expires" TIMESTAMP(3);
