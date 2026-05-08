-- CreateTable
CREATE TABLE "DriverOrderRejection" (
    "driverId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverOrderRejection_pkey" PRIMARY KEY ("driverId","orderId")
);

-- CreateIndex
CREATE INDEX "DriverOrderRejection_driverId_idx" ON "DriverOrderRejection"("driverId");

-- AddForeignKey
ALTER TABLE "DriverOrderRejection" ADD CONSTRAINT "DriverOrderRejection_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverOrderRejection" ADD CONSTRAINT "DriverOrderRejection_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
