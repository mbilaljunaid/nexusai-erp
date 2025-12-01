import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Linkedin, Github, Twitter } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";
import { Header, Footer } from "@/components/Navigation";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About NexusAI | AI-Powered ERP Platform";
  }, []);

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
      {/* Hero */}
      <section className="public-hero px-4 py-20 text-center max-w-4xl mx-auto">
        <h1 className="public-hero-title text-5xl font-bold mb-6">About NexusAI</h1>
        <p className="public-hero-subtitle text-xl">Revolutionizing enterprise software with AI-powered automation and industry-specific solutions for the modern workforce.</p>
      </section>

      {/* Mission */}
      <section className="public-section-alt px-4 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="public-card p-6">
            <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
            <p style={{ color: `hsl(var(--muted-foreground))` }}>Empower businesses of all sizes with enterprise-grade ERP software that's affordable, easy to use, and powered by artificial intelligence.</p>
          </Card>
          <Card className="public-card p-6">
            <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
            <p style={{ color: `hsl(var(--muted-foreground))` }}>To become the world's most trusted all-in-one ERP platform, enabling companies to operate more efficiently across 40+ industries globally.</p>
          </Card>
          <Card className="public-card p-6">
            <h3 className="text-2xl font-bold mb-3">Our Values</h3>
            <p style={{ color: `hsl(var(--muted-foreground))` }}>Innovation, transparency, customer-first thinking, and continuous improvement in everything we do.</p>
          </Card>
        </div>
      </section>

      {/* Why NexusAI */}
      <section className="public-section px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-center">Why Choose NexusAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { title: "Built for Speed", desc: "Implement in weeks, not months. Pre-configured for your industry." }
            { title: "AI at Core", desc: "Real-time insights, predictive analytics, and intelligent automation." }
            { title: "40+ Industries", desc: "Specialized modules for Automotive, Banking, Healthcare, Retail, and more." }
            { title: "One Platform", desc: "ERP, CRM, HR, Finance, Projects, and more - all in one place." }
            { title: "Transparent Pricing", desc: "No hidden fees. Scale-as-you-grow pricing model." }
            { title: "Enterprise Security", desc: "RBAC, multi-tenant isolation, audit logging, SOC 2 compliant." }
          ].map((item, i) => (
            <div key={i} className="public-accent-border border-l-4 pl-6">
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p style={{ color: `hsl(var(--muted-foreground))` }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="public-section-alt px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-slate-400">support@nexusai.com</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-slate-400">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-slate-400">San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-slate-700 border-slate-600 p-6">
              <h3 className="font-bold text-lg mb-4">Send us a Message</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-2 rounded bg-slate-600 border border-slate-500 text-white placeholder-slate-400" />
                <input type="email" placeholder="Your Email" className="w-full px-4 py-2 rounded bg-slate-600 border border-slate-500 text-white placeholder-slate-400" />
                <textarea placeholder="Message" className="w-full px-4 py-2 rounded bg-slate-600 border border-slate-500 text-white placeholder-slate-400 h-24"></textarea>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Send Message</Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="px-4 py-16 text-center">
        <h3 className="text-2xl font-bold mb-8">Follow Us</h3>
        <div className="flex justify-center gap-8">
          <a href="#linkedin" className="text-slate-400 hover:text-blue-400 transition"><Linkedin className="w-8 h-8" /></a>
          <a href="#github" className="text-slate-400 hover:text-blue-400 transition"><Github className="w-8 h-8" /></a>
          <a href="#twitter" className="text-slate-400 hover:text-blue-400 transition"><Twitter className="w-8 h-8" /></a>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
