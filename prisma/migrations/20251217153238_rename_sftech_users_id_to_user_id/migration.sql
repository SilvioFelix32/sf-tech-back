-- Drop foreign key constraint from address table
ALTER TABLE "address" DROP CONSTRAINT IF EXISTS "address_user_id_fkey";

-- Drop the sftech_users table (will be recreated with user_id instead of _id)
DROP TABLE IF EXISTS "sftech_users";

-- Recreate sftech_users table with user_id as PRIMARY KEY
CREATE TABLE "sftech_users" (
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cellphone" TEXT NOT NULL,
    "birthdate" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'Other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sftech_users_pkey" PRIMARY KEY ("user_id")
);

-- Recreate unique indexes
CREATE UNIQUE INDEX "sftech_users_email_key" ON "sftech_users"("email");
CREATE UNIQUE INDEX "sftech_users_cpf_key" ON "sftech_users"("cpf");

-- Recreate foreign key constraint pointing to user_id
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "sftech_users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

