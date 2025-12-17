-- Remove DEFAULT constraint from user_id column
-- The user_id will come from Cognito, not auto-generated
ALTER TABLE "sftech_users" ALTER COLUMN "_id" DROP DEFAULT;

