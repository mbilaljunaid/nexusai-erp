import { KanbanBoard } from "../KanbanBoard";

export default function KanbanBoardExample() {
  return (
    <div className="p-4">
      <KanbanBoard 
        onAddTask={(columnId) => console.log('Add task to', columnId)}
      />
    </div>
  );
}
