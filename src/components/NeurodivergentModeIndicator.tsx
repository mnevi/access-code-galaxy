// neurodivergent mode panel

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNeurodivergentMode } from '@/hooks/useNeurodivergentMode';
import { 
  Brain, 
  Timer, 
  Volume2, 
  Eye, 
  Heart, 
  Settings2,
  Coffee,
  Play,
  Pause
} from 'lucide-react';

interface NeurodivergentModeIndicatorProps {
  onOpenSettings?: () => void;
}

const NeurodivergentModeIndicator: React.FC<NeurodivergentModeIndicatorProps> = ({ onOpenSettings }) => {
  const { 
    isActive, 
    settings, 
    sessionTimer, 
    breakTimer, 
    isOnBreak, 
    startSession, 
    pauseSession, 
    formatTime,
    playAudioCue 
  } = useNeurodivergentMode();

  if (!isActive) return null;

  const activeFeatures = [
    settings.timerEnabled && 'Timer',
    settings.textToSpeechEnabled && 'TTS',
    settings.audioCuesEnabled && 'Audio',
    settings.practiceMode && 'Practice',
    settings.gentleErrorMessages && 'Gentle',
    settings.celebrateProgress && 'Celebrate',
  ].filter(Boolean);

  const handleTimerAction = () => {
    if (sessionTimer !== null || breakTimer !== null) {
      pauseSession();
      playAudioCue('notification');
    } else {
      startSession();
      playAudioCue('success');
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 z-[9999] w-80 shadow-lg border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Neurodivergent Mode</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-6 w-6 p-0"
          >
            <Settings2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Timer Section */}
        {settings.timerEnabled && (
          <div className="mb-3 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnBreak ? (
                  <Coffee className="h-4 w-4 text-warning" />
                ) : (
                  <Timer className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-medium">
                  {isOnBreak ? 'Break Time' : 'Focus Time'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono">
                  {sessionTimer !== null ? formatTime(sessionTimer) : 
                   breakTimer !== null ? formatTime(breakTimer) : '--:--'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTimerAction}
                  className="h-6 w-6 p-0"
                >
                  {sessionTimer !== null || breakTimer !== null ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Features */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">Active Features:</div>
          <div className="flex flex-wrap gap-1">
            {activeFeatures.map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          {settings.textToSpeechEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => playAudioCue('notification')}
              className="flex items-center gap-1"
            >
              <Volume2 className="h-3 w-3" />
              Test TTS
            </Button>
          )}
          
          {settings.celebrateProgress && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => playAudioCue('success')}
              className="flex items-center gap-1"
            >
              <Heart className="h-3 w-3" />
              Celebrate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NeurodivergentModeIndicator;
