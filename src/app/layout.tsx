import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import React from "react";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";

// The Outfit font gives a clean, modern, and slightly elegant vibe
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "Lassana | Premium Crafted Flowers & Vases",
    description: "Discover beautiful, hand-crafted floral arrangements and premium vases.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${outfit.variable} font-sans bg-rose-50/30 text-slate-800 antialiased min-h-screen flex flex-col`}
            >
                <Header />

                {/* Main Content Area */}
                <main className="flex-grow pt-24">
                    {children}
                </main>

                <CartDrawer />

                {/* Minimal Footer */}
                <footer className="bg-white border-t border-rose-100 py-12 mt-auto">
                    <div className="container mx-auto px-4 text-center">
                        <h3 className="text-xl font-medium text-rose-800 mb-4">Lassana</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                            Bringing beauty into your everyday life with exquisitely crafted floral arrangements and elegant vases.
                        </p>
                        <div className="text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Lassana. All rights reserved.
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
