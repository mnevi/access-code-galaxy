import { useState, useEffect } from 'react';
import { ChallengeService } from '@/services/challengeService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useChallengeProgress(challengeId?: string) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const evaluateWorkspace = async (workspace: any, output?: string) => {
    if (!challengeId || !workspace) return;

    setIsEvaluating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const evaluation = ChallengeService.evaluateWorkspace(workspace, challengeId, output);
      setCurrentProgress(evaluation.progress);

      // Only update if progress has changed significantly or challenge is completed
      if (Math.abs(evaluation.progress - currentProgress) > 5 || evaluation.completed !== isCompleted) {
        await ChallengeService.updateChallengeProgress(
          user.id,
          challengeId,
          evaluation.progress,
          evaluation.completed
        );

        setIsCompleted(evaluation.completed);

        if (evaluation.completed && !isCompleted) {
          const challenge = ChallengeService.getChallengeById(challengeId);
          toast({
            title: "🎉 Challenge Completed!",
            description: `You earned ${challenge?.xpReward} XP for completing "${challenge?.title}"`,
          });
        }
      }
    } catch (error) {
      console.error('Error evaluating workspace:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    currentProgress,
    isCompleted,
    isEvaluating,
    evaluateWorkspace
  };
}