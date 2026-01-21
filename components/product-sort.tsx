"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal, Grid3X3, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductFilters } from "./product-filters";

const sortOptions = [
  { label: "Best Match", value: "createdAt", order: "desc" },
  { label: "Best Selling", value: "sales", order: "desc" },
  { label: "Price: Low to High", value: "price.ghs", order: "asc" },
  { label: "Price: High to Low", value: "price.ghs", order: "desc" },
  { label: "Top Rated", value: "rating.average", order: "desc" },
  { label: "Most Reviews", value: "rating.count", order: "desc" },
  { label: "Newest", value: "createdAt", order: "desc" },
];

export function ProductSort() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentSortOrder = searchParams.get("sortOrder") || "desc";

  const currentSortLabel =
    sortOptions.find(
      (opt) => opt.value === currentSortBy && opt.order === currentSortOrder
    )?.label || "Best Match";

  const handleSortChange = (value: string, order: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", value);
      params.set("sortOrder", order);
      params.set("page", "1"); // Reset to first page when sort changes
      router.push(`/products?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mobile Filter Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="lg:hidden bg-transparent transition-colors h-10 min-h-[2.5rem] text-sm"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ProductFilters />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[140px] sm:min-w-[180px] justify-between bg-transparent transition-colors h-10 min-h-[2.5rem] text-sm"
            disabled={isPending}
          >
            <span className="text-muted-foreground mr-1 hidden sm:inline">Sort:</span>
            <span className="flex items-center gap-2 truncate">
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="truncate">{currentSortLabel}</span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 ml-2 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          {sortOptions.map((option) => {
            const isSelected =
              option.value === currentSortBy &&
              option.order === currentSortOrder;
            return (
              <DropdownMenuItem
                key={`${option.value}-${option.order}`}
                onClick={() => handleSortChange(option.value, option.order)}
                className={`transition-colors ${
                  isSelected ? "bg-iherb-green/10 text-iherb-green" : ""
                }`}
                disabled={isPending}
              >
                {option.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Mode Toggle */}
      <div className="hidden md:flex items-center border border-border rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-none rounded-l-md transition-all min-w-[2.5rem] min-h-[2.5rem] ${
            viewMode === "grid" ? "bg-muted" : ""
          }`}
          onClick={() => setViewMode("grid")}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-none rounded-r-md transition-all min-w-[2.5rem] min-h-[2.5rem] ${
            viewMode === "list" ? "bg-muted" : ""
          }`}
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
