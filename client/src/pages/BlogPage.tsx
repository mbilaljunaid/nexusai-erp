import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useState } from "react";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const posts = [
    {
      id: 1,
      title: "10 Ways AI is Transforming Enterprise ERP",
      category: "AI",
      author: "Sarah Chen",
      date: "Nov 28, 2025",
      excerpt: "Discover how artificial intelligence is revolutionizing enterprise resource planning and automating complex workflows.",
      image: "🤖",
    },
    {
      id: 2,
      title: "Implementing ERP in Retail: Best Practices",
      category: "Industry",
      author: "Mike Johnson",
      date: "Nov 25, 2025",
      excerpt: "Learn the proven strategies for successful ERP implementation in retail businesses, from planning to execution.",
      image: "🛒",
    },
    {
      id: 3,
      title: "Financial Close Automation: A Complete Guide",
      category: "Finance",
      author: "Emily Rodriguez",
      date: "Nov 22, 2025",
      excerpt: "Streamline your month-end close process with automated workflows and real-time reconciliation.",
      image: "💰",
    },
    {
      id: 4,
      title: "Multi-Tenant Architecture in SaaS ERP",
      category: "Technical",
      author: "David Lee",
      date: "Nov 20, 2025",
      excerpt: "Deep dive into how NexusAI ensures data isolation and security in a multi-tenant SaaS environment.",
      image: "🔐",
    },
    {
      id: 5,
      title: "Supply Chain Optimization with Predictive Analytics",
      category: "Analytics",
      author: "Lisa Wang",
      date: "Nov 18, 2025",
      excerpt: "Use machine learning to forecast demand, optimize inventory, and reduce supply chain costs.",
      image: "📊",
    },
    {
      id: 6,
      title: "HR Workflows: From Recruitment to Retirement",
      category: "HR",
      author: "James Wilson",
      date: "Nov 15, 2025",
      excerpt: "Complete HR lifecycle management with automated workflows, compliance tracking, and analytics.",
      image: "👥",
    },
  ];

  const categories = ["all", "AI", "Industry", "Finance", "Technical", "Analytics", "HR"];

  const filtered = selectedCategory === "all" 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <head>
        <title>Blog | NexusAI ERP Platform</title>
        <meta name="description" content="Read the latest articles, best practices, and insights about ERP, automation, and enterprise software." />
      </head>

      {/* Hero */}
      <section className="px-4 py-16 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">NexusAI Blog</h1>
        <p className="text-xl text-slate-300">Insights, best practices, and industry news for enterprise ERP</p>
      </section>

      {/* Category Filter */}
      <section className="px-4 py-8 flex justify-center gap-3 flex-wrap">
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
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <Card key={post.id} className="bg-slate-800 border-slate-700 overflow-hidden hover-elevate cursor-pointer" data-testid={`card-blog-post-${post.id}`}>
              <div className="text-6xl p-4 text-center bg-slate-700/50">{post.image}</div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/50">{post.category}</Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" /> {post.author}
                  </span>
                  <Button variant="ghost" size="sm" data-testid={`button-read-more-${post.id}`}>
                    Read <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-4 py-16 bg-slate-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-slate-300 mb-6">Get weekly insights on ERP, AI automation, and industry best practices.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-slate-400"
              data-testid="input-newsletter-email"
            />
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-subscribe">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
