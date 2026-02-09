

# Plan: Stabilize Frontend — Replace @shared/schema Imports and Remove @ts-nocheck

## Overview

The frontend build is broken because files import **runtime values** (like Zod schemas) from `@shared/schema` that aren't available in the compiled output. Additionally, 74 files have `// @ts-nocheck` suppressing TypeScript errors. This plan systematically fixes both categories.

## Phase 1: Fix Build-Breaking @shared/schema Value Imports (Priority: Critical)

These imports pull in **runtime values** (Zod schemas, Drizzle table objects) that don't exist in the compiled `shared/schema.js`. Each must be replaced with a local Zod schema and/or interface.

### Files with value imports (build breakers):

| File | Broken Import | Fix |
|------|--------------|-----|
| `src/components/treasury/FxDealEntry.tsx` | `insertTreasuryFxDealSchema, InsertTreasuryFxDeal` | Inline Zod schema + interface locally |
| `src/components/fixed-assets/AddAssetDialog.tsx` | `insertFaAssetSchema, InsertFaAsset` | Inline Zod schema + interface locally |
| `src/components/finance/IntercompanyManager.tsx` | `insertGlIntercompanyRuleSchema` | Inline Zod schema locally |
| `src/components/forms/CaseForm.tsx` | `insertCaseSchema` (if value) | Inline Zod schema locally |
| `src/pages/LeadsDetail.tsx` | `insertLeadSchema, InsertLead, Lead` | Inline Zod schema + interfaces locally |
| `src/pages/ContactsDetail.tsx` | `insertContactSchema, InsertContact, Contact` | Inline Zod schema + interfaces locally |
| `src/pages/RevenueContractWorkbench.tsx` | `revenueContracts` (Drizzle table object) | Replace with local interface |

### Approach for each file:
1. Remove the `@shared/schema` import
2. Define a local Zod schema (using `z.object(...)`) matching the field names used in the form
3. Define a local TypeScript interface for the type
4. Keep `// @ts-nocheck` temporarily if other errors remain in the file

## Phase 2: Convert Type-Only @shared/schema Imports (Priority: High)

These 65+ files import only **types** (e.g., `type { ArInvoice }`). While some work today, they are fragile. Each type import will be replaced with a local interface.

### Approach:
- For each file, define a minimal local interface with only the fields actually used in the component
- Group by module to batch similar types:

| Module | Files | Types to Localize |
|--------|-------|-------------------|
| AR | ~6 files | `ArInvoice`, `ArReceipt`, `ArRevenueSchedule`, `ArSystemOptions` |
| AP | ~3 files | `ApInvoice`, `ApSupplier` |
| Treasury | ~4 files | `TreasuryDeal`, `TreasuryFxDeal`, `TreasuryCounterparty` |
| CRM | ~8 files | `Account`, `Contact`, `Opportunity`, `Lead`, `Campaign`, `Quote`, `Order` |
| GL | ~4 files | `GlJournal`, `GlCoaStructure`, `GlSegment`, `GlValueSet`, `GlSegmentValue` |
| Manufacturing | ~3 files | `WipBalance`, `VarianceJournal` |
| Construction | ~4 files | `CostCode`, `ConstructionResource`, `ConstructionResourceAllocation` |
| Cash | ~2 files | `CashStatementLine`, `CashTransaction` |
| Fixed Assets | ~2 files | `FaAsset` |
| Billing | ~3 files | `BillingEvent`, `BillingRule`, `BillingProfile` |
| Community | ~2 files | `CommunitySpace`, `CommunityPost`, `UserTrustLevel`, `CommunityVoteAnomaly` |
| Marketplace | ~2 files | `MarketplaceDeveloper`, `MarketplaceApp` |
| Platform/Admin | ~1 file | `Partner` |

### Efficiency strategy:
Create a single shared local types file `src/types/erp-types.ts` containing all these interfaces, so each component imports from `@/types/erp-types` instead of `@shared/schema`.

## Phase 3: Remove @ts-nocheck from 74 Files (Priority: Medium)

After Phase 1 and 2 eliminate the schema import errors, many `@ts-nocheck` files will compile cleanly. The remaining issues are typically:

1. **`useRoute`/`useParams` null safety** -- add fallback: `const { id } = useParams() ?? {}`
2. **Prop mismatches on `StandardPage`** -- use `subtitle` or `description` consistently
3. **Missing `queryClient` import** -- ensure `apiRequest` is imported from `@/lib/queryClient`
4. **Form type mismatches** -- use `as any` on `useForm` generics where needed

### Batch processing order (by module):
1. Treasury components (4 files) -- already partially fixed
2. AP components (3 files)
3. CRM pages (8 files)
4. Finance/GL pages (5 files)
5. Procurement pages (4 files)
6. HR self-service pages (5 files)
7. Billing pages (4 files)
8. Manufacturing pages (3 files)
9. Remaining pages (38 files)

## Phase 4: Build Verification

After all changes:
1. Run `vite build --mode development` to confirm zero build errors
2. Verify the preview renders the dashboard
3. Spot-check key modules: CRM, Finance, Treasury, HR

## Technical Details

### Local Zod schema pattern (for forms):
```typescript
import { z } from "zod";

const fxDealFormSchema = z.object({
  dealNumber: z.string().optional(),
  dealType: z.string(),
  counterpartyId: z.string(),
  buyCurrency: z.string(),
  buyAmount: z.string().optional(),
  sellCurrency: z.string(),
  sellAmount: z.string().optional(),
  exchangeRate: z.string().optional(),
  tradeDate: z.date().optional(),
  valueDate: z.date().optional(),
  status: z.string().optional(),
});
type FxDealFormData = z.infer<typeof fxDealFormSchema>;
```

### Local interface pattern (for display-only components):
```typescript
interface ArInvoice {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  invoiceAmount?: string;
  status?: string;
  invoiceDate?: string;
}
```

### Estimated scope:
- ~72 files need schema import replacement
- ~74 files need @ts-nocheck removal
- 1 new shared types file (`src/types/erp-types.ts`)
- Total files modified: ~100 (with overlap)

