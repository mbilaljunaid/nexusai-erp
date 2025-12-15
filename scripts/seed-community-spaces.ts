import { db } from "../server/db";
import { sql } from "drizzle-orm";

const moduleSpaces = [
  { slug: "crm-sales", name: "CRM & Sales", icon: "Users", description: "Customer relationship management and sales operations" },
  { slug: "finance-accounting", name: "Finance & Accounting", icon: "DollarSign", description: "General ledger, AP/AR, financial reporting" },
  { slug: "human-resources", name: "Human Resources", icon: "UserCheck", description: "HR management, employee records, benefits" },
  { slug: "payroll", name: "Payroll", icon: "Wallet", description: "Payroll processing, tax calculations, compensation" },
  { slug: "procurement", name: "Procurement", icon: "ShoppingCart", description: "Purchasing, vendor management, RFQs" },
  { slug: "inventory", name: "Inventory Management", icon: "Package", description: "Stock control, warehousing, inventory tracking" },
  { slug: "manufacturing", name: "Manufacturing", icon: "Factory", description: "Production planning, BOM, shop floor" },
  { slug: "supply-chain", name: "Supply Chain", icon: "Truck", description: "Logistics, shipping, supply chain optimization" },
  { slug: "project-management", name: "Project Management", icon: "FolderKanban", description: "Project planning, resource allocation, tracking" },
  { slug: "field-service", name: "Field Service", icon: "Wrench", description: "Field operations, work orders, technician dispatch" },
  { slug: "service-desk", name: "Service Desk", icon: "Headphones", description: "IT service management, ticketing, support" },
  { slug: "marketing", name: "Marketing", icon: "Megaphone", description: "Campaign management, lead generation, marketing automation" },
  { slug: "analytics-bi", name: "Analytics & BI", icon: "BarChart3", description: "Business intelligence, reporting, dashboards" },
  { slug: "ai-copilot", name: "AI Copilot", icon: "Bot", description: "AI-powered assistance, automation, insights" },
  { slug: "compliance-governance", name: "Compliance & Governance", icon: "Shield", description: "Regulatory compliance, audit, risk management" },
  { slug: "security-access", name: "Security & Access", icon: "Lock", description: "Security settings, RBAC, authentication" },
  { slug: "integrations-api", name: "Integrations & API", icon: "Plug", description: "Third-party integrations, API development" },
  { slug: "workflow-automation", name: "Workflow & Automation", icon: "Workflow", description: "Business process automation, workflows" },
  { slug: "document-management", name: "Document Management", icon: "FileText", description: "Document storage, version control, collaboration" },
  { slug: "quality-management", name: "Quality Management", icon: "BadgeCheck", description: "QA/QC, inspections, certifications" },
  { slug: "asset-management", name: "Asset Management", icon: "HardDrive", description: "Fixed assets, depreciation, maintenance" },
  { slug: "billing-subscriptions", name: "Billing & Subscriptions", icon: "CreditCard", description: "Subscription billing, invoicing, payments" },
  { slug: "mobile-apps", name: "Mobile Apps", icon: "Smartphone", description: "Mobile applications, offline sync" },
  { slug: "data-migration", name: "Data Migration", icon: "Database", description: "Data import/export, migration tools" },
];

const industrySpaces = [
  { slug: "ind-healthcare", name: "Healthcare", icon: "Heart", description: "Hospitals, clinics, healthcare providers" },
  { slug: "ind-pharmaceuticals", name: "Pharmaceuticals", icon: "Pill", description: "Drug manufacturing, clinical trials, FDA compliance" },
  { slug: "ind-life-sciences", name: "Life Sciences", icon: "Dna", description: "Biotech, research labs, medical devices" },
  { slug: "ind-banking", name: "Banking", icon: "Landmark", description: "Retail banking, commercial banking, lending" },
  { slug: "ind-insurance", name: "Insurance", icon: "ShieldCheck", description: "Insurance carriers, claims, underwriting" },
  { slug: "ind-capital-markets", name: "Capital Markets", icon: "TrendingUp", description: "Investment banking, trading, asset management" },
  { slug: "ind-retail", name: "Retail", icon: "Store", description: "Retail stores, POS, merchandising" },
  { slug: "ind-ecommerce", name: "E-Commerce", icon: "ShoppingBag", description: "Online retail, marketplaces, fulfillment" },
  { slug: "ind-wholesale", name: "Wholesale & Distribution", icon: "Boxes", description: "Wholesale distribution, B2B sales" },
  { slug: "ind-manufacturing-discrete", name: "Discrete Manufacturing", icon: "Cog", description: "Assembly, discrete production, engineering" },
  { slug: "ind-manufacturing-process", name: "Process Manufacturing", icon: "FlaskConical", description: "Chemical, food processing, batch production" },
  { slug: "ind-automotive", name: "Automotive", icon: "Car", description: "Automotive OEM, parts suppliers, dealerships" },
  { slug: "ind-aerospace", name: "Aerospace & Defense", icon: "Plane", description: "Aviation, defense contractors, aerospace" },
  { slug: "ind-construction", name: "Construction", icon: "Building2", description: "General contractors, construction management" },
  { slug: "ind-real-estate", name: "Real Estate", icon: "Home", description: "Property management, commercial real estate" },
  { slug: "ind-energy", name: "Energy & Utilities", icon: "Zap", description: "Power generation, utilities, renewable energy" },
  { slug: "ind-oil-gas", name: "Oil & Gas", icon: "Fuel", description: "Upstream, midstream, downstream operations" },
  { slug: "ind-mining", name: "Mining & Metals", icon: "Mountain", description: "Mining operations, metal processing" },
  { slug: "ind-chemicals", name: "Chemicals", icon: "Beaker", description: "Chemical manufacturing, specialty chemicals" },
  { slug: "ind-food-beverage", name: "Food & Beverage", icon: "UtensilsCrossed", description: "Food processing, beverage manufacturing" },
  { slug: "ind-consumer-goods", name: "Consumer Goods", icon: "Gift", description: "CPG, FMCG, consumer products" },
  { slug: "ind-fashion", name: "Fashion & Apparel", icon: "Shirt", description: "Clothing, textiles, fashion retail" },
  { slug: "ind-logistics", name: "Logistics & Transportation", icon: "Container", description: "Freight, shipping, 3PL providers" },
  { slug: "ind-airlines", name: "Airlines & Aviation", icon: "PlaneTakeoff", description: "Airlines, airports, aviation services" },
  { slug: "ind-hospitality", name: "Hospitality", icon: "Hotel", description: "Hotels, restaurants, tourism" },
  { slug: "ind-travel", name: "Travel & Tourism", icon: "Map", description: "Travel agencies, tour operators" },
  { slug: "ind-telecom", name: "Telecommunications", icon: "Radio", description: "Telecom carriers, network operators" },
  { slug: "ind-media", name: "Media & Entertainment", icon: "Film", description: "Broadcasting, publishing, entertainment" },
  { slug: "ind-technology", name: "Technology", icon: "Monitor", description: "Software, hardware, IT services" },
  { slug: "ind-professional-services", name: "Professional Services", icon: "Briefcase", description: "Consulting, legal, accounting firms" },
  { slug: "ind-education", name: "Education", icon: "GraduationCap", description: "Schools, universities, EdTech" },
  { slug: "ind-government", name: "Government & Public Sector", icon: "Building", description: "Federal, state, local government" },
  { slug: "ind-nonprofit", name: "Nonprofit & NGO", icon: "HeartHandshake", description: "Nonprofits, foundations, NGOs" },
  { slug: "ind-agriculture", name: "Agriculture", icon: "Wheat", description: "Farming, agribusiness, food production" },
  { slug: "ind-forestry", name: "Forestry & Paper", icon: "TreePine", description: "Forestry, pulp and paper, timber" },
  { slug: "ind-environmental", name: "Environmental Services", icon: "Leaf", description: "Waste management, environmental consulting" },
  { slug: "ind-sports", name: "Sports & Recreation", icon: "Trophy", description: "Sports teams, fitness, recreation" },
  { slug: "ind-gaming", name: "Gaming & Casinos", icon: "Gamepad2", description: "Casinos, gaming, lottery" },
  { slug: "ind-defense", name: "Defense Contractors", icon: "Target", description: "Defense systems, military contractors" },
  { slug: "ind-marine", name: "Marine & Shipping", icon: "Ship", description: "Shipping lines, ports, maritime" },
];

const generalSpaces = [
  { slug: "announcements", name: "Announcements", icon: "Bell", description: "Official NexusAI announcements and updates" },
  { slug: "general-discussion", name: "General Discussion", icon: "MessageCircle", description: "General community discussions" },
  { slug: "feature-requests", name: "Feature Requests", icon: "Lightbulb", description: "Suggest new features and improvements" },
  { slug: "bugs-issues", name: "Bugs & Issues", icon: "Bug", description: "Report bugs and technical issues" },
  { slug: "best-practices", name: "Best Practices", icon: "Sparkles", description: "Share and learn best practices" },
  { slug: "tips-tricks", name: "Tips & Tricks", icon: "Wand2", description: "Productivity tips and shortcuts" },
  { slug: "training-certification", name: "Training & Certification", icon: "Award", description: "Learning resources and certifications" },
  { slug: "jobs-careers", name: "Jobs & Careers", icon: "UserPlus", description: "NexusAI job opportunities and career advice" },
  { slug: "partners", name: "Partner Network", icon: "Handshake", description: "Partner discussions and collaborations" },
  { slug: "app-marketplace", name: "App Marketplace", icon: "LayoutGrid", description: "Discuss marketplace apps and extensions" },
];

async function seedCommunitySpaces() {
  console.log("Seeding community spaces...");
  
  const allSpaces = [...generalSpaces, ...moduleSpaces, ...industrySpaces];
  let created = 0;
  let updated = 0;
  
  for (const space of allSpaces) {
    const existing = await db.execute(sql`
      SELECT id FROM community_spaces WHERE slug = ${space.slug}
    `);
    
    if (existing.rows.length === 0) {
      await db.execute(sql`
        INSERT INTO community_spaces (id, slug, name, description, icon, is_active, created_at)
        VALUES (${`space-${space.slug}`}, ${space.slug}, ${space.name}, ${space.description}, ${space.icon}, true, ${new Date()})
      `);
      created++;
    } else {
      await db.execute(sql`
        UPDATE community_spaces 
        SET name = ${space.name}, description = ${space.description}, icon = ${space.icon}, is_active = true
        WHERE slug = ${space.slug}
      `);
      updated++;
    }
  }
  
  console.log(`Community spaces seeded: ${created} created, ${updated} updated`);
  console.log(`Total spaces: ${allSpaces.length}`);
}

seedCommunitySpaces().then(() => {
  console.log("Done!");
  process.exit(0);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
