import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilityModeCardProps {
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
  features: string[];
}

const AccessibilityModeCard: React.FC<AccessibilityModeCardProps> = ({
  title,
  description,
  icon,
  isSelected,
  onClick,
  features,
}) => {
  return (
    <div
      className={cn(
        "mode-card group",
        isSelected && "selected"
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <div className="absolute top-4 right-4 p-1 bg-success rounded-full">
          <Check className="h-4 w-4 text-success-foreground" />
        </div>
      )}
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
          <img 
            src={icon} 
            alt={`${title} mode icon`}
            className="w-12 h-12 object-contain"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            <span className="text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessibilityModeCard;