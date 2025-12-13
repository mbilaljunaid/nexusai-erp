import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Brain,
  Users,
  DollarSign,
  Package,
  Factory,
  BarChart3,
  Briefcase,
  Shield,
  Megaphone,
  Headphones,
  ClipboardList,
  Settings,
  Sparkles,
  Bot,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Cpu,
  Globe,
  Mail,
  Database
} from "lucide-react";

export default function ModulesPage() {
  useEffect(() => {
    document.title = "Modules | NexusAI ERP - AI-First Enterprise Solutions";
  }, []);

  const modules = [
    {
      icon: Users,
      title: "CRM & Sales",
      description: "Complete customer relationship management with lead tracking, opportunity management, quote generation, and sales pipeline analytics.",
      features: ["Lead Management", "Opportunity Tracking", "Quote Builder", "Customer 360 View", "Sales Analytics"],
      aiCapability: "Predictive Lead Scoring",
      aiDescription: "AI analyzes customer behavior patterns, engagement history, and demographic data to automatically score leads. The system predicts conversion probability, recommends optimal follow-up timing, and suggests personalized engagement strategies to maximize close rates.",
      color: "blue"
    },
    {
      icon: DollarSign,
      title: "Finance & Accounting",
      description: "Comprehensive financial management including general ledger, accounts payable/receivable, budgeting, cash management, and multi-entity consolidation.",
      features: ["General Ledger", "AP/AR Management", "Budgeting & Forecasting", "Bank Reconciliation", "Financial Reporting"],
      aiCapability: "Intelligent Cash Flow Forecasting",
      aiDescription: "AI models analyze historical transaction patterns, seasonal trends, and external market factors to predict future cash flows with high accuracy. The system automatically identifies potential cash shortfalls and recommends optimal payment scheduling.",
      color: "green"
    },
    {
      icon: Package,
      title: "Inventory & Supply Chain",
      description: "End-to-end supply chain visibility with inventory optimization, warehouse management, procurement automation, and demand planning.",
      features: ["Inventory Control", "Warehouse Management", "Purchase Orders", "Demand Forecasting", "Vendor Management"],
      aiCapability: "AI-Powered Demand Prediction",
      aiDescription: "Machine learning algorithms process historical sales data, market trends, weather patterns, and economic indicators to forecast demand with precision. The system automatically adjusts reorder points and safety stock levels to minimize carrying costs while preventing stockouts.",
      color: "orange"
    },
    {
      icon: Factory,
      title: "Manufacturing & Production",
      description: "Complete manufacturing execution with BOM management, work orders, shop floor control, quality management, and production scheduling.",
      features: ["BOM Management", "Work Orders", "MRP Planning", "Quality Control", "Shop Floor Tracking"],
      aiCapability: "Predictive Maintenance & Optimization",
      aiDescription: "AI continuously monitors equipment sensor data to predict maintenance needs before failures occur. The system optimizes production schedules based on machine availability, material constraints, and order priorities to maximize throughput and minimize downtime.",
      color: "purple"
    },
    {
      icon: Briefcase,
      title: "HR & Payroll",
      description: "Integrated human capital management covering recruitment, onboarding, performance management, payroll processing, and workforce analytics.",
      features: ["Employee Directory", "Payroll Processing", "Leave Management", "Performance Reviews", "Talent Acquisition"],
      aiCapability: "Intelligent Talent Matching",
      aiDescription: "AI analyzes candidate profiles against job requirements, team dynamics, and organizational culture to identify best-fit candidates. The system predicts employee performance potential, flight risk, and recommends personalized development paths.",
      color: "pink"
    },
    {
      icon: ClipboardList,
      title: "Project Management",
      description: "Comprehensive project execution with task management, resource allocation, time tracking, milestone monitoring, and project analytics.",
      features: ["Task Management", "Gantt Charts", "Resource Planning", "Time Tracking", "Project Analytics"],
      aiCapability: "AI Project Risk Assessment",
      aiDescription: "AI evaluates project parameters, resource availability, and historical project data to identify potential risks and delays. The system provides early warnings, suggests mitigation strategies, and automatically adjusts timelines based on real-time progress.",
      color: "cyan"
    },
    {
      icon: BarChart3,
      title: "Analytics & BI",
      description: "Powerful business intelligence with real-time dashboards, custom reports, data visualization, and advanced analytics capabilities.",
      features: ["Dashboard Builder", "Custom Reports", "Data Explorer", "KPI Tracking", "Scheduled Reports"],
      aiCapability: "Anomaly Detection & Insights",
      aiDescription: "AI continuously monitors business metrics to detect unusual patterns and anomalies in real-time. The system automatically surfaces insights, identifies root causes of performance changes, and provides actionable recommendations.",
      color: "indigo"
    },
    {
      icon: Headphones,
      title: "Customer Service",
      description: "Complete service management with ticket tracking, SLA management, knowledge base, customer portal, and service analytics.",
      features: ["Ticket Management", "SLA Tracking", "Knowledge Base", "Customer Portal", "Service Analytics"],
      aiCapability: "AI-Powered Ticket Routing",
      aiDescription: "Natural language processing analyzes incoming tickets to understand intent, sentiment, and urgency. The system automatically routes tickets to the most qualified agents, suggests relevant knowledge articles, and predicts resolution time.",
      color: "teal"
    },
    {
      icon: Megaphone,
      title: "Marketing Automation",
      description: "Integrated marketing management with campaign creation, email automation, lead nurturing, content management, and marketing analytics.",
      features: ["Campaign Management", "Email Marketing", "Lead Nurturing", "Content CMS", "Marketing Analytics"],
      aiCapability: "Personalized Campaign Optimization",
      aiDescription: "AI analyzes customer segments, engagement patterns, and campaign performance to optimize marketing efforts. The system automatically personalizes content, determines optimal send times, and predicts campaign ROI.",
      color: "rose"
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "Enterprise-grade compliance management with audit trails, access controls, regulatory reporting, and security monitoring.",
      features: ["Audit Trails", "Access Control", "Compliance Reports", "Security Monitoring", "Policy Management"],
      aiCapability: "Intelligent Risk Detection",
      aiDescription: "AI monitors user activities, access patterns, and system events to detect potential security threats and compliance violations. The system provides real-time alerts, automates compliance checks, and generates audit-ready reports.",
      color: "red"
    },
    {
      icon: Settings,
      title: "Admin & Configuration",
      description: "Centralized administration with user management, role-based access, system configuration, integration management, and platform monitoring.",
      features: ["User Management", "Role Configuration", "System Settings", "API Management", "Integration Hub"],
      aiCapability: "Intelligent System Optimization",
      aiDescription: "AI analyzes system usage patterns, performance metrics, and user behavior to recommend configuration optimizations. The system automatically suggests workflow improvements, identifies unused features, and optimizes resource allocation.",
      color: "slate"
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Visual workflow designer with rule-based automation, approval workflows, notifications, and cross-module process orchestration.",
      features: ["Workflow Designer", "Approval Routing", "Event Triggers", "Notifications", "Process Monitoring"],
      aiCapability: "Smart Process Automation",
      aiDescription: "AI learns from historical workflow patterns to suggest automation opportunities and optimize approval routing. The system predicts bottlenecks, recommends process improvements, and automatically handles routine decisions based on learned patterns.",
      color: "amber"
    },
    {
      icon: TrendingUp,
      title: "EPM - Enterprise Performance Management",
      description: "Comprehensive financial planning platform with budgeting, forecasting, scenario modeling, financial consolidation, and period-end close automation.",
      features: ["Budget Planning", "Rolling Forecasts", "Scenario Modeling", "Multi-Entity Consolidation", "Financial Close", "Variance Analysis"],
      aiCapability: "AI-Powered Financial Forecasting",
      aiDescription: "Machine learning models analyze historical financial data, market trends, and business drivers to generate accurate forecasts. The system automatically identifies variance patterns, recommends budget adjustments, and predicts cash flow with high precision.",
      color: "emerald"
    },
    {
      icon: Globe,
      title: "Website Builder",
      description: "No-code website creation platform with drag-and-drop builder, templates, SEO optimization, forms integration, and e-commerce capabilities.",
      features: ["Drag & Drop Builder", "Website Templates", "Landing Pages", "Forms & CRM Integration", "SEO Tools", "E-Commerce"],
      aiCapability: "AI Content & Design Generation",
      aiDescription: "AI generates website copy, suggests design layouts based on industry best practices, and optimizes content for search engines. The system automatically A/B tests variations and recommends improvements to increase conversion rates.",
      color: "violet"
    },
    {
      icon: Mail,
      title: "Email & Communications",
      description: "Unified email management with team collaboration, marketing campaigns, templates, automation workflows, and communication analytics.",
      features: ["Unified Inbox", "Team Collaboration", "Email Campaigns", "Template Library", "Automation Rules", "Analytics"],
      aiCapability: "Intelligent Email Automation",
      aiDescription: "AI analyzes email content, sentiment, and urgency to prioritize messages and suggest responses. The system automatically categorizes emails, routes to appropriate team members, and optimizes send times for maximum engagement.",
      color: "sky"
    },
    {
      icon: Database,
      title: "Data & Integration Hub",
      description: "Enterprise data management with API gateway, webhooks, third-party integrations, data synchronization, and real-time event processing.",
      features: ["API Management", "Webhook Management", "Third-Party Connectors", "Data Sync", "ETL Pipelines", "Event Streaming"],
      aiCapability: "Smart Data Integration",
      aiDescription: "AI monitors data flows, detects anomalies, and automatically maps fields between systems. The system suggests optimal integration patterns, identifies data quality issues, and recommends schema improvements.",
      color: "gray"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; badge: string }> = {
      blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-500" },
      green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", badge: "bg-green-500" },
      orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-500" },
      purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-500" },
      pink: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", badge: "bg-pink-500" },
      cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", badge: "bg-cyan-500" },
      indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-500" },
      teal: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400", badge: "bg-teal-500" },
      rose: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-500" },
      red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", badge: "bg-red-500" },
      slate: { bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", badge: "bg-slate-500" },
      amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-500" },
      emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-500" },
      violet: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", badge: "bg-violet-500" },
      sky: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-400", badge: "bg-sky-500" },
      gray: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400", badge: "bg-gray-500" }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-20 text-center max-w-5xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white" data-testid="badge-ai-first">
            <Brain className="w-3 h-3 mr-1" /> AI-FIRST PLATFORM
          </Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">
            Enterprise Modules Powered by AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            NexusAI delivers 16 comprehensive enterprise modules, each enhanced with artificial intelligence 
            to automate decisions, predict outcomes, and optimize operations across your entire organization.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/demo">
              <Button size="lg" data-testid="button-request-demo">
                <Sparkles className="mr-2 w-5 h-5" /> Request Demo
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" data-testid="button-view-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </section>

        {/* AI-First Banner */}
        <section className="px-4 py-12 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6 text-white text-center">
              <div className="flex flex-col items-center" data-testid="stat-ai-models">
                <Bot className="w-10 h-10 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-sm text-white/80">AI Models</div>
              </div>
              <div className="flex flex-col items-center" data-testid="stat-automation">
                <Zap className="w-10 h-10 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">80%</div>
                <div className="text-sm text-white/80">Task Automation</div>
              </div>
              <div className="flex flex-col items-center" data-testid="stat-predictions">
                <TrendingUp className="w-10 h-10 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">95%</div>
                <div className="text-sm text-white/80">Prediction Accuracy</div>
              </div>
              <div className="flex flex-col items-center" data-testid="stat-processing">
                <Cpu className="w-10 h-10 mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">Real-time</div>
                <div className="text-sm text-white/80">AI Processing</div>
              </div>
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="px-4 py-20 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center">Complete Module Suite</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Each module is built with AI at its core, not as an afterthought. Discover how AI transforms every aspect of your enterprise operations.
          </p>
          
          <div className="space-y-8">
            {modules.map((module, index) => {
              const colors = getColorClasses(module.color);
              const IconComponent = module.icon;
              
              return (
                <Card key={index} className="p-6 overflow-visible" data-testid={`card-module-${index}`}>
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left: Module Info */}
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-xl ${colors.bg}`}>
                          <IconComponent className={`w-8 h-8 ${colors.text}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{module.title}</h3>
                          <p className="text-muted-foreground text-sm">{module.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {module.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Right: AI Capability */}
                    <div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <Badge className={`${colors.badge} text-white text-xs`}>
                          AI-POWERED
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{module.aiCapability}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {module.aiDescription}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How AI Works Section */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">How NexusAI Works</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Our AI engine processes your enterprise data to deliver intelligent automation and insights
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center" data-testid="card-ai-step-1">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-bold text-lg mb-2">Data Integration</h3>
                <p className="text-sm text-muted-foreground">
                  NexusAI continuously ingests data from all modules, external systems, and market sources to build a comprehensive enterprise data lake.
                </p>
              </Card>
              
              <Card className="p-6 text-center" data-testid="card-ai-step-2">
                <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-bold text-lg mb-2">AI Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Machine learning models analyze patterns, predict outcomes, and identify optimization opportunities in real-time across your operations.
                </p>
              </Card>
              
              <Card className="p-6 text-center" data-testid="card-ai-step-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-bold text-lg mb-2">Intelligent Actions</h3>
                <p className="text-sm text-muted-foreground">
                  The system automatically executes routine decisions, surfaces insights to users, and provides recommendations for complex scenarios.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Integration Note */}
        <section className="px-4 py-16 max-w-5xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold mb-2">All Modules Work Together</h3>
                <p className="text-muted-foreground">
                  NexusAI modules share a unified data layer, enabling cross-functional AI insights. 
                  For example, sales predictions inform manufacturing schedules, which optimize inventory 
                  levels, which affect cash flow forecasts - all automatically connected.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Brain className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Experience the AI Difference</h2>
            <p className="text-lg text-white/80 mb-8">
              See how NexusAI can transform your enterprise operations with intelligent automation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/demo">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100" data-testid="button-schedule-demo">
                  Schedule a Demo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/docs/training-guides">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-explore-training">
                  Explore Training
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
