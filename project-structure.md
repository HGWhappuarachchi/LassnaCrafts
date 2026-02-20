# Lassana E-Commerce - Next.js 14 Folder Structure

This project uses the Next.js 14 App Router with an organized `src` directory structure to separate concerns cleanly, maintaining a modular and scalable architecture suitable for a premium e-commerce platform.

```plaintext
lassana/
├── .env.local                    # Environment variables (Supabase URL, Anon Key, Stripe keys)
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind config (custom pastel color palette, animations)
├── tsconfig.json                 # TypeScript config
├── supabase-schema.sql           # Database schema setup instructions
└── src/
    ├── app/                      # Next.js App Router root
    │   ├── layout.tsx            # Global layout (Providers, Header, Footer)
    │   ├── page.tsx              # Storefront Home Page (Hero, Featured Products)
    │   ├── globals.css           # Global Tailwind utilities and custom CSS
    │   ├── products/
    │   │   ├── [slug]/page.tsx   # Individual Product Detail Page
    │   │   └── page.tsx          # Product Listing / Category Browse
    │   ├── checkout/
    │   │   └── page.tsx          # Checkout page (WhatsApp routing or Stripe form)
    │   └── admin/                # Admin Dashboard Routes
    │       ├── layout.tsx        # Admin-specific layout (Sidebar)
    │       ├── page.tsx          # Dashboard Overview
    │       └── products/
    │           ├── page.tsx      # Admin Product Listing
    │           └── new/
    │               └── page.tsx  # Product Creation Form
    ├── components/               # Reusable UI Components
    │   ├── ui/                   # Primitive UI elements (Buttons, Inputs, Modals)
    │   ├── layout/               # Header, Footer, AdminSidebar
    │   ├── product/              # ProductCard, ProductGrid, ImageGallery
    │   └── cart/                 # CartDrawer, CartItem
    ├── lib/                      # Utilities and Configuration
    │   ├── supabase/
    │   │   ├── client.ts         # Supabase client (browser-side)
    │   │   └── server.ts         # Supabase client (server-side handling)
    │   ├── utils.ts              # cn() utility for Tailwind classes merging
    │   └── whatsapp.ts           # Utility to format cart to WhatsApp URL
    ├── store/                    # State Management (Zustand)
    │   └── cartStore.ts          # Global Cart State (items, add, remove, total calculation)
    ├── types/                    # TypeScript interfaces
    │   └── index.ts              # Product, Category, Order, CartItem types
    └── actions/                  # Next.js Server Actions
        └── products.ts           # Functions to fetch/mutate products
```

## Key Technical Decisions
- **`src/app`**: Utilizes Next.js Server Components by default for optimal SEO and loading speed, essential for an e-commerce storefront.
- **`src/store`**: Using Zustand for client-side cart management (lightweight, easy to use without React Context wrapper hell).
- **`src/components`**: Organized by domain (ui, layout, product, cart) so that components remain highly decoupled.
- **`src/actions`**: Centralized server actions for Supabase mutations (like creating a product), ensuring secrets remain on the server and avoiding complex API route setups where possible.
