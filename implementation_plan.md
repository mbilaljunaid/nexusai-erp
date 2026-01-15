# Implementation Plan - Phase V: Financial Integrity (Tax & GL)

## Goal Description
Implement the missing "Financial Integrity" layer for the Billing Module. This includes:
1.  **Tax Calculation**: A service to calculate tax on billing events (initially flat rate/stubbed, extensible for Vertex).
2.  **SLA (Subledger Accounting) Integration**: A mechanism to derive Accounting Entries (Dr/Cr) from Billing Events and post them to the GL Interface.
3.  **Approvals**: A basic workflow state machine for High-Value invoices.

## User Review Required
> [!IMPORTANT]
> **Tax Logic**: We will implement a simple "10% Flat Tax" or "Region-based" stub for now. Real tax integration (Vertex/Avalara) is out of scope but the interface must be compatible.

> [!WARNING]
> **GL Integration**: We will write to a `gl_interface` or `journal_entries` table. Ensure `JournalService` exists or we mock the hand-off.

## Proposed Changes

### Billing Module
#### [NEW] [TaxService.ts](file:///server/modules/billing/TaxService.ts)
*   `calculateTax(event)`: Returns tax amount and lines.

#### [NEW] [BillingAccountingService.ts](file:///server/modules/billing/BillingAccountingService.ts)
*   `createAccounting(event)`: Derives Dr AR / Cr Revenue.
*   `postToGL(accountingEntries)`: Sends to General Ledger.

#### [MODIFY] [BillingService.ts](file:///server/modules/billing/BillingService.ts)
*   Integrate `TaxService` into `processEvent`.
*   Integrate `BillingAccountingService` into `runAutoInvoice`.

#### [MODIFY] [schema/billing.ts](file:///shared/schema/billing_enterprise.ts)
*   Add `taxAmount`, `taxLines` to `BillingEvent`.
*   Add `glStatus`, `glDate` to `ArInvoice`.

## Verification Plan

### Automated Tests
1.  **Tax Calculation**: Verify 10% tax is added to new events.
2.  **Accounting Generation**: Verify Dr/Cr lines are created for an invoice.
3.  **GL Posting**: Verify entries appear in `gl_interface` (or equivalent).

### Manual Verification
1.  Create a Billing Event via Dashboard.
2.  Run `AutoInvoice`.
3.  Check "Tax" field on Invoice.
4.  Check "Accounting" tab/status on Invoice (if UI exists) or DB.

# Phase VI: Adjustments & Credits Implementation Plan

## Goal Description
Implement the ability to issue Credit Memos, Debit Memos, and perform Invoice Adjustments.

## User Review Required
> [!IMPORTANT]
> **Workflow**: Credit Memos > $1000 require approval. For now, we will implement the backend logic and a basic "Approve" button.

## Proposed Changes
### Billing Module
#### [NEW] [CreditMemoService.ts](file:///server/modules/billing/CreditMemoService.ts)
*   `createCreditMemo(invoiceId, amount, reason)`: Creates a CM linked to original Invoice.
*   `applyCredit(creditNoteId, invoiceId)`: Applies CM balance to open Invoice.

#### [MODIFY] [schema/ar.ts](file:///shared/schema/ar.ts)
*   Ensure `arAdjustments` table exists or create it.
*   Ensure `arCreditMemos` logic is supported (via `transactionClass` in `arInvoices`).

## Verification Plan
1.  **Create Invoice**: $1000.
2.  **Create CM**: $100.
3.  **Verify Balance**: Invoice balance should be $900.

