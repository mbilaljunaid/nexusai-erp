# NexusAI Deployment Guide

## Quick Start (Development)
```bash
npm run dev
# App runs on http://localhost:5000
```

## Production Build
```bash
npm run build
npm start
```

## Environment Setup

### Required Environment Variables
- `OPENAI_API_KEY` - OpenAI API key for AI Copilot (optional but recommended)
- `NODE_ENV` - Set to `production` for production builds

### Optional Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (for persistence; currently using in-memory storage)

## Deployment Checklist

### Pre-Deployment
- ✅ All TypeScript errors resolved (0 LSP errors)
- ✅ All routes working (100+ endpoints)
- ✅ Frontend complete (39 pages)
- ✅ Dark mode working
- ✅ OpenAI integration ready
- ⚠️ Using in-memory storage (data will reset on restart)

### For Production Use
1. **Add Persistent Database**
   - Migrate from MemStorage to PostgreSQL using Drizzle ORM
   - Update `server/storage.ts` to implement DrizzleStorage
   - Run Drizzle migrations: `npx drizzle-kit migrate`

2. **Configure OpenAI**
   - Set `OPENAI_API_KEY` environment variable
   - AI Copilot will then have full LLM capabilities

3. **Enable HTTPS**
   - Deploy behind reverse proxy (nginx/Caddy)
   - Enable TLS certificates

4. **Set Up Monitoring**
   - Monitor port 5000 health checks
   - Log important events
   - Track API response times

## Key Files
- `server/index.ts` - Express server entry point
- `server/routes.ts` - API route definitions (100+ endpoints)
- `server/storage.ts` - Storage layer interface
- `client/src/App.tsx` - React app entry point
- `shared/schema.ts` - 71 database models

## Current Architecture
```
Frontend (React + Vite)
    ↓
Express.js Server (Port 5000)
    ↓
In-Memory Storage (MemStorage)
    ↓
OpenAI API (for AI features)
```

## Next Steps
1. Test all 39 pages in production environment
2. Connect to PostgreSQL for data persistence
3. Set up CI/CD pipeline for auto-deployment
4. Configure error tracking (Sentry/LogRocket)
5. Add API rate limiting and security headers
