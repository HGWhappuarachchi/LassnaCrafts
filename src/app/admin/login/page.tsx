"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const supabase = createClient();
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError("Invalid email or password. Please try again.");
                return;
            }

            router.push("/admin");
            router.refresh();
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-slate-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tighter text-slate-900">
                        Lassana<span className="text-rose-500">.</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">Admin Dashboard</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@lassana.lk"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 outline-none focus:border-rose-400 focus:bg-white transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-50 outline-none focus:border-rose-400 focus:bg-white transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Access restricted to authorised administrators only.
                </p>
            </div>
        </div>
    );
}
