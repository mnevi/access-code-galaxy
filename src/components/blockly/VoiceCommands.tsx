import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useHuggingFaceVoiceRecognition } from '@/hooks/useHuggingFaceVoiceRecognition';
import { Mic, MicOff, Volume2, HelpCircle, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceCommandsProps {
  onPlaceBlock: (blockType: string) => void;
  enabled: boolean;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onPlaceBlock, enabled }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<'openai' | 'huggingface'>('huggingface');

  const handleVoiceCommand = (blockType: string, text: string) => {
    console.log(`Voice command received: ${text} -> ${blockType}`);
    onPlaceBlock(blockType);
  };

  // OpenAI Voice Recognition
  const openaiVoice = useVoiceRecognition({
    onCommand: handleVoiceCommand,
    enabled: enabled && voiceProvider === 'openai'
  });

  // Hugging Face Voice Recognition
  const huggingfaceVoice = useHuggingFaceVoiceRecognition({
    onCommand: handleVoiceCommand,
    enabled: enabled && voiceProvider === 'huggingface'
  });

  // Get current voice recognition instance
  const currentVoice = voiceProvider === 'openai' ? openaiVoice : huggingfaceVoice;

  if (!enabled) return null;

  const getButtonState = () => {
    if (currentVoice.isProcessing || (voiceProvider === 'huggingface' && huggingfaceVoice.isModelLoading)) {
      return { text: voiceProvider === 'huggingface' && huggingfaceVoice.isModelLoading ? 'Loading Model...' : 'Processing...', icon: <Volume2 className="h-4 w-4 animate-pulse" /> };
    }
    if (currentVoice.isListening) return { text: 'Listening...', icon: <Mic className="h-4 w-4 text-red-500 animate-pulse" /> };
    return { text: 'Voice Commands', icon: <MicOff className="h-4 w-4" /> };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex items-center gap-2">
      <Select value={voiceProvider} onValueChange={(value: 'openai' | 'huggingface') => setVoiceProvider(value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="huggingface">🤗 Hugging Face</SelectItem>
          <SelectItem value="openai">🤖 OpenAI</SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        variant={currentVoice.isListening ? "destructive" : "outline"}
        size="sm"
        onClick={currentVoice.isListening ? currentVoice.stopListening : currentVoice.startListening}
        disabled={currentVoice.isProcessing || (voiceProvider === 'huggingface' && huggingfaceVoice.isModelLoading)}
        className="min-w-[140px]"
      >
        {buttonState.icon}
        {buttonState.text}
      </Button>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Voice Commands for Block Placement</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">How to Use Voice Commands</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Voice Commands" and speak clearly. You can say phrases like:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>"Place print block"</li>
                <li>"Add if statement"</li>
                <li>"Create repeat loop"</li>
                <li>"Insert text block"</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Available Commands</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Control Blocks</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">repeat</Badge>
                    <Badge variant="secondary" className="text-xs">loop</Badge>
                    <Badge variant="secondary" className="text-xs">while</Badge>
                    <Badge variant="secondary" className="text-xs">for loop</Badge>
                    <Badge variant="secondary" className="text-xs">if</Badge>
                    <Badge variant="secondary" className="text-xs">if else</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Text Blocks</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">print</Badge>
                    <Badge variant="secondary" className="text-xs">text</Badge>
                    <Badge variant="secondary" className="text-xs">join text</Badge>
                    <Badge variant="secondary" className="text-xs">text length</Badge>
                    <Badge variant="secondary" className="text-xs">ask</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Math Blocks</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">number</Badge>
                    <Badge variant="secondary" className="text-xs">add</Badge>
                    <Badge variant="secondary" className="text-xs">subtract</Badge>
                    <Badge variant="secondary" className="text-xs">multiply</Badge>
                    <Badge variant="secondary" className="text-xs">divide</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Logic Blocks</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">true</Badge>
                    <Badge variant="secondary" className="text-xs">false</Badge>
                    <Badge variant="secondary" className="text-xs">and</Badge>
                    <Badge variant="secondary" className="text-xs">or</Badge>
                    <Badge variant="secondary" className="text-xs">not</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Variables</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">variable</Badge>
                    <Badge variant="secondary" className="text-xs">set variable</Badge>
                    <Badge variant="secondary" className="text-xs">change variable</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Functions</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">function</Badge>
                    <Badge variant="secondary" className="text-xs">return</Badge>
                    <Badge variant="secondary" className="text-xs">call function</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Tips for Better Recognition</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Use simple phrases like "place [block name]"</li>
                <li>• Wait for the "Listening..." indicator before speaking</li>
                <li>• The microphone will auto-stop after 5 seconds</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceCommands;