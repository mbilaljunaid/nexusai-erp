'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { PlusIcon, ListBulletIcon, RectangleStackIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'on-leave' | 'inactive';
}

const statusColors = {
  active: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
  'on-leave': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200',
  inactive: 'bg-slate-100 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200',
};

const deptColors: Record<string, string> = {
  Engineering: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  Product: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  Design: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
  'Human Resources': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  'Quality Assurance': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  Analytics: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
  Infrastructure: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  Finance: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
  Sales: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300',
  Marketing: 'bg-lime-100 dark:bg-lime-900/20 text-lime-700 dark:text-lime-300',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const limit = 12;

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      try {
        const res = await fetch(`/api/hr/employees?page=${page}&limit=${limit}`);
        const data = await res.json();
        setEmployees(data.data);
        setTotal(data.total);
        setPages(data.pages);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployees();
  }, [page]);

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage company employees and team members"
        breadcrumbs={[
          { label: 'Human Resources', href: '/hr' },
          { label: 'Employees' },
        ]}
        status={{ label: '156 Active', color: 'green' }}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                aria-label="Grid view"
                data-testid="view-grid"
              >
                <RectangleStackIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                aria-label="List view"
                data-testid="view-list"
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="add-employee-btn"
            >
              <PlusIcon className="w-5 h-5" />
              Add Employee
            </button>
          </div>
        }
      />

      <div className="px-8 py-6">
        {/* Grid View */}
        {viewMode === 'grid' && (
          <div>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No employees found</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                      data-testid={`employee-card-${emp.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{emp.name}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{emp.role}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[emp.status]}`}
                          data-testid={`status-${emp.id}`}
                        >
                          {emp.status === 'on-leave' ? 'On Leave' : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">{emp.email}</p>

                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${deptColors[emp.department]}`}
                          data-testid={`dept-${emp.id}`}
                        >
                          {emp.department}
                        </span>
                        <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      data-testid={`employee-row-${emp.id}`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{emp.email}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white">{emp.role}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${deptColors[emp.department]}`}
                          data-testid={`dept-${emp.id}`}
                        >
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[emp.status]}`}
                          data-testid={`status-${emp.id}`}
                        >
                          {emp.status === 'on-leave' ? 'On Leave' : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 dark:text-blue-400 hover:underline">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} employees
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-colors"
                aria-label="Previous page"
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
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
