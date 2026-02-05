import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface Column {
  key: string;
  label: string;
  editable?: boolean;
  type?: "text" | "number" | "email" | "date";
}

interface EditableTableProps {
  columns: Column[];
  rows: Record<string, any>[];
  onRowUpdate?: (rowIndex: number, updatedRow: Record<string, any>) => Promise<void>;
  onRowDelete?: (rowIndex: number) => Promise<void>;
  isLoading?: boolean;
}

export function EditableTable({
  columns,
  rows,
  onRowUpdate,
  onRowDelete,
  isLoading = false,
}: EditableTableProps) {
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Record<string, any> | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = (rowIndex: number) => {
    setEditingRowIndex(rowIndex);
    setEditingData({ ...rows[rowIndex] });
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingData(null);
  };

  const handleSaveEdit = async (rowIndex: number) => {
    if (!editingData || !onRowUpdate) return;

    try {
      setIsUpdating(true);
      await onRowUpdate(rowIndex, editingData);
      setEditingRowIndex(null);
      setEditingData(null);
    } catch (error) {
      console.error("Failed to update row:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = async (rowIndex: number) => {
    if (!onRowDelete) return;

    try {
      setIsUpdating(true);
      await onRowDelete(rowIndex);
    } catch (error) {
      console.error("Failed to delete row:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCellChange = (key: string, value: any) => {
    if (editingData) {
      setEditingData({ ...editingData, [key]: value });
    }
  };

  return (
    <div className="border rounded-lg overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            {columns.map((column) => (
              <TableHead key={column.key} className="font-semibold">
                {column.label}
              </TableHead>
            ))}
            <TableHead className="w-24 text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center py-4 text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column.key}`} className="py-2">
                    {editingRowIndex === rowIndex && column.editable ? (
                      <Input
                        type={column.type || "text"}
                        value={editingData?.[column.key] ?? ""}
                        onChange={(e) => handleCellChange(column.key, e.target.value)}
                        disabled={isUpdating}
                        className="h-8"
                        data-testid={`input-edit-${column.key}-${rowIndex}`}
                      />
                    ) : (
                      <span>{row[column.key] ?? "-"}</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right space-x-1">
                  {editingRowIndex === rowIndex ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEdit(rowIndex)}
                        disabled={isUpdating}
                        data-testid={`button-save-${rowIndex}`}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        data-testid={`button-cancel-${rowIndex}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(rowIndex)}
                        disabled={isLoading || isUpdating}
                        data-testid={`button-edit-${rowIndex}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(rowIndex)}
                        disabled={isLoading || isUpdating}
                        data-testid={`button-delete-${rowIndex}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
