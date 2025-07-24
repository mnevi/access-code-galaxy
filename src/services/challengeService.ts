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

/**
 * BLOCKLY TYPE IDs
 * 
 * can be verified with
 * > window.blocklyWorkspace.getAllBlocks(false).map(block => block.type)
 * in the web console.
 * 
 * ----- TEXT -----
 * print statement : "text_print"
 * text : "text"
 * length of : "text_length"
 * create text with : "text_join"
 * prompt for text message : "text_prompt_ext"
 * 
 * ----- CONTROL -----
 * repeat increment : "controls_repeat"
 * repeat while : "controls_whileUntil"
 * count with i : "controls_for"
 * if statement : "controls_if"
 * if else : "controls_ifelse"
 * 
 * ----- MATH -----
 * number : "math_number"
 * arithmetic : "math_arithmetic"
 * various functions (square root, exp, etc.) : "math_single"
 * random : "math_random_int"
 * round : "math_round"
 * 
 * ----- LOGIC -----
 * comparison : "logic_compare"
 * and / or : "logic_operation"
 * true / false : "logic_boolean"
 * test -> if true -> if false : "logic_ternary"
 * null : "logic_null"
 * 
 * ----- VARIABLES -----
 * set : "variables_set"
 * change : "math_change"
 * get : "variables_get"
 * 
 * ----- FUNCTIONS -----
 * function - return : "procedures_defnoreturn"
 * function + return : "procedures_defreturn"
 * if -> return : "procedures_ifreturn"
 * 
 * ----- LISTS -----
 * create list : "lists_create_with"
 * length : "lsits_length"
 * is empty : "lists_isEmpty"
 * in list find first occurence : "lists_indexOf"
 */

export const challenges: Challenge[] = [
  {
    id: "print",
    title: "Intro to Printing",
    description: "Print 'hello' five times",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    xpReward: 100,
    requiredBlocks: ["text_print"],
    successCriteria: {
      type: "execution",
      value: 'hello\nhello\nhello\nhello\nhello\n'
    }
  },
  {
    id: "print2",
    title: "Intro to Printing - 2",
    description: "Print 1 - 5 using a loop",
    difficulty: "Intermediate",
    estimatedTime: "60 min",
    xpReward: 150,
    requiredBlocks: ["controls_repeat", "text_print"],
    successCriteria: {
      type: "execution",
      value: '1\n2\n3\n4\n5\n'
    }
  },
  {
    id: "prime100",
    title: "Intro to Printing - 3",
    description: "Print the prime numbers from 2 - 100",
    difficulty: "Advanced",
    estimatedTime: "90 min",
    xpReward: 200,
    requiredBlocks: ["controls_if", "controls_for", "variables_get"],
    successCriteria: {
      type: "execution",
      value: '\n' +
      '2\\n3\\n5\\n7\\n11\\n13\\n17\\n19\\n23\\n29\\n31\\n37\\n41\\n43\\n47\\n53\\n59\\n61\\n67\\n71\\n73\\n79\\n83\\n89\\n97\\n'
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

static evaluateWorkspace(workspace: any, challengeId: string, output?: string): { progress: number, completed: boolean } {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) {
      console.error(`[Blockly Debug] Challenge not found for id: ${challengeId}`);
      return { progress: 0, completed: false };
    }

    const blocks = workspace.getAllBlocks(false);
    const blockTypes = blocks.map((block: any) => block.type);

    console.log(`[Blockly Debug] Evaluating challenge:`, {
      challengeId,
      challenge,
      blockTypes,
      output
    });

    const { successCriteria } = challenge;

    switch (successCriteria.type) {
      case "blockCount": {
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
        console.log(`[Blockly Debug] blockCount`, {
          requiredBlocks,
          minBlocks,
          foundBlocks,
          hasMinimumBlocks,
          hasRequiredTypes,
          progress,
          completed
        });
        return { progress, completed };
      }

      case "execution": {
        if (!output) {
          console.warn(`[Blockly Debug] No output provided for execution challenge.`);
          return { progress: 0, completed: false };
        }
        const expected = (successCriteria.value || "").replace(/\r\n/g, "\n").trim();
        const actual = output.replace(/\r\n/g, "\n").trim();
        const completed = actual === expected;
        const progress = completed ? 100 : 0;
        console.log(`[Blockly Debug] execution`, {
          expected,
          actual,
          completed,
          progress
        });
        return { progress, completed };
      }

      default:
        console.warn(`[Blockly Debug] Unknown successCriteria type: ${successCriteria.type}`);
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