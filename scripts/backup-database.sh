#!/bin/bash

# Database Backup Script
# Usage: ./scripts/backup-database.sh

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-nexusai_erp}
DB_USER=${DB_USER:-postgres}
BACKUP_DIR=${BACKUP_DIR:-./backups}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo "🔄 Starting database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE_GZ"

# Perform backup using pg_dump
PGPASSWORD=$DB_PASSWORD pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    > "$BACKUP_FILE"

# Compress backup
echo "🗜️  Compressing backup..."
gzip "$BACKUP_FILE"

# Verify backup file exists and has content
if [ -f "$BACKUP_FILE_GZ" ] && [ -s "$BACKUP_FILE_GZ" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    echo "✅ Backup completed successfully!"
    echo "Size: $BACKUP_SIZE"
    echo "Location: $BACKUP_FILE_GZ"
else
    echo "❌ Backup failed - file is missing or empty"
    exit 1
fi

# Clean up old backups (older than RETENTION_DAYS)
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lh "$BACKUP_DIR" | tail -5

echo ""
echo "✅ Backup process completed!"
