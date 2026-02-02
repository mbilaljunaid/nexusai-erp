// Industry-specific demo data generators
export const industrySeeds = {
  "Automotive": {
    models: [
      { id: "M001", name: "Sedan Pro", category: "Sedan", price: 25000 },
      { id: "M002", name: "SUV Max", category: "SUV", price: 35000 },
      { id: "M003", name: "Electric EV", category: "EV", price: 45000 }
    ],
    dealers: [
      { id: "D001", name: "Metro Motors", city: "New York", inventory: 150 },
      { id: "D002", name: "City Auto", city: "Los Angeles", inventory: 200 }
    ],
    customers: [
      { id: "C001", name: "John Doe", email: "john@demo.com", phone: "555-0001" },
      { id: "C002", name: "Jane Smith", email: "jane@demo.com", phone: "555-0002" }
    ]
  },
  "Banking": {
    accounts: [
      { id: "ACC001", customer: "John Doe", type: "Checking", balance: 50000 },
      { id: "ACC002", customer: "Jane Smith", type: "Savings", balance: 100000 }
    ],
    loans: [
      { id: "LOAN001", customer: "John Doe", amount: 250000, rate: 3.5 },
      { id: "LOAN002", customer: "Jane Smith", amount: 150000, rate: 2.8 }
    ],
    transactions: [
      { id: "TXN001", account: "ACC001", type: "Deposit", amount: 5000 },
      { id: "TXN002", account: "ACC002", type: "Withdrawal", amount: 2000 }
    ]
  },
  "Healthcare": {
    patients: [
      { id: "P001", name: "Alice Johnson", dob: "1980-05-15", email: "alice@demo.com" },
      { id: "P002", name: "Bob Wilson", dob: "1975-08-20", email: "bob@demo.com" }
    ],
    appointments: [
      { id: "APT001", patient: "P001", doctor: "Dr. Smith", date: "2025-01-15" },
      { id: "APT002", patient: "P002", doctor: "Dr. Jones", date: "2025-01-16" }
    ],
    medications: [
      { id: "MED001", name: "Aspirin", stock: 500, price: 5 },
      { id: "MED002", name: "Ibuprofen", stock: 300, price: 8 }
    ]
  },
  "Retail": {
    products: [
      { id: "SKU001", name: "Running Shoes", category: "Footwear", price: 89.99, stock: 200 },
      { id: "SKU002", name: "T-Shirt", category: "Apparel", price: 29.99, stock: 500 },
      { id: "SKU003", name: "Jeans", category: "Apparel", price: 59.99, stock: 300 }
    ],
    orders: [
      { id: "ORD001", customer: "John Demo", items: 2, total: 179.97, status: "Delivered" },
      { id: "ORD002", customer: "Jane Demo", items: 1, total: 89.99, status: "Processing" }
    ],
    inventory: [
      { id: "INV001", location: "Warehouse A", items: 1500, lastStock: "2025-01-10" }
    ]
  },
  "Manufacturing": {
    bom: [
      { id: "BOM001", product: "Assembly Unit A", components: 15, leadTime: 7 },
      { id: "BOM002", product: "Assembly Unit B", components: 12, leadTime: 5 }
    ],
    workorders: [
      { id: "WO001", product: "Unit A", quantity: 100, status: "In Progress", dueDate: "2025-01-20" },
      { id: "WO002", product: "Unit B", quantity: 50, status: "Scheduled", dueDate: "2025-01-25" }
    ],
    suppliers: [
      { id: "SUP001", name: "Parts Co", leadTime: 7, quality: 98 },
      { id: "SUP002", name: "Supply Ltd", leadTime: 5, quality: 95 }
    ]
  },
  "Education": {
    students: [
      { id: "STU001", name: "Emma Brown", email: "emma@demo.edu", program: "Computer Science" },
      { id: "STU002", name: "Liam Davis", email: "liam@demo.edu", program: "Business Admin" }
    ],
    courses: [
      { id: "CRS001", name: "Data Science", credits: 3, instructor: "Prof. Smith", enrollment: 45 },
      { id: "CRS002", name: "Financial Mgmt", credits: 3, instructor: "Prof. Jones", enrollment: 30 }
    ],
    grades: [
      { id: "GRD001", student: "STU001", course: "CRS001", score: 92, grade: "A" },
      { id: "GRD002", student: "STU002", course: "CRS002", score: 88, grade: "A-" }
    ]
  }
};

export function generateDemoData(industry: string) {
  const seed = industrySeeds[industry as keyof typeof industrySeeds];
  if (!seed) return null;
  
  return {
    industry,
    timestamp: new Date().toISOString(),
    recordCount: Object.values(seed).flat().length,
    data: seed
  };
}

// Marketplace developers seed data
export const marketplaceDeveloperSeeds = [
  {
    userId: "dev-nexus-001",
    companyName: "NexusAIFirst Solutions",
    displayName: "NexusAIFirst Official",
    email: "apps@nexusaifirst.cloud",
    website: "https://nexusaifirst.cloud",
    description: "Official NexusAIFirst first-party apps and integrations",
    status: "approved"
  },
  {
    userId: "dev-healthcare-001",
    companyName: "HealthTech Systems",
    displayName: "HealthTech",
    email: "dev@healthtech.com",
    website: "https://healthtech.com",
    description: "Healthcare technology solutions and integrations",
    status: "approved"
  },
  {
    userId: "dev-fintech-001",
    companyName: "FinFlow Labs",
    displayName: "FinFlow",
    email: "dev@finflow.com",
    website: "https://finflow.com",
    description: "Financial technology and analytics solutions",
    status: "approved"
  },
  {
    userId: "dev-manufacturing-001",
    companyName: "IndustryEdge",
    displayName: "IndustryEdge",
    email: "dev@industryedge.com",
    website: "https://industryedge.com",
    description: "Smart manufacturing and IoT solutions",
    status: "approved"
  },
  {
    userId: "dev-retail-001",
    companyName: "RetailBoost Inc",
    displayName: "RetailBoost",
    email: "dev@retailboost.com",
    website: "https://retailboost.com",
    description: "Retail and e-commerce optimization solutions",
    status: "approved"
  },
  {
    userId: "dev-logistics-001",
    companyName: "LogiFlow Systems",
    displayName: "LogiFlow",
    email: "dev@logiflow.com",
    website: "https://logiflow.com",
    description: "Logistics and supply chain optimization",
    status: "approved"
  },
  {
    userId: "dev-education-001",
    companyName: "EduTech Pro",
    displayName: "EduTech",
    email: "dev@edutech.com",
    website: "https://edutech.com",
    description: "Education technology and learning management",
    status: "approved"
  },
  {
    userId: "dev-ai-001",
    companyName: "AI Accelerate",
    displayName: "AI Accelerate",
    email: "dev@aiaccelerate.com",
    website: "https://aiaccelerate.com",
    description: "AI and machine learning solutions for enterprise",
    status: "approved"
  }
];

// Marketplace apps seed data by industry
export const marketplaceAppSeeds = [
  // Healthcare Apps
  {
    name: "Healthcare Analytics Pro",
    slug: "healthcare-analytics-pro",
    shortDescription: "AI-powered patient analytics and population health insights",
    longDescription: "Comprehensive healthcare analytics platform with patient outcome predictions, population health trends, and clinical decision support. Integrates seamlessly with your EHR systems.",
    tags: ["healthcare", "analytics", "ai", "clinical"],
    supportedIndustries: ["healthcare"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "analytics"
  },
  {
    name: "HIPAA Compliance Manager",
    slug: "hipaa-compliance-manager",
    shortDescription: "Automated HIPAA compliance tracking and reporting",
    longDescription: "Stay compliant with HIPAA regulations through automated auditing, access logging, and compliance reporting. Real-time alerts for potential violations.",
    tags: ["healthcare", "compliance", "hipaa", "security"],
    supportedIndustries: ["healthcare"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  {
    name: "Patient Scheduling AI",
    slug: "patient-scheduling-ai",
    shortDescription: "Smart appointment scheduling with no-show prediction",
    longDescription: "AI-powered scheduling system that optimizes appointment slots, predicts no-shows, and automates patient reminders. Reduces wait times and improves clinic efficiency.",
    tags: ["healthcare", "scheduling", "ai", "automation"],
    supportedIndustries: ["healthcare"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "149",
    subscriptionPriceYearly: "1490",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  // Banking & Finance Apps
  {
    name: "Fraud Detection Engine",
    slug: "fraud-detection-engine",
    shortDescription: "Real-time transaction fraud detection using ML",
    longDescription: "Advanced machine learning engine that detects fraudulent transactions in real-time. Reduces false positives while catching sophisticated fraud patterns.",
    tags: ["banking", "finance", "fraud", "ml", "security"],
    supportedIndustries: ["banking-finance"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "499",
    subscriptionPriceYearly: "4990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "analytics"
  },
  {
    name: "Regulatory Compliance Suite",
    slug: "regulatory-compliance-suite",
    shortDescription: "Multi-jurisdiction banking compliance management",
    longDescription: "Comprehensive compliance management for banking regulations including KYC, AML, SOX, and Basel III. Automated reporting and audit trails.",
    tags: ["banking", "finance", "compliance", "regulatory"],
    supportedIndustries: ["banking-finance"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "finance"
  },
  {
    name: "Credit Risk Analyzer",
    slug: "credit-risk-analyzer",
    shortDescription: "AI-powered credit scoring and risk assessment",
    longDescription: "Machine learning credit risk models that provide accurate scoring, portfolio risk analysis, and predictive default modeling.",
    tags: ["banking", "finance", "credit", "risk", "ai"],
    supportedIndustries: ["banking-finance"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 2,
    categorySlug: "analytics"
  },
  // Manufacturing Apps
  {
    name: "Predictive Maintenance Hub",
    slug: "predictive-maintenance-hub",
    shortDescription: "IoT-powered equipment failure prediction",
    longDescription: "Connect your shop floor equipment and predict failures before they happen. Reduce unplanned downtime by up to 50% with AI-driven maintenance scheduling.",
    tags: ["manufacturing", "iot", "maintenance", "predictive", "ai"],
    supportedIndustries: ["manufacturing"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 3,
    categorySlug: "manufacturing"
  },
  {
    name: "Quality Vision AI",
    slug: "quality-vision-ai",
    shortDescription: "Computer vision for automated quality inspection",
    longDescription: "Deploy AI-powered visual inspection on your production lines. Detect defects in real-time with sub-second response times and 99.5% accuracy.",
    tags: ["manufacturing", "quality", "vision", "ai", "inspection"],
    supportedIndustries: ["manufacturing"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "599",
    subscriptionPriceYearly: "5990",
    status: "approved",
    developerIndex: 3,
    categorySlug: "manufacturing"
  },
  {
    name: "Production Scheduler Pro",
    slug: "production-scheduler-pro",
    shortDescription: "AI-optimized production planning and scheduling",
    longDescription: "Optimize your production schedules with constraint-based AI planning. Balances capacity, materials, and deadlines for maximum throughput.",
    tags: ["manufacturing", "scheduling", "production", "optimization"],
    supportedIndustries: ["manufacturing"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 3,
    categorySlug: "manufacturing"
  },
  // Retail & E-Commerce Apps
  {
    name: "Demand Forecasting Engine",
    slug: "demand-forecasting-engine",
    shortDescription: "ML-powered demand prediction for inventory planning",
    longDescription: "Accurate demand forecasting using machine learning. Reduce stockouts by 40% and overstock by 30% with seasonal and trend-aware predictions.",
    tags: ["retail", "ecommerce", "forecasting", "inventory", "ml"],
    supportedIndustries: ["retail-e-commerce"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 4,
    categorySlug: "analytics"
  },
  {
    name: "Personalization Engine",
    slug: "personalization-engine",
    shortDescription: "AI product recommendations and personalization",
    longDescription: "Deliver personalized shopping experiences with AI-powered product recommendations, dynamic pricing, and targeted promotions.",
    tags: ["retail", "ecommerce", "personalization", "ai", "recommendations"],
    supportedIndustries: ["retail-e-commerce"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 4,
    categorySlug: "sales-crm"
  },
  {
    name: "Omnichannel POS",
    slug: "omnichannel-pos",
    shortDescription: "Unified point-of-sale for all sales channels",
    longDescription: "Seamlessly manage in-store, online, and mobile sales from a single platform. Real-time inventory sync and unified customer profiles.",
    tags: ["retail", "pos", "omnichannel", "sales"],
    supportedIndustries: ["retail-e-commerce"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 4,
    categorySlug: "sales-crm"
  },
  // Logistics & Transportation Apps
  {
    name: "Route Optimizer AI",
    slug: "route-optimizer-ai",
    shortDescription: "AI-powered route planning and optimization",
    longDescription: "Optimize delivery routes considering traffic, weather, and vehicle capacity. Reduce fuel costs by 15% and improve on-time delivery rates.",
    tags: ["logistics", "routing", "optimization", "ai", "transportation"],
    supportedIndustries: ["logistics-transportation"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  {
    name: "Fleet Tracker Pro",
    slug: "fleet-tracker-pro",
    shortDescription: "Real-time fleet tracking and management",
    longDescription: "GPS-enabled fleet tracking with driver behavior monitoring, fuel consumption analytics, and maintenance scheduling.",
    tags: ["logistics", "fleet", "tracking", "gps", "transportation"],
    supportedIndustries: ["logistics-transportation"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "integrations"
  },
  {
    name: "Warehouse Manager Plus",
    slug: "warehouse-manager-plus",
    shortDescription: "Smart warehouse management and optimization",
    longDescription: "AI-optimized warehouse operations including slotting, pick paths, and labor allocation. Increase picking efficiency by 30%.",
    tags: ["logistics", "warehouse", "inventory", "optimization"],
    supportedIndustries: ["logistics-transportation"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "inventory"
  },
  // Education Apps
  {
    name: "Student Success Predictor",
    slug: "student-success-predictor",
    shortDescription: "AI early warning system for at-risk students",
    longDescription: "Identify students at risk of dropping out or failing using machine learning. Enable early intervention with actionable insights.",
    tags: ["education", "analytics", "student", "ai", "retention"],
    supportedIndustries: ["education"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 6,
    categorySlug: "analytics"
  },
  {
    name: "Adaptive Learning Platform",
    slug: "adaptive-learning-platform",
    shortDescription: "Personalized learning paths with AI",
    longDescription: "Create personalized learning experiences that adapt to each student's pace and learning style. Improve outcomes with data-driven curriculum.",
    tags: ["education", "learning", "adaptive", "ai", "personalization"],
    supportedIndustries: ["education"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 6,
    categorySlug: "automation"
  },
  {
    name: "Accreditation Manager",
    slug: "accreditation-manager",
    shortDescription: "Automated accreditation compliance and reporting",
    longDescription: "Streamline accreditation processes with automated data collection, reporting, and compliance tracking for multiple accrediting bodies.",
    tags: ["education", "compliance", "accreditation", "reporting"],
    supportedIndustries: ["education"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 6,
    categorySlug: "automation"
  },
  // Cross-Industry AI Apps
  {
    name: "AI Copilot Assistant",
    slug: "ai-copilot-assistant",
    shortDescription: "Intelligent ERP assistant powered by AI",
    longDescription: "Your AI-powered ERP assistant that answers questions, generates reports, and automates routine tasks using natural language.",
    tags: ["ai", "assistant", "copilot", "automation", "nlp"],
    supportedIndustries: ["healthcare", "banking-finance", "manufacturing", "retail-e-commerce", "logistics-transportation", "education", "government-public-sector"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "99",
    subscriptionPriceYearly: "990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "automation"
  },
  {
    name: "Document Intelligence",
    slug: "document-intelligence",
    shortDescription: "AI document processing and data extraction",
    longDescription: "Automatically extract data from invoices, contracts, and forms using AI. Reduce manual data entry by 90% with intelligent document processing.",
    tags: ["ai", "documents", "ocr", "automation", "extraction"],
    supportedIndustries: ["healthcare", "banking-finance", "manufacturing", "retail-e-commerce", "logistics-transportation", "education", "government-public-sector"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 7,
    categorySlug: "automation"
  },
  {
    name: "Advanced Analytics Dashboard",
    slug: "advanced-analytics-dashboard",
    shortDescription: "Custom BI dashboards with drill-down analytics",
    longDescription: "Build powerful custom dashboards with drag-and-drop ease. Connect to any data source and create real-time visualizations.",
    tags: ["analytics", "bi", "dashboard", "visualization", "reporting"],
    supportedIndustries: ["healthcare", "banking-finance", "manufacturing", "retail-e-commerce", "logistics-transportation", "education", "government-public-sector"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "149",
    subscriptionPriceYearly: "1490",
    status: "approved",
    developerIndex: 0,
    categorySlug: "analytics"
  },
  {
    name: "Workflow Automator",
    slug: "workflow-automator",
    shortDescription: "No-code workflow automation builder",
    longDescription: "Create complex business workflows without coding. Automate approvals, notifications, and data flows across your ERP modules.",
    tags: ["automation", "workflow", "no-code", "integration"],
    supportedIndustries: ["healthcare", "banking-finance", "manufacturing", "retail-e-commerce", "logistics-transportation", "education", "government-public-sector"],
    pricingModel: "freemium",
    price: "0",
    subscriptionPriceMonthly: "99",
    subscriptionPriceYearly: "990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "automation"
  },
  // Government & Public Sector Apps
  {
    name: "Citizen Portal",
    slug: "citizen-portal",
    shortDescription: "Self-service portal for citizen engagement",
    longDescription: "Enable citizens to access services, submit applications, and track requests online. Reduce foot traffic and improve service delivery.",
    tags: ["government", "portal", "citizen", "self-service"],
    supportedIndustries: ["government-public-sector"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "integrations"
  },
  {
    name: "Grant Management System",
    slug: "grant-management-system",
    shortDescription: "End-to-end grant lifecycle management",
    longDescription: "Manage the complete grant lifecycle from application to closeout. Automated compliance tracking and reporting for federal and state grants.",
    tags: ["government", "grants", "compliance", "reporting"],
    supportedIndustries: ["government-public-sector"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "finance"
  },
  // Additional Industry Apps
  {
    name: "Telecom Billing Suite",
    slug: "telecom-billing-suite",
    shortDescription: "Complex billing for telecom services",
    longDescription: "Handle usage-based billing, rate plans, and bundle pricing for telecommunications services. Real-time rating and invoice generation.",
    tags: ["telecom", "billing", "usage", "invoicing"],
    supportedIndustries: ["telecom"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "499",
    subscriptionPriceYearly: "4990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "finance"
  },
  {
    name: "Insurance Claims Processor",
    slug: "insurance-claims-processor",
    shortDescription: "Automated insurance claims processing",
    longDescription: "Streamline claims processing with AI-powered validation, fraud detection, and automated settlements. Reduce processing time by 60%.",
    tags: ["insurance", "claims", "automation", "fraud"],
    supportedIndustries: ["insurance"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "automation"
  },
  {
    name: "Fashion PLM",
    slug: "fashion-plm",
    shortDescription: "Product lifecycle management for fashion",
    longDescription: "Manage your fashion product lifecycle from design to production. Track samples, manage size matrices, and coordinate with suppliers.",
    tags: ["fashion", "plm", "design", "production"],
    supportedIndustries: ["fashion"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 4,
    categorySlug: "manufacturing"
  },
  {
    name: "Dealer Management System",
    slug: "dealer-management-system",
    shortDescription: "Complete dealer network management",
    longDescription: "Manage your dealer network with inventory tracking, sales reporting, and service scheduling. Improve dealer performance and customer satisfaction.",
    tags: ["automotive", "dealer", "inventory", "sales"],
    supportedIndustries: ["automotive"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 3,
    categorySlug: "sales-crm"
  },
  {
    name: "Vehicle Service Tracker",
    slug: "vehicle-service-tracker",
    shortDescription: "Automotive service and warranty management",
    longDescription: "Track vehicle service history, manage warranty claims, and schedule maintenance. Improve customer retention with proactive service reminders.",
    tags: ["automotive", "service", "warranty", "maintenance"],
    supportedIndustries: ["automotive"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 3,
    categorySlug: "automation"
  },
  // Hospitality & Travel
  {
    name: "Hotel Reservation Manager",
    slug: "hotel-reservation-manager",
    shortDescription: "Complete hotel booking and guest management",
    longDescription: "Manage reservations, room inventory, guest profiles, and billing in one unified platform. Integrates with major OTAs and booking engines.",
    tags: ["hospitality", "hotel", "reservations", "booking"],
    supportedIndustries: ["hospitality-travel"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "sales-crm"
  },
  {
    name: "Guest Experience Platform",
    slug: "guest-experience-platform",
    shortDescription: "Personalized guest services and concierge",
    longDescription: "Deliver exceptional guest experiences with personalized services, mobile check-in, and AI-powered recommendations for amenities and local attractions.",
    tags: ["hospitality", "guest", "experience", "concierge"],
    supportedIndustries: ["hospitality-travel"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "automation"
  },
  // Pharmaceuticals
  {
    name: "Pharma Production Suite",
    slug: "pharma-production-suite",
    shortDescription: "GMP-compliant pharmaceutical manufacturing",
    longDescription: "Manage pharmaceutical production with full GMP compliance, batch tracking, environmental monitoring, and regulatory documentation.",
    tags: ["pharma", "manufacturing", "gmp", "compliance"],
    supportedIndustries: ["pharmaceuticals"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "599",
    subscriptionPriceYearly: "5990",
    status: "approved",
    developerIndex: 3,
    categorySlug: "manufacturing"
  },
  {
    name: "Drug Trial Manager",
    slug: "drug-trial-manager",
    shortDescription: "Clinical trial management and compliance",
    longDescription: "Comprehensive clinical trial management with patient tracking, adverse event reporting, and regulatory submission preparation.",
    tags: ["pharma", "clinical", "trials", "compliance"],
    supportedIndustries: ["pharmaceuticals"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "499",
    subscriptionPriceYearly: "4990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  // CPG & Food & Beverage
  {
    name: "Food Safety Tracker",
    slug: "food-safety-tracker",
    shortDescription: "HACCP and food safety compliance management",
    longDescription: "Ensure food safety compliance with HACCP monitoring, temperature tracking, lot traceability, and automated recall management.",
    tags: ["food", "safety", "haccp", "compliance", "traceability"],
    supportedIndustries: ["cpg-food-beverage"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 3,
    categorySlug: "manufacturing"
  },
  {
    name: "CPG Distribution Hub",
    slug: "cpg-distribution-hub",
    shortDescription: "Consumer goods distribution management",
    longDescription: "Manage CPG distribution with DSD routing, retail execution, and trade promotion tracking. Optimize your path to market.",
    tags: ["cpg", "distribution", "retail", "dsd"],
    supportedIndustries: ["cpg-food-beverage"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "inventory"
  },
  // Energy & Utilities
  {
    name: "Grid Management System",
    slug: "grid-management-system",
    shortDescription: "Smart grid monitoring and optimization",
    longDescription: "Monitor and optimize energy distribution with real-time grid analytics, outage management, and demand forecasting.",
    tags: ["energy", "grid", "utilities", "monitoring"],
    supportedIndustries: ["energy-utilities"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "599",
    subscriptionPriceYearly: "5990",
    status: "approved",
    developerIndex: 3,
    categorySlug: "analytics"
  },
  {
    name: "Utility Billing Platform",
    slug: "utility-billing-platform",
    shortDescription: "Metered billing and customer management",
    longDescription: "Handle complex utility billing with meter reading integration, tiered pricing, and customer self-service portals.",
    tags: ["utilities", "billing", "metering", "customer"],
    supportedIndustries: ["energy-utilities"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "finance"
  },
  // Business Services
  {
    name: "Professional Services Automation",
    slug: "professional-services-automation",
    shortDescription: "End-to-end consulting engagement management",
    longDescription: "Manage consulting projects from proposal to billing. Track time, expenses, and profitability across all engagements.",
    tags: ["consulting", "services", "psa", "billing"],
    supportedIndustries: ["business-services"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 0,
    categorySlug: "finance"
  },
  {
    name: "Resource Planning Pro",
    slug: "resource-planning-pro",
    shortDescription: "Staff scheduling and resource allocation",
    longDescription: "Optimize resource utilization with skills-based scheduling, capacity planning, and real-time availability tracking.",
    tags: ["services", "scheduling", "resources", "planning"],
    supportedIndustries: ["business-services"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "hr-payroll"
  },
  // Real Estate & Construction
  {
    name: "Construction Project Manager",
    slug: "construction-project-manager",
    shortDescription: "Complete construction project management",
    longDescription: "Manage construction projects with scheduling, budgeting, subcontractor coordination, and change order tracking.",
    tags: ["construction", "projects", "scheduling", "budget"],
    supportedIndustries: ["real-estate-construction"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  {
    name: "Property Leasing Suite",
    slug: "property-leasing-suite",
    shortDescription: "Commercial and residential leasing management",
    longDescription: "Manage property portfolios with tenant screening, lease tracking, rent collection, and maintenance request handling.",
    tags: ["real-estate", "leasing", "property", "tenant"],
    supportedIndustries: ["real-estate-construction"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "sales-crm"
  },
  // Media & Entertainment
  {
    name: "Content Management Hub",
    slug: "content-management-hub",
    shortDescription: "Digital content lifecycle management",
    longDescription: "Manage content creation, rights, distribution, and monetization across all channels. Track royalties and licensing agreements.",
    tags: ["media", "content", "rights", "distribution"],
    supportedIndustries: ["media-entertainment"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 0,
    categorySlug: "automation"
  },
  {
    name: "Audience Analytics",
    slug: "audience-analytics",
    shortDescription: "Deep audience insights and engagement tracking",
    longDescription: "Understand your audience with viewership analytics, engagement metrics, and predictive content recommendations.",
    tags: ["media", "analytics", "audience", "engagement"],
    supportedIndustries: ["media-entertainment"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 7,
    categorySlug: "analytics"
  },
  // Warehouse & Storage
  {
    name: "Smart WMS",
    slug: "smart-wms",
    shortDescription: "AI-powered warehouse management system",
    longDescription: "Optimize warehouse operations with AI-driven slotting, pick path optimization, and real-time inventory visibility.",
    tags: ["warehouse", "wms", "inventory", "ai"],
    supportedIndustries: ["warehouse-storage"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "inventory"
  },
  {
    name: "Storage Unit Manager",
    slug: "storage-unit-manager",
    shortDescription: "Self-storage facility management",
    longDescription: "Manage self-storage facilities with unit availability, access control, billing, and customer portal integration.",
    tags: ["storage", "facilities", "rental", "access"],
    supportedIndustries: ["warehouse-storage"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "sales-crm"
  },
  // Wholesale & Distribution
  {
    name: "Wholesale Order Management",
    slug: "wholesale-order-management",
    shortDescription: "B2B order and fulfillment management",
    longDescription: "Streamline wholesale operations with bulk ordering, tiered pricing, credit management, and EDI integration.",
    tags: ["wholesale", "orders", "b2b", "edi"],
    supportedIndustries: ["wholesale-distribution"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "sales-crm"
  },
  {
    name: "Distribution Analytics",
    slug: "distribution-analytics",
    shortDescription: "Supply chain performance analytics",
    longDescription: "Gain insights into distribution performance with fill rates, delivery times, and channel profitability analysis.",
    tags: ["distribution", "analytics", "supply-chain", "performance"],
    supportedIndustries: ["wholesale-distribution"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "analytics"
  },
  // Laboratory Services
  {
    name: "Lab Information System",
    slug: "lab-information-system",
    shortDescription: "Complete LIMS for testing laboratories",
    longDescription: "Manage laboratory workflows with sample tracking, test scheduling, result entry, and quality control monitoring.",
    tags: ["laboratory", "lims", "testing", "quality"],
    supportedIndustries: ["laboratory-services"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "449",
    subscriptionPriceYearly: "4490",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  {
    name: "Lab Compliance Manager",
    slug: "lab-compliance-manager",
    shortDescription: "Regulatory compliance for laboratories",
    longDescription: "Ensure laboratory compliance with CAP, CLIA, and ISO 17025 requirements. Automated documentation and audit trails.",
    tags: ["laboratory", "compliance", "audit", "regulatory"],
    supportedIndustries: ["laboratory-services"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  // Equipment Rental
  {
    name: "Equipment Rental Manager",
    slug: "equipment-rental-manager",
    shortDescription: "Heavy equipment rental and maintenance",
    longDescription: "Manage equipment fleet with availability tracking, rental contracts, maintenance scheduling, and utilization analytics.",
    tags: ["equipment", "rental", "maintenance", "fleet"],
    supportedIndustries: ["equipment-rental"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "inventory"
  },
  {
    name: "Asset Tracking Pro",
    slug: "asset-tracking-pro",
    shortDescription: "GPS and IoT asset tracking solution",
    longDescription: "Track equipment location and status in real-time with GPS and IoT sensors. Monitor usage, prevent theft, and optimize deployment.",
    tags: ["equipment", "tracking", "gps", "iot"],
    supportedIndustries: ["equipment-rental"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "integrations"
  },
  // Marine & Shipping
  {
    name: "Vessel Operations Manager",
    slug: "vessel-operations-manager",
    shortDescription: "Maritime fleet and voyage management",
    longDescription: "Manage vessel operations with voyage planning, crew scheduling, maintenance tracking, and compliance documentation.",
    tags: ["marine", "vessel", "shipping", "fleet"],
    supportedIndustries: ["marine-shipping"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "499",
    subscriptionPriceYearly: "4990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  {
    name: "Port Management System",
    slug: "port-management-system",
    shortDescription: "Port operations and berth scheduling",
    longDescription: "Optimize port operations with berth scheduling, cargo handling, and vessel traffic management. Real-time visibility across terminals.",
    tags: ["marine", "port", "cargo", "berth"],
    supportedIndustries: ["marine-shipping"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "599",
    subscriptionPriceYearly: "5990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  // Training & Development
  {
    name: "Corporate LMS",
    slug: "corporate-lms",
    shortDescription: "Enterprise learning management system",
    longDescription: "Deliver corporate training with course authoring, learning paths, certifications, and compliance tracking.",
    tags: ["training", "lms", "learning", "certification"],
    supportedIndustries: ["training-development"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 6,
    categorySlug: "automation"
  },
  {
    name: "Skills Assessment Platform",
    slug: "skills-assessment-platform",
    shortDescription: "Competency testing and gap analysis",
    longDescription: "Assess employee skills with customizable tests, identify skill gaps, and recommend training paths for professional development.",
    tags: ["training", "assessment", "skills", "competency"],
    supportedIndustries: ["training-development"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 6,
    categorySlug: "hr-payroll"
  },
  // Vehicle & Auto Rental
  {
    name: "Fleet Rental System",
    slug: "fleet-rental-system",
    shortDescription: "Vehicle rental fleet management",
    longDescription: "Manage rental fleet with reservations, check-in/out, pricing rules, and maintenance scheduling. Multi-location support.",
    tags: ["rental", "fleet", "vehicle", "reservations"],
    supportedIndustries: ["vehicle-auto-rental"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "sales-crm"
  },
  {
    name: "Rental Damage Tracker",
    slug: "rental-damage-tracker",
    shortDescription: "Vehicle condition and damage documentation",
    longDescription: "Document vehicle condition at check-in/out with photos, track damage history, and manage insurance claims efficiently.",
    tags: ["rental", "damage", "inspection", "claims"],
    supportedIndustries: ["vehicle-auto-rental"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "149",
    subscriptionPriceYearly: "1490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  // Mortgage & Lending
  {
    name: "Loan Origination System",
    slug: "loan-origination-system",
    shortDescription: "End-to-end mortgage origination",
    longDescription: "Streamline mortgage origination with automated underwriting, document collection, and compliance checking. Reduce time to close.",
    tags: ["mortgage", "lending", "origination", "underwriting"],
    supportedIndustries: ["mortgage-lending"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "499",
    subscriptionPriceYearly: "4990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "finance"
  },
  {
    name: "Loan Servicing Platform",
    slug: "loan-servicing-platform",
    shortDescription: "Mortgage servicing and escrow management",
    longDescription: "Service mortgage portfolios with payment processing, escrow management, investor reporting, and loss mitigation workflows.",
    tags: ["mortgage", "servicing", "escrow", "payments"],
    supportedIndustries: ["mortgage-lending"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "finance"
  },
  // Credit & Collections
  {
    name: "Collections Workflow Manager",
    slug: "collections-workflow-manager",
    shortDescription: "Automated debt collection workflows",
    longDescription: "Optimize collections with automated contact strategies, payment arrangements, and compliance tracking. Improve recovery rates.",
    tags: ["collections", "debt", "workflow", "compliance"],
    supportedIndustries: ["credit-collections"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 2,
    categorySlug: "automation"
  },
  {
    name: "Credit Decision Engine",
    slug: "credit-decision-engine",
    shortDescription: "Automated credit decisioning",
    longDescription: "Make faster, more accurate credit decisions with customizable scorecards, policy rules, and bureau integration.",
    tags: ["credit", "decisioning", "scoring", "risk"],
    supportedIndustries: ["credit-collections"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "analytics"
  },
  // Freight & Cargo
  {
    name: "Freight Management System",
    slug: "freight-management-system",
    shortDescription: "Multi-modal freight booking and tracking",
    longDescription: "Book and track freight across ocean, air, and ground carriers. Rate comparison, documentation, and shipment visibility.",
    tags: ["freight", "shipping", "tracking", "logistics"],
    supportedIndustries: ["freight-cargo"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  {
    name: "Cargo Claims Manager",
    slug: "cargo-claims-manager",
    shortDescription: "Freight damage and claims processing",
    longDescription: "Process cargo claims efficiently with documentation tracking, carrier communication, and settlement management.",
    tags: ["freight", "claims", "cargo", "damage"],
    supportedIndustries: ["freight-cargo"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  // Export & Import
  {
    name: "Trade Compliance Manager",
    slug: "trade-compliance-manager",
    shortDescription: "Import/export regulatory compliance",
    longDescription: "Navigate complex trade regulations with automated classification, denied party screening, and export license management.",
    tags: ["trade", "compliance", "export", "import"],
    supportedIndustries: ["export-import"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "449",
    subscriptionPriceYearly: "4490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  {
    name: "Customs Documentation",
    slug: "customs-documentation",
    shortDescription: "Automated customs forms and filings",
    longDescription: "Generate customs documents automatically with HS code lookup, duty calculation, and electronic filing to customs authorities.",
    tags: ["customs", "documentation", "trade", "filing"],
    supportedIndustries: ["export-import"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  // Events & Conferences
  {
    name: "Event Management Platform",
    slug: "event-management-platform",
    shortDescription: "Complete event planning and execution",
    longDescription: "Plan and execute events with registration, agenda management, speaker coordination, and attendee engagement tools.",
    tags: ["events", "conferences", "registration", "planning"],
    supportedIndustries: ["events-conferences"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 0,
    categorySlug: "automation"
  },
  {
    name: "Virtual Event Studio",
    slug: "virtual-event-studio",
    shortDescription: "Hybrid and virtual event production",
    longDescription: "Produce engaging virtual and hybrid events with streaming, networking lounges, and interactive sessions. Full analytics suite.",
    tags: ["events", "virtual", "streaming", "hybrid"],
    supportedIndustries: ["events-conferences"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "integrations"
  },
  // Marketing & Advertising
  {
    name: "Campaign Orchestrator",
    slug: "campaign-orchestrator",
    shortDescription: "Multi-channel marketing automation",
    longDescription: "Orchestrate campaigns across email, social, display, and direct mail. AI-powered audience targeting and performance optimization.",
    tags: ["marketing", "campaigns", "automation", "multi-channel"],
    supportedIndustries: ["marketing-advertising"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 7,
    categorySlug: "automation"
  },
  {
    name: "Marketing ROI Tracker",
    slug: "marketing-roi-tracker",
    shortDescription: "Marketing attribution and ROI analysis",
    longDescription: "Measure marketing effectiveness with multi-touch attribution, channel ROI analysis, and predictive budget allocation.",
    tags: ["marketing", "roi", "attribution", "analytics"],
    supportedIndustries: ["marketing-advertising"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 7,
    categorySlug: "analytics"
  },
  // Property Management
  {
    name: "Property Manager Pro",
    slug: "property-manager-pro",
    shortDescription: "Residential property management",
    longDescription: "Manage residential properties with tenant portals, rent collection, maintenance tracking, and financial reporting.",
    tags: ["property", "residential", "tenant", "management"],
    supportedIndustries: ["property-management"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 2,
    categorySlug: "finance"
  },
  {
    name: "Maintenance Request System",
    slug: "maintenance-request-system",
    shortDescription: "Work order and vendor management",
    longDescription: "Streamline maintenance with tenant requests, work order dispatch, vendor management, and preventive maintenance scheduling.",
    tags: ["property", "maintenance", "work-orders", "vendors"],
    supportedIndustries: ["property-management"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "149",
    subscriptionPriceYearly: "1490",
    status: "approved",
    developerIndex: 2,
    categorySlug: "automation"
  },
  // Security & Defense
  {
    name: "Security Operations Center",
    slug: "security-operations-center",
    shortDescription: "Physical security monitoring and response",
    longDescription: "Centralize security operations with alarm monitoring, incident management, guard tour tracking, and video integration.",
    tags: ["security", "operations", "monitoring", "incidents"],
    supportedIndustries: ["security-defense"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "449",
    subscriptionPriceYearly: "4490",
    status: "approved",
    developerIndex: 0,
    categorySlug: "automation"
  },
  {
    name: "Clearance Management",
    slug: "clearance-management",
    shortDescription: "Security clearance tracking and compliance",
    longDescription: "Manage personnel security clearances with application tracking, reinvestigation scheduling, and compliance reporting.",
    tags: ["security", "clearance", "personnel", "compliance"],
    supportedIndustries: ["security-defense"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 0,
    categorySlug: "hr-payroll"
  },
  // Portal & Digital Services
  {
    name: "Customer Portal Builder",
    slug: "customer-portal-builder",
    shortDescription: "Self-service customer portal framework",
    longDescription: "Create branded customer portals with self-service capabilities, knowledge base, and support ticket integration.",
    tags: ["portal", "self-service", "customer", "digital"],
    supportedIndustries: ["portal-digital-services"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "integrations"
  },
  {
    name: "Digital Experience Platform",
    slug: "digital-experience-platform",
    shortDescription: "Omnichannel digital engagement",
    longDescription: "Deliver consistent digital experiences across web, mobile, and kiosk. Personalization engine and analytics included.",
    tags: ["digital", "experience", "omnichannel", "engagement"],
    supportedIndustries: ["portal-digital-services"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 0,
    categorySlug: "integrations"
  },
  // Audit & Compliance
  {
    name: "Internal Audit Manager",
    slug: "internal-audit-manager",
    shortDescription: "Audit planning and execution platform",
    longDescription: "Plan and execute internal audits with risk-based scheduling, workpaper management, and finding tracking.",
    tags: ["audit", "internal", "compliance", "risk"],
    supportedIndustries: ["audit-compliance"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 2,
    categorySlug: "automation"
  },
  {
    name: "Compliance Dashboard",
    slug: "compliance-dashboard",
    shortDescription: "Real-time compliance monitoring",
    longDescription: "Monitor compliance status across regulations with automated control testing, gap analysis, and remediation tracking.",
    tags: ["compliance", "monitoring", "controls", "remediation"],
    supportedIndustries: ["audit-compliance"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "analytics"
  },
  // Carrier & Shipping
  {
    name: "Carrier Rate Manager",
    slug: "carrier-rate-manager",
    shortDescription: "Multi-carrier rate shopping and booking",
    longDescription: "Compare rates across carriers, book shipments, and manage carrier contracts. Integrate with major carriers via API.",
    tags: ["carrier", "rates", "shipping", "booking"],
    supportedIndustries: ["carrier-shipping"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  {
    name: "Last Mile Delivery",
    slug: "last-mile-delivery",
    shortDescription: "Last mile delivery optimization",
    longDescription: "Optimize last mile delivery with route planning, driver apps, proof of delivery, and customer notifications.",
    tags: ["delivery", "last-mile", "routing", "tracking"],
    supportedIndustries: ["carrier-shipping"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  },
  // Clinical Research
  {
    name: "Clinical Trial Management",
    slug: "clinical-trial-management",
    shortDescription: "Complete CTMS for research organizations",
    longDescription: "Manage clinical trials with site management, patient recruitment, study tracking, and regulatory submissions.",
    tags: ["clinical", "trials", "research", "ctms"],
    supportedIndustries: ["clinical-research"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "599",
    subscriptionPriceYearly: "5990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  {
    name: "eCRF Builder",
    slug: "ecrf-builder",
    shortDescription: "Electronic case report form design",
    longDescription: "Design and deploy electronic CRFs with validation rules, edit checks, and integration with clinical data management systems.",
    tags: ["clinical", "ecrf", "data", "forms"],
    supportedIndustries: ["clinical-research"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  // Finance & Investment
  {
    name: "Portfolio Management Suite",
    slug: "portfolio-management-suite",
    shortDescription: "Investment portfolio analytics and reporting",
    longDescription: "Manage investment portfolios with performance attribution, risk analytics, and client reporting. Multi-asset class support.",
    tags: ["investment", "portfolio", "analytics", "reporting"],
    supportedIndustries: ["finance-investment"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "499",
    subscriptionPriceYearly: "4990",
    status: "approved",
    developerIndex: 2,
    categorySlug: "analytics"
  },
  {
    name: "Trading Compliance Monitor",
    slug: "trading-compliance-monitor",
    shortDescription: "Trade surveillance and compliance",
    longDescription: "Monitor trading activity for compliance violations, insider trading, and market manipulation. Automated alerts and reporting.",
    tags: ["trading", "compliance", "surveillance", "regulatory"],
    supportedIndustries: ["finance-investment"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "449",
    subscriptionPriceYearly: "4490",
    status: "approved",
    developerIndex: 2,
    categorySlug: "automation"
  },
  // Laboratory Technology
  {
    name: "Lab Equipment Manager",
    slug: "lab-equipment-manager",
    shortDescription: "Laboratory equipment and calibration tracking",
    longDescription: "Track laboratory equipment with calibration scheduling, maintenance records, and usage logs. Ensure compliance with ISO standards.",
    tags: ["laboratory", "equipment", "calibration", "maintenance"],
    supportedIndustries: ["laboratory-technology"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "249",
    subscriptionPriceYearly: "2490",
    status: "approved",
    developerIndex: 3,
    categorySlug: "automation"
  },
  {
    name: "Lab Data Analytics",
    slug: "lab-data-analytics",
    shortDescription: "Laboratory data analysis and visualization",
    longDescription: "Analyze laboratory data with statistical tools, trend analysis, and customizable visualizations. Export to regulatory formats.",
    tags: ["laboratory", "data", "analytics", "visualization"],
    supportedIndustries: ["laboratory-technology"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "299",
    subscriptionPriceYearly: "2990",
    status: "approved",
    developerIndex: 7,
    categorySlug: "analytics"
  },
  // Pharmacy & Retail
  {
    name: "Pharmacy Management System",
    slug: "pharmacy-management-system",
    shortDescription: "Complete pharmacy operations management",
    longDescription: "Manage pharmacy operations with prescription processing, inventory control, insurance billing, and patient counseling tools.",
    tags: ["pharmacy", "prescriptions", "inventory", "billing"],
    supportedIndustries: ["pharmacy-retail"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "399",
    subscriptionPriceYearly: "3990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "automation"
  },
  {
    name: "Drug Interaction Checker",
    slug: "drug-interaction-checker",
    shortDescription: "Real-time drug interaction alerts",
    longDescription: "Prevent adverse drug interactions with real-time checking at point of dispensing. Comprehensive drug database integration.",
    tags: ["pharmacy", "drug-interactions", "safety", "alerts"],
    supportedIndustries: ["pharmacy-retail"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 1,
    categorySlug: "integrations"
  },
  // Shipment Management
  {
    name: "Shipment Visibility Platform",
    slug: "shipment-visibility-platform",
    shortDescription: "End-to-end shipment tracking and monitoring",
    longDescription: "Track shipments across carriers with real-time visibility, exception alerts, and ETA predictions powered by AI.",
    tags: ["shipment", "tracking", "visibility", "logistics"],
    supportedIndustries: ["shipment-management"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "349",
    subscriptionPriceYearly: "3490",
    status: "approved",
    developerIndex: 5,
    categorySlug: "analytics"
  },
  {
    name: "Shipping Documentation Hub",
    slug: "shipping-documentation-hub",
    shortDescription: "Automated shipping document generation",
    longDescription: "Generate bills of lading, packing lists, and commercial invoices automatically. Electronic document exchange with partners.",
    tags: ["shipping", "documentation", "automation", "edi"],
    supportedIndustries: ["shipment-management"],
    pricingModel: "subscription",
    subscriptionPriceMonthly: "199",
    subscriptionPriceYearly: "1990",
    status: "approved",
    developerIndex: 5,
    categorySlug: "automation"
  }
];
