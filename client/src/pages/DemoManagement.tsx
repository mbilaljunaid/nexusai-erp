import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Download, Refresh, Trash2, Copy, Zap } from "lucide-react";
import { Header, Footer } from "@/components/Navigation";

export default function DemoManagement() {
  const [industries, setIndustries] = useState<string[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndustries();
    fetchDemos();
  }, []);

  const fetchIndustries = async () => {
    try {
      const res = await fetch("/api/demos/industries");
      const data = await res.json();
      setIndustries(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDemos = async () => {
    try {
      const res = await fetch("/api/demos/list", {
        headers: { "x-user-role": "admin" },
      });
      const data = await res.json();
      setDemos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const createDemo = async (seedData = false) => {
    if (!selectedIndustry || !email) {
      alert("Please select industry and enter email");
      return;
    }
    
    setLoading(true);
    try {
      // First seed the data if requested
      if (seedData) {
        const seedRes = await fetch(`/api/demos/seed/${selectedIndustry}`, {
          method: "POST",
          headers: { "x-user-role": "admin" },
        });
        const seedData = await seedRes.json();
        console.log(`Seeded ${seedData.recordsSeeded} records for ${selectedIndustry}`);
      }

      const res = await fetch("/api/demos/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company: selectedIndustry, industry: selectedIndustry }),
      });
      const data = await res.json();
      if (res.ok) {
        const username = `demo_${selectedIndustry.toLowerCase().replace(/\s+/g, "_")}`;
        const password = `Demo@${new Date().getFullYear()}`;
        
        alert(`✓ Demo created!\n\nUsername: ${username}\nPassword: ${password}\n\nEmail sent to: ${email}`);
        
        // Send credentials
        await fetch("/api/demos/send-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            industry: selectedIndustry,
            demoLink: `${window.location.origin}/demo-access/${data.id}`,
            username,
            password,
          }),
        });
        
        fetchDemos();
        setEmail("");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create demo");
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = async (demoId: string) => {
    if (!confirm("Reset this demo environment?")) return;
    try {
      await fetch(`/api/demos/${demoId}/reset`, {
        method: "POST",
        headers: { "x-user-role": "admin" },
      });
      fetchDemos();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Demo Management</h1>
        <p className="text-slate-300 mb-8">Create and manage demo environments for all industries</p>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="create">Create Demo</TabsTrigger>
            <TabsTrigger value="active">Active Demos</TabsTrigger>
          </TabsList>

          {/* Create Demo Tab */}
          <TabsContent value="create">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-2xl font-bold mb-6">Create New Demo Environment</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Industry</label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white"
                    data-testid="select-industry"
                  >
                    <option value="">-- Choose Industry --</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">User Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 text-white placeholder-slate-400"
                    data-testid="input-demo-email"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => createDemo(false)} 
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="button-create-demo"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? "Creating..." : "Create Demo"}
                  </Button>
                  <Button 
                    onClick={() => createDemo(true)} 
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    data-testid="button-create-demo-seeded"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {loading ? "Seeding..." : "Seed Data"}
                  </Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                <p className="font-semibold mb-2">What happens:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Demo environment created with full sample data</li>
                  <li>Credentials generated and sent to email</li>
                  <li>Fully operational for 30 days</li>
                  <li>All modules pre-configured for industry</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          {/* Active Demos Tab */}
          <TabsContent value="active">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-2xl font-bold mb-6">Active Demo Environments</h2>
              
              {demos.length === 0 ? (
                <p className="text-slate-400">No active demos yet</p>
              ) : (
                <div className="space-y-4">
                  {demos.map((demo) => (
                    <Card key={demo.id} className="bg-slate-700 border-slate-600 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{demo.industry}</h3>
                          <p className="text-sm text-slate-400 mt-1">ID: {demo.id}</p>
                          <p className="text-sm text-slate-400">Created: {new Date(demo.createdAt).toLocaleDateString()}</p>
                          <div className="mt-3 flex gap-2">
                            <span className={`px-3 py-1 rounded text-xs font-semibold ${
                              demo.status === "active" ? "bg-green-600/20 text-green-300" : "bg-slate-600/20 text-slate-300"
                            }`}>
                              {demo.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" data-testid={`button-copy-demo-${demo.id}`}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => resetDemo(demo.id)} data-testid={`button-reset-demo-${demo.id}`}>
                            <Refresh className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-400" data-testid={`button-delete-demo-${demo.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
