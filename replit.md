# NexusAIFirst - Enterprise ERP Platform

## Overview
NexusAIFirst is a production-ready Enterprise Resource Planning (ERP) platform designed to manage and automate core business processes. It offers 18 end-to-end business processes, 812 configurable forms, and over 50 API endpoints. The platform provides a comprehensive, integrated solution for financial management, supply chain, manufacturing, HR, and sales operations, ensuring compliance, automation, and real-time analytics. NexusAIFirst targets diverse industries with specialized modules for Healthcare, Manufacturing, Retail & E-Commerce, Banking & Finance, and more.

## User Preferences
- Iterative development approach
- Detailed explanations preferred
- Ask before making major changes
- Do not make changes to folder Z
- Do not make changes to file Y

## System Architecture

### UI/UX Decisions
The frontend uses React with TypeScript, styled with Shadcn/UI and Tailwind CSS for a modern and consistent user interface. Wouter handles client-side routing, and React Hook Form with Zod provides robust form management and validation.

### Technical Implementations
- **Frontend**: React, TypeScript, Wouter, TanStack Query, Shadcn/UI, Tailwind CSS, React Hook Form, Zod.
- **Backend**: Node.js with Express for RESTful API endpoints.
- **Database**: PostgreSQL with Drizzle ORM.
- **Authentication**: Replit Auth integration.
- **Development Tools**: Vite for building, TypeScript for full-stack language consistency, Lucide React for icons.
- **Security**: Implements Role-Based Access Control (RBAC), multi-tenant architecture, session management, audit logging, and data encryption.

### Feature Specifications
NexusAIFirst is built around 18 core end-to-end business processes, including Procure-to-Pay, Order-to-Cash, Hire-to-Retire, Month-End Consolidation, and more. Key modules include CRM & Sales, Finance & Accounting, Human Resources & Payroll, Manufacturing & Production, Supply Chain & Logistics, Project Management, Service & Support, Analytics & BI, AI & Automation, Workflow & Automation, Integration & API, Administration & Security, Marketing & Campaigns, E-Commerce & Retail, and Compliance & Governance. Each module offers a rich set of features to support its respective domain. The platform also includes an AI Copilot and various AI-powered features for insights, automation, and predictive modeling.

### Dynamic Theming System
- **Theme Modes**: Light, Dark, and System (auto-detect) with persistence to localStorage
- **Custom Accent Colors**: 12 preset colors (Rose, Orange, Amber, Emerald, Teal, Cyan, Blue, Indigo, Violet, Purple, Fuchsia, Pink)
- **Implementation**: ThemeProvider.tsx manages theme state and applies CSS variables (--primary, --ring, --sidebar-primary, --sidebar-ring)
- **Settings**: Appearance section in Settings page allows theme and accent color selection with live preview

### AI Copilot Features
- **Multi-Agent Architecture**: Four coordinated agents (Auditor, Planner, Executor, Verifier) for enterprise-grade AI operations
  - **Auditor Agent**: System audit, module mapping, constraint detection, gap analysis
  - **Planner Agent**: Intent classification, execution plan design, RBAC validation, dependency resolution
  - **Executor Agent**: Action execution via storage layer, cross-module coordination, audit logging
  - **Verifier Agent**: State validation, memory reconciliation, conflict handling, factual feedback
- **Enterprise System Prompt**: Context-aware AI with 42 industry templates and 27 enabled modules
- **Industry Coverage (42 industries)**: Healthcare, Pharmaceuticals, Biotech, Medical Devices, Veterinary, Manufacturing, Construction, Logistics, Automotive, Aerospace, Oil & Gas, Retail, Hospitality, Food & Beverage, Fashion, Consumer Goods, Banking, Insurance, Investment, FinTech, Accounting, Legal, Consulting, Architecture, Marketing Agency, HR Services, Technology, Telecommunications, Cybersecurity, Gaming, AI/ML, Education, Government, Nonprofit, Public Health, Utilities, Real Estate, Property Management, Commercial RE, Media, Sports, Film Production, Airlines, Shipping, Trucking, Agriculture, Agribusiness
- **Module Coverage (27 modules)**: Projects, Tasks, Workflows, ERP, EPM, CRM, Finance, HR, Payroll, Analytics, Automation, Emails, Documents, SCM, Quality, Compliance, Marketing, E-Commerce, Service, Field Service, Asset Management, Training, Marketplace, Community, API, DevOps, R&D
- **Real Action Execution**: Creates projects, tasks, leads, invoices via storage layer (not mocks)
- **RBAC Enforcement**: Actions validated against user role (admin/editor/viewer)
- **Audit Logging**: All AI actions logged with user ID, action type, entity, and outcome
- **Context Persistence**: Conversation history persists to localStorage (max 50 messages)
- **Session-Only Authentication**: Role determined from server session, not client context
- **Core Principles**: Action-first behavior, failure transparency, confirmation over assumption, cross-module intelligence
- **Global Availability**: AI Copilot widget accessible on ALL pages throughout the application

### System Design Choices
The system utilizes a modular design to support extensive configurability and scalability. It features a robust API Gateway for managing and securing external integrations. Data governance and compliance monitoring are integrated throughout the platform. The architecture supports multi-tenancy and is designed for high performance, with browser testing confirming fast page loads and API response times.

## External Dependencies
- **Database**: PostgreSQL
- **Authentication**: Replit Auth
- **AI Integrations**: OpenAI (via `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`)