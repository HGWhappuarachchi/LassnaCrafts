"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";

interface Category {
    id: string;
    name: string;
    slug: string;
}

export function Header() {
    const { getTotalItems, setIsOpen } = useCartStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // Fetch real categories from Supabase
        const supabase = createClient();
        supabase
            .from("categories")
            .select("id, name, slug")
            .order("name")
            .then(({ data }) => {
                if (data) setCategories(data);
            });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const totalItems = mounted ? getTotalItems() : 0;

    return (
        <>
            <header
                className={`fixed top-0 z-40 w-full transition-all duration-300 ${isScrolled || isMobileMenuOpen
                        ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
                        : "bg-white/70 backdrop-blur-sm py-4"
                    }`}
            >
                <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900">
                        Lassana<span className="text-rose-500">.</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-700">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/?category=${cat.slug}`}
                                className="hover:text-rose-500 transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsOpen(true)}
                            aria-label="Open cart"
                            className="p-2 text-slate-700 hover:text-rose-500 transition-colors relative group"
                        >
                            <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">
                                    {totalItems}
                                </span>
                            )}
                        </button>

                        <button
                            className="md:hidden p-2 text-slate-700 hover:text-rose-500 transition-colors"
                            onClick={() => setIsMobileMenuOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-rose-50 px-4 py-4 flex flex-col gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/?category=${cat.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-slate-700 font-medium text-base py-2 border-b border-slate-50 hover:text-rose-500 transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                )}
            </header>
        </>
    );
}
