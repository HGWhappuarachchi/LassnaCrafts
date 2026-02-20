import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
}

export interface AppliedPromo {
    code: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    appliedPromo: AppliedPromo | null;

    // Actions
    setIsOpen: (isOpen: boolean) => void;
    toggleCart: () => void;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    applyPromo: (promo: AppliedPromo) => void;
    removePromo: () => void;

    // Getters
    getTotalItems: () => number;
    getSubtotal: () => number;
    getDiscountAmount: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            appliedPromo: null,

            setIsOpen: (isOpen) => set({ isOpen }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            addItem: (newItem) => set((state) => {
                const existingItem = state.items.find((item) => item.id === newItem.id);
                if (existingItem) {
                    return {
                        items: state.items.map((item) =>
                            item.id === newItem.id
                                ? { ...item, quantity: item.quantity + newItem.quantity }
                                : item
                        ),
                        isOpen: true,
                    };
                }
                return { items: [...state.items, newItem], isOpen: true };
            }),

            removeItem: (id) => set((state) => ({
                items: state.items.filter((item) => item.id !== id),
            })),

            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                ),
            })),

            clearCart: () => set({ items: [], appliedPromo: null }),

            applyPromo: (promo) => set({ appliedPromo: promo }),

            removePromo: () => set({ appliedPromo: null }),

            getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),

            getSubtotal: () =>
                get().items.reduce((t, i) => t + i.price * i.quantity, 0),

            getDiscountAmount: () => {
                const { appliedPromo, getSubtotal } = get();
                if (!appliedPromo) return 0;
                const sub = getSubtotal();
                if (appliedPromo.discount_type === 'percentage') {
                    return Math.round((sub * appliedPromo.discount_value) / 100);
                }
                return Math.min(appliedPromo.discount_value, sub);
            },

            getTotalPrice: () => {
                const { getSubtotal, getDiscountAmount } = get();
                return Math.max(0, getSubtotal() - getDiscountAmount());
            },
        }),
        {
            name: 'lassana-cart-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ items: state.items, appliedPromo: state.appliedPromo }),
        }
    )
);
