import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/ProductCard";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  images: string[];
  stock_count: number;
  is_active: boolean;
}

interface Props {
  searchParams: { category?: string };
}

export default async function Home({ searchParams }: Props) {
  const supabase = createClient();

  // Fetch all active categories for the filter nav
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  // Build the products query
  let productsQuery = supabase
    .from("products")
    .select("id, title, slug, description, price, compare_at_price, images, stock_count, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Apply category filter if present
  if (searchParams.category && searchParams.category !== "all") {
    const matchedCat = (categories ?? []).find(
      (c: Category) => c.slug === searchParams.category
    );
    if (matchedCat) {
      productsQuery = supabase
        .from("products")
        .select("id, title, slug, description, price, compare_at_price, images, stock_count, is_active")
        .eq("is_active", true)
        .eq("category_id", matchedCat.id)
        .order("created_at", { ascending: false });
    }
  }

  const { data: products } = await productsQuery;

  const activeCategory = searchParams.category || "all";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-200 text-rose-800 text-sm font-medium mb-6">
            New Spring Collection
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-800 tracking-tight max-w-4xl mb-6">
            Handcrafted Floral Beauty, Delivered.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10">
            Elevate your space with premium, sustainably sourced flowers and elegant artisan vases. Perfect for every occasion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#products"
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Shop Now
            </a>
            <Link
              href="/?category=vases"
              className="bg-white hover:bg-slate-50 text-slate-800 font-medium py-3 px-8 rounded-full shadow-sm border border-slate-200 transition-all transform hover:-translate-y-0.5"
            >
              Explore Vases
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-1">Our Collection</h2>
              <p className="text-slate-500 text-sm">
                {(products ?? []).length} product{(products ?? []).length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {/* Category Filter Pills */}
          {(categories ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <Link
                href="/"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                  }`}
              >
                All
              </Link>
              {(categories as Category[]).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.slug
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Product Grid */}
          {(products ?? []).length === 0 ? (
            <div className="py-24 text-center">
              <div className="text-5xl mb-4">🌸</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {activeCategory !== "all"
                  ? "No products in this category yet"
                  : "No products available yet"}
              </h3>
              <p className="text-slate-400 text-sm">
                {activeCategory !== "all" ? (
                  <Link href="/" className="text-rose-500 hover:underline">
                    View all products →
                  </Link>
                ) : (
                  "Check back soon for our stunning new collection!"
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(products as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-20 bg-rose-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-800 mb-12">Why Choose Lassana?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: "",
                title: "Premium Quality",
                desc: "We source only the freshest, longest-lasting blooms from trusted growers.",
              },
              {
                icon: "",
                title: "Artisan Design",
                desc: "Every arrangement is handcrafted by experienced florists with an eye for detail.",
              },
             
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
