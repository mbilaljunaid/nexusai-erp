import { cn } from "@/lib/utils";
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GLAccount {
  account: string;
  description: string;
  type: string;
  debitCredit: 'Dr' | 'Cr';
}

interface GLMappingPanelProps {
  accounts: GLAccount[];
  title?: string;
}

const typeColors = {
  asset: 'bg-blue-500/10 text-blue-900 dark:text-blue-200',
  liability: 'bg-red-500/10 text-red-900',
  equity: 'bg-purple-500/10 text-purple-900',
  revenue: 'bg-green-500/10 text-green-900',
  expense: 'bg-orange-500/10 text-orange-900'
};

export function GLMappingPanel({ accounts, title = "GL Account Mappings" }: GLMappingPanelProps) {
  const debitTotal = accounts.filter(a => a.debitCredit === 'Dr').length;
  const creditTotal = accounts.filter(a => a.debitCredit === 'Cr').length;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-500/10 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Debits</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{debitTotal}</div>
        </div>
        <div className="p-4 bg-red-500/10 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Credits</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-200">{creditTotal}</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GL Account</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Dr/Cr</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.account} data-testid={`gl-row-${account.account}`}>
              <TableCell className="font-mono font-medium">{account.account}</TableCell>
              <TableCell>{account.description}</TableCell>
              <TableCell>
                <span className={cn(`px-2 py-1 rounded text-xs font-medium ${typeColors[account.type as keyof typeof typeColors]}`)}>
                  {account.type}
                </span>
              </TableCell>
              <TableCell className={account.debitCredit === 'Dr' ? 'text-blue-600 font-bold' : 'text-red-600 font-bold'}>
                {account.debitCredit}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
