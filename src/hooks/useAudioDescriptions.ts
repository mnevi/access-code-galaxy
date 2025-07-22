import { useCallback, useRef, useEffect } from 'react';

interface AudioDescriptionOptions {
  enabled: boolean;
  rate?: number; // Speech rate (0.1 to 10)
  pitch?: number; // Speech pitch (0 to 2)
  volume?: number; // Speech volume (0 to 1)
  voice?: string; // Specific voice name
}

export function useAudioDescriptions(options: AudioDescriptionOptions) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpesking = useRef(false);
  
  useEffect(() => {
    // Stop any ongoing speech when component unmounts or is disabled
    return () => {
      if (isSpesking.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);
  
  const speak = useCallback((text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!options.enabled || !('speechSynthesis' in window)) return;
    
    // Cancel ongoing speech for high priority messages
    if (priority === 'high' && isSpesking.current) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    
    // Set voice if specified
    if (options.voice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name.includes(options.voice!));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.onstart = () => {
      isSpesking.current = true;
    };
    
    utterance.onend = () => {
      isSpesking.current = false;
    };
    
    utterance.onerror = (event) => {
      // Only log non-interrupted errors to reduce console noise
      if (event.error !== 'interrupted') {
        console.warn('Speech synthesis error:', event.error);
      }
      isSpesking.current = false;
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [options]);
  
  const stop = useCallback(() => {
    if (isSpesking.current) {
      speechSynthesis.cancel();
      isSpesking.current = false;
    }
  }, []);
  
  const pause = useCallback(() => {
    if (isSpesking.current) {
      speechSynthesis.pause();
    }
  }, []);
  
  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);
  
  // Workspace-specific descriptions
  const describeWorkspace = useCallback((workspace: any) => {
    if (!workspace) return;
    
    const topBlocks = workspace.getTopBlocks();
    const blockCount = topBlocks.length;
    
    if (blockCount === 0) {
      speak("Workspace is empty. You can start by adding blocks from the toolbox.");
      return;
    }
    
    let description = `Workspace contains ${blockCount} block${blockCount === 1 ? '' : ' groups'}. `;
    
    // Describe each top-level block
    topBlocks.forEach((block: any, index: number) => {
      const blockType = block.type.replace(/_/g, ' ');
      const childCount = block.getChildren(false).length;
      
      description += `Group ${index + 1}: ${blockType}`;
      if (childCount > 0) {
        description += ` with ${childCount} connected block${childCount === 1 ? '' : 's'}`;
      }
      description += '. ';
    });
    
    speak(description);
  }, [speak]);
  
  const describeBlock = useCallback((block: any) => {
    if (!block) return;
    
    const blockType = block.type.replace(/_/g, ' ');
    const inputs = block.inputList || [];
    const fields = [];
    
    // Get field values
    inputs.forEach((input: any) => {
      input.fieldRow.forEach((field: any) => {
        if (field.getValue && field.getValue() !== '') {
          fields.push(field.getValue());
        }
      });
    });
    
    let description = `${blockType} block`;
    if (fields.length > 0) {
      description += ` with values: ${fields.join(', ')}`;
    }
    
    const childCount = block.getChildren(false).length;
    if (childCount > 0) {
      description += `. Has ${childCount} connected block${childCount === 1 ? '' : 's'}`;
    }
    
    speak(description);
  }, [speak]);
  
  const describeChallenge = useCallback((challenge: any, progress: number) => {
    if (!challenge) return;
    
    const description = `Challenge: ${challenge.title}. ${challenge.description}. 
                        Difficulty: ${challenge.difficulty}. 
                        Current progress: ${progress} percent. 
                        Estimated time: ${challenge.estimatedTime}. 
                        XP reward: ${challenge.xpReward} points.`;
    
    speak(description, 'high');
  }, [speak]);
  
  const describeProgress = useCallback((progress: number, isComplete: boolean) => {
    if (isComplete) {
      speak("Congratulations! Challenge completed successfully!", 'high');
    } else if (progress > 0) {
      speak(`Progress update: ${progress} percent complete`, 'medium');
    }
  }, [speak]);
  
  const describeError = useCallback((error: string) => {
    speak(`Error occurred: ${error}`, 'high');
  }, [speak]);
  
  const describeSuccess = useCallback((message: string) => {
    speak(`Success: ${message}`, 'high');
  }, [speak]);
  
  const describeLanguageChange = useCallback((language: string) => {
    speak(`Switched to ${language} programming language`, 'medium');
  }, [speak]);
  
  const describeToolboxCategory = useCallback((category: string) => {
    speak(`Toolbox category: ${category}`, 'low');
  }, [speak]);
  
  const describeCodeGeneration = useCallback((language: string, lineCount: number) => {
    speak(`Generated ${lineCount} lines of ${language} code`, 'medium');
  }, [speak]);
  
  return {
    speak,
    stop,
    pause,
    resume,
    describeWorkspace,
    describeBlock,
    describeChallenge,
    describeProgress,
    describeError,
    describeSuccess,
    describeLanguageChange,
    describeToolboxCategory,
    describeCodeGeneration,
    isSupported: 'speechSynthesis' in window,
    isSpeaking: () => isSpesking.current
  };
}