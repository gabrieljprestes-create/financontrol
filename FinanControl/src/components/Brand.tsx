import { BarChart3 } from "lucide-react";

export function Brand({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BarChart3 className="h-6 w-6 text-primary" strokeWidth={2.5} />
      <span className="text-xl font-bold text-slate-900">
        Finan<span className="text-primary">Control</span>
      </span>
    </div>
  );
}
