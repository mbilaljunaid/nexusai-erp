# NexusAI ERP - General Ledger System Architecture

## 1. High-Level Overview
The General Ledger (GL) module is the central repository for financial data, designed around a **Multi-Ledger Architecture** supporting Oracle Fusion standards. It features a unified persistence layer (`FinanceService`) that serves as the single source of truth for all financial transactions.

## 2. Core Components

### 2.1 Ledger Architecture
- **Primary Ledger**: The main record-keeping ledger for a legal entity.
- **Secondary Ledger**: Shadow ledgers for alternative accounting representations (e.g., IFRS vs. GAAP).
- **Reporting Ledger**: Currency-converted views of the primary ledger.
- **Ledger Sets**: Groupings of ledgers for consolidated processing and reporting.

### 2.2 Financial Engines
The system is driven by four key engines:
1.  **Posting Engine (`postJournal`)**: 
    - Validates journals (Period status, CVRs, Intercompany).
    - Updates the **Balances Cube** (`glBalances`).
    - Runs asynchronously for high volume.
2.  **SLA Engine (Subledger Accounting)**:
    - Transforms upstream events (AP Invoices, AR Receipts) into GL Journals.
    - Uses configurable Mapping Sets and Account Rules.
3.  **Revaluation Engine**:
    - Revalues foreign currency balances at period end.
    - Generates unrealized Gain/Loss journals.
4.  **Reporting Engine (FSG)**:
    - Generates financial statements based on Row/Column Sets.
    - Supports dynamic slice-and-dice of the Balances Cube.

## 3. Data Flow Diagram

```mermaid
graph TD
    subgraph "Inputs"
        UI[User Interface] -->|API| GW[API Gateway]
        Ext[External Systems] -->|API| GW
    end

    subgraph "Core Services"
        GW --> Routes[GL Routes]
        Routes --> FS[FinanceService (Single Source of Truth)]
        
        FS -->|Validate| CVR[Cross-Validation Rules]
        FS -->|Check| DAS[Data Access Sets]
        FS -->|Balance| IC[Intercompany Engine]
    end

    subgraph "Storage Layer"
        FS -->|Persist| DB[(PostgreSQL)]
        
        DB --> Journals[gl_journals]
        DB --> Lines[gl_journal_lines]
        DB --> Balances[gl_balances]
    end

    subgraph "Reporting"
        DB --> RepEngine[Reporting Service]
        RepEngine -->|Generate| FSG[Financial Reports]
        RepEngine -->|Analyze| AI[AI Insights]
    end
```

## 4. Key Data Models

| Table | Description |
| :--- | :--- |
| `gl_ledgers` | Definition of Ledgers (Currency, Calendar, COA). |
| `gl_coa_structures` | Dynamic Chart of Accounts definition (Segments, Delimiters). |
| `gl_code_combinations` | Unique combinations of segment values (CCIDs). |
| `gl_journals` | Journal Headers (Source, Category, Status). |
| `gl_journal_lines` | Journal Lines (Debits, Credits, CCID). |
| `gl_balances` | Pre-aggregated balances (Period, CCID, Currency). |

## 5. Security Model
- **RBAC**: Role-Based Access Control (e.g., 'General Accountant', 'Controller').
- **Data Access Sets (DAS)**: Fine-grained security preventing users from accessing specific Balancing Segment Values (e.g., Company '01') even if they have the functionality.

## 6. Integration Points
- **REST API**: All operations exposed via `/api/gl/*`.
- **Async Workers**: Heavy processing (Posting, Mass Allocation) is designed for background execution.
