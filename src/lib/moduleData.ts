export const moduleData: Record<string, {
  name: string;
  description: string;
  tagline: string;
  features: string[];
  aiFeatures: string[];
  modules?: string[];
  businessBenefits?: string[];
  industries?: string[];
  workflows?: string[];
}> = {
  "erp-core": {
    name: "ERP Core",
    tagline: "Unified Enterprise Resource Planning Foundation",
    description: "Centralized hub for all enterprise operations with real-time visibility across finance, inventory, manufacturing, and supply chain. Integrates every department into a single, connected system.",
    features: [
      "Real-time Financial Visibility",
      "Inventory & Asset Management",
      "Multi-warehouse Operations",
      "Integrated Accounting",
      "Supply Chain Integration",
      "Manufacturing Planning",
      "General Ledger & GL Journaling",
      "Audit Trails & Compliance",
      "Multi-currency & Multi-language",
      "Consolidated Reporting"
    ],
    aiFeatures: [
      "Predictive Demand Forecasting",
      "Inventory Optimization with ML",
      "Anomaly Detection in Transactions",
      "Automated Data Reconciliation",
      "Smart Period Close Automation",
      "Fraud Prevention & Detection",
      "Intelligent Workflow Recommendations",
      "Real-time Risk Analytics"
    ],
    businessBenefits: [
      "50% reduction in implementation time",
      "Real-time decision making across departments",
      "Reduced operational errors by 70%",
      "Improved cash flow visibility",
      "Better resource utilization",
      "Faster month-end close process"
    ],
    industries: ["Manufacturing", "Retail", "Healthcare", "Finance", "Government", "Logistics"]
  },

  "crm": {
    name: "Customer Relationship Management (CRM)",
    tagline: "Build Lasting Customer Relationships with AI-Powered Insights",
    description: "360-degree customer view with sales pipeline management, lead scoring, and customer analytics. Automate sales workflows and personalize customer interactions at scale.",
    features: [
      "Lead & Opportunity Management",
      "Sales Pipeline Tracking",
      "Customer 360 View",
      "Account Management",
      "Contact & Company Management",
      "Sales Forecasting",
      "Activity & Task Management",
      "Territory Management",
      "Quote & Order Management",
      "Customer Interaction History"
    ],
    aiFeatures: [
      "AI-Powered Lead Scoring",
      "Predictive Sales Forecasting",
      "Next Best Action Recommendations",
      "Sentiment Analysis on Communications",
      "Automated Lead Qualification",
      "Churn Prediction & Retention",
      "Customer Lifetime Value Prediction",
      "Intelligent Pipeline Health Analysis"
    ],
    businessBenefits: [
      "40% improvement in sales productivity",
      "Higher conversion rates with better lead targeting",
      "Reduced sales cycle by 25%",
      "Improved customer retention",
      "Data-driven pipeline management",
      "Real-time sales insights for decision-making"
    ],
    industries: ["Automotive", "Insurance", "Banking", "Retail", "Telecom", "Hospitality"]
  },

  "hr": {
    name: "Human Resources & Payroll",
    tagline: "Attract, Retain, and Develop Top Talent",
    description: "End-to-end HR lifecycle management from recruitment to retirement. Integrated payroll, benefits administration, performance management, and employee development.",
    features: [
      "Recruitment & Applicant Tracking",
      "Employee Records Management",
      "Payroll & Compensation",
      "Benefits Administration",
      "Time & Attendance",
      "Performance Management",
      "Learning & Development",
      "Employee Engagement",
      "Org Charts & Reporting",
      "Compliance & Certifications"
    ],
    aiFeatures: [
      "Intelligent Resume Screening",
      "Candidate Recommendation Engine",
      "Predictive Attrition Analysis",
      "Compensation Benchmarking",
      "Automated Payroll Calculations",
      "Performance Insights & Recommendations",
      "Skills Gap Analysis",
      "Career Path Recommendations"
    ],
    businessBenefits: [
      "30% reduction in hiring time",
      "Improved employee retention by 25%",
      "Reduced payroll errors",
      "Better workforce planning",
      "Increased employee engagement",
      "Compliance automation"
    ],
    industries: ["Manufacturing", "Finance", "Healthcare", "Education", "Government", "Retail"]
  },

  "projects": {
    name: "Project Management",
    tagline: "Deliver Projects On Time, On Budget",
    description: "Comprehensive project delivery platform with resource planning, budget management, and real-time progress tracking. Collaborate seamlessly across teams and geographies.",
    features: [
      "Project Planning & Scheduling",
      "Work Breakdown Structure",
      "Resource Planning & Allocation",
      "Budget Management",
      "Time & Expense Tracking",
      "Collaboration Tools",
      "Risk Management",
      "Quality Assurance",
      "Change Management",
      "Portfolio Management"
    ],
    aiFeatures: [
      "Intelligent Project Risk Forecasting",
      "Smart Resource Allocation",
      "Predictive Schedule Analysis",
      "Automated Budget Variance Detection",
      "AI-Powered Progress Monitoring",
      "Intelligent Resource Recommendation",
      "Timeline Optimization",
      "Team Productivity Analytics"
    ],
    businessBenefits: [
      "35% improvement in on-time delivery",
      "Better resource utilization",
      "Reduced project overruns",
      "Improved team collaboration",
      "Better risk identification",
      "Real-time project visibility"
    ],
    industries: ["Manufacturing", "Construction", "IT Services", "Consulting", "Telecom", "Energy"]
  },

  "epm": {
    name: "Enterprise Performance Management (EPM)",
    tagline: "Drive Strategic Performance with Real-Time Analytics",
    description: "Strategic planning, budgeting, forecasting, and performance monitoring. Align organizational strategy with execution and measure what matters most.",
    features: [
      "Strategic Planning",
      "Budgeting & Forecasting",
      "Scenario Planning",
      "KPI Management",
      "Balanced Scorecard",
      "Profitability Analysis",
      "Variance Analysis",
      "Consolidation",
      "Report Builder",
      "Dashboard Analytics"
    ],
    aiFeatures: [
      "Predictive Forecasting Models",
      "Anomaly Detection in Performance",
      "Scenario Impact Analysis",
      "Intelligent Reporting",
      "Recommendation Engine",
      "Trend Analysis",
      "Pattern Recognition",
      "What-If Scenario Analysis"
    ],
    businessBenefits: [
      "20% faster planning cycles",
      "Better forecast accuracy",
      "Improved strategic alignment",
      "Faster decision-making",
      "Reduced planning manual effort by 50%",
      "Real-time visibility to strategic targets"
    ],
    industries: ["Finance", "Banking", "Insurance", "Energy", "Government", "Retail"]
  },

  "finance": {
    name: "Financial Management",
    tagline: "Full Visibility and Control of Financial Operations",
    description: "Comprehensive financial accounting, reporting, and analysis. Manage accounts payable, accounts receivable, general ledger, and financial consolidation.",
    features: [
      "General Ledger",
      "Accounts Payable",
      "Accounts Receivable",
      "Cash Management",
      "Bank Reconciliation",
      "Financial Reporting",
      "Intercompany Transactions",
      "Fixed Assets",
      "Revenue Recognition",
      "Tax Management"
    ],
    aiFeatures: [
      "Intelligent Invoice Processing",
      "Automated 3-way Matching",
      "Cash Flow Forecasting",
      "Fraud Detection in Transactions",
      "Automated Reconciliation",
      "Anomaly Detection",
      "Tax Optimization",
      "Working Capital Analytics"
    ],
    businessBenefits: [
      "40% reduction in month-end close time",
      "Improved cash flow management",
      "Better compliance & audit readiness",
      "Reduced accounting errors",
      "Faster invoice processing",
      "Real-time financial visibility"
    ],
    industries: ["Finance", "Banking", "Insurance", "Healthcare", "Manufacturing", "Retail"]
  },

  "inventory": {
    name: "Inventory & Supply Chain",
    tagline: "Optimize Inventory Levels and Supply Chain Operations",
    description: "Real-time inventory visibility across warehouses and distribution centers. Manage stock levels, warehouse operations, and supplier relationships efficiently.",
    features: [
      "Inventory Tracking",
      "Multi-warehouse Management",
      "Stock Transfer",
      "Physical Inventory",
      "ABC Analysis",
      "Reorder Point Management",
      "Warehouse Operations",
      "Pick & Pack",
      "Barcode Management",
      "Supplier Management"
    ],
    aiFeatures: [
      "Demand Forecasting",
      "Inventory Optimization",
      "Automated Reorder Recommendations",
      "Safety Stock Optimization",
      "Warehouse Space Optimization",
      "Supplier Performance Prediction",
      "Lead Time Forecasting",
      "Shrinkage Prediction"
    ],
    businessBenefits: [
      "30% reduction in carrying costs",
      "Lower stock-out incidents",
      "Improved warehouse efficiency",
      "Better supplier relationships",
      "Real-time inventory visibility",
      "Reduced dead stock"
    ],
    industries: ["Retail", "Manufacturing", "Logistics", "Healthcare", "Automotive", "E-commerce"]
  },

  "compliance": {
    name: "Compliance & Risk Management",
    tagline: "Stay Compliant with Automated Risk Management",
    description: "Manage regulatory requirements, audit trails, and risk mitigation. Ensure organization-wide compliance with internal policies and external regulations.",
    features: [
      "Policy Management",
      "Audit Trail Tracking",
      "Regulatory Mapping",
      "Risk Assessment",
      "Incident Management",
      "Corrective Actions",
      "Documentation Control",
      "Compliance Calendar",
      "Evidence Collection",
      "Attestation Management"
    ],
    aiFeatures: [
      "Intelligent Risk Identification",
      "Predictive Compliance Violations",
      "Anomaly Detection",
      "Automated Audit Trail Analysis",
      "Compliance Gap Analysis",
      "Document Classification",
      "Pattern Recognition",
      "Regulatory Update Notifications"
    ],
    businessBenefits: [
      "Reduced compliance violations",
      "Faster audit preparation",
      "Lower regulatory fines",
      "Improved audit readiness",
      "Reduced compliance manual work by 60%",
      "Better risk visibility"
    ],
    industries: ["Finance", "Banking", "Healthcare", "Insurance", "Government", "Energy"]
  },

  "bpm": {
    name: "Business Process Management (BPM)",
    tagline: "Automate and Optimize Your Business Processes",
    description: "Design, execute, monitor, and optimize business processes. Automate workflows with intelligent routing and reduce manual handoffs.",
    features: [
      "Process Design & Modeling",
      "Workflow Automation",
      "Task Management",
      "Approval Workflows",
      "Document Management",
      "Process Monitoring",
      "Process Analytics",
      "Form Builder",
      "Integration Hub",
      "Mobile Workflows"
    ],
    aiFeatures: [
      "Intelligent Process Discovery",
      "Bottleneck Identification",
      "Automated Routing",
      "Intelligent Workflow Recommendations",
      "Process Optimization",
      "Predictive Process Issues",
      "Intelligent Document Processing",
      "RPA Integration"
    ],
    businessBenefits: [
      "50% reduction in process cycle time",
      "70% reduction in manual errors",
      "Improved compliance",
      "Better process visibility",
      "Faster time to market",
      "Increased operational efficiency"
    ],
    industries: ["Finance", "Insurance", "Healthcare", "Government", "Manufacturing", "Retail"]
  },

  "website": {
    name: "Website & Portal",
    tagline: "Engaging Digital Experiences for Customers",
    description: "Build and manage responsive websites, customer portals, and digital storefronts. Integrate with backend systems for seamless customer experience.",
    features: [
      "Website Builder",
      "Portal Framework",
      "Content Management",
      "E-commerce Integration",
      "Mobile Responsive",
      "SEO Optimization",
      "Analytics",
      "A/B Testing",
      "Multi-language Support",
      "Security & SSL"
    ],
    aiFeatures: [
      "Personalization Engine",
      "Recommendation System",
      "Chatbot Integration",
      "Content Optimization",
      "User Behavior Analytics",
      "Search Optimization",
      "Sentiment Analysis",
      "Dynamic Pricing"
    ],
    businessBenefits: [
      "Increased online conversion rates",
      "Better customer engagement",
      "Improved SEO rankings",
      "Reduced bounce rates",
      "Better mobile experience",
      "Increased online revenue"
    ],
    industries: ["Retail", "E-commerce", "Banking", "Insurance", "Healthcare", "Hospitality"]
  },

  "email": {
    name: "Email & Communication",
    tagline: "Integrated Communication Hub",
    description: "Enterprise email, marketing campaigns, and customer communications. Manage internal and external communications from a unified platform.",
    features: [
      "Email Management",
      "Marketing Campaigns",
      "Email Templates",
      "List Management",
      "Campaign Analytics",
      "A/B Testing",
      "Deliverability",
      "Compliance Management",
      "Integration with CRM",
      "Notification Center"
    ],
    aiFeatures: [
      "Intelligent Send Time Optimization",
      "Subject Line Optimization",
      "Recipient Segmentation",
      "Content Personalization",
      "Predictive Engagement",
      "Automated Campaign Optimization",
      "Spam Detection",
      "Tone Analysis"
    ],
    businessBenefits: [
      "30% increase in email open rates",
      "Better campaign ROI",
      "Improved customer engagement",
      "Higher conversion rates",
      "Better deliverability",
      "Reduced unsubscribe rates"
    ],
    industries: ["Retail", "E-commerce", "Marketing", "Finance", "Insurance", "Hospitality"]
  },

  "analytics": {
    name: "Business Intelligence & Analytics",
    tagline: "Turn Data into Actionable Insights",
    description: "Advanced analytics and reporting with real-time dashboards. Discover hidden patterns and predict future trends with AI-powered analytics.",
    features: [
      "Data Warehousing",
      "ETL & Data Integration",
      "Real-time Dashboards",
      "Report Builder",
      "Data Visualization",
      "Ad-hoc Analysis",
      "Predictive Analytics",
      "Data Mining",
      "Mobile Analytics",
      "Data Governance"
    ],
    aiFeatures: [
      "Predictive Analytics",
      "Anomaly Detection",
      "Pattern Recognition",
      "Automated Insights",
      "Natural Language Queries",
      "Forecasting Models",
      "Recommendation Engine",
      "Sentiment Analysis"
    ],
    businessBenefits: [
      "40% faster insights",
      "Better decision-making",
      "Improved forecasting accuracy",
      "Reduced data analysis time by 50%",
      "Real-time visibility to KPIs",
      "Competitive advantage through data"
    ],
    industries: ["Finance", "Retail", "Healthcare", "Banking", "Insurance", "E-commerce"]
  },

  "ai-copilot": {
    name: "AI Copilot",
    tagline: "Your Intelligent AI Assistant for Enterprise Success",
    description: "Conversational AI assistant integrated across all modules. Ask questions, get recommendations, and automate tasks using natural language.",
    features: [
      "Natural Language Interface",
      "Cross-module Queries",
      "Document Generation",
      "Code Assistant",
      "Recommendation Engine",
      "Task Automation",
      "Data Analysis",
      "Insight Generation",
      "Learning & Training",
      "Integration Hub"
    ],
    aiFeatures: [
      "Advanced NLP Understanding",
      "Context-Aware Responses",
      "Multi-turn Conversations",
      "Real-time Data Access",
      "Predictive Recommendations",
      "Sentiment Understanding",
      "Multi-language Support",
      "Continuous Learning"
    ],
    businessBenefits: [
      "60% reduction in task completion time",
      "Better user adoption",
      "Reduced training time",
      "Improved productivity",
      "24/7 intelligent assistant",
      "Democratized data access"
    ],
    industries: ["All Industries"]
  },

  "consolidation": {
    name: "Financial Consolidation",
    tagline: "Streamline Multi-Entity Financial Consolidation",
    description: "Automate consolidation processes across multiple entities and currencies. Manage intercompany eliminations and produce consolidated reports.",
    features: [
      "Multi-entity Consolidation",
      "Multi-currency Support",
      "Intercompany Elimination",
      "Elimination Rule Management",
      "Consolidation Rules",
      "Journal Entry Management",
      "Consolidated Reporting",
      "Data Validation",
      "Audit Trail",
      "Variance Analysis"
    ],
    aiFeatures: [
      "Automated Data Mapping",
      "Smart Elimination Rules",
      "Anomaly Detection",
      "Data Quality Checks",
      "Predictive Adjustments",
      "Automated Reconciliation",
      "Pattern Recognition",
      "Variance Explanation"
    ],
    businessBenefits: [
      "70% reduction in consolidation time",
      "Reduced consolidation errors",
      "Faster period close",
      "Better audit trail",
      "Improved accuracy",
      "Real-time consolidation views"
    ],
    industries: ["Finance", "Banking", "Insurance", "Manufacturing", "Retail", "Energy"]
  },

  "financial-close": {
    name: "Financial Close",
    tagline: "Accelerate Month-End Close with Automation",
    description: "Orchestrate the entire month-end close process with automated checks, approvals, and reporting. Reduce close cycles from days to hours.",
    features: [
      "Close Calendar & Timeline",
      "Automated Checklist",
      "Journal Entry Management",
      "Reconciliation Automation",
      "Balance Sheet Rollforward",
      "Review & Approval Workflow",
      "Close Reporting",
      "Close Analytics",
      "Documentation",
      "Compliance Checklist"
    ],
    aiFeatures: [
      "Intelligent Task Sequencing",
      "Automated Reconciliations",
      "Anomaly Detection",
      "Predictive Issues",
      "Smart Notifications",
      "Close Optimization",
      "Data Validation",
      "Automated Adjustments"
    ],
    businessBenefits: [
      "50% reduction in close time",
      "Fewer close errors",
      "Better close visibility",
      "Improved compliance",
      "Faster reporting",
      "Earlier strategic insights"
    ],
    industries: ["Finance", "Banking", "Insurance", "Manufacturing", "Retail", "Telecom"]
  }
};
