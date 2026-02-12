#!/bin/bash
# Comprehensive Backend-UI Gap Audit Script
# Counts all API endpoints and UI components per module

echo "=== COMPREHENSIVE BACKEND-UI GAP AUDIT ==="
echo ""
echo "Date: $(date '+%Y-%m-%d')"
echo ""

# Count total route files
echo "## Route File Statistics"
routes_count=$(find server/routes -name "*.ts" -type f | wc -l)
modules_count=$(find server/modules -name "*routes.ts" -o -name "*Routes.ts" | wc -l)
total_lines=$(find server/routes server/modules -name "*routes.ts" -o -name "*Routes.ts" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')

echo "- server/routes files: $routes_count"
echo "- server/modules routes: $modules_count"
echo "- Total route code lines: $total_lines"
echo ""

# Count UI pages
echo "## UI Component Statistics"
ui_total=$(find src/pages -name "*.tsx" -type f | wc -l)
ui_top_level=$(find src/pages -maxdepth 1 -name "*.tsx" -type f | wc -l)

echo "- Total UI pages (.tsx): $ui_total"
echo "- Top-level pages: $ui_top_level"
echo ""

# Count endpoints per route file in server/routes
echo "## API Endpoints by Route File (server/routes)"
echo ""
total_endpoints=0

for file in server/routes/*.ts; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        count=$(grep -E "router\.(get|post|put|patch|delete|all)" "$file" 2>/dev/null | wc -l | tr -d ' ')
        if [ "$count" -gt 0 ]; then
            printf "%-35s %3d endpoints\n" "$filename" "$count"
            total_endpoints=$((total_endpoints + count))
        fi
    fi
done

echo ""
echo "Subtotal (server/routes): $total_endpoints endpoints"
echo ""

# Count endpoints in server/modules
echo "## API Endpoints by Module (server/modules)"
echo ""
module_endpoints=0

# Find all route files in modules
find server/modules -name "*routes.ts" -o -name "*Routes.ts" | while read file; do
    count=$(grep -E "router\.(get|post|put|patch|delete|all)" "$file" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
        # Get relative path from server/modules
        rel_path=${file#server/modules/}
        printf "%-50s %3d endpoints\n" "$rel_path" "$count"
        module_endpoints=$((module_endpoints + count))
    fi
done

echo ""
echo "## Summary"
echo "Total API Endpoints: $(( total_endpoints + $(find server/modules -name "*routes.ts" -o -name "*Routes.ts" -exec grep -E "router\.(get|post|put|patch|delete|all)" {} \; 2>/dev/null | wc -l | tr -d ' ') ))"
echo "Total UI Pages: $ui_total"
echo ""
