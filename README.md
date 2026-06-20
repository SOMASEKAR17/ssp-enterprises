# SSP Enterprises — Real Estate Platform

A full-stack real estate listing platform built with **Next.js 14 (App Router)**, **PostgreSQL + Prisma**, **NextAuth.js**, and **Cloudinary**. Built for SSP Enterprises to list flats, villas, independent houses, plots, and commercial properties across India.

## Features

- 🏠 **Public listing site** — browse, search, and filter properties by type, city, price, bedrooms, and listing type (sale/rent/lease)
- 🔒 **Gated property details** — visitors only see images + area; full details (price, address, contact, amenities) require login
- 👤 **Customer accounts** — register/login via email+password or Google OAuth
- 🛠️ **Admin panel** (`/admin`) — restricted to a single configured admin email; manage all properties, invite/revoke operators, view site-wide analytics (visits, leads, top-viewed properties)
- 🧑‍💼 **Operator panel** (`/operator`) — invited operators can list/edit/delete their own properties and view leads + analytics for their own listings only
- 📸 **Cloudinary image uploads** — signed direct-to-Cloudinary uploads from the browser
- 📊 **Analytics** — site visits, per-property view counts, and lead tracking, all stored in Postgres
- 🔍 **SEO** — dynamic metadata, Open Graph tags, JSON-LD structured data, sitemap.xml, robots.txt
- 🎨 **Branded theme** — color palette extracted from the SSP Enterprises logo (navy blue + slate gray)

---

## 1. Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- A PostgreSQL database (local, or hosted — [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app) all have free tiers)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine)
- A [Google Cloud OAuth Client](https://console.cloud.google.com/apis/credentials) (for Google sign-in)

---

## 2. Setup

### 2.1 Install dependencies

```bash
cd ssp-enterprises
npm install
```

> This runs `prisma generate` automatically via the `postinstall` script. It requires internet access to download the Prisma query engine binaries the first time — this is normal and only needs to happen once per machine/environment.

### 2.2 Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in real values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app's base URL (e.g. `http://localhost:3000` in dev) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From Google Cloud Console OAuth credentials |
| `ADMIN_EMAIL` | The **only** email allowed full `/admin` access (defaults to `somasekarnaidu79@gmail.com`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same as `CLOUDINARY_CLOUD_NAME`, exposed to the browser |
| `NEXT_PUBLIC_SITE_URL` | Public URL of your deployed site (used for SEO/sitemap) |
| `NEXT_PUBLIC_SITE_NAME` | Display name, defaults to "SSP Enterprises" |
| `IP_HASH_SALT` | Any random string — used to anonymize IPs in visit tracking |

#### Setting up Google OAuth

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL equivalent)
4. Copy the Client ID and Client Secret into `.env`

#### Setting up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. From your dashboard, copy **Cloud Name**, **API Key**, and **API Secret** into `.env`
3. No upload preset is required — the app uses **signed uploads** generated server-side via `/api/upload`

### 2.3 Set up the database

```bash
npx prisma migrate dev --name init
```

This creates all tables (User, Property, PropertyImage, Lead, PropertyView, SiteVisit, etc.) in your PostgreSQL database.

### 2.4 (Optional) Seed sample data

```bash
npm run seed
```

This creates:
- An **admin** account matching `ADMIN_EMAIL` in `.env` (password: `Admin@12345` — **change this immediately**)
- A **demo operator** account: `operator@sspenterprises.in` (password: `Operator@123`)
- 10 sample properties across different categories and Indian cities

### 2.5 Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## 3. How access control works

- **Admin** (`/admin`): only the email set in `ADMIN_EMAIL` gets the `ADMIN` role automatically, whether they sign up via Google or email/password. This is enforced server-side on every request — changing your own role in the database or client won't grant access.
- **Operators** (`/operator`): the admin invites operator emails from the Admin Panel → Operators tab. Once invited:
  - If the email already has an account, it's instantly promoted to `OPERATOR`.
  - If not, the next time that email signs up (Google or credentials), it's automatically assigned the `OPERATOR` role.
- **Customers**: anyone who registers without being the admin email or an invited operator gets the default `CUSTOMER` role, which allows them to view full property details and submit enquiries (leads), but not list properties.
- Both `/admin` and `/operator` are protected by **both** a Next.js middleware (`src/middleware.js`) and a server-side layout check, plus every API route re-validates the session role — so there's no client-side-only gate to bypass.

---

## 4. Gated property details

- Unauthenticated visitors hitting `/properties/[slug]` only receive (via the API and the page itself) the **images and area** — no price, address, bedrooms, contact info, or description.
- Once logged in (any role), the full property details are unlocked.
- This is enforced **server-side** in `src/app/api/properties/[id]/route.js` and `src/app/properties/[slug]/page.js` — the gated/ungated decision isn't just a UI toggle, the API itself withholds the fields.

---

## 5. Project structure

```
src/
  app/
    page.js                  → Homepage
    properties/               → Public listing + detail pages
    login/, register/         → Auth pages
    admin/                     → Admin panel (role-gated layout)
    operator/                  → Operator panel (role-gated layout)
    api/
      auth/[...nextauth]/      → NextAuth handler
      properties/               → Property CRUD
      upload/                   → Cloudinary signed upload
      leads/                    → Lead capture + retrieval
      track/                    → Visit/view tracking
      admin/                    → Admin-only stats & operator management
      operator/                 → Operator-scoped stats
  components/                 → Shared UI components
  lib/                        → Prisma client, auth config, constants, tracking helpers
prisma/
  schema.prisma               → Database schema
  seed.js                     → Demo data seeder
```

---

## 6. Deployment notes

- Works well on **Vercel** (set all `.env` variables in the Vercel project settings) — just ensure `DATABASE_URL` points to a publicly reachable Postgres instance (Neon/Supabase/RDS).
- Run `npx prisma migrate deploy` as part of your deployment pipeline (or manually) to apply migrations to production.
- Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` to your production domain, and add the production OAuth redirect URI in Google Cloud Console.

---

## 7. Tech stack

- **Framework:** Next.js 14 (App Router, Server Components)
- **Database/ORM:** PostgreSQL + Prisma
- **Auth:** NextAuth.js (Google OAuth + Credentials/JWT)
- **Image storage:** Cloudinary (signed direct uploads)
- **Styling:** Tailwind CSS (brand theme from logo)
- **Charts:** Recharts (admin dashboard)
