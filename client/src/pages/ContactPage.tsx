import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  Send,
  Building2,
  MessageSquare,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    document.title = "Contact Us | NexusAI ERP Platform";
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSubmitted(true);
      toast({
        title: "Message Sent",
        description: data.message || "Thank you for contacting us. We'll respond shortly.",
      });
      setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Our Location",
      details: ["123 Enterprise Way", "San Francisco, CA 94105"]
    },
    {
      icon: Phone,
      title: "Phone",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543"]
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9AM - 6PM PST", "Weekend: Closed"]
    }
  ];

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="public-hero px-4 py-16 text-center max-w-4xl mx-auto">
          <h1 className="public-hero-title text-5xl font-bold mb-4" data-testid="text-contact-title">Contact Us</h1>
          <p className="public-hero-subtitle text-xl text-muted-foreground">
            Have questions about NexusAI ERP? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </section>

        <section className="px-4 py-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h2 className="text-2xl font-bold mb-2">Message Sent Successfully</h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. Our team will review your message and get back to you within 24-48 hours.
                    </p>
                    <Button onClick={() => setSubmitted(false)} data-testid="button-send-another">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <MessageSquare className="w-6 h-6 text-blue-500" />
                      <h2 className="text-2xl font-bold">Send us a Message</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                          data-testid="input-contact-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@company.com"
                          required
                          data-testid="input-contact-email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Acme Inc."
                            className="pl-10"
                            data-testid="input-contact-company"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input 
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="How can we help?"
                          required
                          data-testid="input-contact-subject"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea 
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required
                        data-testid="input-contact-message"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={submitMutation.isPending}
                      data-testid="button-submit-contact"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-blue-500" />
                  <h3 className="font-bold text-lg">Get in Touch</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  Our team is available to answer your questions and help you find the right ERP solution for your business.
                </p>
              </Card>

              {contactInfo.map((info, i) => {
                const IconComponent = info.icon;
                return (
                  <Card key={i} className="p-6" data-testid={`card-contact-info-${i}`}>
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <IconComponent className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{info.title}</h4>
                        {info.details.map((detail, j) => (
                          <p key={j} className="text-sm text-muted-foreground">{detail}</p>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}

              <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <h3 className="font-bold text-lg mb-2">Need Immediate Help?</h3>
                <p className="text-sm text-blue-100 mb-4">
                  For urgent inquiries, our support team is available via live chat during business hours.
                </p>
                <Button variant="secondary" size="sm" className="w-full" data-testid="button-start-chat">
                  Start Live Chat
                </Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground mb-8">
              Before reaching out, check if your question has already been answered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <Card className="p-6">
                <h4 className="font-semibold mb-2">How do I request a demo?</h4>
                <p className="text-sm text-muted-foreground">
                  Visit our Demo page to schedule a personalized walkthrough of NexusAI ERP features.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">What industries do you support?</h4>
                <p className="text-sm text-muted-foreground">
                  NexusAI ERP supports 41+ industries including manufacturing, retail, healthcare, and more.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">Is there a free trial available?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! We offer a 14-day free trial with access to all core features.
                </p>
              </Card>
              <Card className="p-6">
                <h4 className="font-semibold mb-2">How long does implementation take?</h4>
                <p className="text-sm text-muted-foreground">
                  Implementation typically takes 4-12 weeks depending on your organization's size and requirements.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
