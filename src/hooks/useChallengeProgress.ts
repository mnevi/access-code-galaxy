import { useState, useEffect } from 'react';
import { ChallengeService } from '@/services/challengeService';
import { useToast } from '@/components/ui/use-toast';

export function useChallengeProgress(challengeId?: string) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!challengeId) return;
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        const progressList = await ChallengeService.getUserChallengeProgress(userId);
        const progressItem = progressList.find((p: any) => p.challenge_id === challengeId);
        if (progressItem) {
          setCurrentProgress(progressItem.progress || 0);
          setIsCompleted(!!progressItem.completed);
        } else {
          setCurrentProgress(0);
          setIsCompleted(false);
        }
      } catch (error) {
        console.error('Error fetching challenge progress:', error);
      }
    };
    fetchProgress();
  }, [challengeId]);

  const evaluateWorkspace = async (workspace: any, output?: string) => {
    if (!challengeId || !workspace) return;

    setIsEvaluating(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      // Capture previous state to avoid stale closure
      const prevProgress = currentProgress;
      const prevCompleted = isCompleted;

      const evaluation = ChallengeService.evaluateWorkspace(workspace, challengeId, output);
      let updatedProgress = evaluation.progress;
      let updatedCompleted = evaluation.completed;

      // Only update backend if progress has changed significantly or challenge is completed
      if (Math.abs(evaluation.progress - prevProgress) > 5 || evaluation.completed !== prevCompleted) {
        await ChallengeService.updateChallengeProgress(
          userId,
          challengeId,
          evaluation.progress,
          evaluation.completed
        );
        // Re-fetch progress to sync state with backend
        const progressList = await ChallengeService.getUserChallengeProgress(userId);
        const progressItem = progressList.find((p: any) => p.challenge_id === challengeId);
        updatedProgress = progressItem?.progress || 0;
        updatedCompleted = !!progressItem?.completed;
      }

      setCurrentProgress(updatedProgress);
      setIsCompleted(updatedCompleted);

      // Show toast if just completed (compare to previous state)
      if (updatedCompleted && !prevCompleted) {
        const challenge = ChallengeService.getChallengeById(challengeId);
        toast({
          title: "🎉 Challenge Completed!",
          description: `You earned ${challenge?.xpReward} XP for completing \"${challenge?.title}\"`,
        });
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