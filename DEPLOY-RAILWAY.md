# DMCC — Railway Deployment Guide

## Prerequisites

1. A [Railway](https://railway.app) account (free tier works)
2. Your code pushed to a **GitHub repository**
3. Your `GEMINI_API_KEY` ready

---

## Step 1: Push Code to GitHub

Ensure your latest code (including `railway.toml`) is committed and pushed:

```bash
git add -A
git commit -m "Add Railway deployment config"
git push origin main
```

---

## Step 2: Create Railway Project

### Option A — Via Railway Dashboard (Recommended)

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub Repo"**
3. Select your **dmcc** repository
4. Railway auto-detects the `Dockerfile` and begins building

### Option B — Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project (run from project root)
railway init

# Link to your repo
railway link

# Deploy
railway up
```

---

## Step 3: Set Environment Variables

In the Railway dashboard, go to your service → **Variables** tab and add:

| Variable | Required | Value |
|----------|----------|-------|
| `GEMINI_API_KEY` | **Yes** | Your Google Gemini API key |
| `REDDIT_SUBREDDITS` | No | `soccer,football,sports` (default) |
| `REDDIT_FETCH_LIMIT` | No | `8` (default, max 15) |

> **Note:** Do NOT set `PORT` — Railway injects it automatically.

> **Note:** Do NOT set `NODE_ENV` — the Dockerfile already sets `production`.

---

## Step 4: Generate Public URL

1. In your Railway service dashboard, go to **Settings** → **Networking**
2. Click **"Generate Domain"** to get a free `*.up.railway.app` URL
3. Alternatively, add a custom domain

Your app will be available at:

```
https://dmcc-production-XXXX.up.railway.app
```

---

## How It Works

Railway uses the existing `Dockerfile` which:

1. **Installs** dependencies via `npm ci`
2. **Builds** the Next.js app with `next build` (standalone output)
3. **Runs** `node server.js` — the optimized standalone server
4. **Binds** to the `PORT` env var injected by Railway

The SQLite database is **ephemeral** — it auto-bootstraps from seed data (`data/mvp-db.json`) on each deployment or container restart. This is expected for a demo/hackathon deployment.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key for AI analysis |
| `REDDIT_SUBREDDITS` | No | `soccer,football,sports` | Comma-separated subreddits to monitor |
| `REDDIT_FETCH_LIMIT` | No | `8` | Max posts to fetch per scan (max 15) |
| `PORT` | Auto | — | Set automatically by Railway |

---

## Troubleshooting

### Build fails with dependency errors
```bash
# Locally verify the build passes
npm ci
npm run build
```

### App crashes on startup
- Check Railway logs: Service → **Deployments** → click latest → **View Logs**
- Ensure `GEMINI_API_KEY` is set (app won't crash without it, but AI features won't work)

### SQLite warning in logs
```
ExperimentalWarning: SQLite is an experimental feature
```
This is harmless — Node.js 22's built-in SQLite module is flagged as experimental but works correctly.

### Port binding issues
- Do NOT hardcode a port — Railway injects `PORT` at runtime
- The `railway.toml` and `Dockerfile` handle this automatically

---

## Useful Commands (Railway CLI)

```bash
# View logs
railway logs

# Open the deployed app
railway open

# Check service status
railway status

# Redeploy
railway up

# Set env vars from CLI
railway variables set GEMINI_API_KEY=your-key-here

# Delete the service
railway down
```

---

## Files Added/Modified for Railway

| File | Change |
|------|--------|
| `railway.toml` | **NEW** — Railway deployment config |
| `package.json` | **Modified** — `start` script now respects `$PORT` |

> All other files remain unchanged. The existing `Dockerfile` is reused as-is.
