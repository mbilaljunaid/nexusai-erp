import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Share2, Printer } from 'lucide-react';

interface ProcessPageProps {
  processId: string;
  processName: string;
  processCode: string;
  description: string;
  category: string;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cycleTime: string;
  formsCount: number;
  glAccountsCount: number;
  approvalSteps: number;
  relatedProcesses?: string[];
  children: React.ReactNode;
}

export function ProcessPageTemplate({
  processId,
  processName,
  processCode,
  description,
  category,
  criticality,
  cycleTime,
  formsCount,
  glAccountsCount,
  approvalSteps,
  relatedProcesses = [],
  children
}: ProcessPageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const criticalityColor = {
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-green-100 text-green-800'
  };

  return (
    <div className="flex gap-6 p-8 bg-background">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{processName}</h1>
              <p className="text-lg text-muted-foreground">{processCode}</p>
            </div>
            <Badge className={criticalityColor[criticality]}>{criticality}</Badge>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl">{description}</p>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          Processes &gt; {category} &gt; {processName}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flow">Flow</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="gl-mapping">GL Mapping</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          {children}
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="w-80">
        {/* Quick Facts */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Quick Facts</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Criticality:</span>
              <span className="font-medium">{criticality}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cycle Time:</span>
              <span className="font-medium">{cycleTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Forms:</span>
              <span className="font-medium">{formsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GL Accounts:</span>
              <span className="font-medium">{glAccountsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Approval Steps:</span>
              <span className="font-medium">{approvalSteps}</span>
            </div>
          </div>
        </Card>

        {/* Status Indicators */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-foreground mb-4">Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>GL Posting: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Workflow: Configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Analytics: Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Audit Trail: Enabled</span>
            </div>
          </div>
        </Card>

        {/* Related Processes */}
        {relatedProcesses.length > 0 && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">Related Processes</h3>
            <div className="space-y-2 text-sm">
              {relatedProcesses.map((process) => (
                <div key={process} className="text-primary hover:underline cursor-pointer">
                  → {process}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-export-process">
              <Download className="w-4 h-4 mr-2" />
              Export Process
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-print-details">
              <Printer className="w-4 h-4 mr-2" />
              Print Details
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-share-link">
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
