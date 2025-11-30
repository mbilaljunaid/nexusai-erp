import { useState, useMemo } from "react"; import { Input } from "@/components/ui/input"; import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; import { Badge } from "@/components/ui/badge"; import { Search, Grid3x3, List } from "lucide-react"; import { Link } from "wouter";

const PAGES_BY_PACK = [
  { pack: "Core Modules", pages: ["Dashboard", "UserProfile", "Settings", "Notifications"] },
  { pack: "Retail & E-Commerce", pages: ["ProductCatalog", "InventoryWarehouse", "OrderFulfillment", "CustomerProfiles", "LoyaltyPrograms", "PricingPromotionsRetail", "BillingPaymentsRetail", "SupplyChainRetail"] },
  { pack: "Hospitality & Travel", pages: ["PropertyManagement", "ReservationsBookings", "GuestManagement", "HospitalityCRM", "HospitalityBilling", "HospitalitySupply", "HospitalityHR", "RevenueOptimization", "HospitalityAnalytics", "EventsActivities", "TravelItinerary"] },
  { pack: "Telecom & Media", pages: ["SubscriberManagement", "ServiceProvisioning", "BillingInvoicing", "NetworkUsageMonitoring", "CustomerSupportCRM", "MarketingTelecom", "HRTelecom", "TelecomAnalytics", "TelecomDashboard", "NetworkProvisioning"] },
  { pack: "Government & Public Sector", pages: ["CitizenCaseManagement", "PublicServicesDelivery", "FinanceGrants", "GovernmentHR", "GovernmentProcurement", "ProjectInfrastructure", "ComplianceReporting", "GovernmentBI", "CitizenEngagement", "WorkflowAutomation"] },
  { pack: "Education & E-Learning", pages: ["StudentManagement", "FacultyManagement", "CourseManagement", "AdmissionsEnrollment", "AssessmentGrading", "LMSContent", "EducationCRM", "EducationBilling", "EducationHR", "EducationAttendance", "EducationEvents", "EducationAnalytics"] },
];

function pageToUrl(pageName: string): string {
  const lower = pageName.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
  return `/${lower}`;
}

export default function PagesIndex() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedPacks, setExpandedPacks] = useState<Set<string>>(new Set(PAGES_BY_PACK.map(p => p.pack)));

  const filteredPacks = useMemo(() => {
    const searchLower = search.toLowerCase();
    return PAGES_BY_PACK.map(pack => ({
      ...pack,
      pages: pack.pages.filter(page => page.toLowerCase().includes(searchLower) || pack.pack.toLowerCase().includes(searchLower)),
    })).filter(pack => pack.pages.length > 0);
  }, [search]);

  const totalPages = useMemo(() => filteredPacks.reduce((sum, p) => sum + p.pages.length, 0), [filteredPacks]);

  const togglePack = (packName: string) => {
    setExpandedPacks(prev => {
      const next = new Set(prev);
      if (next.has(packName)) next.delete(packName);
      else next.add(packName);
      return next;
    });
  };

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold">Pages Explorer</h1>
          <p className="text-muted-foreground mt-1">Browse all {PAGES_BY_PACK.reduce((sum, p) => sum + p.pages.length, 0)} pages across 30+ industry packs</p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-pages" />
          </div>
          <div className="flex gap-1">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-accent" : "bg-secondary"}`} data-testid="button-view-grid"><Grid3x3 className="h-4 w-4" /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-accent" : "bg-secondary"}`} data-testid="button-view-list"><List className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="default">{totalPages} Pages</Badge>
          <Badge variant="secondary">{filteredPacks.length} Packs</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPacks.map(pack => (
          <Card key={pack.pack} className="overflow-hidden" data-testid={`pack-${pack.pack.replace(/\s+/g, "-").toLowerCase()}`}>
            <CardHeader className="pb-3 cursor-pointer hover-elevate" onClick={() => togglePack(pack.pack)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pack.pack}</CardTitle>
                <Badge variant="outline">{pack.pages.length} pages</Badge>
              </div>
            </CardHeader>

            {expandedPacks.has(pack.pack) && (
              <CardContent>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {pack.pages.map(page => (
                      <Link key={page} href={pageToUrl(page)}>
                        <a className="p-3 border rounded hover-elevate transition block text-sm font-medium text-center" data-testid={`link-${page.toLowerCase()}`}>
                          <span className="line-clamp-2">{page}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {pack.pages.map(page => (
                      <Link key={page} href={pageToUrl(page)}>
                        <a className="p-2 border rounded hover-elevate transition flex items-center text-sm" data-testid={`link-${page.toLowerCase()}`}>
                          {page}
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
