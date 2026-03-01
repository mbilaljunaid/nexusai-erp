# GL Module – BU / Ledger Scoping Implementation Guide

## 1. Scoping Strategy

GL module is scoped by **Ledger** (not BU directly).
BU → Legal Entity → Ledger is the indirect chain.

The frontend uses the `LedgerContext` to track the active ledger.
The backend filters data by `ledgerId` via **query parameter** (existing pattern).

---

## 2. Schema Changes

### 2.1 `gl_ledgers` – Add missing fields
```sql
ALTER TABLE gl_ledgers 
  ADD COLUMN legal_entity_id VARCHAR REFERENCES gl_legal_entities(id),
  ADD COLUMN accounting_method VARCHAR DEFAULT 'Accrual', -- Accrual | Cash | None
  ADD COLUMN chart_of_accounts_id VARCHAR; -- CoA structure reference
```

### 2.2 `gl_journal_lines` – Add Oracle parity fields
```sql
ALTER TABLE gl_journal_lines
  ADD COLUMN tax_code VARCHAR,
  ADD COLUMN reference VARCHAR,
  ADD COLUMN attribute1 VARCHAR, ADD COLUMN attribute2 VARCHAR,
  ADD COLUMN attribute3 VARCHAR, ADD COLUMN attribute4 VARCHAR,
  ADD COLUMN attribute5 VARCHAR, ADD COLUMN attribute6 VARCHAR,
  ADD COLUMN attribute7 VARCHAR, ADD COLUMN attribute8 VARCHAR,
  ADD COLUMN attribute9 VARCHAR, ADD COLUMN attribute10 VARCHAR;
```

### 2.3 `gl_journals` – Add batch grouping field
```sql
ALTER TABLE gl_journals
  ADD COLUMN batch_name VARCHAR; -- Oracle: JE Batch Name separate from journal description
```

---

## 3. Backend Route Changes

### 3.1 Routes to ADD
| Route | Purpose |
|---|---|
| `GET /api/gl/ledgers` | List all ledgers (used by LedgerContext, Revaluation, etc.) |
| `GET /api/gl/ledgers/:id` | Get single ledger |
| `POST /api/gl/ledgers` | Create ledger |
| `PATCH /api/gl/ledgers/:id` | Update ledger |
| `GET /api/gl/periods` | List periods (filtered by ledgerId) |
| `POST /api/gl/periods` | Create period |
| `PATCH /api/gl/periods/:id/open` | Open period |
| `PATCH /api/gl/periods/:id/close` | Close period |
| `GET /api/gl/journals/:id` | Get single journal + lines |
| `POST /api/gl/journals/:id/post` | Post a journal |
| `POST /api/gl/journals/:id/submit` | Submit for approval |
| `POST /api/gl/journals/:id/approve` | Approve journal |
| `POST /api/gl/journals/:id/reject` | Reject journal |
| `POST /api/gl/journals/:id/reverse` | Create reversal journal |
| `GET /api/gl/journals/:id/audit` | Get audit trail for journal |
| `GET /api/gl/revaluations` | List revaluation runs |
| `POST /api/gl/revaluation` | Run revaluation |
| `POST /api/gl/translation/run` | Trigger FASB 52 translation |
| `GET /api/finance/gl/ledgers` | Alias for LedgerContext.tsx |
| `POST /api/gl/consolidation/run` | Run consolidation |

### 3.2 Routes to DE-MOCK
| Route | Current State | Fix |
|---|---|---|
| `GET /api/gl/consolidation/variance` | ✅ De-mocked | Query glBalances for real variance |
| `GET /api/gl/consolidation/history` | ✅ De-mocked | Query glConsolidationRuns table |

### 3.3 Existing Routes to Update (add ledgerId scoping)
| Route | Change |
|---|---|
| `GET /api/gl/journals` | Already accepts `ledgerId` query param ✓ |
| `GET /api/gl/trial-balance` | Already accepts `ledgerId` ✓ |
| `GET /api/gl/allocations` | Already accepts `ledgerId` ✓ |
| `GET /api/gl/budget-balances` | Already accepts `ledgerId` ✓ |

---

## 4. Frontend – Context Switcher Re-fetch

### 4.1 Update LedgerContext.tsx (DONE baseline – needs queryClient invalidation)

After `setCurrentLedgerId` is called, invalidate all GL query keys:
```tsx
const queryClient = useQueryClient();

const handleLedgerChange = (id: string) => {
  setCurrentLedgerId(id);
  // Purge all ledger-scoped GL data
  queryClient.invalidateQueries({ queryKey: ['/api/gl/journals'] });
  queryClient.invalidateQueries({ queryKey: ['/api/gl/reporting/trial-balance'] });
  queryClient.invalidateQueries({ queryKey: ['/api/gl/periods'] });
  queryClient.invalidateQueries({ queryKey: ['/api/gl/revaluations'] });
  queryClient.invalidateQueries({ queryKey: ['/api/gl/allocations'] });
  queryClient.invalidateQueries({ queryKey: ['/api/gl/budget-balances'] });
  queryClient.invalidateQueries({ queryKey: ['/api/gl/stats'] });
};
```

### 4.2 Pages that need useLedger() wiring

| Page | File | Current State | Change Required |
|---|---|---|---|
| JournalEntry | `JournalEntry.tsx` | ✅ Uses useLedger() | - |
| TrialBalance | `TrialBalance.tsx` | ✅ Uses useLedger() | Add useLedger(); pass ledgerId to query |
| CloseDashboard | `CloseDashboard.tsx` | ✅ Uses useLedger() | Add useLedger(); pass to API |
| BudgetManager | `BudgetManager.tsx` | ✅ Uses useLedger() | Add useLedger(); pass to API |
| ConsolidationWorkbench | `ConsolidationWorkbench.tsx` | ✅ Uses useLedger() | Add useLedger() |
| FSGBuilder | `FSGBuilder.tsx` | ✅ Uses useLedger() | Add useLedger() |
| FinancialReports | `FinancialReports.tsx` | ✅ Uses useLedger() | Add useLedger() |
| AccountAnalysisReport | `AccountAnalysisReport.tsx` | ✅ Uses useLedger() | Add useLedger() |
| AuditLogs | `AuditLogs.tsx` | ✅ Uses useLedger() | Add useLedger() |
| Revaluation | `Revaluation.tsx` | ✅ Uses useLedger() | Use useLedger().currentLedgerId |

### 4.3 Query Key Pattern (Ledger-aware)

Add `currentLedgerId` to all GL query keys so React Query caches per ledger:
```tsx
const { currentLedgerId } = useLedger();

useQuery({
  queryKey: ['/api/gl/journals', { ledgerId: currentLedgerId }],
  queryFn: () => fetch(`/api/gl/journals?ledgerId=${currentLedgerId}`).then(r => r.json()),
});
```

---

## 5. Ledger Selector UI Component

A `LedgerSelector` component should be shown on every GL page in the page header, driven by `useLedger()`:

```tsx
function LedgerSelector() {
  const { ledgers, currentLedgerId, setCurrentLedgerId } = useLedger();
  return (
    <Select value={currentLedgerId} onValueChange={setCurrentLedgerId}>
      {ledgers.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
    </Select>
  );
}
```

This replaces the hardcoded local `ledgerId` states in Revaluation.tsx and similar pages.

---

## 6. Page-level Ledger Context Badge

Every GL page header should show: `Ledger: [Primary Ledger Name] | Period: [Active Period]`

This badge should be implemented as `<LedgerContextBadge />` – a small shared component.
