import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Eye, 
  EyeOff,
  Keyboard,
  Mouse,
  Zap,
  ZapOff
} from 'lucide-react';

interface AccessibilityControlsProps {
  onVoiceToggle: () => void;
  isVoiceActive: boolean;
  onAudioToggle?: (enabled: boolean) => void;
  isAudioEnabled?: boolean;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  onVoiceToggle,
  isVoiceActive,
  onAudioToggle,
  isAudioEnabled = true
}) => {
  const { currentMode, features } = useAccessibility();
  const [audioEnabled, setAudioEnabled] = useState(isAudioEnabled);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [tactileFeedback, setTactileFeedback] = useState(false);

  // Update local state when prop changes
  React.useEffect(() => {
    setAudioEnabled(isAudioEnabled);
  }, [isAudioEnabled]);

  if (!currentMode) return null;

  return (
    <div className="accessibility-controls">
      <div className="accessibility-mode-indicator">
        <span className="mode-badge">{currentMode.title} Mode</span>
      </div>
      
      <div className="accessibility-buttons">
        {/* Voice Commands for Motor Impairment */}
        {features.voiceCommands && (
          <Button
            variant="outline"
            size="sm"
            onClick={onVoiceToggle}
            className={`voice-control ${isVoiceActive ? 'active' : ''}`}
            aria-label={`${isVoiceActive ? 'Disable' : 'Enable'} voice commands`}
          >
            {isVoiceActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            Voice
          </Button>
        )}

        {/* Audio Descriptions for Visual Impairment */}
        {features.audioDescriptions && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newState = !audioEnabled;
              setAudioEnabled(newState);
              onAudioToggle?.(newState);
            }}
            className={`audio-control ${audioEnabled ? 'active' : ''}`}
            aria-label={`${audioEnabled ? 'Disable' : 'Enable'} audio descriptions`}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Audio
          </Button>
        )}

        {/* Screen Reader Mode for Visual Impairment */}
        {features.screenReader && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScreenReaderMode(!screenReaderMode)}
            className={`screen-reader-control ${screenReaderMode ? 'active' : ''}`}
            aria-label={`${screenReaderMode ? 'Disable' : 'Enable'} screen reader mode`}
          >
            {screenReaderMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Reader
          </Button>
        )}

        {/* Keyboard Navigation */}
        {features.keyboardNavigation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setKeyboardMode(!keyboardMode)}
            className={`keyboard-control ${keyboardMode ? 'active' : ''}`}
            aria-label={`${keyboardMode ? 'Disable' : 'Enable'} keyboard navigation`}
          >
            {keyboardMode ? <Keyboard className="h-4 w-4" /> : <Mouse className="h-4 w-4" />}
            Keyboard
          </Button>
        )}

        {/* Tactile Feedback for Hearing Impairment */}
        {features.tactileFeedback && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTactileFeedback(!tactileFeedback)}
            className={`tactile-control ${tactileFeedback ? 'active' : ''}`}
            aria-label={`${tactileFeedback ? 'Disable' : 'Enable'} tactile feedback`}
          >
            {tactileFeedback ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
            Haptic
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccessibilityControls;