# Analysis: Cost Management Gap & Readiness

> **Forensic Analysis Date:** 2026-01-13
> **Current Status:** ❌ **Proto-MVP / Embedded Feature**
> **Enterprise Readiness:** ❌ **Not Ready**

## 1. Executive Summary
The current system contains a basic **transaction cost recorder** capabilities embedded within the `Inventory` module. It captures a `unitCost` for material transactions but lacks the architectural separation, accounting intelligence, and subledger integrations required for an Enterprise Cost Management system.

**Critical Deficiencies (Oracle Fusion Comparison):**
*   **No Receipt Accounting:** Receipts update inventory value but do not generate "Accrual" accounting entries (Dr Inventory / Cr Accrual) at the time of receipt.
*   **No Standard Costing:** No infrastructure for defining Cost Scenarios, Rollups, or Standard Costs independent of transaction history.
*   **No Subledger Accounting (SLA):** Cost transactions do not generate debits/credits for GL.
*   **No Cost Accounting Hub:** No central processor for disparate cost sources (e.g., Landed Costs, AP Invoices).

---

## 2. Feature Parity Heatmap (Oracle Fusion Cost Management)

| Feature Area | Oracle Fusion | NexusAI Current | Gap |
| :--- | :--- | :--- | :--- |
| **Cost Method** | Perpetual (Std, Avg, FIFO, LIFO) | ⚠️ Transaction (Avg-ish) | **Current impl uses placeholder cost** |
| **Receipt Accounting** | Receipt Accruals, Match to PO | ❌ **Missing** | **Critical Financial Control Gap** |
| **Landed Cost** | Estimated & Actual LCM | ❌ **Missing** | **Critical for Import/Export** |
| **Cost Planning** | Rollups, Scenarios, Updates | ❌ **Missing** | **Required for Manufacturing** |
| **Period Close** | Cost Period Open/Close, Reconcile | ❌ **Missing** | **Critical for Audit** |
| **Subledger** | Create Accounting, Transfer to GL | ❌ **Missing** | **Disconnects Ops from Finance** |
| **Analytics** | Gross Margin, WIP Valuation | ❌ **Missing** | **Blind Finance Team** |

---

## 3. Level-15 Canonical Decomposition

### Dimension 1: Basic Cost Management (The Foundation)
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L1** | **Domain** | Inventory Costing | ✅ **Implemented** (`CostingService`) |
| **L2** | **Sub-Domain** | Cost Layer Processing | ✅ **Implemented** (`CstTransactionCost`) |
| **L3** | **Capability** | Transaction Cost Calculation | ⚠️ **Partial** (Hardcoded/Pass-through) |
| **L4** | **Use Case** | PO Receipt Cost Capture | ❌ **Missing** (Receipt Svc -> Inventory Only) |
| **L5** | **Persona** | Cost Accountant | ❌ **Missing** (No RBAC/View) |
| **L6** | **UI Surface** | Cost Processor Console | ❌ **Missing** |
| **L7** | **UI Component** | Cost Distributions Grid | ❌ **Missing** |
| **L8** | **Config** | Cost Books & Profiles | ❌ **Missing** |
| **L9** | **Master Data** | Cost Elements (Material, Overhead) | ❌ **Missing** |
| **L10** | **Object** | Cost Organization | ❌ **Missing** (Assumes Inv Org = Cost Org) |
| **L11** | **Workflow** | Cost Adjustment Approval | ❌ **Missing** |
| **L12** | **Logic** | FIFO / Weighted Avg Algorithm | ⚠️ **Skeleton Only** |
| **L13** | **AI Agent** | Cost Anomaly Detection | ❌ **Missing** |
| **L14** | **Audit** | Valuation Audit Trail | ⚠️ **Partial** (Via Txn History) |
| **L15** | **Ops** | High-Volume Processor | ❌ **Missing** |

### Dimension 2: Receipt Accounting (The Bridge)
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L1** | **Domain** | Receipt Accounting | ❌ **Missing Logic** |
| **L3** | **Capability** | Accrual Accounting (Receipt) | ❌ **Missing** |
| **L10** | **Object** | Receipt Accounting Distributions | ❌ **Missing** |
| **L12** | **Logic** | 3-Way Match Variance (IPV) | ❌ **Missing** |

### Dimension 3: Manufacturing Costing (WIP)
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L1** | **Domain** | WIP Costing | ❌ **Missing** |
| **L3** | **Capability** | Resource & Overhead Absorption | ❌ **Missing** |
| **L12** | **Logic** | Work Order Variance (Usage/Efficiency) | ❌ **Missing** |

---

## 4. Financial & Audit Risks
1.  **Valuation Accuracy**: Without strict FIFO/Avg logic, the `On Hand Value` metric is an estimate at best.
2.  **Period Cutoff**: No "Cost Period" control means backdated transactions could alter finalized financial reports.
3.  **Un-invoiced Receipts**: Without Receipt Accounting, the liability for Received-Not-Invoiced (RNI) goods is not tracked in GL.

---

## 5. Remediation Roadmap (Build-Ready)

### Phase 1: Foundation (Structure)
1.  **Extract Module**: Create `modules/cost-management`. Reference `Inventory` but do not live inside it.
2.  **Master Data**: Create `CostBooks`, `CostElements`, `CostProfiles`.
3.  **Ledger Integration**: Create `CostDistribution` entity (The bridge to GL).

### Phase 2: Receipt Accounting (The Bridge)
1.  **Receipt Listener**: Listen to `ReceiptCreated` events.
2.  **Accrual Engine**: Generate `Dr Inventory / Cr Accrual` distributions.
3.  **IPV Engine**: When AP Invoice arrives, calculate Invoice Price Variance.

### Phase 3: Cost Processor (The Brain)
1.  **Cost Processor**: Build the engine that runs FIFO/Avg calculations batch or real-time.
2.  **Standard Costing**: Build `ItemCost` definition tables for Standard Cost method.

### Phase 4: Intelligence & UI
1.  **Cost Dashboard**: View Valuation by Org/Subinv/Item.
2.  **AI Analyst**: Detect margin erosion or PPV anomalies.

---

## 6. Execution Plan
**STOP.** Needs explicit user approval to proceed with creating the `Cost Management` module structure. This is a significant architectural expansion.
