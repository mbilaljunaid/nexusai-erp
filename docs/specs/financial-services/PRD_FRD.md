# FINANCIAL SERVICES INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" Banking, Lending, Wealth Management

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
A bank-grade Core Banking and Wealth Management platform with integrated KYC/AML, Loan Origination, and Real-time portfolio analytics.

### 1.2 Scope
*   **Segments:** Retail Banking, Commercial Lending, Investment Firms, Fintechs.
*   **Key Modules:**
    *   **Core Banking:** Deposit Accounts (Checking/Savings), Ledger, Interest Calc.
    *   **Lending:** LOS (Loan Origination System), Underwriting, Servicing.
    *   **Wealth:** Portfolio Management, Trading (Execution via API), Performance Reporting.
    *   **Compliance:** KYC (Know Your Customer), AML (Anti-Money Laundering), BSA.
    *   **Treasury:** Cash Management, FX.

### 1.3 User Personas
*   **Banker:** Manages customer relationships.
*   **Underwriter:** Assesses credit risk.
*   **Trader/Advisor:** Rebalances portfolios.
*   **Compliance Officer:** Reviews suspicious activity reports (SARs).

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Customer (KYC Profile)
*   **Attributes:** Risk Score (Low/Med/High), PEP (Politically Exposed Person) status.
*   **Documents:** Passport, Utility Bill (stored encrypted).

#### 2.1.2 Account & Transaction
*   **Account:** DDA (Demand Deposit), CD, Loan, Brokerage.
*   **Transaction:** Immutable double-entry ledger. `Debit` = `Credit`.
*   **Balance:** Real-time Available vs. Ledger Balance.

#### 2.1.3 Loan
*   **Lifecycle:** `APPLICATION` -> `UNDERWRITING` -> `APPROVED` -> `ACTIVE` -> `PAID_OFF` -> `DEFAULT`.
*   **Amortization:** Schedule generation (Principal/Interest split).

### 2.2 Workflows

#### 2.2.1 Onboarding (KYC)
1.  **Application:** User submits ID.
2.  **Screening:** AI checks OFAC/Sanctions lists.
3.  **Approval:** Risk Score calculated.
4.  **Creation:** Account opened in Core.

#### 2.2.2 AI Action: Detect Fraud
*   **Trigger:** Transaction created > threshold.
*   **Input:** Velocity (tx per hour), Location mismatch, Merchant Category.
*   **Output:** Flag as "Suspicious". Block card if Confidence > 99%.

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `DETECT_FRAUD`
*   **Description:** Analyze transaction patterns for anomalies.
*   **Action:** `FINANCE.FRAUD.BLOCK_TRANSACTION`
*   **Safety:** Must allow user override via 2FA (SMS/Email).

### 3.2 `CALCULATE_CREDIT_RISK`
*   **Description:** Suggest interest rate based on Cash Flow and Bureau Data.
*   **Action:** `FINANCE.LENDING.SET_RATE`
*   **Input:** Plaid/Yodlee data.

### 3.3 `OPTIMIZE_PORTFOLIO`
*   **Description:** Suggest rebalancing trades to match Target Allocation.
*   **Action:** `FINANCE.WEALTH.CREATE_TRADE_ORDER`
*   **Reversible:** Yes, until market execution.

---

## 4. REPORTING & ANALYTICS
*   **AUM (Assets Under Management):** Net Asset Value of all portfolios.
*   **NIM (Net Interest Margin):** Interest Income - Interest Expense.
*   **NPL (Non-Performing Loans):** Loans > 90 days past due.
*   **Liquidity Ratio:** Liquid Assets / Short-term Liabilities.
