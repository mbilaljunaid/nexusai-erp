#!/bin/bash

# NexusAI Open Source Release Preparation Script
# This script prepares files for syncing to the public repository

set -e

echo "=========================================="
echo "NexusAI Open Source Release Preparation"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PUBLIC_REPO_DIR="${PUBLIC_REPO_DIR:-./public-release}"
VERSION="${1:-$(date +%Y.%m.%d)}"

# Files and directories to include in open source release
OPEN_SOURCE_COMPONENTS=(
    "shared/schema.ts"
    "shared/communityConstants.ts"
    "server/gl"
    "server/workflow"
    "server/rules"
    "server/analytics"
    "server/templates"
    "server/metadata"
    "server/storage.ts"
    "server/storage-db.ts"
    "server/db.ts"
    "server/cache"
    "server/logging"
    "server/sync"
    "server/operations"
    "docs/API.md"
    "docs/ARCHITECTURE.md"
)

# Root files to copy
ROOT_FILES=(
    "LICENSE"
    "CONTRIBUTING.md"
    "CODE_OF_CONDUCT.md"
    "SECURITY.md"
    "README.md"
    "CHANGELOG.md"
)

# Clean previous build
echo -e "${YELLOW}Cleaning previous release directory...${NC}"
rm -rf "$PUBLIC_REPO_DIR"
mkdir -p "$PUBLIC_REPO_DIR"

# Create directory structure
echo -e "${YELLOW}Creating directory structure...${NC}"
mkdir -p "$PUBLIC_REPO_DIR/src/schema"
mkdir -p "$PUBLIC_REPO_DIR/src/constants"
mkdir -p "$PUBLIC_REPO_DIR/src/engines"
mkdir -p "$PUBLIC_REPO_DIR/src/metadata"
mkdir -p "$PUBLIC_REPO_DIR/src/storage"
mkdir -p "$PUBLIC_REPO_DIR/src/utils"
mkdir -p "$PUBLIC_REPO_DIR/src/operations"
mkdir -p "$PUBLIC_REPO_DIR/docs"

# Copy open source components
echo -e "${YELLOW}Copying open source components...${NC}"
for item in "${OPEN_SOURCE_COMPONENTS[@]}"; do
    if [ -e "$item" ]; then
        case "$item" in
            "shared/schema.ts")
                cp "$item" "$PUBLIC_REPO_DIR/src/schema/schema.ts"
                ;;
            "shared/communityConstants.ts")
                cp "$item" "$PUBLIC_REPO_DIR/src/constants/community.ts"
                ;;
            "server/gl"|"server/workflow"|"server/rules"|"server/analytics"|"server/templates")
                dirname=$(basename "$item")
                cp -r "$item" "$PUBLIC_REPO_DIR/src/engines/$dirname"
                ;;
            "server/metadata")
                cp -r "$item" "$PUBLIC_REPO_DIR/src/metadata"
                ;;
            "server/storage.ts")
                cp "$item" "$PUBLIC_REPO_DIR/src/storage/interface.ts"
                ;;
            "server/storage-db.ts")
                cp "$item" "$PUBLIC_REPO_DIR/src/storage/postgres.ts"
                ;;
            "server/db.ts")
                cp "$item" "$PUBLIC_REPO_DIR/src/storage/db.ts"
                ;;
            "server/cache"|"server/logging"|"server/sync")
                dirname=$(basename "$item")
                cp -r "$item" "$PUBLIC_REPO_DIR/src/utils/$dirname"
                ;;
            "server/operations")
                cp -r "$item" "$PUBLIC_REPO_DIR/src/operations"
                ;;
            "docs/"*)
                cp "$item" "$PUBLIC_REPO_DIR/docs/"
                ;;
        esac
        echo -e "${GREEN}  ✓ Copied: $item${NC}"
    else
        echo -e "${YELLOW}  ⚠ Skipped (not found): $item${NC}"
    fi
done

# Copy root files
echo -e "${YELLOW}Copying root files...${NC}"
for file in "${ROOT_FILES[@]}"; do
    if [ -e "$file" ]; then
        cp "$file" "$PUBLIC_REPO_DIR/"
        echo -e "${GREEN}  ✓ Copied: $file${NC}"
    else
        echo -e "${YELLOW}  ⚠ Skipped (not found): $file${NC}"
    fi
done

# Add license headers to TypeScript files
echo -e "${YELLOW}Adding AGPL-3.0 license headers...${NC}"
LICENSE_HEADER='/**
 * NexusAI Core - Open Source ERP Engine
 * Copyright (C) 2024 NexusAI Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

'

find "$PUBLIC_REPO_DIR/src" -name "*.ts" 2>/dev/null | while read file; do
    if ! grep -q "SPDX-License-Identifier" "$file" 2>/dev/null; then
        echo "$LICENSE_HEADER$(cat "$file")" > "$file"
        echo -e "${GREEN}  ✓ Added header: $file${NC}"
    fi
done

# Create package.json for the open source package
echo -e "${YELLOW}Creating package.json...${NC}"
cat > "$PUBLIC_REPO_DIR/package.json" << EOF
{
  "name": "@nexusai/core",
  "version": "$VERSION",
  "description": "NexusAI Core - Open Source ERP Engine",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "license": "AGPL-3.0-only",
  "repository": {
    "type": "git",
    "url": "https://github.com/mbilaljunaid/nexusai-erp.git"
  },
  "keywords": [
    "erp",
    "enterprise",
    "accounting",
    "workflow",
    "business",
    "automation"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src",
    "prepublishOnly": "npm run build"
  },
  "engines": {
    "node": ">=18"
  },
  "peerDependencies": {
    "drizzle-orm": ">=0.29.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
EOF
echo -e "${GREEN}  ✓ Created package.json${NC}"

# Create tsconfig.json
echo -e "${YELLOW}Creating tsconfig.json...${NC}"
cat > "$PUBLIC_REPO_DIR/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
echo -e "${GREEN}  ✓ Created tsconfig.json${NC}"

# Create index.ts entry point
echo -e "${YELLOW}Creating entry point...${NC}"
cat > "$PUBLIC_REPO_DIR/src/index.ts" << EOF
/**
 * NexusAI Core - Open Source ERP Engine
 * Copyright (C) 2024 NexusAI Contributors
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Core Schema
export * from './schema/schema';

// Constants
export * from './constants/community';

// Storage
export * from './storage/interface';
export * from './storage/postgres';
export * from './storage/db';
EOF
echo -e "${GREEN}  ✓ Created src/index.ts${NC}"

# Generate file manifest
echo -e "${YELLOW}Generating file manifest...${NC}"
cat > "$PUBLIC_REPO_DIR/MANIFEST.md" << EOF
# NexusAI Core - File Manifest

Version: $VERSION
Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Included Components

### Schema
- \`src/schema/schema.ts\` - Core database schema and types

### Constants
- \`src/constants/community.ts\` - Community feature constants

### Storage
- \`src/storage/interface.ts\` - Storage interface definitions
- \`src/storage/postgres.ts\` - PostgreSQL implementation
- \`src/storage/db.ts\` - Database connection utilities

### Engines (if present)
- \`src/engines/gl/\` - General Ledger engine
- \`src/engines/workflow/\` - Workflow engine
- \`src/engines/rules/\` - Business rules engine
- \`src/engines/analytics/\` - Analytics engine
- \`src/engines/templates/\` - Template engine

### Utilities (if present)
- \`src/utils/cache/\` - Caching utilities
- \`src/utils/logging/\` - Logging utilities
- \`src/utils/sync/\` - Synchronization utilities

### Operations (if present)
- \`src/operations/\` - Business operations

## License

This package is licensed under AGPL-3.0-only.
See LICENSE file for details.
EOF
echo -e "${GREEN}  ✓ Created MANIFEST.md${NC}"

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}Release preparation complete!${NC}"
echo "=========================================="
echo ""
echo "Output directory: $PUBLIC_REPO_DIR"
echo "Version: $VERSION"
echo ""
echo "Next steps:"
echo "1. Review the generated files"
echo "2. Run 'cd $PUBLIC_REPO_DIR && npm install && npm run build'"
echo "3. Test the package locally"
echo "4. Push to the public repository"
echo ""
