import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for browser use
env.allowLocalModels = false;
env.useBrowserCache = true;

interface VoiceRecognitionOptions {
  onCommand: (command: string, text: string) => void;
  enabled: boolean;
}

export const useHuggingFaceVoiceRecognition = ({ onCommand, enabled }: VoiceRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptionPipelineRef = useRef<any>(null);
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
    
    console.log('🎤 Voice transcription received:', text);
    console.log('🔍 Processed text for matching:', lowerText);
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

  const loadModel = useCallback(async () => {
    if (transcriptionPipelineRef.current) return transcriptionPipelineRef.current;

    try {
      setIsModelLoading(true);
      toast({
        title: "Loading Speech Model",
        description: "Downloading Whisper model for the first time...",
      });

      // Load the Whisper model for automatic speech recognition
      const transcriber = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        { 
          device: 'webgpu',
          // Fallback to CPU if WebGPU is not available
          dtype: 'fp32'
        }
      );

      transcriptionPipelineRef.current = transcriber;
      
      toast({
        title: "Model Loaded",
        description: "Speech recognition is ready!",
      });

      return transcriber;
    } catch (error) {
      console.error('Error loading speech model:', error);
      toast({
        title: "Model Loading Error",
        description: "Failed to load speech model. Using fallback.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsModelLoading(false);
    }
  }, [toast]);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const transcriber = await loadModel();
      
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Create audio context to process the audio
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Convert to the format expected by Whisper
      const audio = audioBuffer.getChannelData(0);
      
      // Perform transcription
      const result = await transcriber(audio);
      
      console.log('Transcription result:', result);
      
      return result.text || '';
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    }
  }, [loadModel]);

  const startListening = useCallback(async () => {
    if (!enabled || isListening || isModelLoading) return;

    try {
      // Load model first if not loaded
      if (!transcriptionPipelineRef.current) {
        await loadModel();
      }

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
          
          // Process audio with Hugging Face Transformers
          const transcription = await processAudio(audioBlob);
          
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
  }, [enabled, isListening, isModelLoading, onCommand, toast, loadModel, processAudio]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return {
    isListening,
    isProcessing,
    isModelLoading,
    startListening,
    stopListening,
    availableCommands: Object.keys(blockCommands)
  };
};