export const revalidate = 3600;
export const dynamicParams = true;

import { notFound } from "next/navigation";
import CarCard from "@/components/cars/CarCard";
import { getCachedBrandWithCars, getCachedBrandSlugs } from "@/lib/cache";
import { resolveListPrices } from "@/lib/pricing";

// 전체 브랜드 사전 빌드
export async function generateStaticParams() {
  const brands = await getCachedBrandSlugs();
  return brands.map((b: { slug: string }) => ({ slug: b.slug }));
}

export default async function BrandCarsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const brand = await getCachedBrandWithCars(slug);
  if (!brand) notFound();

  const cars = brand.cars.map((car: any) => {
    const { rent, lease } = resolveListPrices(car);

    return {
      id: car.id,
      slug: car.slug,
      brandName: brand.name,
      modelName: car.modelName,
      trimName: car.trimName,
      year: car.year,
      category: car.category,
      fuelType: car.fuelType,
      monthlyRent: rent,
      monthlyLease: lease,
      basePrice: car.basePrice,
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
            {cars.map((car: any) => (
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
