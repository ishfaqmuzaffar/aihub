"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

type CartItem = {
  id: string;
  postId: string;
  post: {
    id: string;
    title: string;
    imageUrl: string | null;
    images: string[];
    price: number | null;
    isFree: boolean;
    type: string;
    author: { id: string; name: string | null; username: string | null };
  };
};

type CartContextType = {
  items: CartItem[];
  count: number;
  loading: boolean;
  addToCart: (postId: string) => Promise<{ inCart: boolean } | null>;
  removeFromCart: (postId: string) => Promise<void>;
  clearCart: () => void;
  refresh: () => Promise<void>;
  isInCart: (postId: string) => boolean;
  total: number;
};

const CartContext = createContext<CartContextType>({
  items: [], count: 0, loading: false,
  addToCart: async () => null,
  removeFromCart: async () => {},
  clearCart: () => {},
  refresh: async () => {},
  isInCart: () => false,
  total: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) { setItems([]); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  async function addToCart(postId: string) {
    const res = await fetch(`/api/cart/${postId}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) await refresh();
    return data;
  }

  async function removeFromCart(postId: string) {
    await fetch(`/api/cart/${postId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.postId !== postId));
  }

  function clearCart() { setItems([]); }

  const isInCart = (postId: string) => items.some((i) => i.postId === postId);
  const total = items.reduce((sum, i) => sum + (i.post.price || 0), 0);

  return (
    <CartContext.Provider value={{ items, count: items.length, loading, addToCart, removeFromCart, clearCart, refresh, isInCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
