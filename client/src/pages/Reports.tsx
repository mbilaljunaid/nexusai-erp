import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReportBuilder } from "@/components/ReportBuilder";
import { SmartViewBuilder } from "@/components/SmartViewBuilder";
import { ExcelExportButton } from "@/components/ExcelExportButton";
import { 
  BarChart3, 
  FileUp, 
  Filter,
  DownloadCloud,
  Upload,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const MODULES = [
  { id: "crm", label: "CRM", icon: "Target" },
  { id: "finance", label: "Finance", icon: "DollarSign" },
  { id: "supply_chain", label: "Supply Chain", icon: "Package" },
  { id: "manufacturing", label: "Manufacturing", icon: "Factory" },
  { id: "hr", label: "HR & Payroll", icon: "Users" },
  { id: "projects", label: "Projects", icon: "Briefcase" },
  { id: "admin", label: "Admin", icon: "Settings" },
];

export default function Reports() {
  const [selectedModule, setSelectedModule] = useState("crm");
  const [mainTab, setMainTab] = useState("reports");
  const [importData, setImportData] = useState<any[]>([]);
  const { toast } = useToast();

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setImportData(data);
        toast({
          title: "Import successful",
          description: `Loaded ${data.length} records from Excel`,
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Could not parse Excel file",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Reports", href: "/reports" },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-primary" />
          Reports & Analytics Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Build custom reports, create smart views, import/export data, and visualize insights
        </p>
      </div>

      {/* Main Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">50+</span>
            </div>
            <p className="text-sm font-medium">Pre-built Reports</p>
            <p className="text-xs text-muted-foreground mt-1">Across all modules</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Filter className="w-8 h-8 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">∞</span>
            </div>
            <p className="text-sm font-medium">SmartViews</p>
            <p className="text-xs text-muted-foreground mt-1">Custom filtered views</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <FileUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">📊</span>
            </div>
            <p className="text-sm font-medium">Excel Support</p>
            <p className="text-xs text-muted-foreground mt-1">Import & export data</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <DownloadCloud className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">3</span>
            </div>
            <p className="text-sm font-medium">Export Formats</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, CSV, DOCX</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" data-testid="tab-main-reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="smartviews" data-testid="tab-main-smartviews">
            <Filter className="w-4 h-4 mr-2" />
            SmartViews
          </TabsTrigger>
          <TabsTrigger value="excel" data-testid="tab-main-excel">
            <FileUp className="w-4 h-4 mr-2" />
            Excel
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-main-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="mt-6 space-y-6">
          <Tabs value={selectedModule} onValueChange={setSelectedModule} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              {MODULES.map((module) => (
                <TabsTrigger key={module.id} value={module.id} data-testid={`tab-module-${module.id}`}>
                  {module.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {MODULES.map((module) => (
              <TabsContent key={module.id} value={module.id} className="mt-6">
                <ReportBuilder module={module.id} />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* SMARTVIEWS TAB */}
        <TabsContent value="smartviews" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Views</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                SmartViews allow you to save custom filtered views of your data. Configure filters, sorting, and grouping to create the perfect view for your workflow.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map((module) => (
                  <Card key={module.id} className="hover-elevate">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{module.label} SmartViews</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create filtered views for {module.label.toLowerCase()} data
                      </p>
                      <SmartViewBuilder formId={module.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXCEL TAB */}
        <TabsContent value="excel" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DownloadCloud className="w-5 h-5" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export data from any module to Excel format. Perfect for data analysis, sharing, or backup.
                </p>
                <div className="space-y-3">
                  {MODULES.map((module) => (
                    <div key={module.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">{module.label}</span>
                      <ExcelExportButton formId={module.id} fileName={`${module.label}-data`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Import Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import data from Excel files to quickly load records into the system. Supports batch operations and data validation.
                </p>
                <div className="space-y-3">
                  <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload Excel file</p>
                      <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleExcelImport}
                      className="hidden"
                      data-testid="input-excel-import"
                    />
                  </label>
                  {importData.length > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        Imported {importData.length} records
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Review the data and click save to complete the import
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Default Export Format</h3>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>PDF</option>
                  <option>CSV</option>
                  <option>DOCX</option>
                  <option>Excel</option>
                </select>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Data Retention Policy</h3>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option>Keep all data</option>
                  <option>1 year</option>
                  <option>6 months</option>
                  <option>3 months</option>
                </select>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Auto-refresh Reports</h3>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="auto-refresh" defaultChecked className="w-4 h-4" />
                  <label htmlFor="auto-refresh" className="text-sm">
                    Automatically refresh reports every 5 minutes
                  </label>
                </div>
              </div>

              <Button data-testid="button-save-settings">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Tips */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Create SmartViews to save your favorite filtered views and reuse them</li>
            <li>✓ Export reports in multiple formats (PDF, CSV, DOCX) for sharing with stakeholders</li>
            <li>✓ Use Excel import to bulk load data into the system</li>
            <li>✓ Combine reports with spreadsheet pivot tables for deeper analysis</li>
            <li>✓ SmartViews are personal - customize them for your workflow</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
