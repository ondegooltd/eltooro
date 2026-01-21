"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Check,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductReviewsProps {
  productId: string;
}

interface Review {
  _id: string;
  userId: {
    name?: string;
    email?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  images?: Array<{ url: string }>;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState("most-helpful");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    breakdown: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      // First, get product to get rating info
      const productResponse = await fetch(`/api/products/${productId}`);
      const productData = await productResponse.json();

      // Then get reviews
      const response = await fetch(
        `/api/products/${productId}/reviews?limit=10`
      );
      const data = await response.json();

      if (data.success) {
        setReviews(data.data || []);

        // Calculate rating breakdown
        const breakdown = [5, 4, 3, 2, 1].map((stars) => {
          const count = data.data.filter(
            (r: Review) => r.rating === stars
          ).length;
          return {
            stars,
            count,
            percentage:
              data.data.length > 0
                ? Math.round((count / data.data.length) * 100)
                : 0,
          };
        });

        setRatingStats({
          average: productData.data?.rating?.average || 0,
          total:
            productData.data?.rating?.count ||
            data.meta?.pagination?.total ||
            0,
          breakdown,
        });
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        id="reviews"
        className="bg-white rounded-lg border border-border p-4 lg:p-6 mb-6"
      >
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="reviews"
      className="bg-white rounded-lg border border-border p-4 lg:p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-foreground mb-6">
        Customer Reviews
      </h2>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Rating Summary */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl font-bold text-foreground">
              {ratingStats.average.toFixed(1)}
            </div>
            <div>
              <div className="flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(ratingStats.average)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {ratingStats.total.toLocaleString()} reviews
              </p>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {ratingStats.breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="text-sm w-12">{item.stars} star</span>
                <Progress value={item.percentage} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-10">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>

          <Button className="w-full mt-4 bg-iherb-green hover:bg-iherb-green-dark text-white">
            Write a Review
          </Button>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          {/* Sort & Filter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-transparent"
              >
                Most Helpful
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-border pb-6 last:border-0"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                      <div className="w-full h-full bg-iherb-green/20 flex items-center justify-center text-iherb-green font-semibold">
                        {(review.userId?.name ||
                          review.userId?.email ||
                          "U")[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {review.userId?.name || "Anonymous"}
                        </span>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs text-iherb-green">
                            <Check className="h-3 w-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3 w-3",
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted text-muted"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-foreground mb-2">
                      {review.title}
                    </h4>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      Was this helpful?
                    </span>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="h-4 w-4" />
                      {review.helpful}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
