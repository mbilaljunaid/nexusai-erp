import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FormInfo {
  id: string;
  name: string;
  sequence: number;
  required: boolean;
  glAccounts: string[];
}

interface FormsListProps {
  forms: FormInfo[];
}

export function FormsList({ forms }: FormsListProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Forms in Process</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sequence</TableHead>
            <TableHead>Form Name</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>GL Accounts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => (
            <TableRow key={form.id} data-testid={`form-row-${form.id}`}>
              <TableCell className="font-medium">{form.sequence}</TableCell>
              <TableCell>{form.name}</TableCell>
              <TableCell>{form.required ? '✓ Yes' : '○ No'}</TableCell>
              <TableCell>{form.glAccounts.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
