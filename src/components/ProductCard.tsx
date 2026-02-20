"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    stock_count: number;
    is_active: boolean;
    slug?: string;
}

interface ProductCardProps {
    product: Product;
}

function PlaceholderImage({ title }: { title: string }) {
    const initials = title.slice(0, 2).toUpperCase();
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 text-rose-300">
            <svg viewBox="0 0 80 80" className="w-16 h-16 mb-2 opacity-40" fill="currentColor">
                <path d="M40 10 C25 10 15 22 15 35 C15 55 40 70 40 70 C40 70 65 55 65 35 C65 22 55 10 40 10Z" />
            </svg>
            <span className="text-xs font-semibold text-rose-400 tracking-widest">{initials}</span>
        </div>
    );
}

export function ProductCard({ product }: ProductCardProps) {
    const [imgError, setImgError] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    const mainImage = product.images[0] || "";
    const isOutOfStock = product.stock_count <= 0;
    const productHref = `/products/${product.slug ?? product.id}`;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Don't navigate when clicking Add to Cart
        if (!isOutOfStock) {
            addItem({
                id: product.id,
                title: product.title,
                price: product.price,
                image: mainImage,
                quantity: 1,
            });
        }
    };

    return (
        <Link
            href={productHref}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-in-out transform hover:-translate-y-1 cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-rose-50">
                {mainImage && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mainImage}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <PlaceholderImage title={product.title} />
                )}

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isOutOfStock && (
                        <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            Out of Stock
                        </span>
                    )}
                    {!isOutOfStock && product.stock_count <= 5 && (
                        <span className="bg-rose-100/90 backdrop-blur-sm text-rose-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            Only {product.stock_count} left
                        </span>
                    )}
                </div>

                {/* Add to Cart button — always visible on mobile; hover on desktop */}
                {!isOutOfStock && (
                    <button
                        onClick={handleAddToCart}
                        className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-sm font-medium py-2.5 rounded-xl shadow-lg z-10
              transition-all duration-300
              opacity-100 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0"
                    >
                        Add to Cart
                    </button>
                )}

                {isOutOfStock && (
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-100/80 text-slate-500 text-sm font-medium py-2.5 rounded-xl text-center z-10">
                        Out of Stock
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <h3 className="text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-rose-600 transition-colors">
                        {product.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900 tracking-tight">
                        Rs. {product.price.toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-rose-400 font-medium hidden md:inline">View Details →</span>
                </div>
            </div>
        </Link>
    );
}
