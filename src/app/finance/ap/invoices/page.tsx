'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { PlusIcon, EyeIcon, PencilIcon, CheckIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Invoice {
  id: string;
  number: string;
  vendor: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  date: string;
  dueDate: string;
}

const statusColors = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
  approved: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
  paid: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
  rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const limit = 10;

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (statusFilter) params.append('status', statusFilter);

        const res = await fetch(`/api/finance/ap/invoices?${params}`);
        const data = await res.json();
        setInvoices(data.data);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoices();
  }, [page, statusFilter]);

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === invoices.length && invoices.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(invoices.map((inv) => inv.id)));
    }
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Manage accounts payable invoices"
        breadcrumbs={[
          { label: 'Finance', href: '/finance' },
          { label: 'Accounts Payable', href: '/finance/ap' },
          { label: 'Invoices' },
        ]}
        status={{ label: 'Active', color: 'green' }}
        actions={
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="create-invoice-btn"
          >
            <PlusIcon className="w-5 h-5" />
            New Invoice
          </button>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            data-testid="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>

          {selectedRows.size > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span>{selectedRows.size} selected</span>
              <button
                className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                data-testid="bulk-approve-btn"
              >
                Approve
              </button>
              <button
                className="px-3 py-1 bg-red-200 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-300 dark:hover:bg-red-900/30 transition-colors"
                data-testid="bulk-delete-btn"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === invoices.length && invoices.length > 0}
                    onChange={toggleAllRows}
                    aria-label="Select all"
                    data-testid="select-all-checkbox"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Invoice</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Vendor</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    data-testid={`invoice-row-${inv.id}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(inv.id)}
                        onChange={() => toggleRow(inv.id)}
                        aria-label={`Select ${inv.number}`}
                        data-testid={`checkbox-${inv.id}`}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{inv.number}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{inv.vendor}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[inv.status]}`}
                        data-testid={`status-${inv.id}`}
                      >
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{inv.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          aria-label="View"
                          data-testid={`view-${inv.id}`}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                          aria-label="Edit"
                          data-testid={`edit-${inv.id}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {inv.status === 'pending' && (
                          <button
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-green-600"
                            aria-label="Approve"
                            data-testid={`approve-${inv.id}`}
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} invoices
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-colors"
              aria-label="Previous page"
              data-testid="prev-page"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  page === p
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                data-testid={`page-${p}`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-colors"
              aria-label="Next page"
              data-testid="next-page"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
