#!/bin/bash

# Database Backup Script
# This script creates a backup of the PostgreSQL database using pg_dump

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-nexusai_erp}"
DB_USER="${DB_USER:-postgres}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "🔧 Starting database backup..."
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"

# Perform backup with compression
PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    2>&1 | gzip > "${BACKUP_FILE}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup completed successfully"
    echo "Backup size: ${BACKUP_SIZE}"
    echo "Backup location: ${BACKUP_FILE}"
else
    echo "❌ Backup failed"
    exit 1
fi

# Clean up old backups
echo "🧹 Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

REMAINING_BACKUPS=$(find "${BACKUP_DIR}" -name "backup_*.sql.gz" -type f | wc -l)
echo "Remaining backups: ${REMAINING_BACKUPS}"

echo "✅ Backup process completed"
