import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Navigation";
import { 
  Heart, 
  Coffee, 
  Star, 
  CheckCircle, 
  Gift, 
  Building2, 
  Mail, 
  Phone, 
  MessageSquare,
  Github,
  Scale,
  Shield,
  Headphones,
  Server,
  Users,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PricingPage() {
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Pricing | NexusAI - Free Open Source ERP";
  }, []);

  const handleSponsor = async (amount: number) => {
    toast({
      title: "Thank you for your support!",
      description: `Redirecting to payment for $${amount}...`,
    });
    // Payment integration will be added here
  };

  const handleCustomSponsor = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount (minimum $1)",
        variant: "destructive"
      });
      return;
    }
    handleSponsor(amount);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Request Submitted",
      description: "We'll get back to you within 24-48 hours.",
    });
    
    setContactForm({ name: "", email: "", company: "", message: "" });
    setIsSubmitting(false);
  };

  const freeFeatures = [
    "Full source code access",
    "812 configurable forms",
    "18 end-to-end processes",
    "40+ industry templates",
    "Unlimited users",
    "Self-hosted deployment",
    "Community support",
    "Regular updates",
    "API access",
    "All modules included"
  ];

  const implementationServices = [
    { icon: Server, title: "Hosting Setup", desc: "Cloud or on-premise deployment assistance" },
    { icon: Users, title: "Implementation", desc: "Custom configuration and data migration" },
    { icon: Headphones, title: "Support", desc: "Post-implementation technical support" },
    { icon: Shield, title: "Training", desc: "User training and documentation" },
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 py-20 text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-green-600 text-white" data-testid="badge-free">100% FREE FOREVER</Badge>
          <h1 className="text-5xl font-bold mb-6" data-testid="text-page-title">Open Source. Free Forever.</h1>
          <p className="text-xl text-muted-foreground mb-8">
            NexusAI ERP is and will always remain free and open source. 
            Licensed under AGPL-3.0, you get the complete enterprise platform at no cost.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
              <Button size="lg" data-testid="button-github">
                <Github className="mr-2 w-5 h-5" /> View on GitHub
              </Button>
            </a>
            <Link to="/demo">
              <Button size="lg" variant="outline" data-testid="button-demo">
                Try Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Free Features */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything Included. Zero Cost.</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Unlike proprietary ERP systems that charge per user or per module, 
                NexusAI gives you the complete platform for free.
              </p>
            </div>

            <Card className="p-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">NexusAI ERP</h3>
                  <p className="text-muted-foreground">Complete Enterprise Platform</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-500">$0</div>
                  <div className="text-muted-foreground">Forever</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {freeFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Link to="/demo">
                <Button className="w-full" size="lg" data-testid="button-get-started">
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* Licensing Info */}
        <section className="px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Scale className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h2 className="text-3xl font-bold mb-4">Licensing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                NexusAI is licensed under AGPL-3.0. The license is and will remain <strong>FREE</strong>.
              </p>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Free to Use</h4>
                    <p className="text-sm text-muted-foreground">Use NexusAI for any purpose - personal, commercial, or educational</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Free to Modify</h4>
                    <p className="text-sm text-muted-foreground">Customize the code to fit your specific business needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">Free to Distribute</h4>
                    <p className="text-sm text-muted-foreground">Share with others under the same open source license</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Need help with hosting, implementation, or post-deployment support?</strong> 
                  {" "}Contact us for professional services. The software remains free; 
                  you only pay for the services you need.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Implementation Services */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h2 className="text-3xl font-bold mb-4">Implementation Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                While the software is free, companies may contact us for professional 
                implementation services, hosting setup, and ongoing support.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {implementationServices.map((service, i) => {
                const IconComponent = service.icon;
                return (
                  <Card key={i} className="p-6 text-center" data-testid={`card-service-${i}`}>
                    <IconComponent className="w-10 h-10 mx-auto mb-4 text-purple-500" />
                    <h3 className="font-bold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.desc}</p>
                  </Card>
                );
              })}
            </div>

            {/* Contact Form */}
            <Card className="p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-6 text-center">Request Implementation Services</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Name</label>
                    <Input 
                      placeholder="John Doe" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input 
                      type="email" 
                      placeholder="john@company.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Company Name</label>
                  <Input 
                    placeholder="Acme Inc."
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    data-testid="input-contact-company"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">How can we help?</label>
                  <Textarea 
                    placeholder="Tell us about your implementation needs, timeline, and any specific requirements..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                    className="min-h-[120px]"
                    data-testid="input-contact-message"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  data-testid="button-submit-contact"
                >
                  {isSubmitting ? "Sending..." : "Submit Request"}
                </Button>
              </form>
            </Card>
          </div>
        </section>

        {/* Sponsor Section */}
        <section className="px-4 py-20 bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Support NexusAI Development</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              If you find NexusAI valuable, consider sponsoring the project development. 
              Your support helps us maintain and improve the platform for everyone.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* $10 Option */}
              <Card className="bg-white/10 border-white/20 p-6 backdrop-blur" data-testid="card-sponsor-10">
                <Coffee className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">Buy Me 3 Coffees</h3>
                <div className="text-3xl font-bold mb-4">$10</div>
                <p className="text-sm text-white/70 mb-4">One-time contribution</p>
                <Button 
                  onClick={() => handleSponsor(10)} 
                  className="w-full bg-white text-orange-600 hover:bg-slate-100"
                  data-testid="button-sponsor-10"
                >
                  Sponsor $10
                </Button>
              </Card>

              {/* $25 Option */}
              <Card className="bg-white/10 border-white/20 p-6 backdrop-blur" data-testid="card-sponsor-25">
                <Star className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">Feature Supporter</h3>
                <div className="text-3xl font-bold mb-4">$25</div>
                <p className="text-sm text-white/70 mb-4">One-time contribution</p>
                <Button 
                  onClick={() => handleSponsor(25)} 
                  className="w-full bg-white text-orange-600 hover:bg-slate-100"
                  data-testid="button-sponsor-25"
                >
                  Sponsor $25
                </Button>
              </Card>

              {/* $50 Option */}
              <Card className="bg-white/10 border-white/20 p-6 backdrop-blur" data-testid="card-sponsor-50">
                <Gift className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
                <h3 className="text-xl font-bold mb-2">Project Champion</h3>
                <div className="text-3xl font-bold mb-4">$50</div>
                <p className="text-sm text-white/70 mb-4">One-time contribution</p>
                <Button 
                  onClick={() => handleSponsor(50)} 
                  className="w-full bg-white text-orange-600 hover:bg-slate-100"
                  data-testid="button-sponsor-50"
                >
                  Sponsor $50
                </Button>
              </Card>
            </div>

            {/* Custom Amount */}
            <Card className="bg-white/10 border-white/20 p-6 backdrop-blur max-w-md mx-auto" data-testid="card-sponsor-custom">
              <h3 className="text-lg font-bold mb-4">Custom Amount</h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-7 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    data-testid="input-custom-amount"
                  />
                </div>
                <Button 
                  onClick={handleCustomSponsor}
                  className="bg-white text-orange-600 hover:bg-slate-100"
                  data-testid="button-sponsor-custom"
                >
                  Sponsor
                </Button>
              </div>
            </Card>

            <p className="mt-8 text-sm text-white/60">
              Payments securely processed via Stripe
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <h4 className="font-bold mb-2">Is NexusAI really free?</h4>
                <p className="text-muted-foreground text-sm">
                  Yes! NexusAI is 100% free and open source under the AGPL-3.0 license. 
                  You can use it for any purpose without paying licensing fees.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold mb-2">Will it remain free?</h4>
                <p className="text-muted-foreground text-sm">
                  Absolutely. NexusAI will remain free forever. Our commitment to open source is unwavering.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold mb-2">What do implementation services include?</h4>
                <p className="text-muted-foreground text-sm">
                  Implementation services include hosting setup, data migration, custom configuration, 
                  user training, and ongoing technical support. Contact us for a custom quote.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-bold mb-2">Where does sponsorship money go?</h4>
                <p className="text-muted-foreground text-sm">
                  Sponsorship funds help cover development costs, hosting for demos, 
                  documentation improvements, and community support efforts.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 bg-muted/50 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Download NexusAI and start transforming your business today. It's free!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="https://github.com/mbilaljunaid/nexusai-erp" target="_blank" rel="noopener noreferrer">
                <Button size="lg" data-testid="button-download">
                  <Github className="mr-2 w-5 h-5" /> Download from GitHub
                </Button>
              </a>
              <Link to="/docs/implementation">
                <Button size="lg" variant="outline" data-testid="button-implementation-guide">
                  Implementation Guide
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
