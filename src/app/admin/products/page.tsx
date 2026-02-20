"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface Product {
    id: string;
    title: string;
    price: number;
    stock_count: number;
    is_active: boolean;
    slug: string;
    created_at: string;
    categories?: { name: string } | null;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const load = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("id, title, price, stock_count, is_active, slug, created_at, categories(name)")
            .order("created_at", { ascending: false });
        if (!error) setProducts((data as unknown as Product[]) ?? []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []); // eslint-disable-line

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from("products").update({ is_active: !current }).eq("id", id);
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
        );
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        await supabase.from("products").delete().eq("id", id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Link href="/admin" className="hover:text-rose-500 transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">Products</span>
            </nav>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
                    <p className="mt-1 text-sm text-slate-500">{products.length} product{products.length !== 1 ? "s" : ""} total</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm">Loading products…</div>
                ) : products.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-400 text-sm mb-4">No products yet.</p>
                        <Link
                            href="/admin/products/new"
                            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800 line-clamp-1">{product.title}</p>
                                            <p className="text-xs text-slate-400 font-mono">{product.slug}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">
                                            {product.categories?.name ?? <span className="text-slate-300 italic">None</span>}
                                        </td>
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            Rs. {product.price.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-sm font-medium ${product.stock_count === 0 ? "text-red-500" : product.stock_count <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
                                                {product.stock_count}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => toggleActive(product.id, product.is_active)}
                                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${product.is_active
                                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {product.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {product.is_active ? "Active" : "Draft"}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/admin/products/${product.slug}/edit`}
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.title)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
