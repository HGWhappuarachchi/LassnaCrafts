import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartSection from "@/components/product/AddToCartSection";

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
    const supabase = createClient();
    const { data } = await supabase
        .from("products")
        .select("title, description")
        .eq("slug", params.slug)
        .single();

    if (!data) return { title: "Product Not Found – Lassana" };
    return {
        title: `${data.title} – Lassana`,
        description: (data.description ?? "").slice(0, 150),
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const supabase = createClient();

    const { data: product } = await supabase
        .from("products")
        .select("id, title, slug, description, price, images, stock_count, is_active, categories(name)")
        .eq("slug", params.slug)
        .single();

    if (!product || !product.is_active) notFound();

    const isOutOfStock = product.stock_count <= 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryName = (product as any).categories?.name ?? null;
    const mainImage: string | undefined = (product.images as string[])[0];

    return (
        <div className="container mx-auto px-4 md:px-8 py-10">
            {/* Breadcrumb */}
            <nav className="text-sm text-slate-400 mb-8 flex items-center gap-2">
                <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
                <span>/</span>
                {categoryName && (
                    <>
                        <span className="text-slate-500">{categoryName}</span>
                        <span>/</span>
                    </>
                )}
                <span className="text-slate-600 font-medium">{product.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
                {/* Image Gallery */}
                <div className="flex gap-4">
                    {/* Thumbnail strip */}
                    {(product.images as string[]).length > 1 && (
                        <div className="hidden sm:flex flex-col gap-3 w-20 flex-shrink-0">
                            {(product.images as string[]).slice(0, 4).map((img, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${i === 0 ? "border-rose-400" : "border-transparent"
                                        } bg-rose-50`}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="flex-1 aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100 relative shadow-lg">
                        {mainImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-300">
                                <svg viewBox="0 0 100 100" className="w-32 h-32 opacity-20" fill="currentColor">
                                    <path d="M50 8 C30 8 15 22 15 40 C15 65 50 90 50 90 C50 90 85 65 85 40 C85 22 70 8 50 8Z" />
                                </svg>
                                {categoryName && (
                                    <p className="text-rose-300 text-xs mt-2 tracking-widest font-medium">
                                        {categoryName.toUpperCase()}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Stock badge */}
                        {!isOutOfStock && product.stock_count <= 5 && (
                            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-rose-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                Only {product.stock_count} left!
                            </span>
                        )}
                        {isOutOfStock && (
                            <span className="absolute top-4 left-4 bg-slate-100/90 text-slate-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-center">
                    {categoryName && (
                        <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-3">
                            {categoryName}
                        </p>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4">
                        {product.title}
                    </h1>
                    <div className="text-3xl font-bold text-slate-900 mb-6">
                        Rs. {Number(product.price).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </div>
                    {product.description && (
                        <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>
                    )}

                    {/* Add to Cart */}
                    <AddToCartSection
                        product={{
                            id: product.id,
                            title: product.title,
                            price: Number(product.price),
                            images: (product.images as string[]),
                            stock_count: product.stock_count,
                        }}
                    />

                    {/* WhatsApp Direct */}
                    <div className="mt-4 border-t border-slate-100 pt-6">
                        <p className="text-xs text-slate-400 text-center mb-3">Or order directly</p>
                        <a
                            href={`https://wa.me/94772430304?text=Hi Lassana! I'd like to order: *${product.title}* (Rs. ${Number(product.price).toLocaleString()}). Please confirm availability.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1EBE5A] text-white font-medium py-3.5 rounded-xl shadow-lg shadow-green-200 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                            </svg>
                            Order via WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
