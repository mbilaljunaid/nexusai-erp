import { SystemHealth } from "../SystemHealth";

export default function SystemHealthExample() {
  return (
    <div className="p-4 max-w-md">
      <SystemHealth onRefresh={() => console.log('Refreshing health data')} />
    </div>
  );
}
