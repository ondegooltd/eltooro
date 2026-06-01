/**
 * LocalStorage utilities for cart and wishlist
 * These functions handle storing cart/wishlist items when user is not logged in
 */

const CART_STORAGE_KEY = "iherb_cart";
const WISHLIST_STORAGE_KEY = "iherb_wishlist";

export interface LocalStorageCartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface LocalStorageWishlistItem {
  productId: string;
  addedAt: string;
}

// Cart localStorage functions
export const cartStorage = {
  get: (): LocalStorageCartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  set: (items: LocalStorageCartItem[]): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  },

  add: (productId: string, quantity: number = 1): void => {
    const items = cartStorage.get();
    const existingIndex = items.findIndex(
      (item) => item.productId === productId
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        productId,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }

    cartStorage.set(items);
  },

  remove: (productId: string): void => {
    const items = cartStorage
      .get()
      .filter((item) => item.productId !== productId);
    cartStorage.set(items);
  },

  updateQuantity: (productId: string, quantity: number): void => {
    if (quantity < 1) {
      cartStorage.remove(productId);
      return;
    }

    const items = cartStorage.get();
    const existingIndex = items.findIndex(
      (item) => item.productId === productId
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity = quantity;
      cartStorage.set(items);
    }
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear cart from localStorage:", error);
    }
  },
};

// Wishlist localStorage functions
export const wishlistStorage = {
  get: (): LocalStorageWishlistItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  set: (items: LocalStorageWishlistItem[]): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage:", error);
    }
  },

  add: (productId: string): void => {
    const items = wishlistStorage.get();
    const exists = items.some((item) => item.productId === productId);

    if (!exists) {
      items.push({
        productId,
        addedAt: new Date().toISOString(),
      });
      wishlistStorage.set(items);
    }
  },

  remove: (productId: string): void => {
    const items = wishlistStorage
      .get()
      .filter((item) => item.productId !== productId);
    wishlistStorage.set(items);
  },

  has: (productId: string): boolean => {
    return wishlistStorage.get().some((item) => item.productId === productId);
  },

  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear wishlist from localStorage:", error);
    }
  },
};
