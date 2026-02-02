# NexusAI ERP - GL API Reference

## Base URL
`/api/gl`

## Authentication
All endpoints require a simplified User ID injection (pending full AuthZ integration).
Header: `x-user-id: <username>` (Simulated)

## 1. Journals

### POST /api/gl/post
Create and (optionally) Post a Journal Entry.

**Request Body:**
```json
{
  "formId": "manual_journal_entry",
  "formData": {
    "ledgerId": "UUID",
    "category": "Adjustment",
    "currency": "USD",
    "description": "Accrual for Jan",
    "lines": [
      { "account": "01-000-1000", "debit": 100 },
      { "account": "01-000-2000", "credit": 100 }
    ]
  }
}
```

### POST /api/gl/journals/:id/post
Post an existing Draft journal.

**Response:**
```json
{
  "success": true,
  "status": "Processing",
  "message": "Posting initiated in background"
}
```

## 2. Reporting (FSG)

### POST /api/gl/fsg/generate
Generate a Financial Statement.

**Request Body:**
```json
{
  "reportId": "UUID",
  "ledgerId": "UUID",
  "periodName": "Jan-26",
  "format": "JSON"
}
```

**Response:**
```json
{
  "reportName": "Balance Sheet",
  "rows": [...],
  "columns": [...],
  "data": [[100, 200], [300, 400]]
}
```

## 3. Master Data

### GET /api/gl/ledgers
List available ledgers.

### GET /api/gl/ledgers/:id/structure
Get the Chart of Accounts structure (segments, value sets) for a ledger. Used for dynamic UI rendering.

## 4. Error Handling
- **400 Bad Request**: Validation failure (e.g., Unbalanced journal).
- **403 Forbidden**: Data Access Violation.
- **500 Internal Error**: Server-side processing error.
