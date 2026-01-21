import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6 mb-6">
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Image Gallery Skeleton */}
        <div className="flex flex-col-reverse lg:flex-row gap-4">
          <div className="flex lg:flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg"
              />
            ))}
          </div>
          <Skeleton className="flex-1 aspect-square rounded-lg" />
        </div>

        {/* Product Info Skeleton */}
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
