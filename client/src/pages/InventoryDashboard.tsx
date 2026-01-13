import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, Package, ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, ShoppingCart, Activity
} from 'lucide-react';

import { StandardDashboard, DashboardWidget } from '@/components/layout/StandardDashboard';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { StandardTable } from '@/components/ui/StandardTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const InventoryDashboard = () => {
  // Mock Data (Simulating API Responses)
  // In a real scenario, these would ideally be separate widgets fetching their own data or a verified hook
  const { data: stats } = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: async () => {
      // Mock data for now, preserving the logic structure from original file
      return {
        totalValuation: 1250000,
        lowStockItems: 15,
        stockOuts: 3,
        pendingReceipts: 8,
        inventoryTurns: 4.2
      };
    }
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async () => ([
      { id: 1, type: 'PO Receipt', item: 'Laptop Dell 15"', qty: 50, date: '2025-10-25', status: 'Completed' },
      { id: 2, type: 'Misc Issue', item: 'Monitor 24"', qty: -2, date: '2025-10-25', status: 'Completed' },
      { id: 3, type: 'Subinv Transfer', item: 'Laptop Dell 15"', qty: 10, date: '2025-10-24', status: 'Completed' },
    ])
  });

  const { data: replenishment = [] } = useQuery({
    queryKey: ['replenishment'],
    queryFn: async () => ([
      { id: 101, item: 'Wireless Mouse', onHand: 5, min: 20, suggest: 50 },
      { id: 102, item: 'Keyboard Generic', onHand: 2, min: 10, suggest: 20 },
    ])
  });

  const dataValuation = [
    { name: 'Jan', value: 1000000 },
    { name: 'Feb', value: 1100000 },
    { name: 'Mar', value: 1050000 },
    { name: 'Apr', value: 1250000 },
  ];

  const header = (
    <div className="flex justify-between items-center w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Command Center</h1>
        <p className="text-muted-foreground">Real-time visibility into Enterprise Stock, Valuation, and Supply Chain velocity.</p>
      </div>
      <div className="space-x-2">
        <Button variant="outline">Stock Count</Button>
        <Button>Receive Items</Button>
      </div>
    </div>
  );

  const transactionColumns: any[] = [
    { header: "Type", accessorKey: "type", cell: (row: any) => <Badge variant="secondary">{row.type}</Badge> },
    { header: "Item", accessorKey: "item", cell: (row: any) => <span className="font-medium">{row.item}</span> },
    { header: "Qty", accessorKey: "qty", cell: (row: any) => <span className={`font-bold ${row.qty > 0 ? 'text-green-600' : 'text-red-600'}`}>{row.qty > 0 ? '+' : ''}{row.qty}</span> },
    { header: "Date", accessorKey: "date" },
    { header: "Status", accessorKey: "status", cell: (row: any) => <Badge variant="outline">{row.status}</Badge> },
  ];

  const replenishmentColumns: any[] = [
    { header: "Item", accessorKey: "item", cell: (row: any) => <span className="font-medium">{row.item}</span> },
    { header: "On Hand", accessorKey: "onHand", cell: (row: any) => <span className="text-red-600 font-bold">{row.onHand}</span> },
    { header: "Suggestion", accessorKey: "suggest", cell: (row: any) => <Badge variant="outline" className="bg-blue-50 text-blue-700">{row.suggest}</Badge> },
  ];

  return (
    <StandardDashboard header={header}>
      <DashboardWidget title="Total Valuation" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-700">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">${stats?.totalValuation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Low Stock Alerts" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-100 text-orange-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{stats?.lowStockItems}</div>
            <div className="flex items-center text-xs text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats?.stockOuts} Critical Stock-outs
            </div>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Inventory Turns" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-100 text-green-700">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.inventoryTurns}</div>
            <p className="text-xs text-green-600 font-medium">Healthy Level</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Pending Receipts" colSpan={1}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-100 text-purple-700">
            <ArrowDownRight className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.pendingReceipts}</div>
            <p className="text-xs text-muted-foreground">Inbound Orders</p>
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget title="Valuation Trend" colSpan={2} className="min-h-[400px]">
        <div className="h-[350px] w-full mt-2">
          <AnalyticsChart
            title=""
            data={dataValuation}
            type="area"
            dataKey="value"
          />
        </div>
      </DashboardWidget>

      <DashboardWidget title="Replenishment Required" colSpan={2} className="min-h-[400px]">
        <StandardTable
          data={replenishment}
          columns={replenishmentColumns}
          keyExtractor={(i) => String(i.id)}
          hideSearch={true}
          className="mt-4"
        />
      </DashboardWidget>

      <DashboardWidget title="Recent Material Transactions" colSpan={4} className="min-h-[400px]">
        <StandardTable
          data={transactions}
          columns={transactionColumns}
          keyExtractor={(t) => String(t.id)}
          hideSearch={true}
          className="mt-4"
        />
      </DashboardWidget>

    </StandardDashboard>
  );
};

export default InventoryDashboard;
