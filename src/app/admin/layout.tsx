import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/SignOutButton";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Get the user just for display — middleware already enforces auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If unauthenticated (login page renders through here), just pass children through
    if (!user) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin top bar */}
            <div className="bg-white border-b border-slate-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-lg font-bold tracking-tighter text-slate-900">
                            Lassana<span className="text-rose-500">.</span>
                            <span className="ml-2 text-xs font-medium text-slate-400 tracking-normal">Admin</span>
                        </Link>
                        <nav className="hidden sm:flex items-center gap-1 text-sm">
                            <Link href="/admin/products" className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Products</Link>
                            <Link href="/admin/categories" className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Categories</Link>
                            <Link href="/admin/promotions" className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">Promotions</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[180px]">{user.email}</span>
                        <Link href="/" target="_blank" className="text-xs text-slate-500 hover:text-rose-500 transition-colors hidden sm:block">
                            View Store ↗
                        </Link>
                        <SignOutButton />
                    </div>
                </div>
            </div>
            <main>{children}</main>
        </div>
    );
}
