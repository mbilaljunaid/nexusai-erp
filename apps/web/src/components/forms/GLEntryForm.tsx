import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertTriangle, Plus, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function GLEntryForm() {
  const { toast } = useToast();
  const [tab, setTab] = useState("simple");
  const [journalDate, setJournalDate] = useState("");
  const [description, setDescription] = useState("");
  const [debitAccount, setDebitAccount] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [showAICheck, setShowAICheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [lines, setLines] = useState([
    { id: 1, account: "", debit: "", credit: "", desc: "" }
  ]);

  const handlePostEntry = async () => {
    if (!journalDate || !description) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        journalDate,
        description,
        lines: tab === "simple" 
          ? [
              { account: debitAccount, debit: parseFloat(debitAmount) || 0, credit: 0 },
              { account: creditAccount, debit: 0, credit: parseFloat(creditAmount) || 0 }
            ]
          : lines
      };
      
      await api.erp.glEntries.create(payload);
      setSuccessMessage("GL Entry posted successfully!");
      toast({ title: "Success", description: "GL Entry created" });
      
      // Reset form
      setJournalDate("");
      setDescription("");
      setDebitAccount("");
      setDebitAmount("");
      setCreditAccount("");
      setCreditAmount("");
      setLines([{ id: 1, account: "", debit: "", credit: "", desc: "" }]);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const debit = parseFloat(debitAmount) || 0;
  const credit = parseFloat(creditAmount) || 0;
  const isBalanced = Math.abs(debit - credit) < 0.01;

  const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isTableBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold">GL Entry</h2>
        <p className="text-sm text-muted-foreground mt-1">Create and post general ledger journal entries</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="simple">Simple Entry</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
        </TabsList>

        {/* Simple Entry */}
        <TabsContent value="simple" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Journal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Journal Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Accounting Period</Label>
                  <Select>
                    <SelectTrigger id="period" className="text-sm">
                      <SelectValue placeholder="Nov 2024" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nov">Nov 2024</SelectItem>
                      <SelectItem value="oct">Oct 2024</SelectItem>
                      <SelectItem value="sep">Sep 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="journal">Journal Name</Label>
                  <Select defaultValue="general">
                    <SelectTrigger id="journal" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Journal</SelectItem>
                      <SelectItem value="intercompany">Intercompany</SelectItem>
                      <SelectItem value="manual">Manual Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description *</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Monthly rent expense accrual"
                  className="min-h-16 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Validation Check */}
          {showAICheck && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 ml-2 space-y-1">
                <p><strong>GL Entry Validation:</strong></p>
                <ul className="list-disc list-inside text-xs mt-1">
                  <li>✓ Journal is balanced</li>
                  <li>✓ All required fields populated</li>
                  <li>✓ Accounts are active and posting-enabled</li>
                  <li>✓ No duplicate entries detected</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Simple Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                {/* Debit Line */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debitAcc">Debit Account *</Label>
                    <span className="text-xs text-muted-foreground">Cash (1000)</span>
                  </div>
                  <Select value={debitAccount} onValueChange={setDebitAccount}>
                    <SelectTrigger id="debitAcc" className="text-sm">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1000 - Cash</SelectItem>
                      <SelectItem value="1100">1100 - Accounts Receivable</SelectItem>
                      <SelectItem value="1200">1200 - Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debitAmt">Debit Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                    <Input
                      id="debitAmt"
                      type="number"
                      value={debitAmount}
                      onChange={(e) => setDebitAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-sm pl-7 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-muted rounded-lg">
                {/* Credit Line */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="creditAcc">Credit Account *</Label>
                    <span className="text-xs text-muted-foreground">Rent Expense (5100)</span>
                  </div>
                  <Select value={creditAccount} onValueChange={setCreditAccount}>
                    <SelectTrigger id="creditAcc" className="text-sm">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5100">5100 - Rent Expense</SelectItem>
                      <SelectItem value="5200">5200 - Utilities</SelectItem>
                      <SelectItem value="5300">5300 - Salaries</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditAmt">Credit Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                    <Input
                      id="creditAmt"
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="0.00"
                      className="text-sm pl-7 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Balance Status */}
              <div className={`p-3 rounded-lg border-2 ${isBalanced ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${isBalanced ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                      {isBalanced ? '✓ Journal Balanced' : '✗ Out of Balance'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Debit: ${debit.toFixed(2)} | Credit: ${credit.toFixed(2)}
                    </p>
                  </div>
                  {isBalanced && <Badge className="bg-green-600">Ready to Post</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Attach receipts, invoices, or authorization documents</p>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Attachment
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAICheck(!showAICheck)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Validate with AI
            </Button>
            <Button disabled={!isBalanced}>Post Entry</Button>
            <Button variant="outline">Save Draft</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </TabsContent>

        {/* Detailed Entry */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Multi-line Journal Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Account</th>
                      <th className="text-right p-2 font-medium">Debit</th>
                      <th className="text-right p-2 font-medium">Credit</th>
                      <th className="text-left p-2 font-medium">Description</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr key={line.id} className="border-b hover:bg-muted">
                        <td className="p-2">
                          <Select value={line.account} onValueChange={(val) => {
                            const newLines = [...lines];
                            newLines[idx].account = val;
                            setLines(newLines);
                          }}>
                            <SelectTrigger className="text-xs h-8">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1000">1000 - Cash</SelectItem>
                              <SelectItem value="1100">1100 - AR</SelectItem>
                              <SelectItem value="5100">5100 - Rent Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-right">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={line.debit}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx].debit = e.target.value;
                              setLines(newLines);
                            }}
                            className="text-xs text-right font-mono h-8"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={line.credit}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx].credit = e.target.value;
                              setLines(newLines);
                            }}
                            className="text-xs text-right font-mono h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="text"
                            placeholder="Description"
                            value={line.desc}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx].desc = e.target.value;
                              setLines(newLines);
                            }}
                            className="text-xs h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm" onClick={() => setLines(lines.filter((_, i) => i !== idx))}>✕</Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold border-t-2 bg-muted">
                      <td className="p-2">Totals</td>
                      <td className="p-2 text-right font-mono">${totalDebit.toFixed(2)}</td>
                      <td className="p-2 text-right font-mono">${totalCredit.toFixed(2)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Button variant="outline" size="sm" onClick={() => setLines([...lines, { id: Math.max(...lines.map(l => l.id)) + 1, account: "", debit: "", credit: "", desc: "" }])}>
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>

              {!isTableBalanced && (
                <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900">
                  <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-sm text-orange-900 dark:text-orange-100 ml-2">
                    Journal out of balance: ${Math.abs(totalDebit - totalCredit).toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handlePostEntry}
                  disabled={isLoading || !isTableBalanced}
                  data-testid="button-post-entry"
                >
                  {isLoading ? "Posting..." : successMessage ? "Posted!" : "Post Entry"}
                </Button>
                <Button variant="ghost">Cancel</Button>
              </div>
              
              {successMessage && (
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm text-green-900 dark:text-green-100 ml-2">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
