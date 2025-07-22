import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecognitionOptions {
  onCommand: (command: string, text: string) => void;
  enabled: boolean;
}

export const useVoiceRecognition = ({ onCommand, enabled }: VoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  // Voice commands for block placement
  const blockCommands = {
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
  };

  const parseCommand = (text: string): { command: string; blockType: string } | null => {
    const lowerText = text.toLowerCase().trim();
    
    // Check for direct block commands
    for (const [keyword, blockType] of Object.entries(blockCommands)) {
      if (lowerText.includes(keyword)) {
        return { command: keyword, blockType };
      }
    }

    // Check for placement commands
    if (lowerText.includes('place') || lowerText.includes('add') || lowerText.includes('create')) {
      for (const [keyword, blockType] of Object.entries(blockCommands)) {
        if (lowerText.includes(keyword)) {
          return { command: `place ${keyword}`, blockType };
        }
      }
    }

    return null;
  };

  const startListening = useCallback(async () => {
    if (!enabled || isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              const { data, error } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });

              if (error) throw error;

              const transcription = data.text;
              console.log('Voice transcription:', transcription);

              // Parse the command
              const parsedCommand = parseCommand(transcription);
              if (parsedCommand) {
                onCommand(parsedCommand.blockType, transcription);
                toast({
                  title: "Voice Command Recognized",
                  description: `Placing ${parsedCommand.command} block`,
                });
              } else {
                toast({
                  title: "Command Not Recognized",
                  description: `Try saying "place print" or "add if block"`,
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error('Voice processing error:', error);
              toast({
                title: "Voice Processing Error",
                description: "Failed to process voice command",
                variant: "destructive",
              });
            } finally {
              setIsProcessing(false);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          console.error('Audio processing error:', error);
          setIsProcessing(false);
        }

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      setIsListening(true);
      mediaRecorder.start();

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);

    } catch (error) {
      console.error('Error starting voice recognition:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  }, [enabled, isListening, onCommand, toast]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isListening,
    isProcessing,
    startListening,
    stopListening,
    availableCommands: Object.keys(blockCommands)
  };
};