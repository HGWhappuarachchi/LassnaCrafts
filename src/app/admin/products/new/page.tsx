"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Category {
    id: string;
    name: string;
}

export default function AdminProductCreate() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Fetch categories from Supabase on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("categories")
                    .select("id, name")
                    .order("name");
                if (!error && data) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            } finally {
                setCategoriesLoading(false);
            }
        };
        loadCategories();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        description: "",
        price: "",
        compare_at_price: "",
        stock_count: "0",
        is_active: true,
        category_id: "",
    });

    const [images, setImages] = useState<File[]>([]);

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        setFormData((prev) => ({ ...prev, title, slug }));
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const val =
            type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setUploadProgress(10);

        const interval = setInterval(() => {
            setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
        }, 400);

        try {
            const supabase = createClient();

            // 1. Upload images to Supabase Storage (only if images selected)
            const imageUrls: string[] = [];
            if (images.length > 0) {
                for (const file of images) {
                    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from("products")
                        .upload(`public/${filename}`, file, { upsert: false });
                    if (uploadError) {
                        console.warn("Image upload failed (storage bucket may not exist):", uploadError.message);
                        // Continue without images rather than aborting
                    } else {
                        const { data: urlData } = supabase.storage
                            .from("products")
                            .getPublicUrl(uploadData.path);
                        imageUrls.push(urlData.publicUrl);
                    }
                }
            }

            setUploadProgress(80);

            // 2. Insert product row
            const { error: insertError } = await supabase.from("products").insert([
                {
                    title: formData.title,
                    slug: formData.slug,
                    description: formData.description || null,
                    price: parseFloat(formData.price),
                    compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
                    stock_count: parseInt(formData.stock_count),
                    is_active: formData.is_active,
                    category_id: formData.category_id || null,
                    images: imageUrls,
                },
            ]);
            if (insertError) throw insertError;

            setUploadProgress(100);

            // Reset
            setFormData({
                title: "",
                slug: "",
                description: "",
                price: "",
                compare_at_price: "",
                stock_count: "0",
                is_active: true,
                category_id: "",
            });
            setImages([]);
            alert("✅ Product created successfully!");
        } catch (error: unknown) {
            console.error("Error creating product:", error);
            const msg = error instanceof Error ? error.message : String(error);
            alert(`Failed to create product: ${msg}`);
        } finally {
            clearInterval(interval);
            setIsSubmitting(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Link href="/admin" className="hover:text-rose-500 transition-colors">
                    Dashboard
                </Link>
                <span>/</span>
                <Link
                    href="/admin/products"
                    className="hover:text-rose-500 transition-colors"
                >
                    Products
                </Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">New Product</span>
            </nav>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Add New Product
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Create a new floral arrangement or vase listing.
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="text-sm text-slate-500 hover:text-rose-500 transition-colors"
                >
                    ← Back to Dashboard
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
            >
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Product Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 block w-full rounded-xl border border-slate-200 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm px-4 py-3 bg-slate-50 outline-none transition-colors"
                            placeholder="e.g. Lavender Dream Bouquet"
                            value={formData.title}
                            onChange={handleTitleChange}
                        />
                    </div>

                    {/* Slug (auto-generated, editable) */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label
                            htmlFor="slug"
                            className="block text-sm font-medium text-slate-700"
                        >
                            URL Slug{" "}
                            <span className="text-slate-400 font-normal">(auto-generated)</span>
                        </label>
                        <input
                            type="text"
                            name="slug"
                            id="slug"
                            required
                            className="mt-1 block w-full rounded-xl border border-slate-200 sm:text-sm px-4 py-3 bg-slate-100 text-slate-500 outline-none font-mono text-sm"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="lavender-dream-bouquet"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label
                            htmlFor="category_id"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Category
                        </label>
                        <select
                            name="category_id"
                            id="category_id"
                            className="mt-1 block w-full rounded-xl border border-slate-200 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm px-4 py-3 bg-slate-50 outline-none transition-colors appearance-none"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            disabled={categoriesLoading}
                        >
                            <option value="">
                                {categoriesLoading ? "Loading categories…" : "— Select a category —"}
                            </option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {!categoriesLoading && categories.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                                No categories found.{" "}
                                <Link
                                    href="/admin/categories/new"
                                    className="underline hover:text-rose-500"
                                >
                                    Create one first.
                                </Link>
                            </p>
                        )}
                    </div>

                    {/* Price + Compare at Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700">
                                Sale Price (LKR)
                            </label>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                required
                                step="0.01"
                                min="0"
                                className="mt-1 block w-full rounded-xl border border-slate-200 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm px-4 py-3 bg-slate-50 outline-none"
                                placeholder="e.g. 8500.00"
                                value={formData.price}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="compare_at_price" className="block text-sm font-medium text-slate-700">
                                Original Price{" "}
                                <span className="font-normal text-slate-400">(optional)</span>
                            </label>
                            <input
                                type="number"
                                name="compare_at_price"
                                id="compare_at_price"
                                step="0.01"
                                min="0"
                                className="mt-1 block w-full rounded-xl border border-slate-200 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm px-4 py-3 bg-slate-50 outline-none"
                                placeholder="e.g. 12000.00"
                                value={formData.compare_at_price}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    {formData.compare_at_price && parseFloat(formData.compare_at_price) > parseFloat(formData.price || "0") && (
                        <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                            ✓ Discount badge will show{" "}
                            <strong>
                                -{Math.round(((parseFloat(formData.compare_at_price) - parseFloat(formData.price || "0")) / parseFloat(formData.compare_at_price)) * 100)}% off
                            </strong>{" "}
                            on the product card
                        </p>
                    )}

                    {/* Stock */}
                    <div className="space-y-2">
                        <label
                            htmlFor="stock_count"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Inventory Count
                        </label>
                        <input
                            type="number"
                            name="stock_count"
                            id="stock_count"
                            required
                            min="0"
                            className="mt-1 block w-full rounded-xl border border-slate-200 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm px-4 py-3 bg-slate-50 outline-none"
                            value={formData.stock_count}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Description
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows={4}
                        className="mt-1 block w-full rounded-xl border border-slate-200 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:text-sm px-4 py-3 bg-slate-50 outline-none"
                        placeholder="Describe the product details, flowers included, etc."
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                        Product Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-rose-400 transition-colors bg-slate-50">
                        <div className="space-y-1 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-slate-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div className="flex text-sm text-slate-600 justify-center">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md font-medium text-rose-600 hover:text-rose-500 focus-within:outline-none"
                                >
                                    <span>Upload files</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        multiple
                                        className="sr-only"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500">PNG, JPG, WebP up to 5MB</p>
                        </div>
                    </div>
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {images.map((file, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-full"
                                >
                                    📎 {file.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Status Toggle */}
                <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                        <div>
                            <h4 className="text-sm font-medium text-slate-900">
                                Active Status
                            </h4>
                            <p className="text-sm text-slate-500">
                                Draft products are hidden from the public storefront.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer gap-3">
                            <input
                                type="checkbox"
                                name="is_active"
                                className="sr-only peer"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700">
                                {formData.is_active ? "Active" : "Draft"}
                            </span>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-8">
                    <Link
                        href="/admin"
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors relative overflow-hidden"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Saving {uploadProgress}%
                            </div>
                        ) : (
                            "Save Product"
                        )}
                        {isSubmitting && (
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
