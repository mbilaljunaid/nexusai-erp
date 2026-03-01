# GL Module – Multi-Org Context Architecture

## 1. Context Hierarchy

```
Business Unit (BU)
  └── Legal Entity (LE)
        └── Ledger (Primary scoping key for GL)
              └── Accounting Period
                    └── Code Combination (CCID)
```

In Oracle GL, **Ledger** is the primary scoping dimension for all journal and balance data.
BU and LE are structural containers that map to one or more Ledgers.

## 2. NexusAI GL Context Model

| Entity | Table | Scoping Key Present? |
|---|---|---|
| Business Unit | (global org context) | via LE → Ledger |
| Legal Entity | `gl_legal_entities` | `gl_ledgers.legalEntityId` |
| Ledger | `gl_ledgers` | ✓ Primary key for all GL tables |
| Accounting Period | `gl_periods` | `ledgerId` ✓ |
| Journal | `gl_journals` | `ledgerId` ✓ |
| Journal Lines | `gl_journal_lines` | Inherited from Journal |
| GL Balances | `gl_balances` | `ledgerId` ✓ |
| Allocations | `gl_allocations` | `ledgerId` ✓ |
| Budgets | `gl_budgets` | `ledgerId` ✓ |
| Budget Balances | `gl_budget_balances` | via `budgetId` → `ledgerId` |
| Revaluations | `gl_revaluations` | `ledgerId` ✓ |
| Close Tasks | `gl_close_tasks` | `ledgerId` ✓ |
| CVR Rules | `gl_cross_validation_rules` | `ledgerId` ✓ |
| Data Access Sets | `gl_data_access_sets` | `ledgerId` ✓ |
| FSG Reports | `gl_report_definitions` | `ledgerId` ✓ |

## 3. Context Switcher Flow

```
User selects Ledger in Context Switcher
  → LedgerContext.setCurrentLedgerId(id)
  → All GL pages read useLedger().currentLedgerId
  → Frontend queries include ledgerId as query param or header
  → queryClient.invalidateQueries(['gl/...']) called
  → Backend routes filter by ledgerId WHERE clause
```

## 4. Header Convention (Backend)

All GL backend routes accept `ledgerId` via **query parameter** (already consistent in existing routes).
For UI-driven fetches, the ledgerId is appended automatically via the `useLedger()` hook.

No `x-ledger-id` header is required – query params are sufficient and already partially implemented.

## 5. LegalEntity → Ledger Mapping

- `gl_ledgers.legalEntityId` (to be added) links each Ledger to a Legal Entity
- `gl_legal_entities` table tracks LE name, registration number, country  
- A Legal Entity can have multiple Ledgers (primary + secondary/reporting)

## 6. Inventory Organization

GL module has no direct link to Inventory Org – inventory transactions post to GL via subledger journal import. The mapping is: Inventory Org → Business Unit → Legal Entity → Ledger.
