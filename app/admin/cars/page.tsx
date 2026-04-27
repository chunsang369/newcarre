export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import AdminCarsClient from "./AdminCarsClient";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    include: { brand: true },
    orderBy: { sortOrder: "asc" },
  });

  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return <AdminCarsClient initialCars={cars} brands={brands} />;
}
