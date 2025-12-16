# Installation Guide

This guide covers how to set up NexusAIFirst ERP for development and production.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18 or higher
- **npm** 9 or higher (comes with Node.js)
- **PostgreSQL** 12 or higher
- **Git** for version control

---

## Quick Start (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/mbilaljunaid/nexusai-erp.git
cd nexusai-erp
```

### 2. Install Dependencies

```bash
npm i
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexusai

# Session
SESSION_SECRET=your-secure-session-secret

# OpenAI (for AI features)
OPENAI_API_KEY=your-openai-api-key
```

### 4. Initialize Database

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

---

## Production Deployment

### Option 1: Replit Deployment

1. Fork or import the repository to Replit
2. Replit automatically configures PostgreSQL
3. Set environment secrets in the Secrets tab
4. Click "Run" to start the application
5. Use "Publish" for production deployment

### Option 2: Docker Deployment

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Option 3: Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for session encryption |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Server port (default: 5000) |

---

## Database Setup

### Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```sql
   CREATE DATABASE nexusai;
   ```
3. Update `DATABASE_URL` in `.env`

### Cloud PostgreSQL

Supported providers:
- Neon (recommended for Replit)
- Supabase
- AWS RDS
- Google Cloud SQL
- Azure Database

---

## Troubleshooting

### Database Connection Failed

- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Or change port in .env
PORT=3000
```

### Dependencies Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm i
```

### Database Migration Issues

```bash
# Force push schema changes
npm run db:push --force
```

---

## Verification

After installation, verify the setup:

1. Open `http://localhost:5000`
2. Check the landing page loads
3. Navigate to different modules
4. Verify database connection in System Health

---

## Next Steps

- [Configuration Guide](./CONFIGURATION.md)
- [API Documentation](./API.md)
- [Architecture Overview](./ARCHITECTURE.md)

---

## Support

Need help? See our [Support Guide](./SUPPORT.md) or open an issue on [GitHub](https://github.com/mbilaljunaid/nexusai-erp/issues).
