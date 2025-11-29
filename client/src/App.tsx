import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { TenantSwitcher } from "@/components/TenantSwitcher";
import { AIAssistant, AIAssistantTrigger } from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Dashboard from "@/pages/Dashboard";
import CRM from "@/pages/CRM";
import Projects from "@/pages/Projects";
import Analytics from "@/pages/Analytics";
import Health from "@/pages/Health";
import Settings from "@/pages/Settings";
import Industries from "@/pages/Industries";
import PlatformAdmin from "@/pages/admin/PlatformAdmin";
import TenantAdmin from "@/pages/admin/TenantAdmin";
import ERP from "@/pages/ERP";
import EPMModule from "@/pages/EPMModule";
import HR from "@/pages/HR";
import Service from "@/pages/Service";
import Marketing from "@/pages/Marketing";
import Compliance from "@/pages/Compliance";
import BPM from "@/pages/BPM";
import Integrations from "@/pages/Integrations";
import Website from "@/pages/Website";
import Email from "@/pages/Email";
import Ecommerce from "@/pages/Ecommerce";
import FormShowcase from "@/pages/FormShowcase";
import IndustryConfiguration from "@/pages/IndustryConfiguration";
import ComplianceDashboard from "@/pages/ComplianceDashboard";
import UATAutomation from "@/pages/UATAutomation";
import AdvancedFeatures from "@/pages/AdvancedFeatures";
import IntegrationHub from "@/pages/IntegrationHub";
import WebsiteBuilder from "@/pages/WebsiteBuilder";
import EmailManagement from "@/pages/EmailManagement";
import SystemHealth from "@/pages/SystemHealth";
import EPMPage from "@/pages/EPMPage";
import AIAssistantPage from "@/pages/AIAssistant";
import FieldService from "@/pages/FieldService";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/crm" component={CRM} />
      <Route path="/projects" component={Projects} />
      <Route path="/analytics-legacy" component={Analytics} />
      <Route path="/health" component={Health} />
      <Route path="/settings" component={Settings} />
      <Route path="/industries" component={Industries} />
      <Route path="/industry-config" component={IndustryConfiguration} />
      <Route path="/admin/platform" component={PlatformAdmin} />
      <Route path="/admin/tenant" component={TenantAdmin} />
      <Route path="/erp" component={ERP} />
      <Route path="/epm" component={EPMPage} />
      <Route path="/hr" component={HR} />
      <Route path="/service" component={Service} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/compliance" component={ComplianceDashboard} />
      <Route path="/bpm" component={BPM} />
      <Route path="/integrations" component={IntegrationHub} />
      <Route path="/website" component={WebsiteBuilder} />
      <Route path="/email" component={EmailManagement} />
      <Route path="/ecommerce" component={Ecommerce} />
      <Route path="/forms" component={FormShowcase} />
      <Route path="/uat" component={UATAutomation} />
      <Route path="/advanced" component={AdvancedFeatures} />
      <Route path="/system-health" component={SystemHealth} />
      <Route path="/copilot" component={AIAssistantPage} />
      <Route path="/field-service" component={FieldService} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState("acme");

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-4 h-14 px-4 border-b bg-background shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <TenantSwitcher currentTenant={currentTenant} onTenantChange={setCurrentTenant} />
              <div className="text-xs text-muted-foreground font-medium px-2 py-1 rounded bg-muted hidden md:block">
                US • English
              </div>
              <GlobalSearch />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-xs hidden md:flex" data-testid="button-industry-context">
                Manufacturing
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
      
      {!aiAssistantOpen && (
        <AIAssistantTrigger onClick={() => setAiAssistantOpen(true)} />
      )}
      <AIAssistant 
        isOpen={aiAssistantOpen} 
        onClose={() => setAiAssistantOpen(false)} 
      />
    </SidebarProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="nexusai-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
