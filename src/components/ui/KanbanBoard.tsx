import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface KanbanColumn {
    id: string;
    title: string;
    color?: string;
    bgColor?: string;
}

export interface KanbanBoardProps<T extends { id: string }> {
    columns: KanbanColumn[];
    items: T[];
    getColumnId: (item: T) => string;
    onDragEnd?: (itemId: string, newColumnId: string) => void;
    renderCard: (item: T) => React.ReactNode;
    renderColumnHeader?: (column: KanbanColumn, columnItems: T[]) => React.ReactNode;
    onCardClick?: (item: T) => void;
    className?: string;
}

export function KanbanBoard<T extends { id: string }>({
    columns,
    items,
    getColumnId,
    onDragEnd,
    renderCard,
    renderColumnHeader,
    onCardClick,
    className = "",
}: KanbanBoardProps<T>) {
    const itemsByColumn = columns.reduce((acc, column) => {
        acc[column.id] = items.filter((item) => getColumnId(item) === column.id);
        return acc;
    }, {} as Record<string, T[]>);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        if (onDragEnd) {
            onDragEnd(draggableId, destination.droppableId);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
                {columns.map((column) => {
                    const columnItems = itemsByColumn[column.id] || [];

                    return (
                        <div key={column.id} className="flex flex-col min-w-72 flex-1 relative min-h-[500px]">
                            {/* Stage Header */}
                            {renderColumnHeader ? (
                                renderColumnHeader(column, columnItems)
                            ) : (
                                <Card className={`${column.bgColor || "bg-card"} border-2 mb-3 shadow-sm`}>
                                    <CardHeader className="py-3 px-4">
                                        <CardTitle className={`text-sm font-semibold flex items-center justify-between ${column.color || ""}`}>
                                            {column.title}
                                            <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full text-xs">
                                                {columnItems.length}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            )}

                            {/* Droppable Column */}
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 space-y-3 p-2 rounded-lg transition-colors border ${snapshot.isDraggingOver ? "bg-muted/50 border-primary/20" : "bg-transparent border-transparent"
                                            }`}
                                    >
                                        {columnItems.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div role="button" tabIndex={0}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`transition-all duration-200 outline-none ${snapshot.isDragging ? "opacity-90 scale-[1.02] shadow-xl z-50 ring-2 ring-primary/20 rounded-xl" : ""
                                                            }`}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                        }}
                                                        onClick={() => onCardClick?.(item)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                                                    >
                                                        {renderCard(item)}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
}
