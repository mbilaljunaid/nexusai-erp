import { AddTaskDialog } from "../AddTaskDialog";

export default function AddTaskDialogExample() {
  return (
    <div className="p-4">
      <AddTaskDialog onAddTask={(task) => console.log('New task:', task)} />
    </div>
  );
}
