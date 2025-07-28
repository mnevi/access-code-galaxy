import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './AccessibilityControls.css';
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

  // portal ensures that accessibility controls persist at the top of the page
  return createPortal(
    <div className="accessibility-controls">
      <div className="accessibility-mode-indicator">
        <span className="mode-badge">{currentMode.title} Mode</span>
      </div>
      <div className="accessibility-buttons">
        {/* Voice Commands for Motor Impairment */}
        {features.voiceCommands && (
          <Button
            variant="accessibility"
            size="sm"
            onClick={onVoiceToggle}
            data-active={isVoiceActive}
            className={`voice-control gap-2 ${isVoiceActive ? 'bg-primary text-primary-foreground border-primary' : ''}`}
            aria-label={`${isVoiceActive ? 'Disable' : 'Enable'} voice commands`}
          >
            {isVoiceActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            Voice
          </Button>
        )}

        {/* Audio Descriptions for Visual Impairment */}
        {features.audioDescriptions && (
          <Button
            variant="accessibility"
            size="sm"
            onClick={() => {
              const newState = !audioEnabled;
              setAudioEnabled(newState);
              onAudioToggle?.(newState);
            }}
            data-active={audioEnabled}
            className={`audio-control gap-2 ${audioEnabled ? 'bg-primary text-primary-foreground border-primary' : ''}`}
            aria-label={`${audioEnabled ? 'Disable' : 'Enable'} audio descriptions`}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Audio
          </Button>
        )}

        {/* Screen Reader Mode for Visual Impairment */}
        {features.screenReader && (
          <Button
            variant="accessibility"
            size="sm"
            onClick={() => setScreenReaderMode(!screenReaderMode)}
            data-active={screenReaderMode}
            className={`screen-reader-control gap-2 ${screenReaderMode ? 'bg-primary text-primary-foreground border-primary' : ''}`}
            aria-label={`${screenReaderMode ? 'Disable' : 'Enable'} screen reader mode`}
          >
            {screenReaderMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Reader
          </Button>
        )}

        {/* Keyboard Navigation */}
        {features.keyboardNavigation && (
          <Button
            variant="accessibility"
            size="sm"
            onClick={() => setKeyboardMode(!keyboardMode)}
            data-active={keyboardMode}
            className={`keyboard-control gap-2 ${keyboardMode ? 'bg-primary text-primary-foreground border-primary' : ''}`}
            aria-label={`${keyboardMode ? 'Disable' : 'Enable'} keyboard navigation`}
          >
            {keyboardMode ? <Keyboard className="h-4 w-4" /> : <Mouse className="h-4 w-4" />}
            Keyboard
          </Button>
        )}

        {/* Tactile Feedback for Hearing Impairment */}
        {features.tactileFeedback && (
          <Button
            variant="accessibility"
            size="sm"
            onClick={() => setTactileFeedback(!tactileFeedback)}
            data-active={tactileFeedback}
            className={`tactile-control gap-2 ${tactileFeedback ? 'bg-primary text-primary-foreground border-primary' : ''}`}
            aria-label={`${tactileFeedback ? 'Disable' : 'Enable'} tactile feedback`}
          >
            {tactileFeedback ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
            Haptic
          </Button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AccessibilityControls;