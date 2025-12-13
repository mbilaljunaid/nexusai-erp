import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Bot, ShoppingCart, DollarSign, Lock, BarChart3, Users, Factory, Globe, Shield, Cpu, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

const posts = [
  {
    id: 12,
    title: "2025 ERP Trends: What Every Enterprise Should Know",
    category: "Industry",
    author: "Sarah Chen",
    date: "Dec 13, 2025",
    excerpt: "As we approach 2026, discover the key ERP trends that will shape enterprise operations including AI-first architectures, real-time analytics, and sustainable business practices.",
    icon: TrendingUp,
    content: `As we approach 2026, the enterprise resource planning landscape continues to evolve at an unprecedented pace. Organizations that stay ahead of these trends will be better positioned to compete in an increasingly digital marketplace.

## AI-First Architectures

The integration of artificial intelligence into ERP systems has moved from a nice-to-have feature to a fundamental requirement. Modern ERP platforms are being built with AI at their core, enabling predictive analytics, intelligent automation, and natural language processing capabilities that transform how businesses operate.

## Real-Time Analytics

Gone are the days of batch processing and delayed reports. Today's enterprises demand real-time visibility into their operations. From supply chain monitoring to financial dashboards, instant access to actionable data is becoming the norm.

## Sustainable Business Practices

Environmental sustainability is no longer just a corporate responsibility initiative—it's a business imperative. ERP systems are now incorporating carbon footprint tracking, sustainable sourcing metrics, and ESG reporting capabilities to help organizations meet their sustainability goals.

## Cloud-Native Deployments

The shift to cloud-native ERP continues to accelerate. Organizations are moving away from on-premise installations in favor of flexible, scalable cloud solutions that offer better uptime, automatic updates, and reduced infrastructure costs.

## Integration Ecosystems

Modern ERP systems are designed to be the hub of an interconnected ecosystem. API-first architectures enable seamless integration with hundreds of third-party applications, from CRM systems to specialized industry solutions.`
  },
  {
    id: 11,
    title: "Building Resilient Supply Chains with NexusAI",
    category: "Analytics",
    author: "Lisa Wang",
    date: "Dec 10, 2025",
    excerpt: "Learn how to build supply chain resilience using predictive modeling, multi-source vendor management, and automated risk assessment features in NexusAI ERP.",
    icon: Factory,
    content: `Supply chain disruptions have become a constant challenge for businesses worldwide. Building resilience into your supply chain is no longer optional—it's essential for survival.

## Predictive Modeling

NexusAI's advanced predictive modeling capabilities allow you to anticipate supply chain disruptions before they occur. By analyzing historical data, market trends, and external factors, the system can alert you to potential issues and suggest proactive measures.

## Multi-Source Vendor Management

Relying on a single supplier for critical components is a recipe for disaster. NexusAI enables sophisticated multi-source vendor management, helping you diversify your supplier base while maintaining quality and cost efficiency.

## Automated Risk Assessment

Every vendor, every route, every warehouse carries inherent risks. NexusAI's automated risk assessment continuously monitors your supply chain, scoring each element based on reliability, financial stability, and external factors.

## Real-Time Visibility

You can't manage what you can't see. NexusAI provides end-to-end visibility into your supply chain, from raw materials to finished goods delivery.`
  },
  {
    id: 10,
    title: "Zero-Trust Security Architecture in Modern ERP",
    category: "Technical",
    author: "David Lee",
    date: "Dec 07, 2025",
    excerpt: "Explore how NexusAI implements zero-trust security principles including continuous authentication, micro-segmentation, and encrypted data at rest and in transit.",
    icon: Shield,
    content: `In today's threat landscape, traditional perimeter-based security is no longer sufficient. Zero-trust architecture assumes that threats can come from anywhere—inside or outside your organization.

## Continuous Authentication

Rather than authenticating users once at login, NexusAI continuously verifies user identity throughout their session using behavioral analytics and contextual factors.

## Micro-Segmentation

NexusAI implements micro-segmentation to isolate different parts of the system. Even if one segment is compromised, the breach cannot spread to other areas.

## Encryption Everywhere

All data in NexusAI is encrypted both at rest and in transit using industry-standard AES-256 encryption.`
  },
  {
    id: 9,
    title: "Automating Compliance: SOX, GDPR, and Beyond",
    category: "Finance",
    author: "Emily Rodriguez",
    date: "Dec 03, 2025",
    excerpt: "A comprehensive guide to automating regulatory compliance workflows, audit trails, and reporting for SOX, GDPR, HIPAA, and industry-specific requirements.",
    icon: DollarSign,
    content: `Regulatory compliance is a constant challenge for enterprises. Manual compliance processes are time-consuming, error-prone, and expensive.

## Automated Audit Trails

NexusAI automatically captures every action, every change, and every access attempt in immutable audit logs. These comprehensive trails make compliance audits faster and more reliable.

## Pre-Built Compliance Templates

Get started quickly with pre-built templates for major regulations including SOX, GDPR, HIPAA, PCI-DSS, and industry-specific requirements.`
  },
  {
    id: 8,
    title: "Global Workforce Management: Multi-Region HR Operations",
    category: "HR",
    author: "James Wilson",
    date: "Dec 02, 2025",
    excerpt: "Master the complexities of managing a global workforce including multi-currency payroll, regional compliance, localized benefits, and cross-border talent mobility.",
    icon: Globe,
    content: `Managing a global workforce presents unique challenges. Different countries have different labor laws, tax requirements, and cultural expectations.

## Multi-Currency Payroll

NexusAI handles payroll in any currency, with automatic exchange rate updates and compliance with local tax regulations.

## Regional Compliance

Labor laws vary dramatically from country to country. NexusAI stays current with regulations in over 100 countries.`
  },
  {
    id: 7,
    title: "AI-Powered Process Mining: Uncovering Hidden Inefficiencies",
    category: "AI",
    author: "Mike Johnson",
    date: "Nov 29, 2025",
    excerpt: "Discover how NexusAI's process mining capabilities use machine learning to identify bottlenecks, predict process failures, and recommend optimization strategies.",
    icon: Cpu,
    content: `Most organizations don't fully understand their own processes. Process mining uses data from your ERP system to create accurate models of how work actually flows through your organization.

## Automated Process Discovery

NexusAI analyzes your transaction data to automatically discover and visualize your actual business processes.

## Bottleneck Identification

Machine learning algorithms identify bottlenecks and inefficiencies that might not be obvious to human observers.`
  },
  {
    id: 1,
    title: "10 Ways AI is Transforming Enterprise ERP",
    category: "AI",
    author: "Sarah Chen",
    date: "Nov 28, 2025",
    excerpt: "Discover how artificial intelligence is revolutionizing enterprise resource planning through intelligent automation, predictive analytics, and natural language processing.",
    icon: Bot,
    content: `Artificial intelligence is fundamentally changing how enterprises manage their resources. From intelligent automation to predictive analytics, AI is making ERP systems smarter, faster, and more intuitive.

## Intelligent Automation

AI-powered automation goes beyond simple rule-based workflows. Machine learning enables systems to adapt and optimize processes over time.

## Predictive Analytics

Rather than just reporting on what happened, AI enables ERP systems to predict what will happen and recommend actions.

## Natural Language Processing

Conversational interfaces powered by NLP make ERP systems more accessible to non-technical users.`
  },
  {
    id: 2,
    title: "Implementing ERP in Retail: Best Practices",
    category: "Industry",
    author: "Mike Johnson",
    date: "Nov 25, 2025",
    excerpt: "Learn proven strategies for successful ERP implementation in retail, covering inventory optimization, omnichannel integration, and customer experience enhancement.",
    icon: ShoppingCart,
    content: `Retail ERP implementations come with unique challenges. The fast-paced nature of retail, combined with thin margins and complex supply chains, demands careful planning.

## Inventory Optimization

Effective inventory management is critical in retail. NexusAI's AI-powered forecasting helps you maintain optimal stock levels.

## Omnichannel Integration

Modern retailers must provide seamless experiences across all channels. NexusAI unifies online and offline operations.`
  },
  {
    id: 3,
    title: "Financial Close Automation: A Complete Guide",
    category: "Finance",
    author: "Emily Rodriguez",
    date: "Nov 22, 2025",
    excerpt: "Streamline your month-end close process with automated journal entries, real-time reconciliation, and configurable approval workflows that reduce close time by 60%.",
    icon: DollarSign,
    content: `The monthly financial close is one of the most stressful times for finance teams. Manual processes, scattered data, and tight deadlines create a perfect storm of pressure.

## Automated Journal Entries

NexusAI automatically generates routine journal entries based on configured rules, reducing manual effort and errors.

## Real-Time Reconciliation

Continuous reconciliation throughout the month means fewer surprises at close time.`
  },
  {
    id: 4,
    title: "Multi-Tenant Architecture in SaaS ERP",
    category: "Technical",
    author: "David Lee",
    date: "Nov 20, 2025",
    excerpt: "Deep dive into how NexusAI ensures complete data isolation and enterprise-grade security in a multi-tenant SaaS environment with role-based access controls.",
    icon: Lock,
    content: `Multi-tenant architecture is the foundation of modern SaaS ERP systems. It enables economies of scale while maintaining security and customization.

## Data Isolation

Despite sharing infrastructure, each tenant's data is completely isolated using a combination of database-level and application-level controls.

## Role-Based Access Control

Fine-grained RBAC ensures users only see and modify data they're authorized to access.`
  },
  {
    id: 5,
    title: "Supply Chain Optimization with Predictive Analytics",
    category: "Analytics",
    author: "Lisa Wang",
    date: "Nov 18, 2025",
    excerpt: "Use machine learning algorithms to forecast demand patterns, optimize inventory levels, and reduce supply chain costs through intelligent vendor management.",
    icon: BarChart3,
    content: `Supply chain optimization is a complex challenge that involves balancing cost, speed, and reliability. Predictive analytics transforms this from an art to a science.

## Demand Forecasting

Machine learning models analyze historical data, seasonality, and external factors to predict future demand with high accuracy.

## Inventory Optimization

Smart algorithms determine optimal reorder points and quantities for each SKU based on demand patterns and supplier lead times.`
  },
  {
    id: 6,
    title: "HR Workflows: From Recruitment to Retirement",
    category: "HR",
    author: "James Wilson",
    date: "Nov 15, 2025",
    excerpt: "Complete HR lifecycle management featuring automated onboarding, performance tracking, benefits administration, and compliance monitoring in one unified platform.",
    icon: Users,
    content: `Managing the complete employee lifecycle requires coordination across multiple functions. NexusAI unifies all HR processes in a single platform.

## Automated Onboarding

New hire onboarding workflows automatically provision access, assign training, and track completion.

## Performance Management

Continuous feedback and goal tracking replace annual reviews with more effective ongoing performance management.`
  },
];

export default function BlogPostPage() {
  const params = useParams<{ id: string }>();
  const postId = parseInt(params.id || "0");
  const post = posts.find(p => p.id === postId);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | NexusAI Blog`;
    }
  }, [post]);

  if (!post) {
    return (
      <div className="public-page min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <Link to="/blog">
              <Button data-testid="button-back-to-blog">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = post.icon;

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 py-12">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6" data-testid="button-back-to-blog">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-muted/50 rounded-full mb-6">
              <IconComponent className="w-12 h-12 text-blue-500" />
            </div>
            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/50 mb-4">{post.category}</Badge>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-blog-title">{post.title}</h1>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {post.date}
              </span>
            </div>
          </div>

          <Card className="p-8">
            <div className="prose prose-invert max-w-none" data-testid="text-blog-content">
              {post.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={idx} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
                }
                return <p key={idx} className="text-muted-foreground mb-4 leading-relaxed">{paragraph}</p>;
              })}
            </div>
          </Card>

          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button data-testid="button-more-articles">
                Read More Articles <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
