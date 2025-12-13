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
    companyName: "NexusAI Solutions",
    displayName: "NexusAI Official",
    email: "apps@nexusai.com",
    website: "https://nexusai.com",
    description: "Official NexusAI first-party apps and integrations",
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
  }
];
