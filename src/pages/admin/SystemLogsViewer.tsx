import { cn } from "@/lib/utils";
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Search, Filter, X, Loader2 } from "lucide-react";
import LogEntry from '../../components/admin/LogEntry';
import { StandardPage } from "@/components/layout/StandardPage";
import { ExportButton } from "@/components/ExportButton";
import { Card } from "@/components/ui/card";

interface Log {
    id: string;
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    timestamp: string;
    user?: string;
    endpoint?: string;
    metadata?: Record<string, any>;
}

export default function SystemLogsViewer() {
    const [filters, setFilters] = useState({
        level: '',
        user: '',
        endpoint: '',
        search: '',
    });
    const [count, setCount] = useState(100);

    const { data: logs = [], isLoading: loading, refetch: fetchLogs } = useQuery<Log[]>({
        queryKey: ['systemLogs', filters.level, filters.user, filters.endpoint, count, filters.search],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.level) params.append('level', filters.level);
            if (filters.user) params.append('user', filters.user);
            if (filters.endpoint) params.append('endpoint', filters.endpoint);
            params.append('count', count.toString());

            const response = await fetch(`/api/production/logs?${params.toString()}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // Filter by search term on client side
            let filteredLogs = data;
            if (filters.search) {
                filteredLogs = data.filter((log: Log) =>
                    log.message.toLowerCase().includes(filters.search.toLowerCase())
                );
            }

            return filteredLogs;
        }
    });

    const exportData = logs.map(log => ({
        "Timestamp": log.timestamp,
        "Level": log.level,
        "Message": log.message,
        "User": log.user || '',
        "Endpoint": log.endpoint || ''
    }));

    const clearFilters = () => {
        setFilters({
            level: '',
            user: '',
            endpoint: '',
            search: '',
        });
    };

    const hasActiveFilters = filters.level || filters.user || filters.endpoint || filters.search;

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'warn':
                return 'bg-yellow-100 text-yellow-800';
            case 'info':
                return 'bg-blue-100 text-blue-800';
            case 'debug':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <StandardPage
            title="System Logs"
            description="Search and filter application logs"
            actions={
                <div className="flex items-center gap-3">
                    <ExportButton
                        data={exportData}
                        filename={`system-logs-${new Date().toISOString()}`}
                    />
                    <button
                        onClick={() => fetchLogs()}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>
            }
        >
            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                                placeholder="Search messages..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {/* Level Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Log Level
                        </label>
                        <Select value={filters.level} onValueChange={(val) => setFilters({ ...filters, level: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Levels</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                                <SelectItem value="warn">Warning</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="debug">Debug</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* User Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User
                        </label>
                        <Input
                            type="text"
                            value={filters.user}
                            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                            placeholder="User ID"
                        />
                    </div>

                    {/* Endpoint Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endpoint
                        </label>
                        <Input
                            type="text"
                            value={filters.endpoint}
                            onChange={(e) => setFilters({ ...filters, endpoint: e.target.value })}
                            placeholder="/api/..."
                        />
                    </div>
                </div>

                {/* Log Count */}
                <div className="mt-4 flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">
                        Show:
                    </label>
                    <div className="flex items-center gap-2">
                        {[50, 100, 200, 500].map((value) => (
                            <button
                                key={value}
                                onClick={() => setCount(value)}
                                className={cn(`px-3 py-1 text-sm rounded-md ${count === value
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`)}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Logs List */}
            <Card>
                <div className="px-4 py-3 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <h3 className="text-sm font-semibold text-gray-900">
                                Log Entries ({logs.length})
                            </h3>
                        </div>
                        {/* Level Legend */}
                        <div className="flex items-center gap-2 text-xs">
                            {['error', 'warn', 'info', 'debug'].map((level) => (
                                <span key={level} className={cn(`px-2 py-1 rounded ${getLevelColor(level)}`)}>
                                    {level}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="divide-y">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No logs found matching your filters
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <LogEntry key={`${log.timestamp}-${index}`} log={log} />
                        ))
                    )}
                </div>
            </Card>
        </StandardPage>
    );
}
