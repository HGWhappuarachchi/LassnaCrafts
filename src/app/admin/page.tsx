import React from "react";
import Link from "next/link";

export default function AdminDashboard() {
    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="mt-1 text-slate-500">Welcome back. Manage your Lassana store.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Products */}
                <Link
                    href="/admin/products"
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-rose-200 transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4 group-hover:bg-rose-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 11h16M4 15h10" />
                        </svg>
                    </div>
                    <h2 className="text-base font-semibold text-slate-800 group-hover:text-rose-600 transition-colors">Products</h2>
                    <p className="text-sm text-slate-500 mt-1">Add, edit, and manage all products and inventory.</p>
                </Link>

                {/* Categories */}
                <Link
                    href="/admin/categories"
                    className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-rose-200 transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5l5.707 5.707A1 1 0 0118 9.414V19a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
                        </svg>
                    </div>
                    <h2 className="text-base font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">Categories</h2>
                    <p className="text-sm text-slate-500 mt-1">Create and organise product categories.</p>
                </Link>

                {/* Add Product shortcut */}
                <Link
                    href="/admin/products/new"
                    className="group bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-sm p-6 transition-all"
                >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h2 className="text-base font-semibold text-white">Add New Product</h2>
                    <p className="text-sm text-rose-200 mt-1">Quickly list a new floral arrangement.</p>
                </Link>
            </div>

            {/* Quick links row */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-wrap gap-3 items-center">
                <span className="text-sm font-medium text-slate-600 mr-2">Quick links:</span>
                <Link href="/" target="_blank" className="text-sm text-rose-600 hover:underline">View Storefront ↗</Link>
                <span className="text-slate-300">|</span>
                <Link href="/admin/products/new" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">+ New Product</Link>
                <span className="text-slate-300">|</span>
                <Link href="/admin/categories" className="text-sm text-slate-600 hover:text-rose-500 transition-colors">+ New Category</Link>
            </div>
        </div>
    );
}
