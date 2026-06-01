import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg border border-border", className)}>
      {/* Image Skeleton */}
      <div className="relative aspect-square p-4">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Info Skeleton */}
      <div className="p-3 pt-0 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}
