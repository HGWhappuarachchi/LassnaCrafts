"use client";

import React, { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface Product {
    id: string;
    title: string;
    price: number;
    images: string[];
    stock_count: number;
}

export default function AddToCartSection({ product }: { product: Product }) {
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((s) => s.addItem);
    const isOutOfStock = product.stock_count <= 0;

    const handleAdd = () => {
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0] || "",
            quantity,
        });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Quantity selector */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">Quantity</span>
                <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-3 py-2 bg-white shadow-sm">
                    <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-30"
                        disabled={quantity <= 1}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-base font-semibold text-slate-800 min-w-[1.5rem] text-center">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity((q) => Math.min(product.stock_count, q + 1))}
                        className="text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-30"
                        disabled={isOutOfStock || quantity >= product.stock_count}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Add to Cart */}
            <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-rose-600 text-white font-medium py-4 rounded-xl shadow-md shadow-slate-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ShoppingBag className="w-5 h-5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
        </div>
    );
}
