
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceRecognitionOptions {
  onCommand: (command: string, text: string) => void;
  enabled: boolean;
}

export const useHuggingFaceVoiceRecognition = ({ onCommand, enabled }: VoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const [isModelLoading] = useState(false); // Not used for Web Speech API

  // Voice commands for block placement
  const blockCommands = {
    // Block selection commands
    'select first block': 'SELECT_FIRST',
    'select last block': 'SELECT_LAST', 
    'select next block': 'SELECT_NEXT',
    'select previous block': 'SELECT_PREVIOUS',
    'select block': 'SELECT_CYCLE',
    'deselect block': 'DESELECT',
    'select all blocks': 'SELECT_ALL',
    
    // Block movement commands
    'move up': 'MOVE_UP',
    'move down': 'MOVE_DOWN',
    'move left': 'MOVE_LEFT',
    'move right': 'MOVE_RIGHT',
    'move block up': 'MOVE_UP',
    'move block down': 'MOVE_DOWN',
    'move block left': 'MOVE_LEFT',
    'move block right': 'MOVE_RIGHT',
    
    // Fine movement commands
    'nudge up': 'NUDGE_UP',
    'nudge down': 'NUDGE_DOWN',
    'nudge left': 'NUDGE_LEFT',
    'nudge right': 'NUDGE_RIGHT',
    
    // Block manipulation commands
    'delete selected block': 'DELETE_SELECTED',
    'duplicate selected block': 'DUPLICATE_SELECTED',
    'connect blocks': 'CONNECT_BLOCKS',
    'disconnect block': 'DISCONNECT_BLOCK',
    
    // Control blocks
    'repeat': 'controls_repeat',
    'loop': 'controls_repeat',
    'while': 'controls_whileUntil',
    'for loop': 'controls_for',
    'if': 'controls_if',
    'if else': 'controls_ifelse',
    // Text blocks
    'print': 'text_print',
    'text': 'text',
    'join text': 'text_join',
    'text length': 'text_length',
    'ask': 'text_prompt_ext',
    // Math blocks
    'number': 'math_number',
    'math': 'math_arithmetic',
    'add': 'math_arithmetic',
    'subtract': 'math_arithmetic',
    'multiply': 'math_arithmetic',
    'divide': 'math_arithmetic',
    'square root': 'math_single',
    // Logic blocks
    'true': 'logic_boolean',
    'false': 'logic_boolean',
    'and': 'logic_operation',
    'or': 'logic_operation',
    'not': 'logic_negate',
    'compare': 'logic_compare',
    // Variable blocks
    'variable': 'variables_get',
    'set variable': 'variables_set',
    'change variable': 'variables_change',
    // Function blocks
    'function': 'procedures_defnoreturn',
    'return': 'procedures_defreturn',
    'call function': 'procedures_callnoreturn',
    
    // Workspace commands
    'zoom in': 'ZOOM_IN',
    'zoom out': 'ZOOM_OUT',
    'center workspace': 'CENTER_WORKSPACE',
    'clear workspace': 'CLEAR_WORKSPACE',
    'undo': 'UNDO',
    'redo': 'REDO',
    'run code': 'RUN_CODE',
    'clear code': 'CLEAR_CODE'
  };

  const parseCommand = (text: string): { command: string; blockType: string; value?: string } | null => {
    const lowerText = text.toLowerCase().trim();
    console.log('🎤 Voice transcription received:', text);
    console.log('🔍 Processed text for matching:', lowerText);
    // Filter out non-speech transcriptions
    const nonSpeechPatterns = [
      /\[.*?\]/,  // [Sigh], [SOUND], [Music], etc.
      /\(.*?\)/,  // (sighs), (breathing heavily), etc.
      /^\s*$/,    // Empty or whitespace only
      /^(sigh|breath|breathing|sound|music|noise|cough|clear|throat)s?$/i,
      /breathing/i,
      /sighs?/i,
      /sounds?/i
    ];
    for (const pattern of nonSpeechPatterns) {
      if (pattern.test(lowerText)) {
        console.log('🚫 Non-speech detected, ignoring:', lowerText);
        return null;
      }
    }
    // Special case: set value to X / set block value to X
    const setValueMatch = lowerText.match(/^set (?:block )?value to (.+)$/);
    if (setValueMatch && setValueMatch[1]) {
      console.log('✅ Set value command detected:', setValueMatch[1]);
      return { command: 'SET_BLOCK_VALUE', blockType: 'SET_BLOCK_VALUE', value: setValueMatch[1].trim() };
    }
    console.log('📋 Available commands:', Object.keys(blockCommands));
    // Check for direct block commands
    for (const [keyword, blockType] of Object.entries(blockCommands)) {
      if (lowerText.includes(keyword)) {
        console.log('✅ Direct match found:', keyword, '->', blockType);
        return { command: keyword, blockType };
      }
    }
    // Check for placement commands
    if (lowerText.includes('place') || lowerText.includes('add') || lowerText.includes('create')) {
      console.log('🔄 Checking placement commands for:', lowerText);
      for (const [keyword, blockType] of Object.entries(blockCommands)) {
        if (lowerText.includes(keyword)) {
          console.log('✅ Placement match found:', keyword, '->', blockType);
          return { command: `place ${keyword}`, blockType };
        }
      }
    }
    console.log('❌ No command match found for:', lowerText);
    return null;
  };

  const startListening = useCallback(() => {
    if (!enabled || isListening) return;
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support the Web Speech API.",
        variant: "destructive",
      });
      return;
    }
    setIsListening(true);
    setIsProcessing(true);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      setIsListening(false);
      setIsProcessing(false);
      const transcript = event.results[0][0].transcript;
      console.log('Voice transcription:', transcript);
      const parsedCommand = parseCommand(transcript);
      if (parsedCommand) {
        if (parsedCommand.command === 'SET_BLOCK_VALUE' && parsedCommand.value) {
          onCommand('SET_BLOCK_VALUE', parsedCommand.value);
          toast({
            title: "Voice Command Recognized",
            description: `Set block value to: ${parsedCommand.value}`,
          });
        } else {
          onCommand(parsedCommand.blockType, transcript);
          toast({
            title: "Voice Command Recognized",
            description: `Placing ${parsedCommand.command} block`,
          });
        }
      } else {
        // Check if it was non-speech
        const isNonSpeech = /\[.*?\]/.test(transcript) || 
                           /\(.*?\)/.test(transcript) ||
                           /^(sigh|breath|breathing|sound|music|noise|cough|clear|throat)s?$/i.test(transcript.toLowerCase().trim()) ||
                           /breathing|sighs?|sounds?/i.test(transcript);
        toast({
          title: isNonSpeech ? "Please Speak Clearly" : "Command Not Recognized",
          description: isNonSpeech 
            ? "The microphone detected background noise. Try speaking directly into the mic with clear words like 'print' or 'if'."
            : `Try saying "place print" or "add if block". Heard: "${transcript}"`,
          variant: "destructive",
        });
      }
    };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsProcessing(false);
      console.error('Speech recognition error:', event.error);
      toast({
        title: "Speech Recognition Error",
        description: `Could not process speech: ${event.error}`,
        variant: "destructive",
      });
    };
    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };
    recognition.start();
  }, [enabled, isListening, onCommand, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    isProcessing,
    isModelLoading: false,
    startListening,
    stopListening,
    availableCommands: Object.keys(blockCommands)
  };
};