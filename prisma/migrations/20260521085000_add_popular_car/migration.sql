-- CreateTable
CREATE TABLE "PopularCar" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "salesCount" INTEGER NOT NULL,
    "change" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PopularCar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PopularCar_carId_key" ON "PopularCar"("carId");

-- CreateIndex
CREATE INDEX "PopularCar_rank_idx" ON "PopularCar"("rank");

-- AddForeignKey
ALTER TABLE "PopularCar" ADD CONSTRAINT "PopularCar_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
