# Database Migration Guide

## Overview

This guide explains how to manage database migrations using Drizzle ORM for the NexusAI ERP system.

## Prerequisites

- PostgreSQL database running
- `drizzle-kit` installed (already in devDependencies)
- Database connection configured in `.env`

## Migration Workflow

### 1. Generate a Migration

When you make changes to the schema files in `shared/schema/`, generate a migration:

```bash
cd /Users/mbjunaid/My\ Projects/nexusai-erp-2
npx drizzle-kit generate
```

This will:
- Analyze your schema changes
- Create a new migration file in `./migrations` directory
- Include SQL statements to apply the changes

### 2. Review the Migration

Before applying, review the generated migration file:

```bash
ls -la migrations/
cat migrations/<latest-migration-file>.sql
```

**Important:** Always review migrations before applying them to production!

### 3. Apply Migrations

Run the migration runner script:

```bash
npx ts-node backend/scripts/migrate.ts
```

This will:
- Connect to the database
- Apply all pending migrations in order
- Track which migrations have been applied

### 4. Verify Migration Success

Check the database to ensure changes were applied:

```bash
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\d table_name"  # Describe specific table
```

## Common Commands

### Generate Migration
```bash
npx drizzle-kit generate
```

### Push Schema (Development Only)
For rapid development, push schema changes directly without migrations:

```bash
npm run db:push
```

**Warning:** This bypasses migration tracking. Only use in development!

### Introspect Database
Generate schema from existing database:

```bash
npx drizzle-kit introspect
```

### Drop Migration
If you need to drop a migration (use with caution):

```bash
npx drizzle-kit drop
```

## Migration Best Practices

### 1. Incremental Changes
- Make small, focused migrations
- One logical change per migration
- Easier to review and rollback if needed

### 2. Test Migrations
- Always test migrations on a development database first
- Verify data integrity after migration
- Test rollback procedures

### 3. Backward Compatibility
- Avoid breaking changes when possible
- Use multi-step migrations for breaking changes:
  1. Add new column (nullable)
  2. Migrate data
  3. Make column non-nullable
  4. Remove old column

### 4. Data Migrations
For complex data transformations, create custom migration scripts:

```typescript
// migrations/custom/migrate-user-data.ts
import { Pool } from 'pg';
import { databaseConfig } from '../backend/src/config/database.config';

async function migrateUserData() {
    const pool = new Pool(databaseConfig);
    
    try {
        await pool.query('BEGIN');
        
        // Your data migration logic here
        await pool.query(`
            UPDATE users 
            SET new_field = old_field 
            WHERE new_field IS NULL
        `);
        
        await pool.query('COMMIT');
        console.log('✅ Data migration completed');
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('❌ Data migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

migrateUserData();
```

### 5. Production Migrations

**Pre-deployment checklist:**
- [ ] Migration tested on staging environment
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Downtime window scheduled (if needed)
- [ ] Team notified

**Deployment steps:**
1. Create database backup:
   ```bash
   bash backend/scripts/backup.sh
   ```

2. Apply migrations:
   ```bash
   npx ts-node backend/scripts/migrate.ts
   ```

3. Verify application health:
   ```bash
   curl http://localhost:3000/api/health
   ```

4. If issues occur, restore from backup:
   ```bash
   bash backend/scripts/restore.sh ./backups/backup_YYYYMMDD_HHMMSS.sql.gz
   ```

## Rollback Strategy

### Option 1: Restore from Backup
Fastest method for critical issues:

```bash
bash backend/scripts/restore.sh ./backups/backup_YYYYMMDD_HHMMSS.sql.gz
```

### Option 2: Reverse Migration
Create a reverse migration manually:

```sql
-- If migration added a column:
ALTER TABLE users DROP COLUMN new_column;

-- If migration modified a column:
ALTER TABLE users ALTER COLUMN status TYPE varchar(50);
```

### Option 3: Drop and Regenerate
Last resort for development environments:

```bash
npx drizzle-kit drop
npx drizzle-kit generate
npx ts-node backend/scripts/migrate.ts
```

## Troubleshooting

### Migration Fails with "relation already exists"
The migration may have been partially applied. Check the database state and manually fix inconsistencies.

### Migration Hangs
- Check for locks: `SELECT * FROM pg_locks;`
- Check for long-running queries: `SELECT * FROM pg_stat_activity;`
- Consider increasing connection timeout

### Schema Drift
If schema doesn't match migrations:

```bash
# Introspect current database
npx drizzle-kit introspect

# Compare with your schema files
# Manually reconcile differences
```

## Environment-Specific Migrations

### Development
```bash
DATABASE_URL=postgresql://localhost:5432/nexusai_dev npx ts-node backend/scripts/migrate.ts
```

### Staging
```bash
DATABASE_URL=postgresql://staging-host:5432/nexusai_staging npx ts-node backend/scripts/migrate.ts
```

### Production
```bash
DATABASE_URL=postgresql://prod-host:5432/nexusai_prod npx ts-node backend/scripts/migrate.ts
```

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
