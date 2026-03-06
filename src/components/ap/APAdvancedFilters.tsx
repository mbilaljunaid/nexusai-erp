import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from '@/components/ui/DatePicker';
import { useLocalStorage } from "@/hooks/use-local-storage";

interface APAdvancedFiltersProps {
    onFilterChange: (filters: any) => void;
    suppliers?: any[];
}

const FILTER_PRESETS = {
    overdue: {
        name: "Overdue Invoices",
        filters: { status: "Approved", dueDateBefore: new Date().toISOString().split('T')[0] }
    },
    pendingApproval: {
        name: "Pending Approval",
        filters: { status: "Pending Approval" }
    },
    thisMonth: {
        name: "This Month",
        filters: {
            invoiceDateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            invoiceDateTo: new Date().toISOString().split('T')[0]
        }
    },
    highValue: {
        name: "High Value (>$10,000)",
        filters: { amountMin: "10000" }
    }
};

export function APAdvancedFilters({ onFilterChange, suppliers = [] }: APAdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        invoiceDateFrom: "",
        invoiceDateTo: "",
        dueDateFrom: "",
        dueDateTo: "",
        glDateFrom: "",
        glDateTo: "",
        supplierIds: [] as string[],
        statuses: [] as string[],
        amountMin: "",
        amountMax: "",
        paymentTerms: "",
        invoiceType: "",
        searchQuery: ""
    });

    const [savedFilters, setSavedFilters] = useLocalStorage<any[]>('ap-saved-filters', []);
    const [filterName, setFilterName] = useState("");

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearAll = () => {
        const emptyFilters = {
            invoiceDateFrom: "",
            invoiceDateTo: "",
            dueDateFrom: "",
            dueDateTo: "",
            glDateFrom: "",
            glDateTo: "",
            supplierIds: [],
            statuses: [],
            amountMin: "",
            amountMax: "",
            paymentTerms: "",
            invoiceType: "",
            searchQuery: ""
        };
        setFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const handleSaveFilter = () => {
        if (!filterName) return;
        const newSaved = [...savedFilters, { name: filterName, filters: { ...filters } }];
        setSavedFilters(newSaved);
        setFilterName("");
    };

    const handleLoadFilter = (savedFilter: any) => {
        setFilters(savedFilter.filters);
        onFilterChange(savedFilter.filters);
    };

    const handleLoadPreset = (preset: any) => {
        const newFilters = { ...filters, ...preset.filters };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const activeFilterCount = Object.values(filters).filter(v =>
        Array.isArray(v) ? v.length > 0 : v !== ""
    ).length;

    const toggleSupplier = (supplierId: string) => {
        const newSuppliers = filters.supplierIds.includes(supplierId)
            ? filters.supplierIds.filter(id => id !== supplierId)
            : [...filters.supplierIds, supplierId];
        handleFilterChange('supplierIds', newSuppliers);
    };

    const toggleStatus = (status: string) => {
        const newStatuses = filters.statuses.includes(status)
            ? filters.statuses.filter(s => s !== status)
            : [...filters.statuses, status];
        handleFilterChange('statuses', newStatuses);
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2 items-center">
                <Button
                    variant={isOpen ? "default" : "outline"}
                    onClick={() => setIsOpen(!isOpen)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Advanced Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFilterCount}
                        </Badge>
                    )}
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClearAll} className="gap-2">
                        <X className="h-4 w-4" />
                        Clear All
                    </Button>
                )}

                {/* Filter Presets */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            Presets
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Filter Presets</h4>
                            {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
                                <Button
                                    key={key}
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => handleLoadPreset(preset)}
                                >
                                    {preset.name}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Saved Filters */}
                {savedFilters.length > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                Saved Filters ({savedFilters.length})
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Your Saved Filters</h4>
                                {savedFilters.map((saved, idx) => (
                                    <Button
                                        key={idx}
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => handleLoadFilter(saved)}
                                    >
                                        {saved.name}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {isOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Filter Criteria</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label>Search Invoice # or Description</Label>
                            <Input
                                placeholder="Search..."
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            />
                        </div>

                        {/* Date Ranges */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Invoice Date From</Label>
                                <DatePicker value={filters.invoiceDateFrom} onChange={(v) => handleFilterChange('invoiceDateFrom', v)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Invoice Date To</Label>
                                <DatePicker value={filters.invoiceDateTo} onChange={(v) => handleFilterChange('invoiceDateTo', v)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date From</Label>
                                <DatePicker value={filters.dueDateFrom} onChange={(v) => handleFilterChange('dueDateFrom', v)} />
                            </div>
                        </div>

                        {/* Multi-Select Statuses */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Draft', 'Pending Approval', 'Approved', 'Paid', 'Cancelled'].map(status => (
                                    <Badge
                                        key={status}
                                        variant={filters.statuses.includes(status) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleStatus(status)}
                                    >
                                        {status}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Amount Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount Min</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={filters.amountMin}
                                    onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount Max</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={filters.amountMax}
                                    onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Save Filter */}
                        <div className="pt-4 border-t">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Filter name (e.g., My Overdue Invoices)"
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                />
                                <Button onClick={handleSaveFilter} disabled={!filterName} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
