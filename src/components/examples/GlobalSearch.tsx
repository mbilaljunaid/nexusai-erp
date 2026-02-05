import { GlobalSearch } from "../GlobalSearch";

export default function GlobalSearchExample() {
  return (
    <div className="p-4">
      <GlobalSearch onSelect={(result) => console.log('Selected:', result)} />
    </div>
  );
}
