"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Pencil, Plus, Tag } from "lucide-react";

interface Promotion {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed_amount";
    discount_value: number;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
}

const emptyForm = {
    code: "",
    discount_type: "percentage" as "percentage" | "fixed_amount",
    discount_value: "",
    start_date: "",
    end_date: "",
    is_active: true,
};

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");

    const supabase = createClient();

    const load = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("promotions")
            .select("*")
            .order("created_at", { ascending: false });
        setPromotions((data as Promotion[]) ?? []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []); // eslint-disable-line

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!form.code.trim() || !form.discount_value) {
            setError("Code and discount value are required.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                discount_type: form.discount_type,
                discount_value: parseFloat(form.discount_value),
                start_date: form.start_date || null,
                end_date: form.end_date || null,
                is_active: form.is_active,
            };

            if (editingId) {
                const { error: err } = await supabase.from("promotions").update(payload).eq("id", editingId);
                if (err) throw err;
            } else {
                const { error: err } = await supabase.from("promotions").insert([payload]);
                if (err) throw err;
            }
            setForm(emptyForm);
            setEditingId(null);
            await load();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (p: Promotion) => {
        setEditingId(p.id);
        setForm({
            code: p.code,
            discount_type: p.discount_type,
            discount_value: String(p.discount_value),
            start_date: p.start_date ? p.start_date.slice(0, 10) : "",
            end_date: p.end_date ? p.end_date.slice(0, 10) : "",
            is_active: p.is_active,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this promotion?")) return;
        await supabase.from("promotions").delete().eq("id", id);
        await load();
    };

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from("promotions").update({ is_active: !current }).eq("id", id);
        setPromotions((prev) =>
            prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p))
        );
    };

    const formatDiscount = (p: Promotion) =>
        p.discount_type === "percentage"
            ? `${p.discount_value}% off`
            : `Rs. ${p.discount_value.toLocaleString()} off`;

    const isExpired = (p: Promotion) =>
        p.end_date ? new Date(p.end_date) < new Date() : false;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <Link href="/admin" className="hover:text-rose-500 transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-slate-600 font-medium">Promotions</span>
            </nav>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Promotions & Discounts</h1>
                    <p className="mt-1 text-sm text-slate-500">Create promo codes for percentage or fixed-amount discounts.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-rose-500" />
                            {editingId ? "Edit Promotion" : "New Promotion"}
                        </h2>

                        {error && (
                            <div className="mb-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Promo Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.code}
                                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SPRING20"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-rose-400 transition-colors font-mono tracking-widest uppercase"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
                                <select
                                    value={form.discount_type}
                                    onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as "percentage" | "fixed_amount" }))}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-rose-400 transition-colors"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed_amount">Fixed Amount (Rs.)</option>
                                </select>
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {form.discount_type === "percentage" ? "Percentage (0–100)" : "Amount (LKR)"}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max={form.discount_type === "percentage" ? 100 : undefined}
                                    step="0.01"
                                    value={form.discount_value}
                                    onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
                                    placeholder={form.discount_type === "percentage" ? "e.g. 20" : "e.g. 1000"}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-rose-400 transition-colors"
                                />
                            </div>

                            {/* Date range */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={form.start_date}
                                        onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 outline-none focus:border-rose-400 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 outline-none focus:border-rose-400 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Active toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-rose-500 transition-colors flex-shrink-0">
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : ""}`} />
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                    {form.is_active ? "Active" : "Inactive"}
                                </span>
                            </label>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60"
                                >
                                    {saving ? "Saving…" : editingId ? "Update" : "Create Code"}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingId(null); setForm(emptyForm); setError(""); }}
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
                            <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
                        ) : promotions.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm">No promo codes yet.</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Expires</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {promotions.map((promo) => (
                                        <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <span className="font-mono font-bold text-slate-800 tracking-widest bg-slate-100 px-2 py-0.5 rounded text-xs">
                                                    {promo.code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-sm">
                                                    <Tag className="w-3 h-3" />
                                                    {formatDiscount(promo)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-400 text-xs hidden sm:table-cell">
                                                {promo.end_date
                                                    ? <span className={isExpired(promo) ? "text-red-400" : ""}>{new Date(promo.end_date).toLocaleDateString("en-LK")}{isExpired(promo) ? " (expired)" : ""}</span>
                                                    : <span className="text-slate-300 italic">No limit</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => toggleActive(promo.id, promo.is_active)}
                                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${promo.is_active && !isExpired(promo)
                                                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                        }`}
                                                >
                                                    {promo.is_active && !isExpired(promo) ? "Active" : "Off"}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEdit(promo)} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(promo.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
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
                </div>
            </div>
        </div>
    );
}
