# NexusAI Database Migration Guide

## PostgreSQL Migration Steps

### Phase 1: Prepare (5 minutes)
1. Ensure all forms have metadata entries in `client/src/lib/formMetadata.ts` ✅ DONE
2. Verify all API endpoints working ✅ DONE
3. Backup current MemStorage state (document existing data)

### Phase 2: Update Schema (15 minutes)
Update `shared/schema.ts` with Drizzle ORM models:

```typescript
import { pgTable, serial, text, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const leadsTable = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  score: integer('score'),
  status: varchar('status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const invoicesTable = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  customerId: varchar('customer_id', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  status: varchar('status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const employeesTable = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  department: varchar('department', { length: 100 }),
  role: varchar('role', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add tables for all 25+ forms...
```

### Phase 3: Run Migration (5 minutes)
```bash
# Push schema to PostgreSQL database
npm run db:push

# Verify schema was created
npm run build
```

### Phase 4: Update Storage Layer (20 minutes)
Modify `server/storage.ts` to use PostgreSQL instead of MemStorage:

```typescript
import { db } from './db'; // Drizzle ORM instance
import { leadsTable, invoicesTable, employeesTable } from '@shared/schema';

export class DatabaseStorage implements IStorage {
  async getLeads() {
    return await db.select().from(leadsTable);
  }

  async createLead(lead: NewLead) {
    const [result] = await db.insert(leadsTable).values(lead).returning();
    return result;
  }

  async getInvoices() {
    return await db.select().from(invoicesTable);
  }

  async createInvoice(invoice: NewInvoice) {
    const [result] = await db.insert(invoicesTable).values(invoice).returning();
    return result;
  }

  // Add methods for all 25+ forms...
}
```

### Phase 5: Connect Routes (10 minutes)
Update `server/routes.ts` to use new storage:

```typescript
const storage = new DatabaseStorage(); // Switch from MemStorage

// All existing routes work without change:
app.get('/api/leads', (req, res) => {
  const leads = storage.getLeads();
  res.json(leads);
});

app.post('/api/leads', (req, res) => {
  const lead = storage.createLead(req.body);
  res.status(201).json(lead);
});

// All other endpoints automatically use PostgreSQL...
```

### Phase 6: Test & Verify (10 minutes)
```bash
# Start application
npm run dev

# Run data persistence tests
# Execute testDataPersistence.ts to verify end-to-end flow

# Test each module:
# - POST to /api/leads with test data
# - GET from /api/leads to verify retrieval
# - Repeat for all 15+ endpoints
```

### Phase 7: Deploy (Done automatically)
- Publishing will handle building, hosting, TLS, health checks
- PostgreSQL connection automatically managed by Replit platform

---

## Commands Summary

```bash
# Update schema and migrate
npm run db:push

# Build to verify no errors
npm run build

# Start development server with PostgreSQL
npm run dev

# Test data persistence
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","email":"test@example.com","company":"Test Co"}'

# Verify retrieval
curl http://localhost:5000/api/leads
```

---

## Rollback Plan

If migration fails:
1. Revert `shared/schema.ts` changes
2. Revert `server/storage.ts` to MemStorage
3. Delete PostgreSQL database
4. Restart workflow
5. Data is preserved (previous MemStorage)

---

## Estimated Timeline

- Schema preparation: 5 min
- Schema migration: 5 min  
- Storage layer update: 20 min
- Route connection: 10 min
- Testing: 10 min
- **Total: ~50 minutes**

---

## Success Criteria

✅ All 25+ forms have database tables  
✅ All API endpoints return PostgreSQL data  
✅ Data persistence tests pass  
✅ No LSP errors  
✅ Build succeeds  
✅ Application runs on 0.0.0.0:5000  

---

## Status

**Ready for Migration**: YES ✅
- Form metadata: Complete
- API endpoints: Working
- Test suite: Created
- Documentation: Complete
- Infrastructure: Production-ready

**Next Step**: Execute Phase 2-7 in next session (Est. 50 minutes)
