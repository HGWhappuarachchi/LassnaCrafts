"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
        >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
        </button>
    );
}
