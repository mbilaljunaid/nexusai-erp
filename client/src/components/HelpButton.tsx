import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTour, Tour } from "@/hooks/use-tour";
import { HelpCircle, RotateCcw, Play, BookOpen, Sparkles } from "lucide-react";

const dashboardTour: Tour = {
  id: "dashboard-tour",
  name: "Dashboard Tour",
  steps: [
    {
      target: "[data-testid='button-sidebar-toggle']",
      title: "Navigation Menu",
      content: "Click here to toggle the sidebar navigation. The sidebar gives you access to all NexusAI modules and features.",
      placement: "right",
    },
    {
      target: "[data-tour='quick-stats']",
      title: "Quick Stats",
      content: "This section shows you real-time metrics about your organization - active users, running processes, pending tasks, and system health.",
      placement: "bottom",
    },
    {
      target: "[data-tour='core-modules']",
      title: "Core Modules",
      content: "These are the main business modules available in NexusAI. Click any card to access CRM, Projects, Finance, HR, and more.",
      placement: "top",
    },
    {
      target: "[data-tour='quick-links']",
      title: "Quick Links",
      content: "Access frequently used features like Process Hub, Integrations, API Management, and Admin settings from here.",
      placement: "top",
    },
    {
      target: "[data-tour='getting-started']",
      title: "Getting Started",
      content: "New to NexusAI? The Process Hub is a great starting point to understand our 18 end-to-end business processes.",
      placement: "top",
    },
  ],
};

const navigationTour: Tour = {
  id: "navigation-tour",
  name: "Navigation Tour",
  steps: [
    {
      target: "[data-testid='button-sidebar-toggle']",
      title: "Sidebar Toggle",
      content: "Click this button to expand or collapse the sidebar navigation menu.",
      placement: "right",
    },
    {
      target: "[data-testid='button-help-menu']",
      title: "Help & Tours",
      content: "Access guided tours and help resources from this menu. You can restart tours anytime.",
      placement: "bottom",
    },
  ],
};

export function HelpButton() {
  const { startTour, hasCompletedTour, resetAllTours } = useTour();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" data-testid="button-help-menu">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Guided Tours
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => startTour(dashboardTour)}
          className="flex items-center gap-2"
          data-testid="menu-item-dashboard-tour"
        >
          <Play className="h-4 w-4" />
          Dashboard Tour
          {hasCompletedTour("dashboard-tour") && (
            <span className="ml-auto text-xs text-muted-foreground">Completed</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => startTour(navigationTour)}
          className="flex items-center gap-2"
          data-testid="menu-item-navigation-tour"
        >
          <BookOpen className="h-4 w-4" />
          Navigation Tour
          {hasCompletedTour("navigation-tour") && (
            <span className="ml-auto text-xs text-muted-foreground">Completed</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={resetAllTours}
          className="flex items-center gap-2 text-muted-foreground"
          data-testid="menu-item-reset-tours"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All Tours
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
