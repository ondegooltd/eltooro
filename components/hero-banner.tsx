"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    title: "Organic Hair Booster",
    subtitle: "For better growth",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1769366310/Carousel1_cb9ugh.jpg",
    link: "/products?q=hair+growth",
    bgColor: "bg-emerald-600",
  },
  {
    id: 2,
    title: "Organic Shampoo",
    subtitle: "Hair cleanser",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1769388433/Organic_Hair_Shampoo_yuxyge.jpg",
    link: "/products?q=shampoo",
    bgColor: "bg-teal-600",
  },
  {
    id: 3,
    title: "Alpha Growth Beard Oil",
    subtitle: "Natural beard care",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1769366324/beard_fertilizer_nrbmxa.jpg",
    link: "/products?q=beard+oil",
    bgColor: "bg-green-700",
  },
  {
    id: 4,
    title: "Menstrual Heat Belt",
    subtitle: "Cure cramps and menstrual pain",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1769389049/Menstrual_Heat_Belt_For_cramps_reduction_pain_relief_tocgx8.png",
    link: "/products?q=menstrual",
    bgColor: "bg-amber-700",
  },
  {
    id: 5,
    title: "Radiance",
    subtitle: "Powered by nature",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1769389196/Facial_serum_k1qqft.webp",
    link: "/products?q=facial+serum",
    bgColor: "bg-purple-600",
  },
  {
    id: 6,
    title: "Homemade Hair Treatment",
    subtitle: "For growth and thickness",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1769389310/homemade-hair-oil-for-growth-thickness_cojfu7.jpg",
    link: "/products?q=hair+treatment",
    bgColor: "bg-indigo-600",
  },
  {
    id: 7,
    title: "Grow Your Beard Naturally",
    subtitle: "Natural beard growth",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1769389586/Beard_growth_bdxc34.jpg",
    link: "/products?q=beard+growth",
    bgColor: "bg-slate-700",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Main Banner */}
      <div className="relative h-[400px] sm:h-[300px] md:h-[400px] border">
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className={`relative h-full ${banner.bgColor}`}>
              <Image
                src={banner.image || "/placeholder.svg"}
                alt={banner.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-lg text-white">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 text-balance">
                      {banner.title}
                    </h2>
                    <p className="text-lg sm:text-xl md:text-2xl opacity-90">
                      {banner.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10 hidden sm:flex z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full h-10 w-10 hidden sm:flex z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {banners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link}
                className="group relative overflow-hidden rounded-lg border border-border hover:border-iherb-green transition-colors"
              >
                <div className="aspect-[3/1] relative">
                  <Image
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-2">
                    <span className="text-xs sm:text-sm font-bold">
                      {banner.title}
                    </span>
                    <span className="text-xs opacity-90 hidden sm:block">
                      {banner.subtitle}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
