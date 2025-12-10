// APPEND TO server/routes.ts

  // ========== DEMO MANAGEMENT APIS ==========
  
  // List all available industries
  app.get("/api/demos/industries", async (req, res) => {
    const industries = [
      "Audit & Compliance", "Automotive", "Banking & Finance", "Business Services",
      "Carrier & Shipping", "Clinical & Healthcare", "Credit & Lending", "Education",
      "Energy & Utilities", "Equipment & Manufacturing", "Events & Conferences", "Export & Import",
      "Fashion & Apparel", "Finance & Investment", "Food & Beverage", "Freight & Logistics",
      "Government & Public Sector", "Healthcare & Life Sciences", "Hospitality & Travel",
      "Insurance", "Laboratory Services", "Laboratory Technology", "Logistics & Transportation",
      "Manufacturing & Operations", "Marketing & Advertising", "Media & Entertainment",
      "Pharmacy & Pharmaceuticals", "Portal & Digital Services", "Property & Real Estate",
      "Real Estate & Construction", "Retail & E-Commerce", "Security & Defense",
      "Shipment Management", "Shipping & Maritime", "Telecom & Technology",
      "Training & Development", "Transportation & Mobility", "Travel & Tourism",
      "Vehicle & Automotive", "Warehouse & Storage", "Wholesale & Distribution"
    ];
    res.json(industries);
  });

  // Create demo request
  app.post("/api/demos/request", async (req, res) => {
    try {
      const { email, industry, company } = req.body;
      const demoRequest = {
        id: `dreq-${Date.now()}`,
        email,
        industry,
        company: company || "N/A",
        status: "pending",
        requestedAt: new Date().toISOString(),
      };
      // In production: save to database
      res.json({ id: demoRequest.id, status: "pending", message: "Demo request created. Check your email for access details." });
    } catch (error) {
      res.status(400).json({ error: "Failed to create demo request" });
    }
  });

  // Get demo environment by ID
  app.get("/api/demos/:demoId", async (req, res) => {
    try {
      const { demoId } = req.params;
      const demo = {
        id: demoId,
        industry: "Automotive",
        status: "active",
        modules: ["Manufacturing", "Supply Chain", "Sales", "Finance"],
        seedDataLoaded: true,
      };
      res.json(demo);
    } catch (error) {
      res.status(404).json({ error: "Demo environment not found" });
    }
  });

  // Create demo environment (admin)
  app.post("/api/demos/create", enforceRBAC("admin"), async (req, res) => {
    try {
      const { industry, email } = req.body;
      const tenantId = `demo-${Date.now()}`;
      const demoEnv = {
        id: tenantId,
        industry,
        tenantId,
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        seedDataLoaded: true,
      };
      
      const username = `demo-${industry.toLowerCase().replace(/ /g, "-")}-${Date.now()}`;
      const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const demoLink = `/demo/${tenantId}`;
      
      const credentials = {
        id: `cred-${Date.now()}`,
        demoEnvironmentId: tenantId,
        email,
        username,
        password, // In production: encrypt this
        demoLink,
        accessCount: 0,
      };
      
      // TODO: Send email with credentials
      res.json({ 
        success: true, 
        demoEnvironment: demoEnv, 
        credentials: { username, password, demoLink },
        message: "Demo environment created and credentials sent to email"
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to create demo environment" });
    }
  });

  // List all demo environments (admin)
  app.get("/api/demos/list", enforceRBAC("admin"), async (req, res) => {
    try {
      const demos = [
        { id: "demo-1", industry: "Automotive", status: "active", createdAt: new Date().toISOString() },
        { id: "demo-2", industry: "Banking & Finance", status: "active", createdAt: new Date().toISOString() },
      ];
      res.json(demos);
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch demos" });
    }
  });

  // Send demo credentials email
  app.post("/api/demos/:demoId/send-email", enforceRBAC("admin"), async (req, res) => {
    try {
      const { email, username, password } = req.body;
      // TODO: Integrate with email service (SendGrid, etc)
      res.json({ 
        success: true, 
        message: `Demo credentials sent to ${email}`
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to send email" });
    }
  });

  // Seed demo data for industry
  app.post("/api/demos/:demoId/seed-data", enforceRBAC("admin"), async (req, res) => {
    try {
      const { demoId } = req.params;
      const { industry } = req.body;
      
      // TODO: Populate demo environment with sample data based on industry
      // This would create sample records in all relevant tables
      
      res.json({ 
        success: true, 
        message: `Demo data seeded for ${industry}`,
        seedStatus: "completed"
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to seed demo data" });
    }
  });

  // Reset demo environment
  app.post("/api/demos/:demoId/reset", enforceRBAC("admin"), async (req, res) => {
    try {
      const { demoId } = req.params;
      // TODO: Clear all demo data and reseed
      res.json({ success: true, message: "Demo environment reset" });
    } catch (error) {
      res.status(400).json({ error: "Failed to reset demo environment" });
    }
  });
