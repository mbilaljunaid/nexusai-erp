import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  CheckCircle2, Circle, ChevronDown, ChevronUp, X, Rocket,
  User, Settings, Users, Bell, BarChart3, FileText, Sparkles
} from "lucide-react";
import { Link } from "wouter";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  href?: string;
  action?: string;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, role, and profile picture to personalize your experience",
    icon: User,
    href: "/settings/profile",
    action: "Go to Profile",
  },
  {
    id: "preferences",
    title: "Set your preferences",
    description: "Configure notifications, theme, and display settings",
    icon: Settings,
    href: "/settings",
    action: "Open Settings",
  },
  {
    id: "team",
    title: "Invite team members",
    description: "Add colleagues to collaborate on projects and tasks",
    icon: Users,
    href: "/user-management",
    action: "Manage Team",
  },
  {
    id: "notifications",
    title: "Configure notifications",
    description: "Choose which alerts and updates you want to receive",
    icon: Bell,
    href: "/settings/notifications",
    action: "Set Up Notifications",
  },
  {
    id: "dashboard",
    title: "Customize your dashboard",
    description: "Add widgets and arrange your dashboard to fit your workflow",
    icon: BarChart3,
    href: "/dashboard",
    action: "Customize Dashboard",
  },
  {
    id: "explore",
    title: "Explore key features",
    description: "Take a tour of CRM, ERP, HR, and Analytics modules",
    icon: Sparkles,
    href: "/processes",
    action: "Start Exploring",
  },
];

const STORAGE_KEY = "nexusai-onboarding-progress";
const DISMISSED_KEY = "nexusai-onboarding-dismissed";

export function OnboardingChecklist() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCompletedItems(JSON.parse(stored));
    }
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const toggleComplete = (itemId: string) => {
    setCompletedItems(prev => {
      const newItems = prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
      return newItems;
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  const handleReopen = () => {
    setIsDismissed(false);
    localStorage.removeItem(DISMISSED_KEY);
  };

  const progress = (completedItems.length / checklistItems.length) * 100;
  const isComplete = completedItems.length === checklistItems.length;

  if (isDismissed && !isComplete) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleReopen}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
        data-testid="button-reopen-onboarding"
      >
        <Rocket className="w-4 h-4 mr-2" />
        Resume Setup
      </Button>
    );
  }

  if (isComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 shadow-lg" data-testid="onboarding-checklist">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription>
                  {completedItems.length} of {checklistItems.length} steps completed
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-toggle-onboarding">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDismiss}
                data-testid="button-dismiss-onboarding"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-2">
            {checklistItems.map((item) => {
              const isCompleted = completedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    isCompleted 
                      ? "bg-green-500/5 border-green-200 dark:border-green-800" 
                      : "bg-card hover-elevate"
                  }`}
                  data-testid={`onboarding-item-${item.id}`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-6 w-6"
                    onClick={() => toggleComplete(item.id)}
                    data-testid={`button-toggle-${item.id}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${isCompleted ? "text-green-600" : "text-muted-foreground"}`} />
                      <h4 className={`font-medium text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  {!isCompleted && item.href && (
                    <Link href={item.href}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleComplete(item.id)}
                        data-testid={`button-action-${item.id}`}
                      >
                        {item.action}
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function OnboardingProgress() {
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCompletedItems(JSON.parse(stored));
    }
  }, []);

  const progress = (completedItems.length / checklistItems.length) * 100;
  const isComplete = completedItems.length === checklistItems.length;

  if (isComplete) return null;

  return (
    <div className="flex items-center gap-2" data-testid="onboarding-progress-mini">
      <Badge variant="outline" className="text-xs">
        Setup: {completedItems.length}/{checklistItems.length}
      </Badge>
    </div>
  );
}
