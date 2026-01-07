# NexusAI Enterprise Platform - Master System Architecture

## 1. High-Level Architecture Overview

**Pattern:** Hybrid Monorepo with Domain-Driven Design (DDD) Microservices.
**Scale:** Multi-tenant, 40+ Industry Verticals, Global Deployment.
**Core Principle:** "Zero Broken Surfaces" - Strict Typing, Deterministic AI, Full Observability.

```mermaid
graph TD
    User[Web/Mobile Client] --> CDN[Global CDN]
    CDN --> LB[Load Balancer / Gateway]
    
    subgraph "Frontend Layer (Client)"
        SPA[React + Vite SPA]
        Mobile[React Native (Future)]
    end
    
    LB --> API_Gateway[API Gateway (Nginx/Traefik)]
    
    subgraph "Application Layer (Backend)"
        AuthService[Auth Service (Identity/RBAC)]
        PlatformService[Platform Core (Tenants/Billing)]
        
        subgraph "ERP Core Services"
            ERP_CRM[CRM Module]
            ERP_HR[HR Module]
            ERP_Finance[Finance Module]
            ERP_SCM[Supply Chain (Inv/Proc)]
            ERP_Projects[Projects Module]
        end
        
        subgraph "Advanced Services"
            EPM_Service[EPM & Forecasting]
            Analytics_Service[BI & Analytics]
            CMS_Service[CMS & Web]
        end
        
        subgraph "Vertical Industry Packs"
            Ind_Mfg[Manufacturing Service]
            Ind_Logistics[Logistics Service]
            Ind_Retail[Retail Service]
            Ind_Healthcare[Healthcare Service]
            Ind_Construction[Construction Service]
            Ind_Education[Education Service]
            Ind_RealEstate[Real Estate Service]
            Ind_FinServ[Financial Services Service]
            Ind_Hospitality[Hospitality Service]
            Ind_Consulting[Consulting Service]
        end
    end
    
    subgraph "AI Action Engine (The Brain)"
        AI_Gateway[AI Gateway]
        Intent_Parser[Intent Parser (LLM)]
        Action_Resolver[Action Resolver]
        Safety_Layer[Safety & Validation Layer]
        Executor[Deterministic Executor]
    end
    
    subgraph "Data Layer"
        PrimaryDB[(PostgreSQL - Sharded by Tenant)]
        Cache[(Redis - Session/Hot Data)]
        VectorDB[(ChromaDB/Pinecone - Embeddings)]
        ObjectStore[S3 - Documents/Media]
        AuditLog[(ClickHouse/Elastic - Audit Trails)]
    end
    
    SPA --> API_Gateway
    API_Gateway --> AuthService
    API_Gateway --> PlatformService
    API_Gateway --> ERP_CRM
    API_Gateway --> AI_Gateway
    
    AI_Gateway --> Intent_Parser
    Intent_Parser --> Action_Resolver
    Action_Resolver --> Safety_Layer
    Safety_Layer --> Executor
    Executor --> ERP_CRM
    Executor --> ERP_Finance
```

## 2. Directory Structure (Strict Enforcement)

We enforce a strict monorepo structure using Turborepo/Nx principles.

```
/
├── apps/                          # Deployable Applications/Services
│   ├── web/                       # Main Frontend (React/Vite)
│   ├── platform/                  # Core Platform Service (NestJS)
│   ├── ai/                        # AI Action Engine (NestJS/Python)
│   ├── erp/                       # Core ERP Service (NestJS) - The Backbone
│   ├── manufacturing/             # Vertical: Manufacturing
│   ├── logistics/                 # Vertical: Logistics
│   ├── healthcare/                # Vertical: Healthcare [TODO]
│   ├── retail/                    # Vertical: Retail [TODO]
│   └── ... (Other Verticals)
│
├── packages/                      # Shared Libraries (Zero Runtime Logic where possible)
│   ├── contracts/                 # Shared Types/Interfaces (Strict Zod Schemas)
│   ├── ui/                        # Design System Components (Radix/Framer)
│   ├── logger/                    # Structured Logging
│   └── config/                    # Environment Configuration
│
├── docs/                          # Documentation
│   ├── specs/                     # PRD, Architecture, User Flows
│   └── api/                       # OpenAPI/Swagger Specs
│
└── scripts/                       # CI/CD, DB Migrations, Seeding
```

## 3. Technology Stack

### Frontend
-   **Framework:** React 19 (Vite)
-   **Language:** TypeScript 5.x (Strict)
-   **State Management:** TanStack Query (Server), Zustand (Client)
-   **UI Library:** Tailwind CSS + Radix UI (Shadcn)
-   **Forms:** React Hook Form + Zod
-   **Visualization:** Recharts / Visx

### Backend
-   **Framework:** NestJS (Node.js)
-   **Language:** TypeScript (Strict)
-   **Architecture:** Modular Monolith -> Microservices Strategy
-   **Communication:** REST (Primary), gRPC (Service-to-Service)
-   **Validation:** Zod / Class-Validator

### Data
-   **Primary DB:** PostgreSQL 16 (RLS Enabled)
-   **ORM:** TypeORM / Prisma
-   **Caching:** Redis
-   **Vector Search:** pgvector / ChromaDB

### AI Engine
-   **Model:** GPT-4o / Claude 3.5 Sonnet (via API)
-   **Framework:** LangChain / Custom Agentic Framework
-   **Safety:** Guardrails AI / Internal Validators

## 4. Key Design Decisions

1.  **Shared Contracts Package:**
    *   **Decision:** All DTOs, interfaces, and API response types live in `packages/contracts`.
    *   **Reason:** Guarantees frontend/backend sync. If the backend changes a DTO, the frontend build fails immediately.

2.  **AI as a "Super User":**
    *   **Decision:** The AI engine does NOT write directly to the DB. It calls the exact same Service methods as the REST API.
    *   **Reason:** Ensures validation, RBAC, and audit logging are identical for UI actions and AI actions.

3.  **Multi-Tenancy at Core:**
    *   **Decision:** Every database table must have `tenant_id`. RLS (Row Level Security) or Application-Layer middleware must enforce this on *every* query.
    *   **Reason:** Critical for Enterprise SaaS security.

4.  **Optimistic UI:**
    *   **Decision:** Frontend uses `useMutation` with `onMutate` to update cache immediately.
    *   **Reason:** "Sub-200ms" interaction feel requires masking network latency.

## 5. Security & Governance

*   **Authentication:** OAuth2 / OIDC (Clerk/Auth0 or Custom Provider).
*   **Authorization:** RBAC (Role Based Access Control) with granular permissions (e.g., `invoice:create`, `employee:view_salary`).
*   **Auditability:** EVERY write operation triggers an Audit Log entry containing: `User`, `Timestamp`, `Action`, `Payload`, `IP`, `UserAgent`.

## 6. Scalability Strategy

*   **Horizontal Scaling:** All services are stateless containerized apps (Docker/K8s).
*   **Database Scaling:** Read Replicas for reporting/analytics. Sharding by `tenant_id` for massive tenants.
*   **Async Processing:** Heavy tasks (Reports, Bulk Imports, AI processing) offloaded to BullMQ/Redis queues.
