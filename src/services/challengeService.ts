

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  xpReward: number;
  maxBlocks: number;
  successCriteria: {
    type: "blockCount" | "codeGeneration" | "execution";
    value: any;
  };
  // Optionals for UI/merged progress
  isCompleted?: boolean;
  progress?: number;
  isLocked?: boolean;
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
    maxBlocks: 3,
    successCriteria: {
      type: "execution",
      value: 'hello\nhello\nhello\nhello\nhello\n'
    }
  },
  {
    id: "print2",
    title: "Intro to Printing - 2",
    description: "Print 1 - 10 using a loop",
    difficulty: "Intermediate",
    estimatedTime: "60 min",
    xpReward: 150,
    maxBlocks: 6,
    successCriteria: {
      type: "execution",
      value: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10'
    }
  },
  {
    id: "prime100",
    title: "Intro to Printing - 3",
    description: "Print the prime numbers from 2 - 100",
    difficulty: "Advanced",
    estimatedTime: "90 min",
    xpReward: 200,
    maxBlocks: 20,
    successCriteria: {
      type: "execution",
      value: '\n' +
      '2\\n3\\n5\\n7\\n11\\n13\\n17\\n19\\n23\\n29\\n31\\n37\\n41\\n43\\n47\\n53\\n59\\n61\\n67\\n71\\n73\\n79\\n83\\n89\\n97\\n'
    }
  },
  {
    id : "fizzbuzz",
    title: "Fizzbuzz Challenge",
    description: "Print the numbers 1 - 100. If the number is divisible by 3, replace it with 'fizz'. If the number is divisible by 5, replace it with 'buzz'. If the number is divisible by 3 and 5, replace it with 'fizzbuzz'. Do this in 35 or fewer blocks",
    difficulty: "Advanced",
    estimatedTime: "120 min",
    xpReward: 200,
    maxBlocks: 35,
    successCriteria: {
      type: "execution",
      value: '1\n2\nfizz\n4\nbuzz\nfizz\n7\n8\nfizz\nbuzz\n11\nfizz\n13\n14\nfizzbuzz\n16\n17\nfizz\n19\nbuzz\nfizz\n22\n23\nfizz\nbuzz\n26\nfizz\n28\n29\nfizzbuzz\n31\n32\nfizz\n34\nbuzz\nfizz\n37\n38\nfizz\nbuzz\n41\nfizz\n43\n44\nfizzbuzz\n46\n47\nfizz\n49\nbuzz\nfizz\n52\n53\nfizz\nbuzz\n56\nfizz\n58\n59\nfizzbuzz\n61\n62\nfizz\n64\nbuzz\nfizz\n67\n68\nfizz\nbuzz\n71\nfizz\n73\n74\nfizzbuzz\n76\n77\nfizz\n79\nbuzz\nfizz\n82\n83\nfizz\nbuzz\n86\nfizz\n88\n89\nfizzbuzz\n91\n92\nfizz\n94\nbuzz\nfizz\n97\n98\nfizz\nbuzz\n'
    }
  }
];

export class ChallengeService {
  static async getUserChallengeProgress(userId: string): Promise<ChallengeProgress[]> {
    try {
      const res = await fetch(`/api/progress/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch challenge progress');
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching challenge progress:', error);
      return [];
    }
  }

  static async updateChallengeProgress(
    userId: string,
    challengeId: string,
    progress: number,
    completed: boolean = false,
    xpEarnedOverride?: number
  ): Promise<ChallengeProgress | null> {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    const xpEarned = typeof xpEarnedOverride === 'number'
      ? xpEarnedOverride
      : (completed ? challenge.xpReward : Math.floor((progress / 100) * challenge.xpReward));

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          challenge_id: challengeId,
          progress,
          completed,
          xp_earned: xpEarned,
          completed_at: completed ? new Date().toISOString() : null
        })
      });
      if (!res.ok) throw new Error('Failed to update challenge progress');
      // Optionally, fetch the updated progress
      const updated = await this.getUserChallengeProgress(userId);
      return updated.find(p => p.challenge_id === challengeId) || null;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return null;
    }
  }

  // No longer needed: updateUserStats handled by backend when progress is completed

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
        // Fulfill the maxBlocks parameter: completed if blocks.length <= maxBlocks and > 0
        const maxBlocks = challenge.maxBlocks;
        const blockCount = blocks.length;
        const completed = blockCount > 0 && blockCount <= maxBlocks;
        const progress = blockCount > maxBlocks ? 0 : Math.min(100, (blockCount / maxBlocks) * 100);
        console.log(`[Blockly Debug] blockCount`, {
          maxBlocks,
          blockCount,
          completed,
          progress
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