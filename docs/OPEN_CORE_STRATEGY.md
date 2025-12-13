# NexusAI Open-Core Strategy

## Executive Summary

This document outlines the complete open-core strategy for NexusAI, enabling community-driven development of core ERP functionality while protecting proprietary platform features. The strategy establishes clear boundaries between open-source and commercial code, governance frameworks, and sustainable contributor models.

---

## Table of Contents

1. [Codebase Classification](#1-codebase-classification)
2. [Repository Restructuring](#2-repository-restructuring)
3. [License & Legal Framework](#3-license--legal-framework)
4. [Architectural Enforcement](#4-architectural-enforcement)
5. [GitHub Governance](#5-github-governance)
6. [Future Development Framework](#6-future-development-framework)
7. [Versioning & Dependency Management](#7-versioning--dependency-management)
8. [Contributor Model](#8-contributor-model)
9. [Migration Risk Mitigation](#9-migration-risk-mitigation)

---

## 1. Codebase Classification

### Classification Matrix

| Component | Classification | Repository | Rationale |
|-----------|---------------|------------|-----------|
| **shared/schema.ts** | OPEN SOURCE | nexusai-core | Data models, types - foundational for extensions |
| **shared/communityConstants.ts** | OPEN SOURCE | nexusai-core | Trust/reputation thresholds - community transparency |
| **shared/types/** | OPEN SOURCE | nexusai-core | TypeScript interfaces - enable type-safe extensions |
| **server/storage.ts** | OPEN SOURCE | nexusai-core | Storage interface abstraction |
| **server/storage-db.ts** | OPEN SOURCE | nexusai-core | Database implementation |
| **server/db.ts** | OPEN SOURCE | nexusai-core | Database connection |
| **server/routes.ts** | OPEN SOURCE | nexusai-core | Core API routes |
| **server/gl/** | OPEN SOURCE | nexusai-core | General Ledger engine - core ERP |
| **server/workflow/** | OPEN SOURCE | nexusai-core | Workflow engine - core ERP |
| **server/rules/** | OPEN SOURCE | nexusai-core | Business rules engine |
| **server/metadata/** | OPEN SOURCE | nexusai-core | Schema/form metadata system |
| **server/templates/** | OPEN SOURCE | nexusai-core | Template engine |
| **server/analytics/** | OPEN SOURCE | nexusai-core | Analytics engine |
| **server/cache/** | OPEN SOURCE | nexusai-core | Caching layer |
| **server/logging/** | OPEN SOURCE | nexusai-core | Logging infrastructure |
| **server/operations/** | OPEN SOURCE | nexusai-core | Bulk operations |
| **server/sync/** | OPEN SOURCE | nexusai-core | Data sync engine |
| **client/src/** | PROPRIETARY | nexusai-platform | Entire frontend UI |
| **server/replitAuth.ts** | PROPRIETARY | nexusai-platform | Platform authentication |
| **server/platformAuth.ts** | PROPRIETARY | nexusai-platform | Platform-specific auth |
| **server/reputationService.ts** | PROPRIETARY | nexusai-platform | Community reputation logic |
| **server/DEMO_*.ts** | PROPRIETARY | nexusai-platform | Demo management |
| **server/demoSeeds.ts** | PROPRIETARY | nexusai-platform | Demo data |
| **server/api/apiGateway.ts** | PROPRIETARY | nexusai-platform | API Gateway with rate limiting |
| **server/integrations/** | PROPRIETARY | nexusai-platform | Third-party integrations |
| **server/webhooks/** | PROPRIETARY | nexusai-platform | Webhook management |
| **server/mobile/** | PROPRIETARY | nexusai-platform | Mobile API layer |
| **server/security/** | PROPRIETARY | nexusai-platform | Security hardening |
| **server/backup/** | PROPRIETARY | nexusai-platform | Backup management |
| **server/migration/** | PROPRIETARY | nexusai-platform | Data migration tools |
| **server/monitoring/** | PROPRIETARY | nexusai-platform | Health checks |
| **server/performance/** | PROPRIETARY | nexusai-platform | Performance optimization |
| **docs/** | MIXED | Both | API docs open, guides proprietary |
| **infrastructure/** | PROPRIETARY | nexusai-platform | Deployment configs |
| **platforms/** | PROPRIETARY | nexusai-platform | Platform configs |

### Classification Decision Tree

```
Is this code...?
    |
    +-- Core ERP business logic (GL, Workflow, Rules)?
    |       |-- YES --> OPEN SOURCE
    |       |-- NO  --> Continue
    |
    +-- Data model or type definition?
    |       |-- YES --> OPEN SOURCE
    |       |-- NO  --> Continue
    |
    +-- Storage interface or database abstraction?
    |       |-- YES --> OPEN SOURCE
    |       |-- NO  --> Continue
    |
    +-- User interface component?
    |       |-- YES --> PROPRIETARY
    |       |-- NO  --> Continue
    |
    +-- Authentication/authorization?
    |       |-- YES --> PROPRIETARY
    |       |-- NO  --> Continue
    |
    +-- Billing, payments, subscriptions?
    |       |-- YES --> PROPRIETARY
    |       |-- NO  --> Continue
    |
    +-- Community features (reputation, moderation)?
    |       |-- YES --> PROPRIETARY
    |       |-- NO  --> Continue
    |
    +-- Third-party integration (Stripe, OAuth providers)?
    |       |-- YES --> PROPRIETARY
    |       |-- NO  --> Continue
    |
    +-- Branding assets or marketing content?
    |       |-- YES --> PROPRIETARY
    |       |-- NO  --> OPEN SOURCE (default for utilities)
```

---

## 2. Repository Restructuring

### Target Repository Structure

#### nexusai-core (PUBLIC)
```
nexusai-core/
├── src/
│   ├── schema/
│   │   ├── index.ts          # Re-export from schema.ts
│   │   ├── schema.ts         # All Drizzle models
│   │   └── types.ts          # TypeScript types
│   ├── constants/
│   │   └── community.ts      # Trust levels, thresholds
│   ├── engines/
│   │   ├── gl/               # General Ledger
│   │   ├── workflow/         # Workflow engine
│   │   ├── rules/            # Rules engine
│   │   ├── analytics/        # Analytics
│   │   └── templates/        # Template engine
│   ├── storage/
│   │   ├── interface.ts      # IStorage interface
│   │   ├── memory.ts         # In-memory implementation
│   │   └── postgres.ts       # PostgreSQL implementation
│   ├── metadata/
│   │   ├── registry.ts
│   │   ├── validator.ts
│   │   └── templates.ts
│   ├── utils/
│   │   ├── cache.ts
│   │   ├── logging.ts
│   │   └── sync.ts
│   └── index.ts              # Main exports
├── tests/
├── docs/
│   └── api/                  # API documentation
├── examples/
│   ├── basic-erp/
│   └── custom-module/
├── LICENSE                   # AGPL-3.0
├── README.md
├── CONTRIBUTING.md
├── package.json
└── tsconfig.json
```

#### nexusai-platform (PRIVATE)
```
nexusai-platform/
├── client/                   # Full React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── lib/
├── server/
│   ├── auth/                 # Authentication
│   ├── api/                  # API Gateway
│   ├── integrations/         # Third-party
│   ├── billing/              # Payment processing
│   ├── community/            # Reputation, moderation
│   ├── demo/                 # Demo management
│   ├── mobile/               # Mobile API
│   ├── security/             # Hardening
│   ├── webhooks/             # Webhook management
│   └── routes/               # Platform routes
├── infrastructure/
├── platforms/
├── docs/
│   ├── user-guides/
│   └── admin-guides/
├── LICENSE                   # Proprietary
├── package.json              # Depends on @nexusai/core
└── tsconfig.json
```

### Package Publishing Strategy

```json
// nexusai-core/package.json
{
  "name": "@nexusai/core",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./schema": "./dist/schema/index.js",
    "./engines/*": "./dist/engines/*/index.js",
    "./storage": "./dist/storage/index.js"
  },
  "license": "AGPL-3.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/nexusai/nexusai-core"
  }
}
```

```json
// nexusai-platform/package.json
{
  "name": "nexusai-platform",
  "private": true,
  "dependencies": {
    "@nexusai/core": "^1.0.0"
  }
}
```

---

## 3. License & Legal Framework

### License Selection

| Repository | License | Rationale |
|------------|---------|-----------|
| nexusai-core | **AGPL-3.0** | Strong copyleft prevents proprietary forks from competing without contributing back |
| nexusai-platform | **Proprietary** | Full commercial control |

### AGPL-3.0 Benefits for Open Core

1. **Network Copyleft**: Any modifications used to provide a service must be released
2. **Fork Protection**: Competitors cannot build closed-source products on the core
3. **Contribution Incentive**: Easier to contribute upstream than maintain private fork
4. **SaaS Protection**: Even network-accessed modifications trigger disclosure

### License Headers

#### Open Source Files
```typescript
/**
 * NexusAI Core - Open Source ERP Engine
 * Copyright (C) 2024 NexusAI Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
```

#### Proprietary Files
```typescript
/**
 * NexusAI Platform - Proprietary Software
 * Copyright (C) 2024 NexusAI Inc. All rights reserved.
 *
 * CONFIDENTIAL AND PROPRIETARY
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * This file is licensed under the NexusAI Commercial License.
 */
```

### Contributor License Agreement (CLA)

All contributors to nexusai-core must sign a CLA granting:
1. Right to relicense contributions (future license changes)
2. Patent grant for contributed code
3. Confirmation of original authorship

---

## 4. Architectural Enforcement

### API Boundary Definition

```typescript
// nexusai-core/src/index.ts - PUBLIC API

// Engines
export { GLPostingEngine, GLReconciler } from './engines/gl';
export { WorkflowEngine, ApprovalEngine } from './engines/workflow';
export { RulesEngine } from './engines/rules';
export { TemplateEngine } from './engines/templates';
export { AnalyticsEngine } from './engines/analytics';

// Storage
export { IStorage } from './storage/interface';
export { MemStorage } from './storage/memory';
export { PostgresStorage } from './storage/postgres';

// Schema & Types
export * from './schema';
export * from './constants/community';

// Metadata
export { MetadataRegistry } from './metadata/registry';
export { MetadataValidator } from './metadata/validator';

// Utilities
export { CacheManager } from './utils/cache';
export { Logger } from './utils/logging';
```

### Dependency Direction

```
┌─────────────────────────────────────────────────────┐
│                 PROPRIETARY LAYER                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Client    │  │  Platform   │  │   Billing   │ │
│  │     UI      │  │    Auth     │  │  Payments   │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │         │
│         └────────────────┼────────────────┘         │
│                          │                          │
│                          ▼                          │
│  ┌───────────────────────────────────────────────┐ │
│  │            Platform Routes Layer               │ │
│  └───────────────────────┬───────────────────────┘ │
└──────────────────────────┼──────────────────────────┘
                           │
                           │ IMPORTS ONLY
                           ▼
┌──────────────────────────────────────────────────────┐
│                  OPEN SOURCE CORE                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  GL Engine  │  │  Workflow   │  │   Rules     │  │
│  │             │  │   Engine    │  │   Engine    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Schema    │  │  Storage    │  │  Metadata   │  │
│  │   Types     │  │  Interface  │  │  Registry   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Import Rules (Enforced via ESLint)

```javascript
// nexusai-platform/.eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['../nexusai-core/**/internal/*'],
          message: 'Cannot import internal modules from core'
        }
      ]
    }]
  }
};
```

```javascript
// nexusai-core/.eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['**/platform/**', '**/client/**'],
          message: 'Core cannot depend on platform code'
        }
      ]
    }]
  }
};
```

### Boundary Validation Script

```typescript
// scripts/validate-boundaries.ts
import * as fs from 'fs';
import * as path from 'path';

const CORE_PATHS = ['src/engines', 'src/schema', 'src/storage', 'src/metadata'];
const PLATFORM_PATHS = ['client', 'server/auth', 'server/billing'];

function validateNoCircularDependencies() {
  // Ensure core never imports from platform
  const coreFiles = getAllFiles(CORE_PATHS);
  
  for (const file of coreFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const platformPath of PLATFORM_PATHS) {
      if (content.includes(`from '${platformPath}`)) {
        throw new Error(`BOUNDARY VIOLATION: ${file} imports from ${platformPath}`);
      }
    }
  }
  
  console.log('Boundary validation passed');
}
```

---

## 5. GitHub Governance

### Branch Protection Rules

#### nexusai-core (main branch)
```yaml
# .github/branch-protection.yml
branches:
  main:
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 2
        dismiss_stale_reviews: true
        require_code_owner_reviews: true
      required_status_checks:
        strict: true
        contexts:
          - "test"
          - "lint"
          - "type-check"
          - "license-check"
          - "boundary-validation"
      enforce_admins: true
      restrictions:
        users: []
        teams:
          - core-maintainers
```

### CODEOWNERS

```
# nexusai-core/CODEOWNERS

# Global owners
*                           @nexusai/core-maintainers

# Engine-specific owners
/src/engines/gl/            @nexusai/finance-team
/src/engines/workflow/      @nexusai/workflow-team
/src/engines/rules/         @nexusai/rules-team

# Schema changes require senior review
/src/schema/                @nexusai/architects

# Security-sensitive
/src/utils/                 @nexusai/security-team
```

### CI/CD Workflows

```yaml
# .github/workflows/core-ci.yml
name: Core CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint
        run: npm run lint
        
      - name: Test
        run: npm test
        
      - name: Boundary validation
        run: npm run validate:boundaries
        
      - name: License check
        run: npm run license:check
        
      - name: Build
        run: npm run build

  publish:
    needs: validate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps: 
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          
      - name: Build
        run: npm run build
        
      - name: Publish
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Issue & PR Templates

```markdown
<!-- .github/ISSUE_TEMPLATE/feature_request.md -->
---
name: Feature Request
about: Propose a new feature for NexusAI Core
labels: enhancement
---

## Feature Description
<!-- Clear description of the feature -->

## Classification Check
- [ ] This is core ERP functionality (GL, Workflow, Rules, etc.)
- [ ] This does NOT require UI components
- [ ] This does NOT involve authentication/authorization
- [ ] This does NOT involve billing/payments
- [ ] This does NOT involve third-party integrations

## Acceptance Criteria
<!-- List of requirements for completion -->
```

---

## 6. Future Development Framework

### Feature Classification Checklist

Before developing ANY new feature, complete this checklist:

| Question | Yes = Open Source | No = Proprietary |
|----------|-------------------|------------------|
| Is this core business logic that any ERP needs? | Open | - |
| Does this implement accounting/financial standards? | Open | - |
| Is this a data model or type definition? | Open | - |
| Is this a storage abstraction or interface? | Open | - |
| Does this require user interface? | - | Proprietary |
| Does this involve authentication? | - | Proprietary |
| Does this involve billing/payments? | - | Proprietary |
| Does this involve community features? | - | Proprietary |
| Does this integrate with third-party services? | - | Proprietary |
| Is this branding or marketing content? | - | Proprietary |

### Decision Documentation Template

```markdown
# Feature Classification: [Feature Name]

## Date: YYYY-MM-DD
## Author: [Name]

### Feature Description
[Brief description]

### Classification Decision: [OPEN SOURCE / PROPRIETARY]

### Justification
- [ ] Core business logic: Yes/No
- [ ] UI required: Yes/No
- [ ] Auth required: Yes/No
- [ ] Third-party integration: Yes/No
- [ ] Billing/payment: Yes/No

### Dependencies
- Depends on: [list open-source dependencies]
- Depended by: [list components that will use this]

### Approved by: [Approver Name]
```

### Module Addition Process

```
1. Proposal submitted via GitHub Issue
          │
          ▼
2. Classification review (2 maintainers)
          │
          ├── OPEN SOURCE ──────────────────┐
          │                                  │
          ▼                                  ▼
3a. Design review in              3b. Internal design
    public RFC                         review
          │                                  │
          ▼                                  ▼
4a. Implementation in             4b. Implementation in
    nexusai-core                       nexusai-platform
          │                                  │
          ▼                                  ▼
5a. Public PR review              5b. Internal PR review
    (2 approvals)                      (1 approval)
          │                                  │
          ▼                                  ▼
6. Merge & Release                6. Deploy
```

---

## 7. Versioning & Dependency Management

### Semantic Versioning Strategy

```
MAJOR.MINOR.PATCH

MAJOR: Breaking API changes
  - Schema changes that break existing queries
  - Removed or renamed exports
  - Changed function signatures

MINOR: New features (backward compatible)
  - New engines or modules
  - New optional parameters
  - New schema fields with defaults

PATCH: Bug fixes
  - Security patches
  - Performance improvements
  - Documentation updates
```

### Core Release Cadence

| Release Type | Frequency | Examples |
|--------------|-----------|----------|
| Major | Annually | v1.0.0, v2.0.0 |
| Minor | Monthly | v1.1.0, v1.2.0 |
| Patch | As needed | v1.1.1, v1.1.2 |
| Security | Immediate | v1.1.3 (hotfix) |

### Platform Dependency Pinning

```json
// nexusai-platform/package.json
{
  "dependencies": {
    "@nexusai/core": "~1.2.0"  // Accept patches only
  }
}
```

### Upgrade Strategy

```typescript
// scripts/upgrade-core.ts

async function upgradeCore() {
  // 1. Check for breaking changes
  const changelog = await fetchChangelog();
  const breaking = changelog.filter(c => c.type === 'BREAKING');
  
  if (breaking.length > 0) {
    console.log('Breaking changes detected:');
    breaking.forEach(b => console.log(`  - ${b.description}`));
    console.log('\nRun migration scripts before upgrading.');
    return;
  }
  
  // 2. Run compatibility tests
  await runCompatibilityTests();
  
  // 3. Update dependency
  await updatePackageJson('@nexusai/core');
  
  // 4. Run full test suite
  await runTests();
  
  console.log('Upgrade complete!');
}
```

### Migration Tooling

```typescript
// nexusai-core/src/migrations/index.ts

export interface Migration {
  version: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: '1.2.0',
    up: async () => {
      // Add new fields
    },
    down: async () => {
      // Rollback
    }
  }
];
```

---

## 8. Contributor Model

### What External Contributors CAN Build

| Category | Examples | License |
|----------|----------|---------|
| **New ERP Modules** | Asset Management, Quality Control | AGPL-3.0 |
| **Engine Extensions** | Custom GL rules, Workflow actions | AGPL-3.0 |
| **Storage Adapters** | MongoDB, MySQL adapters | AGPL-3.0 |
| **Industry Plugins** | Healthcare compliance, Retail POS | AGPL-3.0 (or proprietary if separate) |
| **Integrations** | Connect to open-source systems | AGPL-3.0 |

### What External Contributors CANNOT Access

| Category | Reason |
|----------|--------|
| Frontend UI | Proprietary - not in public repo |
| Authentication | Proprietary - security sensitive |
| Billing/Payments | Proprietary - revenue critical |
| Community Platform | Proprietary - competitive advantage |
| Demo Management | Proprietary - sales tool |
| Mobile Apps | Proprietary - not in public repo |

### Contribution Tiers

```
┌─────────────────────────────────────────────────────────────┐
│                     CONTRIBUTION TIERS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tier 1: Bug Fixes & Documentation                          │
│  ├── Anyone can submit                                       │
│  ├── Requires 1 maintainer approval                         │
│  └── CLA required                                            │
│                                                              │
│  Tier 2: Feature Enhancements                                │
│  ├── Requires RFC discussion first                           │
│  ├── Requires 2 maintainer approvals                        │
│  └── Must pass classification review                         │
│                                                              │
│  Tier 3: New Engines/Modules                                 │
│  ├── Requires formal proposal                                │
│  ├── Architecture review required                            │
│  ├── Requires 3 maintainer approvals                        │
│  └── May require TSC approval                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Building Commercial Products on Core

External developers can build commercial products using nexusai-core under these conditions:

1. **AGPL Compliance Required**
   - If modifying core: Changes must be open-sourced under AGPL
   - If using unmodified: Attribution required

2. **Commercial License Available**
   - For those who cannot comply with AGPL
   - Enables proprietary forks

3. **Plugin Architecture**
   - Build plugins that work WITH core (not modify it)
   - Plugins can be proprietary
   - Must use public API only

### Contributor Recognition

| Achievement | Recognition |
|-------------|-------------|
| First PR merged | Contributor badge |
| 10 PRs merged | Regular Contributor status |
| 50 PRs merged | Core Contributor status |
| Maintainer nomination | Maintainer badge + commit access |

---

## 9. Migration Risk Mitigation

### Pre-Migration Checklist

- [ ] All files classified and documented
- [ ] No proprietary code in open-source paths
- [ ] No open-source code in proprietary paths
- [ ] License headers added to all files
- [ ] .gitignore prevents proprietary leaks
- [ ] CI/CD pipelines tested
- [ ] CLA system configured
- [ ] Documentation updated

### Migration Phases

#### Phase 1: Preparation (Week 1-2)
```
1. Create private staging repositories
2. Set up CI/CD for both repos
3. Configure npm publishing
4. Set up CLA bot
5. Create CODEOWNERS files
6. Configure branch protection
```

#### Phase 2: Code Separation (Week 3-4)
```
1. Extract shared/schema.ts to core
2. Extract shared/communityConstants.ts to core
3. Extract server engines to core
4. Extract storage layer to core
5. Update import paths in platform
6. Add @nexusai/core dependency
7. Run full test suite
```

#### Phase 3: Verification (Week 5)
```
1. Code review by security team
2. License compliance audit
3. Boundary validation
4. Integration testing
5. Performance benchmarking
```

#### Phase 4: Public Launch (Week 6)
```
1. Make nexusai-core repository public
2. Publish @nexusai/core to npm
3. Announce to community
4. Monitor for issues
```

### Rollback Plan

```typescript
// scripts/rollback.ts

async function rollback() {
  // 1. Make public repo private again
  await github.repos.update({
    owner: 'nexusai',
    repo: 'nexusai-core',
    private: true
  });
  
  // 2. Unpublish npm package
  await exec('npm unpublish @nexusai/core --force');
  
  // 3. Restore monorepo structure
  await restoreFromBackup('pre-migration-backup');
  
  // 4. Notify stakeholders
  await notifyTeam('Migration rolled back');
}
```

### Security Measures

1. **Pre-Publication Scan**
   ```bash
   # Scan for secrets
   trufflehog filesystem ./nexusai-core
   
   # Scan for proprietary markers
   grep -r "PROPRIETARY" ./nexusai-core
   grep -r "CONFIDENTIAL" ./nexusai-core
   ```

2. **Git History Audit**
   ```bash
   # Ensure no proprietary code in history
   git filter-repo --analyze
   ```

3. **Continuous Monitoring**
   - GitHub secret scanning enabled
   - Dependabot alerts enabled
   - Weekly license compliance scans

---

## Appendix A: Quick Reference

### Classification One-Liner

> **If it's ERP logic, data models, or storage abstraction → OPEN SOURCE**
> **If it's UI, auth, billing, integrations, or community → PROPRIETARY**

### Contact Points

| Role | Responsibility | Contact |
|------|---------------|---------|
| Core Maintainers | PR reviews, releases | core@nexusai.com |
| Security Team | Audits, vulnerabilities | security@nexusai.com |
| Legal Team | Licensing questions | legal@nexusai.com |
| Community Manager | Contributor relations | community@nexusai.com |

### Key URLs

| Resource | URL |
|----------|-----|
| Core Repository | github.com/nexusai/nexusai-core |
| npm Package | npmjs.com/package/@nexusai/core |
| Documentation | docs.nexusai.com/core |
| RFC Discussions | github.com/nexusai/nexusai-core/discussions |
| CLA Portal | cla.nexusai.com |

---

## Appendix B: File Classification Reference

### Complete Classification Table

| Current Path | Classification | Target Repo | Target Path |
|-------------|---------------|-------------|-------------|
| shared/schema.ts | OPEN | core | src/schema/schema.ts |
| shared/communityConstants.ts | OPEN | core | src/constants/community.ts |
| shared/types/metadata.ts | OPEN | core | src/schema/types.ts |
| server/gl/* | OPEN | core | src/engines/gl/* |
| server/workflow/* | OPEN | core | src/engines/workflow/* |
| server/rules/* | OPEN | core | src/engines/rules/* |
| server/metadata/* | OPEN | core | src/metadata/* |
| server/templates/* | OPEN | core | src/engines/templates/* |
| server/analytics/* | OPEN | core | src/engines/analytics/* |
| server/storage.ts | OPEN | core | src/storage/interface.ts |
| server/storage-db.ts | OPEN | core | src/storage/postgres.ts |
| server/db.ts | OPEN | core | src/storage/db.ts |
| server/cache/* | OPEN | core | src/utils/cache/* |
| server/logging/* | OPEN | core | src/utils/logging/* |
| server/operations/* | OPEN | core | src/utils/operations/* |
| server/sync/* | OPEN | core | src/utils/sync/* |
| client/* | PROPRIETARY | platform | client/* |
| server/replitAuth.ts | PROPRIETARY | platform | server/auth/replit.ts |
| server/platformAuth.ts | PROPRIETARY | platform | server/auth/platform.ts |
| server/reputationService.ts | PROPRIETARY | platform | server/community/reputation.ts |
| server/DEMO_*.ts | PROPRIETARY | platform | server/demo/* |
| server/api/* | PROPRIETARY | platform | server/api/* |
| server/integrations/* | PROPRIETARY | platform | server/integrations/* |
| server/webhooks/* | PROPRIETARY | platform | server/webhooks/* |
| server/mobile/* | PROPRIETARY | platform | server/mobile/* |
| server/security/* | PROPRIETARY | platform | server/security/* |
| server/backup/* | PROPRIETARY | platform | server/backup/* |
| server/migration/* | PROPRIETARY | platform | server/migration/* |
| server/monitoring/* | PROPRIETARY | platform | server/monitoring/* |
| server/performance/* | PROPRIETARY | platform | server/performance/* |
| infrastructure/* | PROPRIETARY | platform | infrastructure/* |
| platforms/* | PROPRIETARY | platform | platforms/* |

---

*Document Version: 1.0.0*
*Last Updated: 2024*
*Approved by: NexusAI Technical Steering Committee*
