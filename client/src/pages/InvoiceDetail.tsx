import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Send } from "lucide-react";

export default function InvoiceDetail() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" data-testid="button-back"><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold">INV-001</h1>
            <p className="text-muted-foreground">Acme Corp</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-download"><Download className="h-4 w-4 mr-2" />PDF</Button>
          <Button data-testid="button-send"><Send className="h-4 w-4 mr-2" />Send</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span>Subtotal</span><span>$5,000</span></div>
              <div className="flex justify-between"><span>Tax (5%)</span><span>$250</span></div>
              <div className="border-t pt-3 flex justify-between font-bold"><span>Total</span><span>$5,250</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm p-2 border rounded">
                  <span>Enterprise Software License</span>
                  <span>$5,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="mt-2 bg-green-100 text-green-800">Paid</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-semibold mt-1">Jan 15, 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Payment Info</p>
              <p className="font-semibold text-sm mt-2">Paid on Jan 12, 2025</p>
              <p className="text-xs text-muted-foreground">Check #12345</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
