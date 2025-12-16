import { TaskCard } from "../TaskCard";

export default function TaskCardExample() {
  // Fallback data for demo/preview when no API data provided
  const mockTask = {
    id: "1",
    title: "Review Q4 marketing strategy",
    description: "Analyze the proposed marketing initiatives and provide feedback",
    status: "in_progress" as const,
    priority: "high" as const,
    assignee: { name: "Alex Chen", initials: "AC" },
    dueDate: "Dec 15",
    project: "Marketing",
    aiGenerated: true,
    completed: false,
  };

  return (
    <div className="p-4 max-w-md">
      <TaskCard 
        task={mockTask}
        onToggleComplete={(task) => console.log('Toggled', task.id)}
      />
    </div>
  );
}
