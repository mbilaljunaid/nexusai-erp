# Configuration Guide

This document describes all configuration options for NexusAI ERP.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/nexusai` |
| `SESSION_SECRET` | Secret for session encryption | `your-secure-random-string` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | - |

---

## Database Configuration

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Connection Pool Settings

Configure in your database client:

```typescript
{
  max: 20,           // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}
```

---

## Session Configuration

### Session Options

```typescript
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}
```

---

## API Configuration

### Rate Limiting

Default rate limits:
- Unauthenticated: 100 requests/minute
- Authenticated: 1000 requests/minute

### CORS Settings

```typescript
{
  origin: ['http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}
```

---

## AI Features Configuration

### OpenAI Settings

```env
OPENAI_API_KEY=sk-your-api-key
```

Features requiring OpenAI:
- AI Copilot
- Bank Reconciliation (fuzzy matching)
- Recruitment AI Scoring
- Predictive Analytics

---

## Multi-Tenant Configuration

### Tenant Settings

Each tenant can configure:
- Branding (logo, colors)
- Industry-specific forms
- Custom workflows
- User roles and permissions

---

## Compliance Configuration

### Framework Settings

Enable/disable compliance frameworks:
- GDPR
- HIPAA
- SOX
- ISO9001
- PCI-DSS

---

## Email Configuration (Optional)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Configure rate limiting
- [ ] Set up monitoring

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables |
| `drizzle.config.ts` | Database migration config |
| `vite.config.ts` | Frontend build config |
| `tailwind.config.ts` | CSS configuration |
| `tsconfig.json` | TypeScript config |

---

## Next Steps

- [Installation Guide](./INSTALL.md)
- [API Documentation](./API.md)
- [Architecture Overview](./ARCHITECTURE.md)
