import { supabase } from "@/integrations/supabase/client";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  xpReward: number;
  requiredBlocks: string[];
  successCriteria: {
    type: "blockCount" | "codeGeneration" | "execution";
    value: any;
  };
}

export interface ChallengeProgress {
  id?: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  xp_earned: number;
  completed_at?: string;
}

export const challenges: Challenge[] = [
  {
    id: "html-basics",
    title: "HTML Basics",
    description: "Learn the fundamental building blocks of web development",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    xpReward: 100,
    requiredBlocks: ["text_print", "text"],
    successCriteria: {
      type: "blockCount",
      value: { min: 2, blocks: ["text_print", "text"] }
    }
  },
  {
    id: "css-styling",
    title: "CSS Styling",
    description: "Master the art of styling web pages with CSS",
    difficulty: "Beginner",
    estimatedTime: "60 min",
    xpReward: 150,
    requiredBlocks: ["controls_repeat", "text_print"],
    successCriteria: {
      type: "blockCount",
      value: { min: 3, blocks: ["controls_repeat", "text_print"] }
    }
  },
  {
    id: "javascript-functions",
    title: "JavaScript Functions",
    description: "Dive into programming logic with JavaScript",
    difficulty: "Intermediate",
    estimatedTime: "90 min",
    xpReward: 200,
    requiredBlocks: ["controls_if", "math_arithmetic", "variables_get"],
    successCriteria: {
      type: "blockCount",
      value: { min: 4, blocks: ["controls_if", "math_arithmetic"] }
    }
  }
];

export class ChallengeService {
  static async getUserChallengeProgress(userId: string): Promise<ChallengeProgress[]> {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching challenge progress:', error);
      return [];
    }

    return data || [];
  }

  static async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number,
    completed: boolean = false
  ): Promise<ChallengeProgress | null> {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    const xpEarned = completed ? challenge.xpReward : Math.floor((progress / 100) * challenge.xpReward);
    
    const { data, error } = await supabase
      .from('challenge_progress')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        progress,
        completed,
        xp_earned: xpEarned,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,challenge_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating challenge progress:', error);
      return null;
    }

    // Update user's total XP and streak if challenge completed
    if (completed) {
      await this.updateUserStats(userId, xpEarned);
    }

    return data;
  }

  static async updateUserStats(userId: string, xpEarned: number): Promise<void> {
    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points, current_streak')
      .eq('id', userId)
      .single();

    if (!profile) return;

    // Update XP and increment streak
    const { error } = await supabase
      .from('profiles')
      .update({
        xp_points: (profile.xp_points || 0) + xpEarned,
        current_streak: (profile.current_streak || 0) + 1
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user stats:', error);
    }
  }

  static evaluateWorkspace(workspace: any, challengeId: string): { progress: number, completed: boolean } {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return { progress: 0, completed: false };

    const blocks = workspace.getAllBlocks(false);
    const blockTypes = blocks.map((block: any) => block.type);

    const { successCriteria } = challenge;

    switch (successCriteria.type) {
      case "blockCount":
        const requiredBlocks = successCriteria.value.blocks;
        const minBlocks = successCriteria.value.min;
        
        let foundBlocks = 0;
        requiredBlocks.forEach((requiredType: string) => {
          if (blockTypes.includes(requiredType)) {
            foundBlocks++;
          }
        });

        const hasMinimumBlocks = blocks.length >= minBlocks;
        const hasRequiredTypes = foundBlocks >= requiredBlocks.length;
        
        const progress = Math.min(100, (foundBlocks / requiredBlocks.length) * 100);
        const completed = hasMinimumBlocks && hasRequiredTypes;

        return { progress, completed };

      default:
        return { progress: 0, completed: false };
    }
  }

  static getChallengeById(challengeId: string): Challenge | undefined {
    return challenges.find(c => c.id === challengeId);
  }

  static async getChallengesWithProgress(userId: string) {
    const userProgress = await this.getUserChallengeProgress(userId);
    
    return challenges.map(challenge => {
      const progress = userProgress.find(p => p.challenge_id === challenge.id);
      return {
        ...challenge,
        progress: progress?.progress || 0,
        isCompleted: progress?.completed || false,
        isLocked: false // You can implement locking logic here
      };
    });
  }
}