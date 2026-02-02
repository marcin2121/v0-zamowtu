# Restaurant SaaS

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/marcinekmolenda4-3452s-projects/zamowtu)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/pJKBvLrnqh3)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/marcinekmolenda4-3452s-projects/zamowtu](https://vercel.com/marcinekmolenda4-3452s-projects/zamowtu)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/pJKBvLrnqh3](https://v0.app/chat/pJKBvLrnqh3)**

## Database Migration

To enable the new advanced features (order notifications, scheduled orders calendar, menu suggestions), you need to run the database migration:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `scripts/002_add_advanced_features.sql`
4. Paste and execute the SQL script

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

### New Features After Migration

- **Sound notifications** for new orders with visual alerts
- **Timer** showing how long orders have been waiting
- **Order pause functionality** when kitchen is overloaded
- **Blocked dates calendar** for busy periods (e.g., New Year's Eve)
- **Scheduled orders calendar** with advance notifications
- **Menu suggestions** based on sales analytics
- **Quick toggle** to enable/disable menu items

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
