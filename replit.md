# NexusAI - Enterprise ERP Platform

## Overview
NexusAI is a production-ready Enterprise Resource Planning (ERP) platform designed to manage and automate core business processes. It features 18 end-to-end business processes, 812 configurable forms, and over 50 API endpoints. The platform aims to provide a comprehensive, integrated solution for financial management, supply chain, manufacturing, HR, and sales operations, ensuring compliance, automation, and real-time analytics. Its primary purpose is to streamline enterprise operations, improve efficiency, and provide robust control and visibility across all business functions.

## User Preferences
I want iterative development.
I prefer detailed explanations.
Ask before making major changes.
Do not make changes to folder Z.
Do not make changes to file Y.

## System Architecture
The NexusAI platform is built with a layered architecture:
-   **User Interface**: Comprises 812 dynamic forms. The frontend includes a `PublicProcessHub` dashboard, 18 public process pages, and a universal 5-tab template with reusable components and full navigation.
-   **API Gateway**: Provides generic endpoints for all forms, managing integrations and rate limiting.
-   **Business Logic Engines**: Eight core engines handle functionalities such as GL Posting, Workflow, Approval, Notification, Rules, Analytics, Template generation, and Data Migration.
-   **Data Persistence**: Utilizes `formDataStore` (in-memory Map) for dynamic data, with critical data migrated to PostgreSQL using Drizzle ORM.
-   **Audit & Compliance**: Features full transaction logging and audit trails.

**Technical Implementations and Design Choices:**
-   **Route Files**: Organized into `glRoutes.ts`, `workflowRoutes.ts`, `analyticsRoutes.ts`, `templateRoutes.ts`, `migrationRoutes.ts`, `mobileRoutes.ts`, `apiGatewayRoutes.ts`, and `productionRoutes.ts` to manage specific functionalities.
-   **Process Coverage**: The system encompasses 18 major end-to-end processes, including Procure-to-Pay, Order-to-Cash, Hire-to-Retire, and Month-End Consolidation, each with defined GL account mappings and approval workflows.
-   **Automation**: Implements workflow automation, rule-based logic, automated GL posting, and notification systems.
-   **Integration**: Features generic form API endpoints, cross-form dependencies, real-time data synchronization, and mobile sync capabilities.
-   **Security**: Includes Role-Based Access Control (RBAC), segregation of duties, and encrypted sensitive data.

## External Dependencies
-   **Database**: PostgreSQL (with Drizzle ORM for persistence of critical endpoints).
-   **Frontend Framework**: (Implied, but not explicitly stated, likely React/Vue/Angular given "App.tsx routing").
-   **Development Tools**: Language Server Protocol (LSP) for code quality checks.