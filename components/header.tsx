"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  Menu,
  MapPin,
  Globe,
  LogOut,
  Settings,
  Package,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/cart-context";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface SearchProduct {
  _id: string;
  name: string;
  slug: string;
  images: Array<{ url: string; alt: string }>;
  price: { ghs: number; usd?: number } | number;
  brand?: string;
}

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const { itemCount } = useCart();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        // Small delay to allow click events to fire first
        setTimeout(() => {
          setShowSearchResults(false);
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearchQuery]);

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

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data || []);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(false);
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      searchInputRef.current?.blur();
    }
  };

  const handleSearchResultClick = (product: SearchProduct, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setShowSearchResults(false);
    setSearchQuery("");
    // Use product ID if available, otherwise use slug
    const productIdentifier = product._id || product.slug;
    router.push(`/product/${productIdentifier}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    searchInputRef.current?.focus();
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const isAuthenticated = status === "authenticated";
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Top Bar */}
      <div className="bg-iherb-green text-white text-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Ship to Ghana</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/help" className="hover:underline">
              Help
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact Us
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:underline">
                <Globe className="h-4 w-4" />
                <span>EN</span>
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Español</DropdownMenuItem>
                <DropdownMenuItem>Français</DropdownMenuItem>
                <DropdownMenuItem>Deutsch</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="min-w-10 min-h-10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <div className="flex flex-col gap-6 mt-8">
                {/* User Account Section */}
                {isAuthenticated ? (
                  <div className="border-b border-border pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-iherb-green/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-iherb-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {(session?.user as any)?.name || session?.user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                        >
                          <Settings className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm"
                      >
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-red-600 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-border pb-4">
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-iherb-green text-white hover:bg-iherb-green-dark text-sm font-medium"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <div className="flex items-center">
              <svg viewBox="0 0 120 40" className="h-10 w-auto">
                <text
                  x="0"
                  y="30"
                  className="fill-iherb-green font-bold text-3xl"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Eltooro
                </text>
              </svg>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div
            ref={searchContainerRef}
            className="flex-1 max-w-2xl relative hidden md:block"
          >
            <form onSubmit={handleSearchSubmit}>
              <div
                className={cn(
                  "flex items-center border-2 rounded-full transition-colors",
                  isSearchFocused ? "border-iherb-green" : "border-border"
                )}
              >
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  className="border-0 focus-visible:ring-0 rounded-l-full pl-4 text-sm sm:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  onBlur={(e) => {
                    // Don't blur if clicking on search results
                    const relatedTarget = e.relatedTarget as HTMLElement;
                    if (
                      searchContainerRef.current?.contains(relatedTarget) ||
                      relatedTarget?.closest('[data-search-result]')
                    ) {
                      return;
                    }
                    // Delay to allow click on search results
                    setTimeout(() => setIsSearchFocused(false), 200);
                  }}
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="submit"
                  className="rounded-full bg-iherb-green hover:bg-iherb-green-dark h-10 w-10 p-0 min-w-10 min-h-10"
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((product) => {
                      const price =
                        typeof product.price === "object"
                          ? product.price.ghs
                          : product.price;
                      return (
                        <button
                          key={product._id}
                          data-search-result
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSearchResultClick(product, e);
                          }}
                          className="w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left flex items-center gap-3 cursor-pointer"
                        >
                          <img
                            src={product.images?.[0]?.url || "/placeholder.svg"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {product.name}
                            </p>
                            {product.brand && (
                              <p className="text-xs text-muted-foreground truncate">
                                {product.brand}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-iherb-green mt-1">
                              GHS {price.toFixed(2)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    <div className="border-t border-border px-4 py-2">
                      <button
                        data-search-result
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSearchSubmit(e as any);
                        }}
                        className="w-full text-sm text-iherb-green hover:underline font-medium text-center cursor-pointer"
                      >
                        View all results for &quot;{searchQuery}&quot;
                      </button>
                    </div>
                  </div>
                ) : debouncedSearchQuery.trim().length >= 2 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No products found for &quot;{debouncedSearchQuery}&quot;
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-w-10 min-h-10"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {(session?.user as any)?.name || session?.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup">Create Account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="min-w-10 min-h-10"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative min-w-10 min-h-10"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-iherb-green text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-5">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <nav className="border-t border-border">
        <div className="container mx-auto px-2 sm:px-4 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <ul className="flex items-center gap-0.5 sm:gap-1 min-w-max">
              {isLoadingCategories
                ? Array.from({ length: 8 }).map((_, i) => (
                    <li key={i} className="shrink-0">
                      <Skeleton className="h-8 sm:h-10 w-16 sm:w-24" />
                    </li>
                  ))
                : categories.map((category) => (
                    <li key={category._id} className="shrink-0">
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="block px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-foreground hover:text-iherb-green hover:bg-iherb-green/5 transition-colors whitespace-nowrap"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar - Below Categories */}
      <div
        ref={searchContainerRef}
        className="md:hidden border-t border-border bg-white relative"
      >
        <div className="container mx-auto px-4 py-3 relative">
          <form onSubmit={handleSearchSubmit}>
            <div
              className={cn(
                "flex items-center border-2 rounded-full transition-colors",
                isSearchFocused ? "border-iherb-green" : "border-border"
              )}
            >
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                className="border-0 focus-visible:ring-0 rounded-l-full pl-4 text-sm h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
                onBlur={(e) => {
                  // Don't blur if clicking on search results
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  if (
                    searchContainerRef.current?.contains(relatedTarget) ||
                    relatedTarget?.closest('[data-search-result]')
                  ) {
                    return;
                  }
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="submit"
                className="rounded-full bg-iherb-green hover:bg-iherb-green-dark h-10 w-10 p-0 min-w-10 min-h-10"
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>

          {/* Mobile Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute left-4 right-4 top-full mt-2 bg-white border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((product) => {
                    const price =
                      typeof product.price === "object"
                        ? product.price.ghs
                        : product.price;
                    return (
                      <button
                        key={product._id}
                        data-search-result
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSearchResultClick(product, e);
                        }}
                        className="w-full px-3 py-2 hover:bg-muted/50 transition-colors text-left flex items-center gap-2 cursor-pointer"
                      >
                        <img
                          src={product.images?.[0]?.url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {product.brand}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-iherb-green mt-0.5">
                            GHS {price.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  <div className="border-t border-border px-3 py-2">
                    <button
                      data-search-result
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSearchSubmit(e as any);
                      }}
                      className="w-full text-xs text-iherb-green hover:underline font-medium text-center cursor-pointer"
                    >
                      View all results for &quot;{searchQuery}&quot;
                    </button>
                  </div>
                </div>
              ) : debouncedSearchQuery.trim().length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No products found for &quot;{debouncedSearchQuery}&quot;
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
