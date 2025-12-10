#!/bin/bash

# Batch generator script - Run this to create all 41 industry pages and docs
# Usage: bash BATCH_GENERATE_INDUSTRIES.sh

INDUSTRIES=(
  "Audit & Compliance"
  "Automotive"
  "Banking & Finance"
  "Business Services"
  "Carrier & Shipping"
  "Clinical & Healthcare"
  "Credit & Lending"
  "Education"
  "Energy & Utilities"
  "Equipment & Manufacturing"
  "Events & Conferences"
  "Export & Import"
  "Fashion & Apparel"
  "Finance & Investment"
  "Food & Beverage"
  "Freight & Logistics"
  "Government & Public Sector"
  "Healthcare & Life Sciences"
  "Hospitality & Travel"
  "Insurance"
  "Laboratory Services"
  "Laboratory Technology"
  "Logistics & Transportation"
  "Manufacturing & Operations"
  "Marketing & Advertising"
  "Media & Entertainment"
  "Pharmacy & Pharmaceuticals"
  "Portal & Digital Services"
  "Property & Real Estate"
  "Real Estate & Construction"
  "Retail & E-Commerce"
  "Security & Defense"
  "Shipment Management"
  "Shipping & Maritime"
  "Telecom & Technology"
  "Training & Development"
  "Transportation & Mobility"
  "Travel & Tourism"
  "Vehicle & Automotive"
  "Warehouse & Storage"
  "Wholesale & Distribution"
)

echo "🚀 Batch Generator: Creating pages and docs for all ${#INDUSTRIES[@]} industries..."
echo ""

for INDUSTRY in "${INDUSTRIES[@]}"; do
  SLUG=$(echo "$INDUSTRY" | tr '[:upper:]' '[:lower:]' | tr ' &' '-' | sed 's/[^a-z0-9-]//g')
  PAGE_NAME=$(echo "$INDUSTRY" | sed 's/ //g')
  
  echo "📄 Generating: $INDUSTRY ($SLUG)"
  
  # Create industry page
  cat > "client/src/pages/Industry${PAGE_NAME}.tsx" << 'EOF'
import IndustryPage from "@/pages/IndustryTemplate";

const industryConfig = {
  industry: "REPLACE_INDUSTRY_NAME",
  description: "Transform your REPLACE_INDUSTRY operations with NexusAI's comprehensive ERP platform featuring AI-driven automation, real-time analytics, and industry-specific modules.",
  modules: [
    "Financial Management",
    "Supply Chain & Procurement",
    "Inventory Management",
    "Sales & CRM",
    "HR & Payroll",
    "Manufacturing & Production",
    "Quality Control",
    "Compliance & Governance",
    "Business Intelligence",
    "AI-Powered Automation"
  ],
  benefits: [
    "✨ AI-driven recommendations for faster decision making",
    "🎯 Industry-specific workflows pre-configured",
    "⚡ 50% faster implementation than traditional ERP",
    "📊 Real-time analytics across all departments",
    "🔒 Enterprise-grade security and compliance",
    "💰 Transparent pricing with no hidden costs",
    "🌍 Multi-language & multi-currency support",
    "📱 Mobile-first design for on-the-go access"
  ],
  processFlows: [
    {
      name: "Order-to-Cash Process",
      steps: [
        "Receive sales order from customer",
        "Validate stock availability",
        "Create picking list for warehouse",
        "Pack and ship order",
        "Generate invoice automatically",
        "Record payment and reconcile"
      ]
    },
    {
      name: "Procure-to-Pay Process",
      steps: [
        "Create purchase requisition",
        "Send RFQ to suppliers",
        "Receive and approve quotes",
        "Create purchase order",
        "Receive goods and inspect quality",
        "Match invoice with PO and receipt",
        "Process payment with discount tracking"
      ]
    }
  ]
};

export default function IndustryPage() {
  return <IndustryPage {...industryConfig} />;
}
EOF
  
  # Create technical documentation
  cat > "DOCS/INDUSTRY_${SLUG}_TECHNICAL.md" << 'EOF'
# REPLACE_INDUSTRY Technical Documentation

## Industry Overview
- **Primary Modules**: Financial Management, Supply Chain, Inventory, Sales, HR, Manufacturing
- **Typical Users**: Finance, Operations, Sales, HR, Compliance teams
- **Key Workflows**: Order-to-Cash, Procure-to-Pay, Production Planning, Financial Closing

## Database Schema

### Core Tables
- `REPLACE_INDUSTRY_customers` - Customer master data
- `REPLACE_INDUSTRY_vendors` - Vendor/supplier data  
- `REPLACE_INDUSTRY_orders` - Sales/purchase orders
- `REPLACE_INDUSTRY_inventory` - Inventory tracking
- `REPLACE_INDUSTRY_financials` - GL, budgets, forecasts
- `REPLACE_INDUSTRY_employees` - HR & payroll data
- `REPLACE_INDUSTRY_compliance` - Compliance rules & audit logs

## API Endpoints

### Sales APIs
- `GET /api/REPLACE_SLUG/orders` - List all orders
- `POST /api/REPLACE_SLUG/orders` - Create new order
- `GET /api/REPLACE_SLUG/orders/:id` - Get order details
- `PUT /api/REPLACE_SLUG/orders/:id` - Update order
- `DELETE /api/REPLACE_SLUG/orders/:id` - Cancel order

### Inventory APIs
- `GET /api/REPLACE_SLUG/inventory` - List inventory items
- `POST /api/REPLACE_SLUG/inventory/adjust` - Adjust stock levels
- `GET /api/REPLACE_SLUG/inventory/forecast` - Demand forecasting
- `POST /api/REPLACE_SLUG/inventory/replenish` - Trigger replenishment

### Finance APIs
- `GET /api/REPLACE_SLUG/financials/ledger` - General ledger
- `POST /api/REPLACE_SLUG/financials/journal-entry` - Create journal entry
- `GET /api/REPLACE_SLUG/financials/balance-sheet` - Balance sheet report
- `GET /api/REPLACE_SLUG/financials/income-statement` - Income statement
- `POST /api/REPLACE_SLUG/financials/budget` - Create budget

## Automation Templates

### Template 1: Auto-Invoice Generation
- **Trigger**: Order shipped
- **Action**: Generate invoice, send to customer, record in GL
- **Frequency**: Real-time

### Template 2: Low Stock Alert
- **Trigger**: Inventory < reorder point
- **Action**: Create PO to supplier, notify operations team
- **Frequency**: Daily check

### Template 3: Payment Reminder
- **Trigger**: Invoice overdue > 30 days
- **Action**: Send payment reminder email, escalate to collections
- **Frequency**: Daily

### Template 4: Financial Close Automation
- **Trigger**: Month-end
- **Action**: Reconcile accounts, create consolidation entries, prepare closing reports
- **Frequency**: Monthly

## User Roles & Permissions

| Role | Modules | Permissions |
|------|---------|-------------|
| Finance Manager | Finance, Compliance | Full access to GL, budgets, reports, audit logs |
| Sales Manager | Sales, Orders, CRM | Create/edit orders, view analytics, manage pipelines |
| Operations Manager | Inventory, Supply Chain | Manage stock, create POs, view forecasts |
| HR Manager | HR, Payroll | Manage employees, process payroll, approve leave |
| Executive | All | Read-only dashboard access to all modules |
| Compliance Officer | Compliance, Audit | Monitor compliance rules, review audit logs |

## Demo Data Seeding

When demo environment is created, the following sample data is populated:

- **100** customers across 5 segments
- **50** vendors/suppliers  
- **1,000** products with pricing tiers
- **500** sample orders (various statuses)
- **1,000** inventory records
- **50** employees across departments
- **100** GL accounts with balances
- **12** months of historical transactions

## Integration Points

### External Systems
- **Payment Gateway**: Stripe, PayPal - process order payments
- **Email Service**: SendGrid - invoice delivery, notifications
- **Analytics**: Google Analytics - track dashboard usage
- **Inventory Sync**: Shopify, WooCommerce - sync stock levels
- **Accounting**: Xero, QuickBooks - export GL entries

### Internal APIs
- **Authentication**: OAuth with x-tenant-id, x-user-id headers
- **Rate Limiting**: 1000 req/min per tenant
- **Webhooks**: Order events, payment confirmations, inventory changes

## Deployment Checklist

- [ ] Create PostgreSQL schema with demo tables
- [ ] Seed demo data (100 customers, 50 vendors, 1000 products)
- [ ] Create demo user credentials (username: demo-REPLACE_SLUG, password: auto-generated)
- [ ] Generate demo link (https://nexusai.replit.dev/demo/REPLACE_SLUG)
- [ ] Send demo credentials email to requester
- [ ] Configure retention policy (30-day expiration)
- [ ] Set up monitoring & health checks
- [ ] Enable audit logging for all transactions

## Support & Documentation

- **Knowledge Base**: See `/docs/REPLACE_SLUG-knowledge-base.md`
- **FAQ**: See `/docs/REPLACE_SLUG-faq.md`
- **API Reference**: See `/docs/REPLACE_SLUG-api.md`

EOF

done

echo ""
echo "✅ Batch generation complete!"
echo "📊 Generated ${#INDUSTRIES[@]} industry pages"
echo "📚 Generated ${#INDUSTRIES[@]} technical documentation files"
echo ""
echo "📝 Next steps:"
echo "1. Run: npm run db:push"
echo "2. Restart app workflow"
echo "3. Visit: http://localhost:5000/industries"
echo "4. Click 'Request Demo' for any industry"
