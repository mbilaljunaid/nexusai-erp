# API Documentation

NexusAIFirst ERP provides a comprehensive REST API for all platform functionality.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## Authentication

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "user@example.com",
    "role": "admin"
  }
}
```

### Logout

```http
POST /api/auth/logout
```

### Get Current User

```http
GET /api/auth/user
```

---

## Form Data API

### Generic Form Endpoints

All forms use a consistent API pattern:

#### Get Form Data
```http
GET /api/forms/:formType
```

#### Create Form Entry
```http
POST /api/forms/:formType
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

#### Update Form Entry
```http
PUT /api/forms/:formType/:id
Content-Type: application/json

{
  "field1": "updated-value"
}
```

#### Delete Form Entry
```http
DELETE /api/forms/:formType/:id
```

---

## Module APIs

### CRM Module

#### Leads
```http
GET    /api/crm/leads
POST   /api/crm/leads
GET    /api/crm/leads/:id
PUT    /api/crm/leads/:id
DELETE /api/crm/leads/:id
```

#### Customers
```http
GET    /api/crm/customers
POST   /api/crm/customers
GET    /api/crm/customers/:id
PUT    /api/crm/customers/:id
DELETE /api/crm/customers/:id
```

#### Opportunities
```http
GET    /api/crm/opportunities
POST   /api/crm/opportunities
GET    /api/crm/opportunities/:id
PUT    /api/crm/opportunities/:id
```

---

### Finance Module

#### GL Entries
```http
GET    /api/finance/gl-entries
POST   /api/finance/gl-entries
```

#### Invoices
```http
GET    /api/finance/invoices
POST   /api/finance/invoices
GET    /api/finance/invoices/:id
PUT    /api/finance/invoices/:id
```

#### Budgets
```http
GET    /api/finance/budgets
POST   /api/finance/budgets
PUT    /api/finance/budgets/:id
```

---

### HR Module

#### Employees
```http
GET    /api/hr/employees
POST   /api/hr/employees
GET    /api/hr/employees/:id
PUT    /api/hr/employees/:id
```

#### Leave Requests
```http
GET    /api/hr/leave-requests
POST   /api/hr/leave-requests
PUT    /api/hr/leave-requests/:id/approve
PUT    /api/hr/leave-requests/:id/reject
```

#### Timesheets
```http
GET    /api/hr/timesheets
POST   /api/hr/timesheets
PUT    /api/hr/timesheets/:id
```

---

### Supply Chain Module

#### Products
```http
GET    /api/supply-chain/products
POST   /api/supply-chain/products
GET    /api/supply-chain/products/:id
PUT    /api/supply-chain/products/:id
```

#### Purchase Orders
```http
GET    /api/supply-chain/purchase-orders
POST   /api/supply-chain/purchase-orders
GET    /api/supply-chain/purchase-orders/:id
PUT    /api/supply-chain/purchase-orders/:id
```

#### Vendors
```http
GET    /api/supply-chain/vendors
POST   /api/supply-chain/vendors
PUT    /api/supply-chain/vendors/:id
```

---

### Projects Module

#### Projects
```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
```

#### Tasks
```http
GET    /api/projects/:projectId/tasks
POST   /api/projects/:projectId/tasks
PUT    /api/projects/:projectId/tasks/:taskId
```

---

## Advanced APIs

### ERP Advanced

#### Bank Reconciliation
```http
POST /api/erp/advanced/bank-reconciliation/reconcile
Content-Type: application/json

{
  "bankStatementId": "stmt-123",
  "accountId": "acc-456"
}
```

#### Multi-Entity Consolidation
```http
POST /api/erp/advanced/multi-entity/consolidate/:parentEntityId
```

#### Tax Engine
```http
POST /api/erp/advanced/tax-engine/calculate
Content-Type: application/json

{
  "amount": 1000,
  "jurisdiction": "US-CA",
  "productType": "goods"
}
```

---

### Analytics API

#### Get KPI
```http
GET /api/analytics/kpi/:kpiName
```

#### Generate Report
```http
POST /api/analytics/report
Content-Type: application/json

{
  "reportType": "sales-summary",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

---

### Compliance API

#### Get Rules
```http
GET /api/compliance/rules
```

#### Check Compliance
```http
POST /api/compliance/check/:industryId
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Rate Limiting

- **Default**: 100 requests per minute
- **Authenticated**: 1000 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Pagination

List endpoints support pagination:

```http
GET /api/crm/leads?page=1&limit=20
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Filtering & Sorting

```http
GET /api/crm/leads?status=active&sort=-createdAt
```

- Use `-` prefix for descending sort
- Multiple filters with `&`

---

## Webhooks

Register webhooks for real-time events:

```http
POST /api/integration/webhook/register
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["lead.created", "invoice.paid"]
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
const response = await fetch('/api/crm/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc'
  })
});

const data = await response.json();
```

### cURL

```bash
curl -X POST https://your-domain.com/api/crm/leads \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

---

## Support

For API support, open an issue on [GitHub](https://github.com/mbilaljunaid/nexusai-erp/issues).
