-- CreateEnum
CREATE TYPE "AddressPreference" AS ENUM ('Primary', 'Secondary');

-- Add new column with migrated data (House->Primary, Work/Temporary->Secondary)
ALTER TABLE "address" ADD COLUMN "address_preference_new" "AddressPreference";

UPDATE "address" SET "address_preference_new" = CASE
  WHEN "address_preference"::text = 'House' THEN 'Primary'::"AddressPreference"
  ELSE 'Secondary'::"AddressPreference"
END;

ALTER TABLE "address" ALTER COLUMN "address_preference_new" SET NOT NULL;
ALTER TABLE "address" ALTER COLUMN "address_preference_new" SET DEFAULT 'Primary';

-- Preserve old column: rename instead of drop
ALTER TABLE "address" RENAME COLUMN "address_preference" TO "address_preference_legacy";
ALTER TABLE "address" RENAME COLUMN "address_preference_new" TO "address_preference";
