import { useState, useEffect, createContext, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, ChevronRight, ChevronLeft } from "lucide-react";

interface QuickTip {
  id: string;
  context: string;
  title: string;
  content: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const quickTips: QuickTip[] = [
  {
    id: "dashboard-widgets",
    context: "dashboard",
    title: "Customize Your View",
    content: "Drag and drop widgets to arrange your dashboard exactly how you want it. Click the edit button to add or remove widgets.",
  },
  {
    id: "keyboard-shortcuts",
    context: "global",
    title: "Keyboard Shortcuts",
    content: "Press Ctrl+K (Cmd+K on Mac) to open the command palette for quick navigation and actions.",
  },
  {
    id: "crm-leads",
    context: "crm",
    title: "Lead Scoring",
    content: "Our AI automatically scores leads based on engagement and profile data. Higher scores indicate better conversion potential.",
  },
  {
    id: "erp-inventory",
    context: "erp",
    title: "Low Stock Alerts",
    content: "Set up automatic alerts when inventory falls below threshold. Go to Settings to configure your notification preferences.",
  },
  {
    id: "hr-onboarding",
    context: "hr",
    title: "Employee Onboarding",
    content: "Use the onboarding workflow to automate new hire setup, including document collection, training assignments, and equipment requests.",
  },
  {
    id: "analytics-export",
    context: "analytics",
    title: "Export Your Data",
    content: "All reports can be exported to Excel, PDF, or CSV. Look for the download button in the top-right corner of any chart.",
  },
  {
    id: "ai-assistant",
    context: "ai",
    title: "AI Assistant",
    content: "Ask the AI assistant anything about your data. Try queries like 'Show my top customers' or 'What were last month's sales?'",
  },
  {
    id: "workflow-automation",
    context: "workflow",
    title: "Automate Repetitive Tasks",
    content: "Create workflows to automate approvals, notifications, and data updates. Save hours every week with smart automation.",
  },
];

const STORAGE_KEY = "nexusai-tips-dismissed";
const TIPS_ENABLED_KEY = "nexusai-tips-enabled";

interface QuickTipsContextType {
  showTip: (context: string) => void;
  hideTip: () => void;
  enableTips: () => void;
  disableTips: () => void;
  tipsEnabled: boolean;
}

const QuickTipsContext = createContext<QuickTipsContextType | undefined>(undefined);

export function QuickTipsProvider({ children }: { children: React.ReactNode }) {
  const [currentTip, setCurrentTip] = useState<QuickTip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDismissedTips(JSON.parse(stored));
    }
    const enabled = localStorage.getItem(TIPS_ENABLED_KEY);
    if (enabled === "false") {
      setTipsEnabled(false);
    }
  }, []);

  const showTip = (context: string) => {
    if (!tipsEnabled) return;
    
    const contextTips = quickTips.filter(
      tip => (tip.context === context || tip.context === "global") && 
             !dismissedTips.includes(tip.id)
    );
    
    if (contextTips.length > 0) {
      setCurrentTip(contextTips[0]);
      setTipIndex(0);
    }
  };

  const hideTip = () => {
    if (currentTip) {
      const newDismissed = [...dismissedTips, currentTip.id];
      setDismissedTips(newDismissed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDismissed));
    }
    setCurrentTip(null);
  };

  const enableTips = () => {
    setTipsEnabled(true);
    localStorage.setItem(TIPS_ENABLED_KEY, "true");
  };

  const disableTips = () => {
    setTipsEnabled(false);
    localStorage.setItem(TIPS_ENABLED_KEY, "false");
    setCurrentTip(null);
  };

  return (
    <QuickTipsContext.Provider value={{ showTip, hideTip, enableTips, disableTips, tipsEnabled }}>
      {children}
      {currentTip && tipsEnabled && (
        <QuickTipPopup tip={currentTip} onDismiss={hideTip} onDisableAll={disableTips} />
      )}
    </QuickTipsContext.Provider>
  );
}

export function useQuickTips() {
  const context = useContext(QuickTipsContext);
  if (!context) {
    throw new Error("useQuickTips must be used within a QuickTipsProvider");
  }
  return context;
}

interface QuickTipPopupProps {
  tip: QuickTip;
  onDismiss: () => void;
  onDisableAll: () => void;
}

function QuickTipPopup({ tip, onDismiss, onDisableAll }: QuickTipPopupProps) {
  return (
    <Card 
      className="fixed bottom-4 right-4 w-80 shadow-xl z-50 border-primary/20 animate-in slide-in-from-bottom-4"
      data-testid="quick-tip-popup"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm">{tip.title}</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                onClick={onDismiss}
                data-testid="button-dismiss-tip"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{tip.content}</p>
            <div className="flex items-center justify-between mt-3 gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={onDisableAll}
                data-testid="button-disable-tips"
              >
                Don't show tips
              </Button>
              <Button 
                size="sm" 
                onClick={onDismiss}
                data-testid="button-got-it"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TipsToggle() {
  const { tipsEnabled, enableTips, disableTips } = useQuickTips();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={tipsEnabled ? disableTips : enableTips}
      title={tipsEnabled ? "Disable quick tips" : "Enable quick tips"}
      data-testid="button-toggle-tips"
    >
      <Lightbulb className={`h-4 w-4 ${tipsEnabled ? "text-yellow-500" : "text-muted-foreground"}`} />
    </Button>
  );
}
