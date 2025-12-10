# WAIO Deployment Guide - Railway.app

## Prerequisites

1. GitHub account
2. Railway.app account (sign up at https://railway.app)

## Step 1: Push Code to GitHub

```bash
cd "WAIO Crawler Tracker"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - WAIO Crawler Tracker"

# Create a new repository on GitHub (via web interface)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/waio-tracker.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `waio-tracker` repository
5. Railway will auto-detect Bun and deploy!

## Step 3: Configure Environment (if needed)

Railway automatically sets `PORT` variable. No additional config needed for
basic deployment.

## Step 4: Access Your Live App

Railway will provide a URL like:
`https://waio-tracker-production.up.railway.app`

## Verification

1. Visit the Railway URL
2. Check if Dashboard loads
3. Test URL Simulator
4. Generate a report

## Troubleshooting

**Build fails:**

- Check Railway logs in the dashboard
- Verify `package.json` has all dependencies

**App crashes:**

- Check if Playwright browsers are installed (Railway should handle this)
- May need to add `nixpacks.toml` for Playwright dependencies

**WebSocket not working:**

- Railway supports WebSockets by default
- Check browser console for connection errors
