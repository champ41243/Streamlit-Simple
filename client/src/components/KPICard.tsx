import { ArrowUpRight, TrendingUp, Activity } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: "trend" | "activity" | "default";
}

export function KPICard({ title, value, description, icon = "default" }: KPICardProps) {
  const Icon = icon === "trend" ? TrendingUp : icon === "activity" ? Activity : ArrowUpRight;

  return (
    <div className="kpi-card group bg-white">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mt-2 font-display">{value}</h3>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-4 font-mono">
          {description}
        </p>
      )}
    </div>
  );
}
