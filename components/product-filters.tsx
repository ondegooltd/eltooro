"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-medium text-foreground hover:text-iherb-green transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<
    Array<{ _id: string; name: string; slug: string; count?: number }>
  >([]);
  const [brands, setBrands] = useState<Array<{ name: string; count?: number }>>(
    []
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const isUpdatingFromDebounce = useRef(false);

  const selectedCategory = searchParams.get("category") || "all";
  const selectedBrand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const selectedRating = searchParams.get("rating");

  // Local state for price range slider (for immediate UI feedback)
  const [localPriceRange, setLocalPriceRange] = useState<number[]>([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 500,
  ]);

  // Debounce price range changes to avoid too many API calls
  const debouncedPriceRange = useDebounce(localPriceRange, 500);

  // Sync local price range with URL params
  useEffect(() => {
    setLocalPriceRange([
      minPrice ? parseInt(minPrice) : 0,
      maxPrice ? parseInt(maxPrice) : 500,
    ]);
  }, [minPrice, maxPrice]);

  // Delayed loading overlay - only show after 400ms to avoid sharp transitions
  useEffect(() => {
    if (isApplyingFilters) {
      const timer = setTimeout(() => {
        setShowLoadingOverlay(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setShowLoadingOverlay(false);
    }
  }, [isApplyingFilters]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setIsLoadingBrands(true);
      // Fetch products to get unique brands
      const response = await fetch("/api/products?limit=1000");
      const data = await response.json();
      if (data.success) {
        const brandMap = new Map<string, number>();
        (data.data || []).forEach((product: any) => {
          if (product.brand) {
            brandMap.set(product.brand, (brandMap.get(product.brand) || 0) + 1);
          }
        });
        const brandsList = Array.from(brandMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
        setBrands(brandsList);
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      setIsApplyingFilters(true);
      setShowLoadingOverlay(false); // Reset immediately
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1"); // Reset to first page when filters change

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`/products?${params.toString()}`);

      // Reset loading state after navigation completes
      setTimeout(() => {
        setIsApplyingFilters(false);
      }, 500);
    },
    [searchParams, router]
  );

  const handleCategoryChange = useCallback(
    (categorySlug: string) => {
      updateFilters({
        category: categorySlug === selectedCategory ? "all" : categorySlug,
      });
    },
    [selectedCategory, updateFilters]
  );

  const handleBrandToggle = useCallback(
    (brand: string) => {
      updateFilters({
        brand: brand === selectedBrand ? null : brand,
      });
    },
    [selectedBrand, updateFilters]
  );

  const handlePriceChange = (values: number[]) => {
    // Update local state immediately for smooth UI
    setLocalPriceRange(values);
  };

  const handleRatingChange = useCallback(
    (rating: string) => {
      updateFilters({
        rating: rating === selectedRating ? null : rating,
      });
    },
    [selectedRating, updateFilters]
  );

  const clearAllFilters = useCallback(() => {
    router.push("/products");
    setLocalPriceRange([0, 500]);
  }, [router]);

  // Apply debounced price range changes
  useEffect(() => {
    if (isUpdatingFromDebounce.current) {
      isUpdatingFromDebounce.current = false;
      return;
    }

    const currentMin = minPrice ? parseInt(minPrice) : 0;
    const currentMax = maxPrice ? parseInt(maxPrice) : 500;

    if (
      debouncedPriceRange[0] !== currentMin ||
      debouncedPriceRange[1] !== currentMax
    ) {
      isUpdatingFromDebounce.current = true;
      updateFilters({
        minPrice:
          debouncedPriceRange[0] > 0 ? debouncedPriceRange[0].toString() : null,
        maxPrice:
          debouncedPriceRange[1] < 500
            ? debouncedPriceRange[1].toString()
            : null,
      });
    }
  }, [debouncedPriceRange, minPrice, maxPrice, updateFilters]);

  const formTypes = [
    { name: "Capsules", value: "capsule" },
    { name: "Tablets", value: "tablet" },
    { name: "Softgels", value: "softgel" },
    { name: "Gummies", value: "gummy" },
    { name: "Liquid", value: "liquid" },
    { name: "Powder", value: "powder" },
  ];

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedBrand !== "" ||
    minPrice ||
    maxPrice ||
    selectedRating;

  return (
    <div className="bg-white rounded-lg border border-border p-4 relative">
      {/* Subtle loading overlay - only shows after delay */}
      {showLoadingOverlay && (
        <div
          className={cn(
            "absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg transition-opacity duration-300",
            showLoadingOverlay ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 border-2 border-iherb-green/30 border-t-iherb-green rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">
              Applying filters...
            </span>
          </div>
        </div>
      )}

      <div
        className={cn(
          "transition-opacity duration-300",
          showLoadingOverlay && "opacity-70"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-foreground">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-iherb-green hover:text-iherb-green-dark transition-colors"
              onClick={clearAllFilters}
              disabled={isApplyingFilters}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Categories */}
        <FilterSection title="Categories">
          {isLoadingCategories ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <label
                className="flex items-center justify-between cursor-pointer group transition-colors"
                onClick={() => handleCategoryChange("all")}
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={selectedCategory === "all"} />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    All Categories
                  </span>
                </div>
              </label>
              {categories.slice(0, 10).map((category) => (
                <label
                  key={category._id}
                  className="flex items-center justify-between cursor-pointer group transition-colors"
                  onClick={() => handleCategoryChange(category.slug)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={selectedCategory === category.slug} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {category.name}
                    </span>
                  </div>
                  {category.count !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({category.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </FilterSection>

        {/* Brands */}
        <FilterSection title="Brands">
          {isLoadingBrands ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {brands.map((brand) => (
                  <label
                    key={brand.name}
                    className="flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedBrand === brand.name}
                        onCheckedChange={() => handleBrandToggle(brand.name)}
                        disabled={isApplyingFilters}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {brand.name}
                      </span>
                    </div>
                    {brand.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        ({brand.count})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </>
          )}
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price">
          <div className="space-y-4">
            <Slider
              value={localPriceRange}
              onValueChange={handlePriceChange}
              max={500}
              step={5}
              className="w-full"
              disabled={isApplyingFilters}
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">
                GH₵{localPriceRange[0]}
              </span>
              <span className="text-muted-foreground font-medium">
                GH₵{localPriceRange[1]}+
              </span>
            </div>
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection title="Rating">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer group transition-colors"
                onClick={() => handleRatingChange(rating.toString())}
              >
                <Checkbox
                  checked={selectedRating === rating.toString()}
                  disabled={isApplyingFilters}
                />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 transition-colors ${
                        i < rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  & Up
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Form Type */}
        <FilterSection title="Form">
          <div className="space-y-2">
            {formTypes.map((form) => (
              <label
                key={form.value}
                className="flex items-center justify-between cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Checkbox disabled={isApplyingFilters} />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {form.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Dietary Preferences */}
        <FilterSection title="Dietary Preferences" defaultOpen={false}>
          <div className="space-y-2">
            {[
              "Vegan",
              "Vegetarian",
              "Gluten-Free",
              "Non-GMO",
              "Organic",
              "Kosher",
            ].map((pref) => (
              <label
                key={pref}
                className="flex items-center gap-2 cursor-pointer group transition-colors"
              >
                <Checkbox disabled={isApplyingFilters} />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {pref}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
