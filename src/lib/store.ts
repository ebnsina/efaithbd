import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  variantName?: string
}

export interface WishlistItem {
  productId: string
  name: string
  price: number
  image: string
  slug: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void
  clearCart: () => void
  total: () => number
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: item =>
        set(state => {
          const existingItem = state.items.find(
            i =>
              i.productId === item.productId && i.variantId === item.variantId
          )

          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.productId === item.productId && i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }

          return { items: [...state.items, item] }
        }),
      removeItem: (productId, variantId) =>
        set(state => ({
          items: state.items.filter(
            i => !(i.productId === productId && i.variantId === variantId)
          ),
        })),
      updateQuantity: (productId, quantity, variantId) =>
        set(state => ({
          items: state.items.map(i =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () => {
        const state = get()
        return state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: item =>
        set(state => {
          const exists = state.items.find(i => i.productId === item.productId)
          if (exists) return state
          return { items: [...state.items, item] }
        }),
      removeItem: productId =>
        set(state => ({
          items: state.items.filter(i => i.productId !== productId),
        })),
      isInWishlist: productId => {
        const state = get()
        return state.items.some(i => i.productId === productId)
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)
