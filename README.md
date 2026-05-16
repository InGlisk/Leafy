# 🌿 Leafy – Plant Care Tracker

A free PWA for tracking watering, repotting, and care for your indoor plants.
Built for a Melbourne apartment with a NW-facing window, tuned for Southern Hemisphere seasons.

## Features

- 🌱 **6 plants pre-loaded** with Melbourne winter-adjusted care schedules
- 💧 **Log care** (water, repot, fertilise, mist, wipe, health check) — shared in real time
- 🔔 **Push notifications** — daily reminder at 8am if plants are overdue
- 📱 **Installable PWA** — add to home screen on iPhone or Android
- ➕ **Add / remove plants** any time
- 👥 **Collaborative** — anyone with the URL sees the same data

---

## Setup (takes ~15 minutes, all free)

### Step 1 — Supabase (database)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier)
2. Note your **Project URL** and **anon key** from Settings → API
3. In the Supabase dashboard: **SQL Editor** → **New query** → paste the contents of `supabase-schema.sql` → **Run**

### Step 2 — Generate VAPID keys (push notifications)

Run this once on your machine (requires Node.js):

```bash
npx web-push generate-vapid-keys
```

Copy the public and private keys — you'll need them in the next step.

### Step 3 — Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:you@example.com
```

### Step 4 — Deploy to Vercel

1. Push this folder to a new **GitHub repository**
2. Go to [vercel.com](https://vercel.com) → **New project** → import the repo
3. In Vercel: **Project → Settings → Environment Variables** — add all 5 variables from Step 3
4. Deploy 🚀

Vercel will give you a URL like `https://leafy-xyz.vercel.app` — share this with your housemates.

### Step 5 — Install on your phone

**iPhone (Safari):** Open the URL → Share → Add to Home Screen
**Android (Chrome):** Open the URL → menu → Install app

### Step 6 — Enable notifications

Tap **"Notify me"** in the top right of the app on each person's phone.
Notifications fire at 8am Melbourne time (22:00 UTC) if any plants are overdue.

---

## App icons

You'll need two PNG icons in `/public`:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px

Use any plant emoji or image. A simple way: use [favicon.io](https://favicon.io/emoji-favicons/herb/) to generate them.

---

## Plant care schedules

All care intervals are tuned for:
- **Melbourne apartment** (stable ~18–22°C)
- **NW-facing window** (bright indirect, no harsh direct sun)
- **Southern Hemisphere seasons** (winter = Jun–Aug)

| Plant | Winter watering | Repot |
|-------|----------------|-------|
| Sensation Peace Lily | Every 14 days | Every 1–2 years (spring) |
| Burgundy Rubber Plant | Every 18 days | Every 1–2 years (spring) |
| Dieffenbachia | Every 14 days | Every 1–2 years (spring) |
| Rattlesnake Plant | Every 12 days | Spring only if root-bound |
| Red-edge Peperomia | Every 14 days | Every 4–6 years |
| Orchid (Phalaenopsis) | Every 12 days | Every 1–2 years after blooming |

---

## Adding more plants

Edit `lib/plants.ts` — add a new entry to `PLANT_LIBRARY` following the same shape.
Each plant has separate care tasks per season. Deploy and the new plant will appear in the "Add plant" picker.

---

## Cron job (push notifications)

`vercel.json` configures a daily cron at 22:00 UTC (= 8am AEST/8am AEDT depending on DST).
The cron calls `/api/push` which checks for overdue tasks and notifies all subscribers.

To test manually: visit `https://your-app.vercel.app/api/push` in a browser.
