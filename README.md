# Lassana Crafts 🌸

> **Lassana** (ලස්සන) — Sinhala for *beautiful*

A modern, elegant e-commerce web application for premium hand-crafted flowers and vases, built with Next.js 14 and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)

---

## ✨ Features

### Storefront
- **Product catalogue** with category filtering
- **Product detail pages** with image gallery and stock status
- **Shopping cart** (Zustand, persisted in localStorage)
- **Promo code** validation with live discount breakdown
- **WhatsApp checkout** — orders sent directly via WhatsApp
- **Strikethrough pricing** with discount % badge for sale items
- Fully responsive, mobile-first design

### Admin Panel (`/admin`)
- 🔐 Secure login via **Supabase Auth** (email + password)
- **Products** — create, list, and manage products with image upload
- **Categories** — full CRUD for product categories
- **Promotions** — create percentage or fixed-amount promo codes with date ranges

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| State | Zustand |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project

### 1. Clone the repo
```bash
git clone https://github.com/HGWhappuarachchi/LassnaCrafts.git
cd LassnaCrafts
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up the database
Run the following SQL files in your [Supabase SQL Editor](https://supabase.com/dashboard) in order:

| File | Purpose |
|---|---|
| `supabase-schema.sql` | Create all tables |
| `supabase-seed.sql` | Seed default categories |
| `supabase-rls-fix.sql` | Relax RLS for initial setup |
| `supabase-migration-discount.sql` | Add discount pricing + Storage bucket |
| `supabase-rls-secure.sql` | *(After auth setup)* Lock to authenticated users |

### 5. Create an admin user
In [Supabase → Authentication → Users](https://supabase.com/dashboard), add a user with email and password.
Then confirm the account:
```sql
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'your@email.com';
```

### 6. Run locally
```bash
npm run dev
```

Visit `http://localhost:3000` for the storefront and `http://localhost:3000/admin` for the admin panel.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Storefront homepage
│   ├── products/[slug]/          # Product detail page
│   ├── admin/
│   │   ├── layout.tsx            # Admin layout with nav bar
│   │   ├── login/                # Login page
│   │   ├── page.tsx              # Dashboard
│   │   ├── products/             # Product management
│   │   ├── categories/           # Category management
│   │   └── promotions/           # Promo code management
├── components/
│   ├── layout/Header.tsx         # Site header with cart icon
│   ├── cart/CartDrawer.tsx       # Slide-out cart with promo input
│   ├── ProductCard.tsx           # Product card with discount badge
│   ├── product/AddToCartSection.tsx
│   └── admin/SignOutButton.tsx
├── lib/supabase/
│   ├── client.ts                 # Client-side Supabase client
│   └── server.ts                 # Server-side Supabase client
├── middleware.ts                 # Auth guard for /admin routes
└── store/cartStore.ts            # Zustand cart + promo state
```

---

## 🌐 Deployment (Vercel)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-builds on every `git push`

---

## 📜 License

MIT © [HGWhappuarachchi](https://github.com/HGWhappuarachchi)
