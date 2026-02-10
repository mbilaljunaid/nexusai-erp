

# NexusAI Consolidation: Deep Audit & Unification Plan

## Part 1: Complete AI Audit

| # | AI Service / Component | Module | Location | Wiring Status |
|---|------------------------|--------|----------|---------------|
| 1 | **NexusAI Central Agent** (Provider-configurable chat with streaming, tool execution, conversation persistence) | Cross-Module (Central) | `server/routes/nexus-ai.ts`, `server/services/nexus-tool-executor.ts`, `src/contexts/NexusAIContext.tsx`, `src/components/NexusAIPanel.tsx` | **WIRED** - Fully connected to configurable AI provider from Platform Admin. Streaming SSE, RBAC tool execution, conversation history. Currently handles 7 tools. |
| 2 | **AIService** (Legacy AI agent - intent parsing via heuristics, action execution for GL/AP/AR/FA, invoice OCR extraction) | Finance (GL, AP, AR, FA) | `server/services/ai.ts`, `server/routes/ai.ts` | **WIRED** - Hardcoded to OpenAI `gpt-4o` via env vars. Registered at `/api/ai/*`. Has 12 registered actions. |
| 3 | **AgenticService** (Advanced action executor with rollback support - GL, AR, AP, Cash, FA, PPM, Manufacturing) | Finance, Manufacturing, PPM | `server/services/agentic.ts`, `server/routes/agentic.ts` | **WIRED** - No AI provider call (pure heuristic intent parsing + deterministic execution). Registered at `/api/intent/*`. Has 12+ registered actions with rollback hooks. |
| 4 | **CopilotService** (General chat + contextual chat with action execution for projects/leads) | Cross-Module | `server/modules/copilot/services/CopilotService.ts`, `server/modules/copilot/copilot.controller.ts`, `server/modules/copilot/routes.ts` | **WIRED** - Hardcoded to OpenAI `gpt-4o` via env vars. Registered at `/api/copilot/*`. Has project/lead creation capability. |
| 5 | **AIChatWidget** (Frontend floating chat bubble - sends to Copilot `/api/copilot/contextual-chat`) | Cross-Module (UI) | `src/components/AIChatWidget.tsx` | **WIRED** - Mounted globally in `AuthenticatedLayout`. Route-aware context detection. **Overlaps with NexusAIPanel.** |
| 6 | **AIGuide** (HR-specific sidebar assistant - queries leave, timesheets, team metrics) | HR / WFM | `src/components/hr/AIGuide.tsx`, `server/services/AIQueryService.ts` | **WIRED** - Mounted globally in `AuthenticatedLayout`. Uses deterministic query routing (no LLM). Calls HR-specific endpoints. |
| 7 | **CrmAiService** (Opportunity analysis - win probability, risks, sentiment) | CRM | `server/services/CrmAiService.ts` | **WIRED** - Hardcoded to OpenAI `gpt-4o` via shared `openai` instance from `ai.ts`. Called from CRM routes. |
| 8 | **ArAiService** (Payment date prediction, collection strategy, collection email generation) | AR (Finance) | `server/services/ar-ai.ts`, `server/routes/ar-ai.ts` | **WIRED** - Payment prediction is heuristic. Email generation uses hardcoded OpenAI `gpt-4o`. Registered at `/api/ar/ai/*`. |
| 9 | **IntercompanyAiService** (Batch anomaly detection - high value, unusual currency, duplicates) | Intercompany | `server/services/ic-ai.ts` | **WIRED** - Pure rule-based/heuristic (no LLM). Called by `IntercompanyService` during batch creation. |
| 10 | **SourcingAIService** (RFQ bid analysis - outlier detection, risk scoring) | SCM / Procurement | `server/services/SourcingAIService.ts` | **WIRED** - Pure statistical analysis (Z-score, standard deviation). No LLM. |
| 11 | **AnomalyDetectionService** (General Z-score anomaly detection for PO lines, inventory) | SCM / Procurement | `server/services/AnomalyDetectionService.ts` | **WIRED** - Pure math/stats. No LLM. |
| 12 | **TimeAIService** (Schedule forecasting, anomaly detection for time entries) | HR / WFM | `server/services/TimeAIService.ts` | **WIRED** - Heuristic (moving average). No LLM. Registered via `/api/wfm/ai/*`. |
| 13 | **LearningAI** (Skill extraction, course recommendations) | HR / Learning | `server/services/LearningAI.ts` | **WIRED** - Dictionary matching + content-based filtering. No LLM. |
| 14 | **HRPredictiveService** (Attrition forecasting, KPI prediction) | HR / Analytics | `server/services/HRPredictiveService.ts` | **WIRED** - Linear regression mock. No LLM. |
| 15 | **LeaseAiService** (Lease document data extraction) | Real Estate / Lease | `server/services/LeaseAiService.ts` | **WIRED** - Mock/regex extraction. No LLM (placeholder for future). |
| 16 | **LcmAiService** (Landed cost prediction based on historical averages) | Logistics / LCM | `server/modules/lcm/lcm-ai.service.ts` | **WIRED** - Weighted average heuristic. No LLM. |
| 17 | **SalesForecastingService** (Pipeline-weighted revenue forecast) | CRM / Sales | `server/services/SalesForecastingService.ts` | **WIRED** - Pure calculation. No LLM. |
| 18 | **CostPredicter** (Standard cost prediction from production history) | Manufacturing | `server/services/CostPredicter.ts` | **WIRED** - Moving average. No LLM. |
| 19 | **ProcurementAiService** (Spend pattern analysis, delivery delay prediction) | Procurement (NestJS backend) | `backend/src/modules/procurement/procurement-ai.service.ts` | **WIRED** - SQL aggregation. No LLM. NestJS backend only. |
| 20 | **AIService (NestJS)** (Stub for anomaly analysis, insight generation, knowledge base search) | General (NestJS backend) | `backend/src/modules/ai/ai.service.ts` | **STUB** - Returns mock data. Placeholder for LLaMA/Ollama integration. |
| 21 | **AiCopilotService (NestJS)** (Industry insight, config generation, anomaly detection, UAT scripts) | Cross-Module (NestJS backend) | `backend/src/modules/ai/copilot.service.ts` | **PARTIALLY WIRED** - Hardcoded to OpenAI `gpt-4` via env var. Falls back to "AI Offline" if no key. |
| 22 | **CRMCopilot Page** (Standalone CRM AI chat page) | CRM (UI) | `src/pages/CRMCopilot.tsx` | **UI ONLY** - Fetches from `/api/copilot/crm`. Standalone page. |
| 23 | **ERPCopilot Page** (Standalone ERP AI analysis page) | ERP (UI) | `src/pages/ERPCopilot.tsx` | **UI ONLY** - Fetches from `/api/copilot/erp`. Standalone page. |
| 24 | **HRCopilot Page** (Standalone HR AI insights page) | HR (UI) | `src/pages/HRCopilot.tsx` | **UI ONLY** - Fetches from `/api/copilot/erp`. Standalone page. |

### Summary

- **4 separate frontend AI UIs** running simultaneously: NexusAIPanel, AIChatWidget, AIGuide, and 3 standalone Copilot pages
- **3 separate LLM-calling backends**: `ai.ts` (OpenAI hardcoded), `CopilotService.ts` (OpenAI hardcoded), `CrmAiService.ts` (OpenAI hardcoded)
- **1 configurable backend**: `nexus-ai.ts` (reads provider from Platform Admin DB)
- **12+ deterministic/heuristic services** that do NOT call any LLM (pure math/rules)
- **NestJS backend** has its own separate AI services (mostly stubs)

---

## Part 2: Unification Plan

### Phase 1: Single AI Gateway (Backend Consolidation)

**Goal**: All LLM calls go through one provider-configurable gateway.

1. **Create `server/services/nexus-ai-gateway.ts`** - A single function `callAI(messages, options)` that:
   - Reads the active provider config from `ai_provider_configs` table (already exists)
   - Routes to the correct provider SDK (OpenAI, Anthropic, Gemini, etc.)
   - Supports both streaming and non-streaming
   - Returns a unified response format

2. **Rewire existing LLM callers**:
   - `CrmAiService.ts` --> use `nexus-ai-gateway` instead of hardcoded `openai`
   - `ArAiService.generateCollectionEmail()` --> use `nexus-ai-gateway`
   - `ai.ts` (invoice extraction, intent parsing) --> use `nexus-ai-gateway`
   - `CopilotService.ts` --> deprecate entirely, merge into NexusAI routes

3. **Keep deterministic services as-is** (items 9-18 above) - they are rule-based and don't need AI provider configuration. They will be registered as NexusAI tools instead.

### Phase 2: Single UI (Frontend Consolidation)

**Goal**: One NexusAIPanel replaces all other AI UIs.

1. **Remove `AIChatWidget`** and `AIChatWidgetWrapper` from `App.tsx`
2. **Remove `AIGuide`** from `App.tsx` - merge its HR query capabilities as NexusAI tools
3. **Deprecate standalone Copilot pages** (`CRMCopilot.tsx`, `ERPCopilot.tsx`, `HRCopilot.tsx`) - redirect to NexusAI panel with pre-set module context
4. **Enhance NexusAIPanel** with:
   - Multi-page context selector (dropdown/chips to select Finance + HR + CRM context simultaneously)
   - Manual context input field (free-text "I'm working on Q1 budget for marketing department")
   - Module-specific quick actions surfaced as buttons

### Phase 3: Comprehensive Tool Registry (All Module Actions)

**Goal**: NexusAI can execute actions across ALL modules with RBAC.

Expand `nexus-tool-executor.ts` from 7 tools to cover all modules:

```text
Current (7 tools):
  create_journal_entry, analyze_account_balance, score_lead,
  analyze_opportunity, recommend_courses, create_task, forecast_demand

New tools to add (~25+):
  FINANCE: create_ap_invoice, check_ap_status, create_ar_invoice,
           check_ar_balance, run_depreciation, create_asset,
           detect_anomalies, explain_variance, close_period
  CRM:     analyze_opportunity, generate_collection_email,
           get_forecast_summary, create_lead
  HR:      query_leave_balance, query_timesheet, get_team_metrics,
           get_attrition_forecast, extract_skills, recommend_learning
  SCM:     analyze_rfq_bids, predict_delivery_delays, analyze_spend
  MFG:     analyze_yield, predict_shortage, predict_standard_cost
  IC:      detect_ic_anomalies
  LCM:     predict_landed_costs
  LEASE:   extract_lease_data
  PPM:     analyze_project_health
  CASH:    transfer_funds, forecast_cash
```

Each tool maps to:
- A required permission from `PERMISSIONS` in `shared/schema/roles.ts`
- An executor function that calls the existing deterministic service
- An AI-readable description so the LLM can decide when to invoke it

### Phase 4: Enhanced Context System

1. **Auto-context from route** (already exists) - detects current module
2. **Multi-page context selector** - user clicks chips to add Finance + CRM context
3. **Manual context input** - free-text field for business context
4. **Data context injection** - when on a specific record page (e.g., viewing Invoice #1042), automatically include that record's data in the AI prompt

### Phase 5: Permission Updates

Expand `shared/schema/roles.ts` with granular permissions for new modules:

```text
AP_READ, AP_WRITE, AR_READ, AR_WRITE,
FA_READ, FA_WRITE, SCM_WRITE, MFG_READ, MFG_WRITE,
IC_READ, IC_WRITE, LCM_READ, LEASE_READ,
PPM_READ, PPM_WRITE, CASH_READ, CASH_WRITE
```

Update `ROLE_PERMISSIONS` mapping and `TOOL_PERMISSION_MAP` accordingly.

---

## Technical Implementation Sequence

1. Create `nexus-ai-gateway.ts` (centralized LLM caller using DB config)
2. Expand `nexus-tool-executor.ts` with all module tools + permissions
3. Expand `roles.ts` with new granular permissions
4. Rewire `CrmAiService`, `ArAiService`, `ai.ts` to use gateway
5. Remove `AIChatWidget`, `AIGuide` from `App.tsx`
6. Deprecate `CopilotService` and copilot routes
7. Add multi-context selector UI to `NexusAIPanel`
8. Add manual context input to `NexusAIPanel`
9. Update NexusAI system prompt to advertise all available tools
10. Update standalone copilot pages to redirect or embed NexusAI

