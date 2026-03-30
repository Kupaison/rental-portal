# 🏠 Rental Portal — Setup Guide
**Built for Kupa · KW Atlantic Partners**

---

## What You're Getting

| Page | URL | Purpose |
|------|-----|---------|
| Client Portal | `yoursite.netlify.app/` | What your client sees — all listings with drive times |
| Listing Detail | `yoursite.netlify.app/listing/:id` | Full photos, details, drive time, contact |
| Admin Dashboard | `yoursite.netlify.app/admin` | Add/remove listings, view interest requests |

---

## Step 1 — Set Up Supabase (5 min)

1. Go to **https://supabase.com** → New project → name it `rental-portal`
2. Once created, go to **SQL Editor** → paste the entire contents of `supabase-schema.sql` → Run
3. Go to **Settings → API** → copy:
   - `Project URL` → this is your `VITE_SUPABASE_URL`
   - `anon public` key → this is your `VITE_SUPABASE_ANON_KEY`

---

## Step 2 — Get Google Maps API Key (5 min)

> This powers the drive time calculations from Cocoa, FL to each listing.

1. Go to **https://console.cloud.google.com**
2. Create a project → Enable **Distance Matrix API**
3. Go to **Credentials** → Create API Key
4. (Recommended) Restrict key to your Netlify domain
5. Copy the key → this is your `VITE_GOOGLE_MAPS_API_KEY`

> **Free tier**: 200 free requests/day. Each listing card loads drive time once and caches it. You won't hit limits.

---

## Step 3 — Set Up EmailJS (5 min)

> This sends you an email at kupadoesrealestate@gmail.com when a client expresses interest.

1. Go to **https://www.emailjs.com** → Free account (200 emails/month)
2. **Email Services** → Add Service → Gmail → connect your Gmail account
3. Copy the **Service ID** → `VITE_EMAILJS_SERVICE_ID`
4. **Email Templates** → Create Template with this content:

```
Subject: 🏠 New Interest: {{listing_address}}

New interest request from {{client_name}}

Property: {{listing_address}}
Price: {{listing_price}}

Client Info:
- Name: {{client_name}}
- Phone: {{client_phone}}
- Email: {{client_email}}

Message: {{message}}
```

5. Copy the **Template ID** → `VITE_EMAILJS_TEMPLATE_ID`
6. Go to **Account → General** → copy **Public Key** → `VITE_EMAILJS_PUBLIC_KEY`

---

## Step 4 — Deploy to Netlify (5 min)

1. Create a GitHub account if you don't have one → **https://github.com**
2. Create a new repository named `rental-portal` → upload all these files
3. Go to **https://netlify.com** → "Add new site" → "Import from GitHub" → select your repo
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Go to **Site Settings → Environment Variables** → add all your keys:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_ADMIN_PASSWORD=kupa2024admin
```

6. Click **Deploy** → Netlify gives you a URL like `https://magical-name-123.netlify.app`
7. You can set a custom domain in Site Settings → Domain Management

---

## Step 5 — Add Your First Listing

1. Go to `yoursite.netlify.app/admin`
2. Password: `kupa2024admin` (change this in your Netlify env vars)
3. Click **+ Add Listing**
4. Fill in address, price, beds/baths, description, amenities
5. Upload photos — label each one (e.g. "Living Room", "Kitchen", "Master Bedroom")
6. Toggle **Active** → click **Publish Listing**

That's it — the listing appears on your client portal immediately!

---

## How to Share With Your Client

Just send them the link: `https://yoursite.netlify.app`

Every listing automatically shows:
- Drive time from **3732 US-1, Cocoa FL** to the property
- "Open in Maps" button for turn-by-turn directions
- Photo gallery with lightbox
- "I'm Interested" button → triggers email to you + saved in admin

---

## Managing Listings

From the admin dashboard:
- **Active toggle**: Hide/show a listing without deleting it
- **Featured toggle**: Pinned to top of client view
- **Edit**: Update any info or add more photos
- **Delete**: Permanently removes listing + photos

## Interest Requests

Admin → **Interest Requests** shows all submissions with:
- Client name, phone, email
- Which property they want
- Their message
- "Mark Contacted" to track follow-up

---

## Need Help?

The code is clean React + Supabase. Any web developer can extend it.
Questions? This was built by Claude for Kupa at KW Atlantic Partners.
