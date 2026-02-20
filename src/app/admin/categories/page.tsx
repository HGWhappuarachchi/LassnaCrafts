"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Pencil, Plus } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", slug: "", description: "" });

    const supabase = createClient();

    const load = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("categories")
            .select("*")
            .order("name");
        setCategories(data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        setForm((f) => ({ ...f, name, slug }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                const { error } = await supabase
                    .from("categories")
                    .update({ name: form.name, slug: form.slug, description: form.description })
                    .eq("id", editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("categories").insert([
                    { name: form.name, slug: form.slug, description: form.description || null },
                ]);
                if (error) throw error;
            }
            setForm({ name: "", slug: "", description: "" });
            setEditingId(null);
            await load();
        } catch (err: unknown) {
            alert("Error: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "" });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category? Products in it will become uncategorised.")) return;
        await supabase.from("categories").delete().eq("id", id);
        await load();
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm({ name: "", slug: "", description: "" });
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Link href="/admin" className="hover:text-rose-500 transition-colors">
                    Dashboard
                </Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">Categories</span>
            </nav>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage product categories shown in the storefront.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-rose-500" />
                            {editingId ? "Edit Category" : "New Category"}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Bouquets"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-rose-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Slug{" "}
                                    <span className="font-normal text-slate-400">(auto)</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.slug}
                                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                    placeholder="bouquets"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-100 text-slate-500 font-mono outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description{" "}
                                    <span className="font-normal text-slate-400">(optional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Short description…"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-rose-400 transition-colors"
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
                                >
                                    {saving ? "Saving…" : editingId ? "Update" : "Create Category"}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                Loading categories…
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                No categories yet. Add one using the form.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                                            Slug
                                        </th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                {cat.name}
                                                {cat.description && (
                                                    <p className="text-xs text-slate-400 font-normal mt-0.5 line-clamp-1">
                                                        {cat.description}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-400 font-mono text-xs hidden sm:table-cell">
                                                {cat.slug}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEdit(cat)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-3 text-center">
                        {categories.length} categor{categories.length === 1 ? "y" : "ies"} total
                    </p>
                </div>
            </div>
        </div>
    );
}
