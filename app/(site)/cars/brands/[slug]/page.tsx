import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CarCard from "@/components/cars/CarCard";

export default async function BrandCarsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. 브랜드 및 해당 브랜드의 활성 차량 가져오기
  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      cars: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  // 2. 차량 데이터 포맷팅 (priceMatrix 추출)
  const cars = brand.cars.map((car) => {
    const matrix = car.priceMatrix as Record<string, { rent: number; lease: number }>;
    const baseKey = "36_PREPAY_30_20000";
    const price = matrix?.[baseKey] || { rent: 0, lease: 0 };

    return {
      id: car.id,
      slug: car.slug,
      brandName: brand.name,
      modelName: car.modelName,
      trimName: car.trimName,
      year: car.year,
      category: car.category,
      fuelType: car.fuelType,
      monthlyRent: price.rent,
      monthlyLease: price.lease,
      thumbnailUrl: car.thumbnailUrl,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 py-6 mb-6">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {brand.name} 차량 목록
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            총 {cars.length}대의 {brand.name} 차량이 준비되어 있습니다.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 lg:px-8">
        {cars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {cars.map((car) => (
              <div key={car.id} className="h-full">
                <CarCard car={car} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-100">
            <p className="text-gray-400 font-medium">
              현재 등록된 차량이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
