import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Grid3x3, BarChart3, PieChart as PieChartIcon, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportSpreadsheetProps {
  data?: any[];
  columns?: { label: string; field: string; type: string }[];
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export function ReportSpreadsheet({ data = [], columns = [] }: ReportSpreadsheetProps) {
  const [tableData, setTableData] = useState<any[]>(data);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");
  const [pivotDimension, setPivotDimension] = useState<string>(columns[0]?.field || "");
  const [pivotMetric, setPivotMetric] = useState<string>("");
  const tableRef = useRef<HTMLDivElement>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C / Cmd+C for copy
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        copySelectedCells();
      }
      // Ctrl+V / Cmd+V for paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        toast({ title: "Paste functionality available via context menu" });
      }
      // Ctrl+Z / Cmd+Z for undo (placeholder)
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        toast({ title: "Undo not available for this view" });
      }
      // Delete key
      if (e.key === "Delete") {
        e.preventDefault();
        clearSelectedCells();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells, tableData]);

  const toast = ({ title }: { title: string }) => {
    console.log(title);
  };

  const copySelectedCells = () => {
    if (selectedCells.size === 0) return;
    const cellArray = Array.from(selectedCells);
    const copyText = cellArray.map(cell => {
      const [row, col] = cell.split("-").map(Number);
      return tableData[row]?.[columns[col]?.field] || "";
    }).join("\t");
    navigator.clipboard.writeText(copyText);
    toast({ title: "Copied to clipboard" });
  };

  const clearSelectedCells = () => {
    if (selectedCells.size === 0) return;
    const newData = tableData.map((row, rowIdx) => {
      const newRow = { ...row };
      selectedCells.forEach(cell => {
        const [r, c] = cell.split("-").map(Number);
        if (r === rowIdx) {
          newRow[columns[c]?.field] = "";
        }
      });
      return newRow;
    });
    setTableData(newData);
    setSelectedCells(new Set());
  };

  const handleCellClick = (rowIdx: number, colIdx: number, e: React.MouseEvent) => {
    const cellKey = `${rowIdx}-${colIdx}`;
    const newSelection = new Set(selectedCells);
    
    if (e.ctrlKey || e.metaKey) {
      if (newSelection.has(cellKey)) {
        newSelection.delete(cellKey);
      } else {
        newSelection.add(cellKey);
      }
    } else if (e.shiftKey && selectedCells.size > 0) {
      const [firstCell] = Array.from(selectedCells)[0].split("-").map(Number);
      const start = Math.min(firstCell, rowIdx);
      const end = Math.max(firstCell, rowIdx);
      for (let i = start; i <= end; i++) {
        newSelection.add(`${i}-${colIdx}`);
      }
    } else {
      newSelection.clear();
      newSelection.add(cellKey);
    }
    
    setSelectedCells(newSelection);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: any) => {
    const newData = [...tableData];
    newData[rowIdx] = { ...newData[rowIdx], [columns[colIdx].field]: value };
    setTableData(newData);
  };

  // Generate pivot table data
  const pivotData = pivotDimension && pivotMetric ? generatePivotData(tableData, pivotDimension, pivotMetric) : [];

  // Generate chart data
  const chartData = pivotData.length > 0 ? pivotData : tableData.slice(0, 10);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="spreadsheet" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spreadsheet" data-testid="tab-spreadsheet">
            <Grid3x3 className="h-4 w-4 mr-2" />
            Spreadsheet
          </TabsTrigger>
          <TabsTrigger value="pivot" data-testid="tab-pivot">
            <BarChart3 className="h-4 w-4 mr-2" />
            Pivot
          </TabsTrigger>
          <TabsTrigger value="chart" data-testid="tab-chart">
            <PieChartIcon className="h-4 w-4 mr-2" />
            Charts
          </TabsTrigger>
        </TabsList>

        {/* SPREADSHEET VIEW */}
        <TabsContent value="spreadsheet" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <CardTitle>Spreadsheet View</CardTitle>
              <div className="text-xs text-muted-foreground">
                Keyboard: Ctrl+C (Copy), Ctrl+V (Paste), Delete (Clear)
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-md" ref={tableRef}>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      {columns.map((col, idx) => (
                        <th key={idx} className="border p-2 font-semibold text-left">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t">
                        {columns.map((col, colIdx) => {
                          const cellKey = `${rowIdx}-${colIdx}`;
                          const isSelected = selectedCells.has(cellKey);
                          return (
                            <td
                              key={colIdx}
                              onClick={(e) => handleCellClick(rowIdx, colIdx, e)}
                              className={`border-r p-2 cursor-cell transition-colors ${
                                isSelected ? "bg-blue-200 dark:bg-blue-900" : "hover:bg-accent"
                              }`}
                              data-testid={`cell-${rowIdx}-${colIdx}`}
                            >
                              <input
                                type="text"
                                value={row[col.field] || ""}
                                onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                className="w-full bg-transparent outline-none"
                                data-testid={`input-cell-${rowIdx}-${colIdx}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {selectedCells.size > 0 && (
                  <p>{selectedCells.size} cell(s) selected</p>
                )}
                <Button size="sm" onClick={copySelectedCells} disabled={selectedCells.size === 0} className="mt-2">
                  Copy Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PIVOT TABLE VIEW */}
        <TabsContent value="pivot" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pivot Table</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-pivot-config">
                    <DialogHeader>
                      <DialogTitle>Configure Pivot Table</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Dimension</label>
                        <Select value={pivotDimension} onValueChange={setPivotDimension}>
                          <SelectTrigger data-testid="select-pivot-dimension">
                            <SelectValue placeholder="Select dimension" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((col) => (
                              <SelectItem key={col.field} value={col.field}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Metric</label>
                        <Select value={pivotMetric} onValueChange={setPivotMetric}>
                          <SelectTrigger data-testid="select-pivot-metric">
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.filter((col) => col.type === "number" || col.type === "currency").map((col) => (
                              <SelectItem key={col.field} value={col.field}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {pivotData.length > 0 ? (
                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 font-semibold text-left">{pivotDimension}</th>
                        <th className="border p-2 font-semibold text-right">Count</th>
                        <th className="border p-2 font-semibold text-right">Sum</th>
                        <th className="border p-2 font-semibold text-right">Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pivotData.map((row, idx) => (
                        <tr key={idx} className="border-t hover:bg-accent">
                          <td className="border p-2">{row.dimension}</td>
                          <td className="border p-2 text-right">{row.count}</td>
                          <td className="border p-2 text-right">{row.sum?.toFixed(2)}</td>
                          <td className="border p-2 text-right">{row.average?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Configure pivot table to see data
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHARTS VIEW */}
        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Charts</CardTitle>
              <div className="flex gap-2">
                <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                  <SelectTrigger className="w-32" data-testid="select-chart-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96">
                {chartType === "bar" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={pivotDimension || columns[0]?.field} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {columns
                        .filter((col) => col.type === "number" || col.type === "currency")
                        .slice(0, 3)
                        .map((col, idx) => (
                          <Bar key={idx} dataKey={col.field} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {chartType === "line" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={pivotDimension || columns[0]?.field} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {columns
                        .filter((col) => col.type === "number" || col.type === "currency")
                        .slice(0, 3)
                        .map((col, idx) => (
                          <Line key={idx} type="monotone" dataKey={col.field} stroke={COLORS[idx % COLORS.length]} />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {chartType === "pie" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey={pivotMetric || columns.find((c) => c.type === "number")?.field || "value"}
                        nameKey={pivotDimension || columns[0]?.field}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {chartData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function generatePivotData(data: any[], dimension: string, metric: string) {
  const groups: Record<string, any[]> = {};
  
  data.forEach((row) => {
    const key = row[dimension] || "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });

  return Object.entries(groups).map(([dimension, rows]) => {
    const values = rows.map((r) => parseFloat(r[metric]) || 0).filter((v) => !isNaN(v));
    const sum = values.reduce((a, b) => a + b, 0);
    const average = values.length > 0 ? sum / values.length : 0;

    return {
      dimension,
      count: rows.length,
      sum,
      average,
      [dimension]: dimension,
      [metric]: sum,
    };
  });
}
