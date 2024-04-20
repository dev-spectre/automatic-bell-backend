-- CreateTable
CREATE TABLE "Userkey" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "Userkey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Userkey" ADD CONSTRAINT "Userkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Userkey" ADD CONSTRAINT "Userkey_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
