import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Factory, Users, Settings2, BarChart3,
  Workflow, LayoutGrid, ClipboardCheck,
  ChevronRight, Boxes, ShieldCheck, Sparkles, Brain, Calendar
} from "lucide-react";
import { Link } from "wouter";

interface ModuleSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  links: { label: string; href: string; description: string; icon: React.ReactNode }[];
}

const sections: ModuleSection[] = [
  {
    title: "Intelligence & Planning",
    description: "Advanced requirement planning and visual scheduling",
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    links: [
      { label: "MRP Workbench", href: "/manufacturing/mrp", description: "Automated Material Requirements Planning", icon: <Brain className="h-4 w-4" /> },
      { label: "Production Gantt", href: "/manufacturing/gantt", description: "Visual shop floor production schedule", icon: <Calendar className="h-4 w-4" /> },
      { label: "Capacity Plan", href: "/manufacturing/capacity", description: "Work center load and availability", icon: <BarChart3 className="h-4 w-4" /> },
    ]
  },
  {
    title: "Executive & Analytics",
    description: "High-level oversight and performance monitoring",
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    links: [
      { label: "Performance Dashboard", href: "/manufacturing/dashboard", description: "OEE, throughput, and yield analytics", icon: <BarChart3 className="h-4 w-4" /> },
    ]
  },
  {
    title: "Manufacturing Engineering",
    description: "BOM, Process Planning, and Routing definitions",
    icon: <Workflow className="h-5 w-5 text-indigo-500" />,
    links: [
      { label: "BOM Designer", href: "/manufacturing/bom", description: "Hierarchical Bill of Materials management", icon: <Boxes className="h-4 w-4" /> },
      { label: "Routing Master", href: "/manufacturing/routings", description: "Operation sequences and process flows", icon: <Workflow className="h-4 w-4" /> },
    ]
  },
  {
    title: "Shop Floor & Execution",
    description: "Live production control and work order management",
    icon: <Factory className="h-5 w-5 text-green-500" />,
    links: [
      { label: "Work Order List", href: "/manufacturing/work-orders", description: "Track and release production orders", icon: <LayoutGrid className="h-4 w-4" /> },
      { label: "Execution Terminal", href: "/manufacturing/shop-floor", description: "Live operator interface for production", icon: <Zap className="h-4 w-4 text-yellow-500" /> },
    ]
  },
  {
    title: "Master Data & Setup",
    description: "Configuration of resources and facilities",
    icon: <Settings2 className="h-5 w-5 text-gray-500" />,
    links: [
      { label: "Work Centers", href: "/manufacturing/work-centers", description: "Manage factory locations and capacity", icon: <Factory className="h-4 w-4" /> },
      { label: "Resources", href: "/manufacturing/resources", description: "Equipment, labor, and tool management", icon: <Users className="h-4 w-4" /> },
      { label: "Quality Control", href: "/manufacturing/quality", description: "Inspection plans and results", icon: <ShieldCheck className="h-4 w-4" /> },
    ]
  }
];

import { Zap } from "lucide-react";

export default function ManufacturingModule() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <Factory className="h-10 w-10 text-primary" />
          Manufacturing Execution System
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          End-to-end production management from engineering definitions to real-time shop floor execution and quality assurance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section) => (
          <Card key={section.title} className="border-2 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                {section.icon}
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {section.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/5 cursor-pointer transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {link.icon}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{link.label}</div>
                        <div className="text-sm text-muted-foreground">{link.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
