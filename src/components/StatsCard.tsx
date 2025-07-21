import React from "react";
import { Progress } from "@/components/ui/progress";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  icon: React.ReactNode;
  color: "primary" | "success" | "warning";
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  progress,
  icon,
  color,
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "success":
        return "from-success to-accent";
      case "warning":
        return "from-warning to-yellow-400";
      default:
        return "from-primary to-primary-glow";
    }
  };

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 bg-gradient-to-r ${getColorClasses(color)} rounded-xl`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      
      {progress !== undefined && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default StatsCard;