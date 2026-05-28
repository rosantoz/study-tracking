import { GoalsManager } from "@/components/goals-manager";

export default function GoalsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-foreground">Goals</h1>
      <GoalsManager />
    </div>
  );
}
