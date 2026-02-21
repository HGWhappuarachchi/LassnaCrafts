"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { X, Plus, Minus, ShoppingBag, Tag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Safe image component — falls back to a floral SVG if src is missing/broken
function CartItemImage({ src, alt }: { src: string; alt: string }) {
    const [err, setErr] = useState(false);
    if (!src || err) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100">
                <svg viewBox="0 0 40 40" className="w-8 h-8 opacity-30 text-rose-400" fill="currentColor">
                    <path d="M20 4C12 4 7 10 7 17C7 28 20 36 20 36C20 36 33 28 33 17C33 10 28 4 20 4Z" />
                </svg>
            </div>
        );
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setErr(true)} />
    );
}

export function CartDrawer() {
    const {
        isOpen, setIsOpen, items, updateQuantity, removeItem,
        getSubtotal, getDiscountAmount, getTotalPrice,
        appliedPromo, applyPromo, removePromo,
    } = useCartStore();

    const [promoInput, setPromoInput] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState("");

    if (!isOpen) return null;

    const subtotal = getSubtotal();
    const discountAmount = getDiscountAmount();
    const total = getTotalPrice();

    const handleApplyPromo = async () => {
        const code = promoInput.trim().toUpperCase();
        if (!code) return;
        setPromoError("");
        setPromoLoading(true);

        try {
            const supabase = createClient();
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from("promotions")
                .select("code, discount_type, discount_value, start_date, end_date, is_active")
                .eq("code", code)
                .eq("is_active", true)
                .or(`start_date.is.null,start_date.lte.${now}`)
                .or(`end_date.is.null,end_date.gte.${now}`)
                .maybeSingle();

            if (error || !data) {
                setPromoError("Invalid or expired promo code.");
            } else {
                applyPromo({
                    code: data.code,
                    discount_type: data.discount_type,
                    discount_value: data.discount_value,
                });
                setPromoInput("");
            }
        } catch {
            setPromoError("Could not validate code. Try again.");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleCheckout = () => {
        const baseUrl = "https://wa.me/94772430304";
        let message = "Hello Lassana, I'd like to place an order:%0A%0A";
        items.forEach(item => {
            message += `- ${item.title} (x${item.quantity}) - Rs. ${(item.price * item.quantity).toLocaleString()}%0A`;
        });
        if (appliedPromo) {
            message += `%0A🏷️ Promo Code: *${appliedPromo.code}* (-Rs. ${discountAmount.toLocaleString()})%0A`;
        }
        message += `%0A*Total: Rs. ${total.toLocaleString()}*`;
        message += "%0A%0APlease let me know how to proceed with payment.";
        window.open(`${baseUrl}?text=${message}`, "_blank");
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                onClick={() => setIsOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-rose-500" />
                        Your Cart
                    </h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-300">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-slate-800 font-medium">Your cart is empty</p>
                                <p className="text-sm text-slate-500 mt-1">Add some beautiful arrangements to get started.</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2 bg-white border border-rose-200 text-rose-600 rounded-full text-sm font-medium hover:bg-rose-50 transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-2xl">
                                <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm border border-slate-100">
                                    <CartItemImage src={item.image} alt={item.title} />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-medium text-slate-800 text-sm leading-snug line-clamp-2">{item.title}</h3>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-slate-400 hover:text-rose-500 disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-medium text-slate-700 min-w-[1ch] text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-slate-400 hover:text-rose-500"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="font-medium text-slate-900 text-sm">
                                            Rs. {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-slate-100 p-6 bg-white flex-shrink-0 space-y-4">
                        {/* Promo Code */}
                        {appliedPromo ? (
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <Tag className="w-4 h-4" />
                                    <span className="text-sm font-semibold font-mono tracking-widest">{appliedPromo.code}</span>
                                    <span className="text-xs text-emerald-600">
                                        ({appliedPromo.discount_type === "percentage"
                                            ? `${appliedPromo.discount_value}% off`
                                            : `Rs. ${appliedPromo.discount_value.toLocaleString()} off`})
                                    </span>
                                </div>
                                <button
                                    onClick={removePromo}
                                    className="text-emerald-500 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoInput}
                                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }}
                                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                                        placeholder="Promo code"
                                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono tracking-wider bg-slate-50 outline-none focus:border-rose-400 transition-colors uppercase"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !promoInput.trim()}
                                        className="px-4 py-2 bg-slate-800 hover:bg-rose-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                    >
                                        {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                                        Apply
                                    </button>
                                </div>
                                {promoError && (
                                    <p className="text-xs text-red-500 mt-1.5">{promoError}</p>
                                )}
                            </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>Rs. {subtotal.toLocaleString()}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                                    <span>Discount ({appliedPromo?.code})</span>
                                    <span>− Rs. {discountAmount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-800 font-semibold text-base pt-2 border-t border-slate-100">
                                <span>Total</span>
                                <span>Rs. {total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Checkout */}
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-[#25D366] hover:bg-[#1EBE5A] text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                            </svg>
                            Checkout via WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
