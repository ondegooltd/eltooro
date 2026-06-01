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
import { cartStorage, type LocalStorageCartItem } from "@/lib/utils/storage";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand?: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  servingSize?: string;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  savings: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to fetch product details for localStorage items
async function fetchProductDetails(
  productId: string
): Promise<CartItem | null> {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();

    if (data.success && data.data) {
      const product = data.data;
      const price =
        typeof product.price === "object" ? product.price.ghs : product.price;
      const originalPrice = product.originalPrice
        ? typeof product.originalPrice === "object"
          ? product.originalPrice.ghs
          : product.originalPrice
        : undefined;

      return {
        id: product._id || productId,
        productId: product._id || productId,
        name: product.name,
        brand: product.brand,
        image: product.images?.[0]?.url || "/placeholder.svg",
        price,
        originalPrice,
        quantity: 1, // Will be set from localStorage
      };
    }
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
  }
  return null;
}

// Load cart from localStorage and enrich with product details
async function loadLocalStorageCart(): Promise<CartItem[]> {
  const localStorageItems = cartStorage.get();
  if (localStorageItems.length === 0) return [];

  // Fetch product details for all items
  const productPromises = localStorageItems.map(async (item) => {
    const productDetails = await fetchProductDetails(item.productId);
    if (productDetails) {
      return {
        ...productDetails,
        quantity: item.quantity,
      };
    }
    return null;
  });

  const items = await Promise.all(productPromises);
  return items.filter((item): item is CartItem => item !== null);
}

// Sync localStorage cart to database
async function syncLocalStorageToDatabase(): Promise<void> {
  const localStorageItems = cartStorage.get();
  if (localStorageItems.length === 0) return;

  try {
    // Add each item to the database cart
    for (const item of localStorageItems) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });
      } catch (error) {
        console.error(`Failed to sync item ${item.productId}:`, error);
      }
    }

    // Clear localStorage after successful sync
    cartStorage.clear();
  } catch (error) {
    console.error("Failed to sync cart to database:", error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSynced, setHasSynced] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!session) {
      // Load from localStorage when not logged in
      try {
        setIsLoading(true);
        const localStorageItems = await loadLocalStorageCart();
        setItems(localStorageItems);
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (data.success) {
        const cartItems: CartItem[] = (data.data?.items || [])
          .filter((item: any) => item.product) // Filter out items with missing products
          .map((item: any) => ({
            id: item.productId,
            productId: item.productId,
            name: item.product?.name || "Unknown Product",
            brand: item.product?.brand,
            image: item.product?.image || "/placeholder.svg",
            price: item.product?.price || 0,
            originalPrice: item.product?.originalPrice,
            quantity: item.quantity,
          }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Sync localStorage to database when user logs in
  useEffect(() => {
    if (session && status === "authenticated" && !hasSynced) {
      syncLocalStorageToDatabase().then(() => {
        setHasSynced(true);
        fetchCart(); // Refresh cart after sync
      });
    } else if (!session) {
      setHasSynced(false);
      fetchCart();
    } else if (session && hasSynced) {
      fetchCart();
    }
  }, [session, status, hasSynced, fetchCart]);

  const addItem = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!session) {
        // Save to localStorage when not logged in
        try {
          // First fetch product details to get the actual ObjectId
          const productDetails = await fetchProductDetails(productId);
          if (productDetails) {
            // Use the actual productId (ObjectId) from product details
            const actualProductId = productDetails.productId;

            // Check if item already exists in localStorage using the actual productId
            const existingItems = cartStorage.get();
            const existingIndex = existingItems.findIndex(
              (item) => item.productId === actualProductId
            );

            if (existingIndex >= 0) {
              // Update quantity in localStorage
              cartStorage.updateQuantity(
                actualProductId,
                existingItems[existingIndex].quantity + quantity
              );
            } else {
              // Add new item to localStorage using actual productId
              cartStorage.add(actualProductId, quantity);
            }

            // Update state
            setItems((prev) => {
              const existingIndex = prev.findIndex(
                (item) => item.productId === actualProductId
              );
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                return updated;
              }
              return [...prev, { ...productDetails, quantity }];
            });

            toast({
              title: "Success",
              description: "Item added to cart",
            });
          } else {
            // If product fetch fails, still save to localStorage with original productId
            cartStorage.add(productId, quantity);
            toast({
              title: "Success",
              description: "Item added to cart",
            });
            // Reload cart to get product details
            const localStorageItems = await loadLocalStorageCart();
            setItems(localStorageItems);
          }
        } catch (error) {
          console.error("Failed to add item to localStorage cart:", error);
          toast({
            title: "Error",
            description: "Failed to add item to cart",
            variant: "destructive",
          });
        }
        return;
      }

      // User is logged in - save to database
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Success",
            description: "Item added to cart",
          });
          await fetchCart();
        } else {
          throw new Error(data.message || "Failed to add item");
        }
      } catch (error) {
        console.error("Failed to add item to cart:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to add item to cart",
          variant: "destructive",
        });
      }
    },
    [session, toast, fetchCart]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!session) {
        // Remove from localStorage when not logged in
        cartStorage.remove(productId);
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        return;
      }

      try {
        const response = await fetch(`/api/cart/${productId}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          await fetchCart();
        } else {
          throw new Error(data.message || "Failed to remove item");
        }
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
        toast({
          title: "Error",
          description: "Failed to remove item from cart",
          variant: "destructive",
        });
      }
    },
    [session, toast, fetchCart]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) {
        await removeItem(productId);
        return;
      }

      if (!session) {
        // Update localStorage when not logged in
        cartStorage.updateQuantity(productId, quantity);
        setItems((prev) =>
          prev.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          )
        );
        return;
      }

      try {
        const response = await fetch(`/api/cart/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });

        const data = await response.json();

        if (data.success) {
          await fetchCart();
        } else {
          throw new Error(data.message || "Failed to update quantity");
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to update quantity",
          variant: "destructive",
        });
      }
    },
    [session, toast, fetchCart, removeItem]
  );

  const clearCart = useCallback(async () => {
    if (!session) {
      // Clear localStorage when not logged in
      cartStorage.clear();
      setItems([]);
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchCart();
      } else {
        throw new Error(data.message || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  }, [session, toast, fetchCart]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const savings = items.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
        itemCount,
        subtotal,
        savings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
