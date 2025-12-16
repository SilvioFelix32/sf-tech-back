-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('House', 'Work', 'Temporary');

-- CreateTable
CREATE TABLE "sftech_users" (
    "_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cellphone" TEXT NOT NULL,
    "birthdate" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'Other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sftech_users_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "address" (
    "_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address_type" "AddressType" NOT NULL DEFAULT 'House',
    "address_preference" "AddressType" NOT NULL DEFAULT 'House',
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sftech_users_email_key" ON "sftech_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sftech_users_cpf_key" ON "sftech_users"("cpf");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "sftech_users"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

