import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BomForm } from "@/components/forms/BomForm";
import { IconNavigation } from "@/components/IconNavigation";
import { Factory, Package, CheckSquare, Zap, QrCode } from "lucide-react";
import { Link } from "wouter";

export default function Manufacturing() {
  const [activeNav, setActiveNav] = useState("bom");

  const navItems = [
    { id: "bom", label: "Bill of Materials", icon: Package, color: "text-blue-500" },
    { id: "workorders", label: "Work Orders", icon: Zap, color: "text-orange-500" },
    { id: "production", label: "Production", icon: Factory, color: "text-purple-500" },
    { id: "quality", label: "Quality Control", icon: QrCode, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Factory className="w-8 h-8" />
            Manufacturing
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage BOMs, work orders, production planning, and quality control
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {navItems.map((item) => (
          <Link key={item.id} to={item.id === "bom" ? `/manufacturing/bom` : `/manufacturing/${item.id}`}>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover-elevate cursor-pointer transition-all">
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-sm font-medium text-center">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {activeNav === "bom" && (
        <div className="space-y-6">
          <BomForm />
          <Card>
            <CardHeader>
              <CardTitle>BOMs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No BOMs created yet. Create one above to get started.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "workorders" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Work Orders <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Work order management will be available soon.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "production" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Production Orders <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Production order management will be available soon.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {activeNav === "quality" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Quality Checks <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quality control management will be available soon.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
