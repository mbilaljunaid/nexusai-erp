import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Gift, Zap, Shield, BarChart3, Workflow, Bell, CheckCircle } from "lucide-react";

interface FeatureUpdate {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: "feature" | "improvement" | "security" | "fix";
  icon: any;
  isNew?: boolean;
}

const recentUpdates: FeatureUpdate[] = [
  {
    id: "1",
    version: "2.5.0",
    date: "December 2024",
    title: "AI-Powered Insights",
    description: "Get intelligent recommendations and predictive analytics powered by advanced AI models. Automatically detect patterns and receive actionable insights.",
    type: "feature",
    icon: Sparkles,
    isNew: true,
  },
  {
    id: "2",
    version: "2.5.0",
    date: "December 2024",
    title: "Marketplace & App Store",
    description: "Browse and install third-party apps from our new marketplace. Extend your platform with integrations for CRM, HR, Finance, and more.",
    type: "feature",
    icon: Gift,
    isNew: true,
  },
  {
    id: "3",
    version: "2.4.0",
    date: "November 2024",
    title: "Enhanced Workflow Automation",
    description: "Create complex multi-step workflows with conditional logic, approvals, and notifications. Automate repetitive tasks and save hours every week.",
    type: "feature",
    icon: Workflow,
  },
  {
    id: "4",
    version: "2.4.0",
    date: "November 2024",
    title: "Advanced Analytics Dashboard",
    description: "New customizable analytics widgets with real-time data visualization, drill-down capabilities, and export options.",
    type: "improvement",
    icon: BarChart3,
  },
  {
    id: "5",
    version: "2.3.0",
    date: "October 2024",
    title: "Enterprise Security Enhancements",
    description: "Added multi-factor authentication, role-based access control, audit logging, and compliance monitoring features.",
    type: "security",
    icon: Shield,
  },
  {
    id: "6",
    version: "2.3.0",
    date: "October 2024",
    title: "Performance Optimizations",
    description: "Significantly improved page load times and API response speeds. Enhanced caching and reduced memory usage.",
    type: "improvement",
    icon: Zap,
  },
];

const STORAGE_KEY = "nexusai-whats-new-seen";

export function WhatsNew() {
  const [open, setOpen] = useState(false);
  const [hasUnseenUpdates, setHasUnseenUpdates] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem(STORAGE_KEY);
    const latestVersion = recentUpdates[0]?.version;
    if (seenVersion !== latestVersion) {
      setHasUnseenUpdates(true);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    const latestVersion = recentUpdates[0]?.version;
    localStorage.setItem(STORAGE_KEY, latestVersion);
    setHasUnseenUpdates(false);
  };

  const getTypeBadge = (type: FeatureUpdate["type"]) => {
    switch (type) {
      case "feature":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">New Feature</Badge>;
      case "improvement":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Improvement</Badge>;
      case "security":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">Security</Badge>;
      case "fix":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-200">Bug Fix</Badge>;
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleOpen}
        className="relative"
        data-testid="button-whats-new"
      >
        <Gift className="h-4 w-4" />
        {hasUnseenUpdates && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              What's New in NexusAI
            </DialogTitle>
            <DialogDescription>
              Discover the latest features, improvements, and updates
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {recentUpdates.map((update) => (
                <div 
                  key={update.id}
                  className="flex gap-4 p-4 rounded-lg border bg-card hover-elevate transition-all"
                  data-testid={`whats-new-item-${update.id}`}
                >
                  <div className="shrink-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      update.type === "feature" ? "bg-blue-500/10 text-blue-600" :
                      update.type === "improvement" ? "bg-green-500/10 text-green-600" :
                      update.type === "security" ? "bg-purple-500/10 text-purple-600" :
                      "bg-orange-500/10 text-orange-600"
                    }`}>
                      <update.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{update.title}</h4>
                        {update.isNew && (
                          <Badge className="bg-primary text-primary-foreground text-xs">NEW</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(update.type)}
                        <span className="text-xs text-muted-foreground">v{update.version}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                    <p className="text-xs text-muted-foreground">{update.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t pt-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Stay updated with our latest improvements
            </p>
            <Button onClick={() => setOpen(false)} data-testid="button-close-whats-new">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
