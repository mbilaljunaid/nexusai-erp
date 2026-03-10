/**
 * Route Audit Script
 * 
 * This script audits all navigation links against actual route definitions
 * to identify broken links, orphan routes, and missing pages.
 */

import * as fs from 'fs';
import * as path from 'path';

interface NavLink {
    id: string;
    title: string;
    path: string;
    source: 'navigation' | 'dashboard';
}

interface RouteDefinition {
    path: string;
    component: string;
    line: number;
}

interface AuditResult {
    workingLinks: NavLink[];
    brokenLinks: NavLink[];
    orphanRoutes: RouteDefinition[];
    duplicatePaths: { path: string; instances: number }[];
}

// Extract all navigation paths from navigation.ts
function extractNavigationPaths(filePath: string): NavLink[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const links: NavLink[] = [];

    // Match path: "/some/path" patterns
    const pathRegex = /path:\s*["']([^"']+)["']/g;
    let match;

    while ((match = pathRegex.exec(content)) !== null) {
        links.push({
            id: `nav-${links.length}`,
            title: '', // Would need more complex parsing to get titles
            path: match[1],
            source: 'navigation'
        });
    }

    return links;
}

// Extract all dashboard module URLs
function extractDashboardPaths(filePath: string): NavLink[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const links: NavLink[] = [];

    // Match url: "/some/path" patterns
    const urlRegex = /url:\s*["']([^"']+)["']/g;
    let match;

    while ((match = urlRegex.exec(content)) !== null) {
        links.push({
            id: `dash-${links.length}`,
            title: '',
            path: match[1],
            source: 'dashboard'
        });
    }

    return links;
}

// Extract all route definitions from App.tsx and route files
function extractRouteDefinitions(appFilePath: string): RouteDefinition[] {
    const content = fs.readFileSync(appFilePath, 'utf-8');
    const routes: RouteDefinition[] = [];
    const lines = content.split('\n');

    // Match <Route path="..." patterns
    const routeRegex = /<Route\s+path=["']([^"']+)["']/;

    lines.forEach((line, index) => {
        const match = line.match(routeRegex);
        if (match) {
            routes.push({
                path: match[1],
                component: '', // Would need more parsing to extract component
                line: index + 1
            });
        }
    });

    return routes;
}

// Check if a navigation path matches any route definition
function pathMatchesRoute(navPath: string, routes: RouteDefinition[]): boolean {
    return routes.some(route => {
        // Exact match
        if (route.path === navPath) return true;

        // Wildcard match (e.g., /crm* matches /crm/anything)
        if (route.path.endsWith('*')) {
            const basePath = route.path.slice(0, -1);
            return navPath.startsWith(basePath);
        }

        // Dynamic route match (e.g., /item/:id)
        if (route.path.includes(':')) {
            const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
            const regex = new RegExp(`^${pattern}$`);
            return regex.test(navPath);
        }

        return false;
    });
}

// Main audit function
function auditRoutes(projectRoot: string): AuditResult {
    const navigationPath = path.join(projectRoot, 'src/config/navigation.ts');
    const dashboardPath = path.join(projectRoot, 'src/pages/Dashboard.tsx');
    const appPath = path.join(projectRoot, 'src/App.tsx');

    const navLinks = extractNavigationPaths(navigationPath);
    const dashLinks = extractDashboardPaths(dashboardPath);
    const allLinks = [...navLinks, ...dashLinks];
    const routes = extractRouteDefinitions(appPath);

    const workingLinks: NavLink[] = [];
    const brokenLinks: NavLink[] = [];

    allLinks.forEach(link => {
        if (pathMatchesRoute(link.path, routes)) {
            workingLinks.push(link);
        } else {
            brokenLinks.push(link);
        }
    });

    // Find orphan routes (routes not in navigation)
    const allNavPaths = new Set(allLinks.map(l => l.path));
    const orphanRoutes = routes.filter(route => {
        // Skip special routes
        if (route.path === '/' || route.path === '*' || route.path.startsWith('/portal')) {
            return false;
        }
        return !allNavPaths.has(route.path) &&
            !Array.from(allNavPaths).some(navPath => route.path.startsWith(navPath));
    });

    // Find duplicate paths
    const pathCounts = new Map<string, number>();
    allLinks.forEach(link => {
        pathCounts.set(link.path, (pathCounts.get(link.path) || 0) + 1);
    });
    const duplicatePaths = Array.from(pathCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([path, instances]) => ({ path, instances }));

    return {
        workingLinks,
        brokenLinks,
        orphanRoutes,
        duplicatePaths
    };
}

// Run the audit
const projectRoot = path.join(__dirname, '..');
const results = auditRoutes(projectRoot);

console.log('=== ROUTE AUDIT RESULTS ===\n');
console.log(`Total Navigation Links: ${results.workingLinks.length + results.brokenLinks.length}`);
console.log(`Working Links: ${results.workingLinks.length}`);
console.log(`Broken Links: ${results.brokenLinks.length}`);
console.log(`Orphan Routes: ${results.orphanRoutes.length}`);
console.log(`Duplicate Paths: ${results.duplicatePaths.length}\n`);

if (results.brokenLinks.length > 0) {
    console.log('=== BROKEN LINKS ===');
    results.brokenLinks.forEach(link => {
        console.log(`  - ${link.path} (from ${link.source})`);
    });
    console.log('');
}

if (results.duplicatePaths.length > 0) {
    console.log('=== DUPLICATE PATHS ===');
    results.duplicatePaths.forEach(dup => {
        console.log(`  - ${dup.path} (${dup.instances} instances)`);
    });
    console.log('');
}

if (results.orphanRoutes.length > 0) {
    console.log('=== ORPHAN ROUTES (No Navigation Entry) ===');
    results.orphanRoutes.slice(0, 20).forEach(route => {
        console.log(`  - ${route.path} (line ${route.line})`);
    });
    if (results.orphanRoutes.length > 20) {
        console.log(`  ... and ${results.orphanRoutes.length - 20} more`);
    }
}
