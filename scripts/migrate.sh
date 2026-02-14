#!/bin/bash

# Database Migration Script
# Usage: ./scripts/migrate.sh [up|down|generate|status]

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

COMMAND=${1:-up}

case $COMMAND in
    generate)
        echo "🔄 Generating migration from schema changes..."
        npx drizzle-kit generate:pg
        echo "✅ Migration generated in ./migrations"
        ;;
    
    up)
        echo "🔄 Running migrations..."
        npx drizzle-kit push:pg
        echo "✅ Migrations applied successfully"
        ;;
    
    status)
        echo "📊 Migration status..."
        npx drizzle-kit check:pg
        ;;
    
    studio)
        echo "🎨 Opening Drizzle Studio..."
        npx drizzle-kit studio
        ;;
    
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Usage: ./scripts/migrate.sh [generate|up|status|studio]"
        echo ""
        echo "Commands:"
        echo "  generate  - Generate migration from schema changes"
        echo "  up        - Apply pending migrations"
        echo "  status    - Check migration status"
        echo "  studio    - Open Drizzle Studio"
        exit 1
        ;;
esac
