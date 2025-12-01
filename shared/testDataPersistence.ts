// End-to-End Data Persistence Test Suite
// Tests verify data flows correctly through: Frontend → Validation → API → Storage → Retrieval → Display

export const dataPersistenceTests = {
  // Test 1: Lead Creation & Retrieval
  testLeadPersistence: async () => {
    const testLead = {
      name: "Test Lead",
      email: "test@example.com",
      company: "Test Company",
      score: 85,
      status: "prospect",
    };
    
    // POST: Create lead
    const createResponse = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testLead),
    });
    const created = await createResponse.json();
    
    // GET: Retrieve all leads
    const listResponse = await fetch("/api/leads");
    const leads = await listResponse.json();
    
    // Verify: Created lead exists in list
    const found = leads.find((l: any) => l.email === testLead.email);
    return {
      passed: createResponse.ok && listResponse.ok && found !== undefined,
      created,
      found,
      error: createResponse.ok && listResponse.ok ? null : "Failed to persist lead",
    };
  },

  // Test 2: Invoice Creation & Search
  testInvoicePersistence: async () => {
    const testInvoice = {
      invoiceNumber: "INV-TEST-001",
      customerId: "CUST-001",
      amount: 5000,
      status: "pending",
    };
    
    const createResponse = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testInvoice),
    });
    const created = await createResponse.json();
    
    const listResponse = await fetch("/api/invoices");
    const invoices = await listResponse.json();
    
    const found = invoices.find((i: any) => i.invoiceNumber === testInvoice.invoiceNumber);
    return {
      passed: createResponse.ok && listResponse.ok && found !== undefined,
      created,
      found,
      error: createResponse.ok && listResponse.ok ? null : "Failed to persist invoice",
    };
  },

  // Test 3: Employee Creation & Search
  testEmployeePersistence: async () => {
    const testEmployee = {
      name: "Test Employee",
      email: "emp@test.com",
      department: "Engineering",
      role: "Engineer",
    };
    
    const createResponse = await fetch("/api/hr/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testEmployee),
    });
    const created = await createResponse.json();
    
    const listResponse = await fetch("/api/hr/employees");
    const employees = await listResponse.json();
    
    const found = employees.find((e: any) => e.email === testEmployee.email);
    return {
      passed: createResponse.ok && listResponse.ok && found !== undefined,
      created,
      found,
      error: createResponse.ok && listResponse.ok ? null : "Failed to persist employee",
    };
  },

  // Test 4: Work Order Creation
  testWorkOrderPersistence: async () => {
    const testWorkOrder = {
      title: "Test Work Order",
      description: "Test description",
      assignedTo: "John Doe",
    };
    
    const createResponse = await fetch("/api/manufacturing/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testWorkOrder),
    });
    const created = await createResponse.json();
    
    const listResponse = await fetch("/api/manufacturing/work-orders");
    const workOrders = await listResponse.json();
    
    const found = workOrders.find((wo: any) => wo.title === testWorkOrder.title);
    return {
      passed: createResponse.ok && listResponse.ok && found !== undefined,
      created,
      found,
      error: createResponse.ok && listResponse.ok ? null : "Failed to persist work order",
    };
  },

  // Run all tests
  runAll: async () => {
    const results = {
      lead: await dataPersistenceTests.testLeadPersistence(),
      invoice: await dataPersistenceTests.testInvoicePersistence(),
      employee: await dataPersistenceTests.testEmployeePersistence(),
      workOrder: await dataPersistenceTests.testWorkOrderPersistence(),
    };
    
    const allPassed = Object.values(results).every((r: any) => r.passed);
    return {
      allPassed,
      results,
      summary: allPassed ? "✅ All data persistence tests passed!" : "❌ Some tests failed",
    };
  },
};
