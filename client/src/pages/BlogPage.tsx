import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Calendar, 
  User, 
  Bot, 
  ShoppingCart, 
  DollarSign, 
  Lock, 
  BarChart3, 
  Users,
  Zap,
  Factory,
  Globe,
  Shield,
  Cpu,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";
import { Link } from "wouter";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    document.title = "Blog | NexusAIFirst ERP Platform";
  }, []);

  const posts = [
    {
      id: 12,
      title: "2025 ERP Trends: What Every Enterprise Should Know",
      category: "Industry",
      author: "Sarah Chen",
      date: "Dec 13, 2025",
      excerpt: "As we approach 2026, discover the key ERP trends that will shape enterprise operations including AI-first architectures, real-time analytics, and sustainable business practices.",
      icon: TrendingUp,
    },
    {
      id: 11,
      title: "Building Resilient Supply Chains with NexusAIFirst",
      category: "Analytics",
      author: "Lisa Wang",
      date: "Dec 10, 2025",
      excerpt: "Learn how to build supply chain resilience using predictive modeling, multi-source vendor management, and automated risk assessment features in NexusAIFirst ERP.",
      icon: Factory,
    },
    {
      id: 10,
      title: "Zero-Trust Security Architecture in Modern ERP",
      category: "Technical",
      author: "David Lee",
      date: "Dec 07, 2025",
      excerpt: "Explore how NexusAIFirst implements zero-trust security principles including continuous authentication, micro-segmentation, and encrypted data at rest and in transit.",
      icon: Shield,
    },
    {
      id: 9,
      title: "Automating Compliance: SOX, GDPR, and Beyond",
      category: "Finance",
      author: "Emily Rodriguez",
      date: "Dec 03, 2025",
      excerpt: "A comprehensive guide to automating regulatory compliance workflows, audit trails, and reporting for SOX, GDPR, HIPAA, and industry-specific requirements.",
      icon: DollarSign,
    },
    {
      id: 8,
      title: "Global Workforce Management: Multi-Region HR Operations",
      category: "HR",
      author: "James Wilson",
      date: "Dec 02, 2025",
      excerpt: "Master the complexities of managing a global workforce including multi-currency payroll, regional compliance, localized benefits, and cross-border talent mobility.",
      icon: Globe,
    },
    {
      id: 7,
      title: "AI-Powered Process Mining: Uncovering Hidden Inefficiencies",
      category: "AI",
      author: "Mike Johnson",
      date: "Nov 29, 2025",
      excerpt: "Discover how NexusAIFirst's process mining capabilities use machine learning to identify bottlenecks, predict process failures, and recommend optimization strategies.",
      icon: Cpu,
    },
    {
      id: 1,
      title: "10 Ways AI is Transforming Enterprise ERP",
      category: "AI",
      author: "Sarah Chen",
      date: "Nov 28, 2025",
      excerpt: "Discover how artificial intelligence is revolutionizing enterprise resource planning through intelligent automation, predictive analytics, and natural language processing.",
      icon: Bot,
    },
    {
      id: 2,
      title: "Implementing ERP in Retail: Best Practices",
      category: "Industry",
      author: "Mike Johnson",
      date: "Nov 25, 2025",
      excerpt: "Learn proven strategies for successful ERP implementation in retail, covering inventory optimization, omnichannel integration, and customer experience enhancement.",
      icon: ShoppingCart,
    },
    {
      id: 3,
      title: "Financial Close Automation: A Complete Guide",
      category: "Finance",
      author: "Emily Rodriguez",
      date: "Nov 22, 2025",
      excerpt: "Streamline your month-end close process with automated journal entries, real-time reconciliation, and configurable approval workflows that reduce close time by 60%.",
      icon: DollarSign,
    },
    {
      id: 4,
      title: "Multi-Tenant Architecture in SaaS ERP",
      category: "Technical",
      author: "David Lee",
      date: "Nov 20, 2025",
      excerpt: "Deep dive into how NexusAIFirst ensures complete data isolation and enterprise-grade security in a multi-tenant SaaS environment with role-based access controls.",
      icon: Lock,
    },
    {
      id: 5,
      title: "Supply Chain Optimization with Predictive Analytics",
      category: "Analytics",
      author: "Lisa Wang",
      date: "Nov 18, 2025",
      excerpt: "Use machine learning algorithms to forecast demand patterns, optimize inventory levels, and reduce supply chain costs through intelligent vendor management.",
      icon: BarChart3,
    },
    {
      id: 6,
      title: "HR Workflows: From Recruitment to Retirement",
      category: "HR",
      author: "James Wilson",
      date: "Nov 15, 2025",
      excerpt: "Complete HR lifecycle management featuring automated onboarding, performance tracking, benefits administration, and compliance monitoring in one unified platform.",
      icon: Users,
    },
  ];

  const categories = ["all", "AI", "Industry", "Finance", "Technical", "Analytics", "HR"];

  const filtered = selectedCategory === "all" 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">

      {/* Hero */}
      <section className="public-hero px-4 py-16 text-center max-w-4xl mx-auto">
        <h1 className="public-hero-title text-5xl font-bold mb-4">NexusAIFirst Blog</h1>
        <p className="public-hero-subtitle text-xl">Insights, best practices, and industry news for enterprise ERP</p>
      </section>

      {/* Category Filter */}
      <section className="public-section px-4 py-8 flex justify-center gap-3 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            variant={selectedCategory === cat ? "default" : "outline"}
            className={selectedCategory === cat ? "bg-blue-600" : "text-white border-slate-600"}
            data-testid={`button-filter-${cat}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </section>

      {/* Blog Posts */}
      <section className="public-section px-4 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => {
            const IconComponent = post.icon;
            return (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <Card className="public-card overflow-hidden hover-elevate cursor-pointer h-full" data-testid={`card-blog-post-${post.id}`}>
                  <div className="p-6 text-center bg-muted/50 flex items-center justify-center">
                    <IconComponent className="w-12 h-12 text-blue-500" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/50">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.author}
                      </span>
                      <Button variant="ghost" size="sm" data-testid={`button-read-more-${post.id}`}>
                        Read <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Newsletter */}
      <section className="public-section-alt px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p style={{ color: `hsl(var(--muted-foreground))` }} className="mb-6">Get weekly insights on ERP, AI automation, and industry best practices.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded bg-[hsl(var(--input))] border border-[hsl(var(--input-border))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))]"
              data-testid="input-newsletter-email"
            />
            <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white" data-testid="button-subscribe">Subscribe</Button>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
