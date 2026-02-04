import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalLayout from "@/components/GlobalLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ESSDashboard from "./pages/hr/selfservice/ESSDashboard";
import PersonalDetails from "./pages/hr/selfservice/PersonalDetails";
import MyTimeCard from "./pages/hr/selfservice/MyTimeCard";
import MSSDashboard from "./pages/hr/selfservice/MSSDashboard";
import PlanningDashboard from "./pages/epm/PlanningDashboard";
import PlanningGrid from "./pages/epm/PlanningGrid";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={
            <GlobalLayout>
              <Dashboard />
            </GlobalLayout>
          } />
          {/* Placeholder routes - to be implemented */}
          <Route path="/processes" element={<GlobalLayout><div className="p-4">Processes Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/crm" element={<GlobalLayout><div className="p-4">CRM Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/finance" element={<GlobalLayout><div className="p-4">Finance Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/epm/dashboard" element={<GlobalLayout><PlanningDashboard /></GlobalLayout>} />
          <Route path="/epm/planning" element={<GlobalLayout><PlanningGrid /></GlobalLayout>} />
          <Route path="/hr" element={<GlobalLayout><div className="p-4">HR Module - Coming Soon</div></GlobalLayout>} />

          {/* ESS / MSS Routes */}
          <Route path="/me" element={<GlobalLayout><ESSDashboard /></GlobalLayout>} />
          <Route path="/me/profile" element={<GlobalLayout><PersonalDetails /></GlobalLayout>} />
          <Route path="/me/documents" element={<GlobalLayout><PersonalDetails /></GlobalLayout>} />
          <Route path="/me/time-card" element={<GlobalLayout><MyTimeCard /></GlobalLayout>} />
          <Route path="/my-team" element={<GlobalLayout><MSSDashboard /></GlobalLayout>} />
          <Route path="/projects" element={<GlobalLayout><div className="p-4">Projects Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/construction" element={<GlobalLayout><div className="p-4">Construction Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/operations" element={<GlobalLayout><div className="p-4">Operations Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/scm" element={<GlobalLayout><div className="p-4">Supply Chain Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/scm/costing/dashboard" element={<GlobalLayout><div className="p-4">Cost Management - Coming Soon</div></GlobalLayout>} />
          <Route path="/inventory" element={<GlobalLayout><div className="p-4">Inventory Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/manufacturing" element={<GlobalLayout><div className="p-4">Manufacturing Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/maintenance" element={<GlobalLayout><div className="p-4">Maintenance Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/analytics" element={<GlobalLayout><div className="p-4">Analytics Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/ai" element={<GlobalLayout><div className="p-4">AI Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/admin" element={<GlobalLayout><div className="p-4">Admin Module - Coming Soon</div></GlobalLayout>} />
          <Route path="/settings" element={<GlobalLayout><div className="p-4">Settings - Coming Soon</div></GlobalLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
