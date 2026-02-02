# Getting Started with NexusAIFirst ERP

This guide will help you get NexusAIFirst ERP up and running quickly.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/mbilaljunaid/nexusai-erp.git
cd nexusai-erp
```

### 2. Set Up Dependencies

```bash
npm i
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
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

## Next Steps

- [Explore the User Guide](../user-guide/README.md)
- [Learn about the Architecture](../architecture/README.md)
- [API Reference](../api-reference/README.md)

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env

**Port Already in Use**
- Change the port in your configuration
- Stop other services using port 5000

## Support

Need help? Open an issue on [GitHub](https://github.com/mbilaljunaid/nexusai-erp/issues).
