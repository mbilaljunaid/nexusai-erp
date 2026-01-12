import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  AlertTriangle, Package, ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const InventoryDashboard = () => {
  // Mock Data (Simulating API Responses)
  const { data: stats, isLoading } = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: async () => ({
      totalValuation: 1250000,
      lowStockItems: 15,
      stockOuts: 3,
      pendingReceipts: 8,
      inventoryTurns: 4.2
    })
  });

  const { data: transactions } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async () => ([
      { id: 1, type: 'PO Receipt', item: 'Laptop Dell 15"', qty: 50, date: '2025-10-25', status: 'Completed' },
      { id: 2, type: 'Misc Issue', item: 'Monitor 24"', qty: -2, date: '2025-10-25', status: 'Completed' },
      { id: 3, type: 'Subinv Transfer', item: 'Laptop Dell 15"', qty: 10, date: '2025-10-24', status: 'Completed' },
    ])
  });

  const { data: replenishment } = useQuery({
    queryKey: ['replenishment'],
    queryFn: async () => ([
      { id: 101, item: 'Wireless Mouse', onHand: 5, min: 20, suggest: 50 },
      { id: 102, item: 'Keyboard Generic', onHand: 2, min: 10, suggest: 20 },
    ])
  });

  // Mock Valuation Trend
  const dataValuation = [
    { name: 'Jan', value: 1000000 },
    { name: 'Feb', value: 1100000 },
    { name: 'Mar', value: 1050000 },
    { name: 'Apr', value: 1250000 },
  ];

  if (isLoading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Command Center</h1>
        <p className="text-muted-foreground">Real-time visibility into Enterprise Stock, Valuation, and Supply Chain velocity.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Valuation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalValuation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.lowStockItems}</div>
            <div className="flex items-center text-xs text-red-500 mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              {stats?.stockOuts} Critical Stock-outs
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Turns</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inventoryTurns}</div>
            <p className="text-xs text-green-600 font-medium">Healthy Level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Receipts</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingReceipts}</div>
            <p className="text-xs text-muted-foreground">Inbound Orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Replenishment Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Valuation Trend</CardTitle>
            <CardDescription>Year to Date Inventory Value</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataValuation}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Replenishment Required
            </CardTitle>
            <CardDescription>Items below minimum safety stock</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">On Hand</TableHead>
                  <TableHead className="text-right">Suggest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {replenishment?.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.item}</TableCell>
                    <TableCell className="text-right text-red-600 font-bold">{row.onHand}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {row.suggest}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Material Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Badge variant="secondary">{row.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{row.item}</TableCell>
                  <TableCell className={`text-right font-bold ${row.qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.qty > 0 ? '+' : ''}{row.qty}
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;
