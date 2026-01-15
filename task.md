
# Treasury Phase 1: Core Instruments (Debt & Investments)

- [x] **Step 1: Schema & Infrastructure**
    - [x] Create `shared/schema/treasury.ts` for Counterparties and Deals <!-- id: 100 -->
    - [x] Export schema in `shared/schema/index.ts` <!-- id: 101 -->
    - [x] Create and run `scripts/patch_treasury_schema.ts` <!-- id: 102 -->

- [x] **Step 2: Backend Services**
    - [x] Implement `TreasuryService.listCounterparties` and `createCounterparty` <!-- id: 103 -->
    - [x] Implement `TreasuryService.createDeal` with P&I generation logic <!-- id: 104 -->
    - [x] Implement `TreasuryService.listDeals` with status tracking <!-- id: 105 -->

- [x] **Step 3: UI Implementation**
    - [x] Create `client/src/components/treasury/TreasuryWorkbench.tsx` <!-- id: 106 -->
    - [x] Create `client/src/components/treasury/DealEntrySheet.tsx` <!-- id: 107 -->
    - [x] Create `client/src/components/treasury/CounterpartyManager.tsx` <!-- id: 108 -->
    - [x] Update `BankingTreasury.tsx` to link to new workbench <!-- id: 109 -->

- [x] **Step 4: Verification**
    - [x] Create `scripts/verify_treasury_phase1.ts` <!-- id: 110 -->
    - [x] Verify: Deal lifecycle (Draft -> Confirmed -> Settled) <!-- id: 111 -->
    - [x] Verify: Interest accrual calculations <!-- id: 112 -->

## Next: Phase 2 - Risk Management & In-house Banking
