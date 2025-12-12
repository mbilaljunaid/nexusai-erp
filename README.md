# NexusAI ERP - Enterprise AI-First Platform

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![GitHub Stars](https://img.shields.io/github/stars/mbilaljunaid/nexusai-erp)](https://github.com/mbilaljunaid/nexusai-erp/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/mbilaljunaid/nexusai-erp)](https://github.com/mbilaljunaid/nexusai-erp/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

**Open Source AI-Powered Enterprise Resource Planning Platform**

A comprehensive, self-hosted enterprise platform combining ERP, EPM, CRM, HRMS, and 40+ business modules with AI-powered features, multi-language support (12 languages), and industry-specific solutions for 40+ sectors.

## Features

### 12 Core Modules
- **CRM** - Customer Relationship Management
- **Projects** - Project & Task Management
- **Finance** - Financial Management & GL
- **HR** - Human Resource Management
- **Manufacturing** - Production Management
- **Supply Chain** - Logistics & Inventory
- **Sales** - Sales Operations
- **Service** - Customer Service
- **Analytics** - Business Intelligence
- **Compliance** - Regulatory Compliance
- **AI Assistant** - AI-Powered Features

### 30 Complete Pages
- **Core Modules**: Dashboard, ERP, EPM, CRM, Projects, HR, Service, Marketing, Finance, Inventory, Procurement
- **Digital/Web**: Website Builder, Email Management, E-Commerce
- **Analytics & Intelligence**: Analytics & BI, Compliance Dashboard, Advanced Features
- **System Management**: BPM, Integration Hub, System Health, Settings
- **Administration**: Platform Admin, Tenant Admin, Industry Configuration, UAT Automation

### 812 Dynamic Forms
GL Entry, Invoice, Budget Entry, Lead Entry, Employee, Task, Service Ticket, Expense Report, Project, Vendor, Customer, Product, Purchase Order, Leave Request, Opportunity, Timesheet, and many more.

### 30+ Advanced Features
- **ERP**: Bank Reconciliation (AI-powered fuzzy matching), Multi-Entity Consolidation, Tax Engine
- **Finance**: Period Close Automation, FX Translation, Intercompany Eliminations
- **CRM**: Territory Management, CPQ (Configure-Price-Quote), Partner Portal
- **HRMS**: Recruitment (with AI scoring), Learning Management
- **Service**: SLA Management, Knowledge Base
- **Marketing**: Campaign Automation, Drip Campaigns
- **Analytics**: Dashboard Widgets, Report Generation, KPI Tracking
- **Integration**: API Gateway, Workflow Automation, Webhook Processing
- **Compliance**: Multi-framework enforcement (GDPR, HIPAA, SOX, ISO9001, PCI-DSS)

### Industry-Specific Solutions (40+ Industries)
Manufacturing, Retail, Finance, Healthcare, Construction, Wholesale, Telecommunications, Energy, Hospitality, Professional Services, Government, Technology, Media, Agriculture, Education, and more.

### 12-Language Support
English, Spanish, French, German, Chinese, Japanese, Arabic, Portuguese, Hindi, Russian, Thai, Indonesian

## Quick Start

```bash
# Clone the repository
git clone https://github.com/mbilaljunaid/nexusai-erp.git
cd nexusai-erp

# Set up dependencies
npm i

# Configure environment
cp .env.example .env

# Initialize database
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5000` to access the application.

## Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS + Shadcn/UI + Vite
- **Backend**: Node.js + Express.js + PostgreSQL + Drizzle ORM
- **Authentication**: Passport (JWT + Local)
- **AI Integration**: OpenAI for intelligent features
- **State Management**: TanStack Query

### System Requirements
- Node.js 18+
- PostgreSQL 12+
- 2GB RAM minimum

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/getting-started/README.md) | Quick start guide |
| [Architecture](./docs/architecture/README.md) | System architecture overview |
| [Contributing](./CONTRIBUTING.md) | How to contribute |
| [Security](./SECURITY.md) | Security policy |
| [Code of Conduct](./CODE_OF_CONDUCT.md) | Community guidelines |

## API Endpoints

### ERP Advanced
- `POST /api/erp/advanced/bank-reconciliation/reconcile`
- `POST /api/erp/advanced/multi-entity/consolidate/:parentEntityId`
- `POST /api/erp/advanced/tax-engine/calculate`

### Finance Advanced
- `POST /api/finance/advanced/period-close/create/:period`
- `POST /api/finance/advanced/fx-translation/translate`

### CRM Advanced
- `POST /api/crm/advanced/territory/create`
- `POST /api/crm/advanced/cpq/create-quote/:accountId`

### HR Advanced
- `POST /api/hr/advanced/recruitment/create-opening`
- `POST /api/hr/advanced/learning/create-course`

### Analytics & Compliance
- `GET /api/analytics/kpi/:kpiName`
- `POST /api/compliance/check/:industryId`

## Security

### Implemented
- JWT Authentication
- Password Hashing (bcrypt)
- Session Management
- CORS Protection
- Input Validation (Zod schemas)
- Rate Limiting Ready
- Audit Trail Framework

### Production Recommendations
- Enable HTTPS/TLS
- Configure firewall rules
- Set up intrusion detection
- Regular security audits
- Database encryption

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Community

- [GitHub Issues](https://github.com/mbilaljunaid/nexusai-erp/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/mbilaljunaid/nexusai-erp/discussions) - Questions and ideas

## Deployment

### Replit (Native)
- Integrated PostgreSQL
- Built-in authentication
- One-click deployment
- Available at `.replit.app` domain

### Docker
```bash
docker-compose build
docker-compose up -d
```

### Kubernetes
- Stateless backend services
- Horizontal scaling ready
- PostgreSQL replication ready

## License

NexusAI ERP is licensed under the [GNU Affero General Public License v3.0](./LICENSE).

This means you can:
- Use the software for any purpose
- Modify and distribute the source code
- Run the software as a network service

With the requirement that you:
- Disclose source code of modifications
- License modifications under AGPL-3.0
- Provide network users access to source code

## Roadmap

### Current (v2.0)
- All core modules
- Advanced features
- Compliance & UAT
- Multi-language support
- Industry configurations

### Future (v2.1)
- Mobile native apps
- Advanced BI dashboards
- Voice interface
- Blockchain integration
- IoT capabilities

---

**Platform**: NexusAI ERP  
**Version**: 2.0.0  
**Status**: Production Ready  
**License**: [AGPL-3.0](./LICENSE)

Made with care by the NexusAI community
