// Voice Commands Component - Simplified to use only Hugging Face
import React, { useState } from 'react';
import {
  selectBlockByPosition,
  selectAdjacentBlock,
  selectBlockByType,
  deselectBlock,
  selectAllBlocks,
  moveSelectedBlock,
  deleteSelectedBlock,
  duplicateSelectedBlock,
  connectSelectedBlocks,
  disconnectSelectedBlock,
  announceToScreenReader,
  setSelectedBlockValue,
  selectBlockForConnection
} from './voiceControl.jsx';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHuggingFaceVoiceRecognition } from '@/hooks/useHuggingFaceVoiceRecognition';
import { Mic, MicOff, Volume2, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VoiceCommandsProps {
  onPlaceBlock: (blockType: string) => void;
  enabled: boolean;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onPlaceBlock, enabled }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleVoiceCommand = (command: string, text: string) => {
    console.log(`Voice command received: ${text} -> ${command}`);
    // Special case: set block value
    if (command === 'SET_BLOCK_VALUE') {
      setSelectedBlockValue(text);
      return;
    }
    // Handle advanced voice control commands
    if (command.startsWith('SELECT_') || command.startsWith('MOVE_') || command.startsWith('NUDGE_') || 
        command.startsWith('DELETE_') || command.startsWith('DUPLICATE_') || command.startsWith('CONNECT_') || 
        command.startsWith('DISCONNECT_') || command === 'DESELECT' || command === 'ADD_TO_CONNECTION_GROUP' ||
        command.startsWith('ZOOM_') || command.startsWith('CENTER_') || command.startsWith('CLEAR_') ||
        command === 'UNDO' || command === 'REDO' || command === 'RUN_CODE') {
      // Execute the command using the voice control system
      executeVoiceControlCommand(command, text);
    } else {
      // Regular block creation
      onPlaceBlock(command);
    }
  };

  const executeVoiceControlCommand = (command: string, originalText: string) => {
    // Route all block actions through voiceControl.jsx
    switch (command) {
      case 'SELECT_FIRST':
        selectBlockByPosition('first');
        break;
      case 'SELECT_LAST':
        selectBlockByPosition('last');
        break;
      case 'SELECT_NEXT':
        selectAdjacentBlock('next');
        break;
      case 'SELECT_PREVIOUS':
        selectAdjacentBlock('previous');
        break;
      case 'SELECT_CYCLE':
        selectBlockByType();
        break;
      case 'DESELECT':
        deselectBlock();
        break;
      case 'SELECT_ALL':
        selectAllBlocks();
        break;
      case 'MOVE_UP':
        moveSelectedBlock(0, -50);
        break;
      case 'MOVE_DOWN':
        moveSelectedBlock(0, 50);
        break;
      case 'MOVE_LEFT':
        moveSelectedBlock(-50, 0);
        break;
      case 'MOVE_RIGHT':
        moveSelectedBlock(50, 0);
        break;
      case 'NUDGE_UP':
        moveSelectedBlock(0, -10);
        break;
      case 'NUDGE_DOWN':
        moveSelectedBlock(0, 10);
        break;
      case 'NUDGE_LEFT':
        moveSelectedBlock(-10, 0);
        break;
      case 'NUDGE_RIGHT':
        moveSelectedBlock(10, 0);
        break;
      case 'DELETE_SELECTED':
        deleteSelectedBlock();
        break;
      case 'DUPLICATE_SELECTED':
        duplicateSelectedBlock();
        break;
      case 'CONNECT_BLOCKS':
        connectSelectedBlocks();
        break;
      case 'DISCONNECT_BLOCK':
        disconnectSelectedBlock();
        break;
      case 'ADD_TO_CONNECTION_GROUP':
        selectBlockForConnection();
        break;
      case 'ZOOM_IN':
        // These workspace actions are UI only, not block actions
        (window as any).blocklyWorkspace?.zoomCenter?.(1);
        break;
      case 'ZOOM_OUT':
        (window as any).blocklyWorkspace?.zoomCenter?.(-1);
        break;
      case 'CENTER_WORKSPACE':
        (window as any).blocklyWorkspace?.scrollCenter?.();
        break;
      case 'CLEAR_WORKSPACE':
        (window as any).blocklyWorkspace?.clear?.();
        break;
      case 'UNDO':
        (window as any).blocklyWorkspace?.undo?.();
        break;
      case 'REDO':
        (window as any).blocklyWorkspace?.redo?.();
        break;
      case 'RUN_CODE':
        (document.querySelector('.run-btn') as HTMLButtonElement)?.click();
        break;
      case 'CLEAR_CODE':
        (document.querySelector('.clear-btn') as HTMLButtonElement)?.click();
        break;
      default:
        break;
    }
    announceToScreenReader(`Executed: ${originalText}`);
  };



  // Hugging Face Voice Recognition
  const voiceRecognition = useHuggingFaceVoiceRecognition({
    onCommand: handleVoiceCommand,
    enabled
  });

  if (!enabled) return null;

  const getButtonState = () => {
    if (voiceRecognition.isModelLoading) {
      return { text: 'Loading Model...', icon: <Volume2 className="h-4 w-4 animate-pulse" /> };
    }
    if (voiceRecognition.isProcessing) {
      return { text: 'Processing...', icon: <Volume2 className="h-4 w-4 animate-pulse" /> };
    }
    if (voiceRecognition.isListening) {
      return { text: 'Listening...', icon: <Mic className="h-4 w-4 text-red-500 animate-pulse" /> };
    }
    return { text: 'Voice Commands', icon: <MicOff className="h-4 w-4" /> };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={voiceRecognition.isListening ? "destructive" : "outline"}
        size="sm"
        onClick={voiceRecognition.isListening ? voiceRecognition.stopListening : voiceRecognition.startListening}
        disabled={voiceRecognition.isProcessing || voiceRecognition.isModelLoading}
        className="voice-btn min-w-[140px]"
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
          <div className="space-y-6" aria-describedby="voice-commands-description">
            <div id="voice-commands-description">
              <h3 className="text-lg font-semibold mb-3">How to Use Voice Commands</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click "Voice Commands" and speak clearly. You can say phrases like:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>"Place print block"</li>
                <li>"Add if statement"</li>
                <li>"Create repeat loop"</li>
                <li>"Insert text block"</li>
                <li>"Select first block"</li>
                <li>"Move right, duplicate selected block"</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Available Commands</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Block Selection</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">select first block</Badge>
                    <Badge variant="secondary" className="text-xs">select last block</Badge>
                    <Badge variant="secondary" className="text-xs">select next block</Badge>
                    <Badge variant="secondary" className="text-xs">select previous block</Badge>
                    <Badge variant="secondary" className="text-xs">select block</Badge>
                    <Badge variant="secondary" className="text-xs">deselect block</Badge>
                    <Badge variant="secondary" className="text-xs">select all blocks</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Block Movement</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">move up/down/left/right</Badge>
                    <Badge variant="secondary" className="text-xs">nudge up/down/left/right</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Block Actions</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">delete selected block</Badge>
                    <Badge variant="secondary" className="text-xs">duplicate selected block</Badge>
                    <Badge variant="secondary" className="text-xs">connect blocks</Badge>
                    <Badge variant="secondary" className="text-xs">disconnect block</Badge>
                    <Badge variant="secondary" className="text-xs">add to connection group</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Control Blocks</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">add repeat block</Badge>
                    <Badge variant="secondary" className="text-xs">add if block</Badge>
                    <Badge variant="secondary" className="text-xs">add for loop</Badge>
                    <Badge variant="secondary" className="text-xs">add while loop</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Text & Print</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">add text block</Badge>
                    <Badge variant="secondary" className="text-xs">add print block</Badge>
                    <Badge variant="secondary" className="text-xs">add heading block</Badge>
                    <Badge variant="secondary" className="text-xs">add paragraph block</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Math & Variables</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">add number block</Badge>
                    <Badge variant="secondary" className="text-xs">add variable block</Badge>
                    <Badge variant="secondary" className="text-xs">add function block</Badge>
                    <Badge variant="secondary" className="text-xs">add list block</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Workspace</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">zoom in/out</Badge>
                    <Badge variant="secondary" className="text-xs">center workspace</Badge>
                    <Badge variant="secondary" className="text-xs">clear workspace</Badge>
                    <Badge variant="secondary" className="text-xs">undo/redo</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Languages</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">switch to python</Badge>
                    <Badge variant="secondary" className="text-xs">switch to javascript</Badge>
                    <Badge variant="secondary" className="text-xs">switch to html</Badge>
                    <Badge variant="secondary" className="text-xs">run code</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-sm mb-2 text-amber-800 dark:text-amber-200">Advanced Block Manipulation</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                Chain commands for complex operations:
              </p>
              <div className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                <div>• "select first block, add to connection group, select next block, add to connection group, connect blocks"</div>
                <div>• "select all blocks, move up, connect blocks"</div>
                <div>• Movement: "move" (50px) vs "nudge" (10px) for precision</div>
                <div>• Selected blocks pulse with red glow and provide audio feedback</div>
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