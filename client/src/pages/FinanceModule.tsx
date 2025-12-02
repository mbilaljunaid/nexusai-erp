import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SmartAddButton } from "@/components/SmartAddButton";
import { FormSearchWithMetadata } from "@/components/FormSearchWithMetadata";
import { getFormMetadata } from "@/lib/formMetadata";
import { FormDialog } from "@/components/FormDialog";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function FinanceModule() {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const invoiceFormMetadata = getFormMetadata("invoice");

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb items={invoiceFormMetadata?.breadcrumbs?.slice(1) || []} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Module</h1>
          <p className="text-muted-foreground">Track expenses, revenue, and financial forecasts</p>
        </div>
        <SmartAddButton formMetadata={invoiceFormMetadata} onClick={() => setShowInvoiceForm(true)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">$1.2M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold mt-1">$450K</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Net Income</p>
              <p className="text-2xl font-bold mt-1 text-green-600">$750K</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Margin</p>
              <p className="text-2xl font-bold mt-1">62%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <FormSearchWithMetadata
            formMetadata={invoiceFormMetadata}
            value={searchQuery}
            onChange={setSearchQuery}
            data={invoices}
            onFilter={setFilteredInvoices}
          />
        </div>
        
        <div className="space-y-2">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice: any, idx: number) => (
              <Card key={invoice.id || idx} className="hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customerId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${invoice.amount}</p>
                      <Badge variant="secondary">{invoice.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="p-4"><p className="text-muted-foreground">No invoices found</p></CardContent></Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between p-2 rounded hover:bg-muted">
              <span>Software Licenses</span>
              <span className="font-mono text-sm">$25,000</span>
            </div>
            <div className="flex justify-between p-2 rounded hover:bg-muted">
              <span>Team Salaries</span>
              <span className="font-mono text-sm">$150,000</span>
            </div>
            <div className="flex justify-between p-2 rounded hover:bg-muted">
              <span>Infrastructure</span>
              <span className="font-mono text-sm">$35,000</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between p-2 rounded hover:bg-muted">
              <span>Product Sales</span>
              <span className="font-mono text-sm">$800,000</span>
            </div>
            <div className="flex justify-between p-2 rounded hover:bg-muted">
              <span>Services</span>
              <span className="font-mono text-sm">$300,000</span>
            </div>
            <div className="flex justify-between p-2 rounded hover:bg-muted">
              <span>Subscriptions</span>
              <span className="font-mono text-sm">$100,000</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
