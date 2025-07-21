import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Trophy } from "lucide-react";

interface ChallengeCardProps {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  progress: number;
  xpReward: number;
  isCompleted: boolean;
  isLocked: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  title,
  description,
  difficulty,
  estimatedTime,
  progress,
  xpReward,
  isCompleted,
  isLocked,
}) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "bg-success text-success-foreground";
      case "Intermediate": return "bg-warning text-warning-foreground";
      case "Advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className={`card-elevated transition-all duration-300 ${
      isLocked ? "opacity-50" : "hover:scale-105"
    } ${isCompleted ? "ring-2 ring-success" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            {isCompleted && (
              <Trophy className="h-5 w-5 text-success" />
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-3">{description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Badge className={getDifficultyColor(difficulty)}>
          {difficulty}
        </Badge>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>{xpReward} XP</span>
          </div>
        </div>
      </div>

      {progress > 0 && !isCompleted && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <Button 
        className={isCompleted ? "btn-success" : "btn-hero"}
        disabled={isLocked}
        size="sm"
      >
        {isLocked ? "Locked" : isCompleted ? "Completed" : progress > 0 ? "Continue" : "Start Challenge"}
      </Button>
    </div>
  );
};

export default ChallengeCard;