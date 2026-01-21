"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import {
  wishlistStorage,
  type LocalStorageWishlistItem,
} from "@/lib/utils/storage";

export interface WishlistItem {
  _id: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    brand?: string;
    image?: string;
    price?: number;
    slug: string;
  };
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  isWishlisted: (productId: string) => boolean;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

// Helper to fetch product details for localStorage items
async function fetchProductDetails(
  productId: string
): Promise<WishlistItem | null> {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const product = data.data;
      return {
        _id: product._id || productId,
        productId: product._id || productId,
        product: {
          _id: product._id || productId,
          name: product.name,
          brand: product.brand,
          image: product.images?.[0]?.url,
          price:
            typeof product.price === "object"
              ? product.price.ghs
              : product.price,
          slug: product.slug,
        },
        addedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
  }
  return null;
}

// Load wishlist from localStorage and enrich with product details
async function loadLocalStorageWishlist(): Promise<WishlistItem[]> {
  const localStorageItems = wishlistStorage.get();
  if (localStorageItems.length === 0) return [];

  // Fetch product details for all items
  const productPromises = localStorageItems.map(async (item) => {
    const productDetails = await fetchProductDetails(item.productId);
    if (productDetails) {
      return {
        ...productDetails,
        addedAt: item.addedAt,
      };
    }
    return null;
  });

  const items = await Promise.all(productPromises);
  return items.filter((item): item is WishlistItem => item !== null);
}

// Sync localStorage wishlist to database
async function syncLocalStorageToDatabase(): Promise<void> {
  const localStorageItems = wishlistStorage.get();
  if (localStorageItems.length === 0) return;

  try {
    // Add each item to the database wishlist
    for (const item of localStorageItems) {
      try {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId }),
        });
      } catch (error) {
        // If item already exists, that's fine - continue
        console.log(`Item ${item.productId} may already be in wishlist`);
      }
    }

    // Clear localStorage after successful sync
    wishlistStorage.clear();
  } catch (error) {
    console.error("Failed to sync wishlist to database:", error);
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSynced, setHasSynced] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!session) {
      // Load from localStorage when not logged in
      try {
        setIsLoading(true);
        const localStorageItems = await loadLocalStorageWishlist();
        setItems(localStorageItems);
      } catch (error) {
        console.error("Failed to load wishlist from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // User is logged in - fetch from database
    try {
      setIsLoading(true);
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        setItems(data.data?.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Sync localStorage to database when user logs in
  useEffect(() => {
    if (session && status === "authenticated" && !hasSynced) {
      syncLocalStorageToDatabase().then(() => {
        setHasSynced(true);
        fetchWishlist(); // Refresh wishlist after sync
      });
    } else if (!session) {
      setHasSynced(false);
      fetchWishlist();
    } else if (session && hasSynced) {
      fetchWishlist();
    }
  }, [session, status, hasSynced, fetchWishlist]);

  const isWishlisted = useCallback(
    (productId: string): boolean => {
      if (!session) {
        return wishlistStorage.has(productId);
      }
      return items.some(
        (item) =>
          item.productId === productId || item.product?._id === productId
      );
    },
    [session, items]
  );

  const addItem = useCallback(
    async (productId: string) => {
      if (!session) {
        // Save to localStorage when not logged in
        try {
          if (wishlistStorage.has(productId)) {
            toast({
              title: "Already in wishlist",
              description: "This item is already in your wishlist",
            });
            return;
          }

          wishlistStorage.add(productId);

          // Fetch product details and update state
          const productDetails = await fetchProductDetails(productId);
          if (productDetails) {
            setItems((prev) => [...prev, productDetails]);
            toast({
              title: "Success",
              description: "Item added to wishlist",
            });
          } else {
            // If product fetch fails, still save to localStorage
            wishlistStorage.add(productId);
            toast({
              title: "Success",
              description: "Item added to wishlist",
            });
            // Reload wishlist to get product details
            const localStorageItems = await loadLocalStorageWishlist();
            setItems(localStorageItems);
          }
        } catch (error) {
          console.error("Failed to add item to localStorage wishlist:", error);
          toast({
            title: "Error",
            description: "Failed to add item to wishlist",
            variant: "destructive",
          });
        }
        return;
      }

      // User is logged in - save to database
      try {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Success",
            description: "Item added to wishlist",
          });
          await fetchWishlist();
        } else if (data.message?.includes("already")) {
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist",
          });
          await fetchWishlist();
        } else {
          throw new Error(data.message || "Failed to add item");
        }
      } catch (error) {
        console.error("Failed to add item to wishlist:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to add item to wishlist",
          variant: "destructive",
        });
      }
    },
    [session, toast, fetchWishlist]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!session) {
        // Remove from localStorage when not logged in
        wishlistStorage.remove(productId);
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        toast({
          title: "Removed",
          description: "Item removed from wishlist",
        });
        return;
      }

      try {
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Removed",
            description: "Item removed from wishlist",
          });
          await fetchWishlist();
        } else {
          throw new Error(data.message || "Failed to remove item");
        }
      } catch (error) {
        console.error("Failed to remove item from wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to remove item from wishlist",
          variant: "destructive",
        });
      }
    },
    [session, toast, fetchWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        isWishlisted,
        addItem,
        removeItem,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
