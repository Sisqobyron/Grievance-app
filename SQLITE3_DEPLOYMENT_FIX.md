# 🔧 SQLite3 Deployment Fix for Render

## Problem
SQLite3 native bindings cause deployment issues on Render due to architecture differences between local development and Linux servers.

## Solutions

### Option 1: Fix SQLite3 Rebuild (Current Approach)
Update your `package.json` with proper build commands:

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm rebuild sqlite3",
    "postinstall": "npm rebuild sqlite3"
  },
  "devDependencies": {
    "node-gyp": "^10.0.0"
  }
}
```

**Render Build Command:** `npm install && npm rebuild sqlite3`

### Option 2: Switch to better-sqlite3 (Recommended)
Replace sqlite3 with better-sqlite3 for better deployment compatibility:

```bash
cd backend
npm uninstall sqlite3
npm install better-sqlite3
```

Update your database connections to use better-sqlite3 syntax.

### Option 3: Use PostgreSQL (Production Ready)
For production deployment, consider using PostgreSQL:

1. In Render dashboard, add PostgreSQL database
2. Update connection string in environment variables
3. Install pg: `npm install pg`
4. Update database models to use PostgreSQL

## Quick Fix Commands

```bash
# In your backend directory
npm install node-gyp --save-dev
npm rebuild sqlite3

# Test locally
npm start
```

## Environment Variables for Render

Add these in your Render service settings:
```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.onrender.com
```

## Alternative Database Setup

If SQLite3 continues to cause issues, switch to PostgreSQL:

1. In Render Dashboard → Create PostgreSQL Database
2. Copy the Internal Database URL
3. Add to environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```
4. Update your models to use PostgreSQL connection

This eliminates native binding issues completely.
