import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BlocklyWorkspace from "../components/blockly/BlocklyWorkspace.jsx";
import { ChallengeService } from "../services/challengeService";
import { useNeurodivergentMode } from "@/hooks/useNeurodivergentMode";
import NeurodivergentModeIndicator from "@/components/NeurodivergentModeIndicator";
import NeurodivergentModeSettingsDialog from "@/components/NeurodivergentModeSettingsDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Zap, Heart, RotateCcw, Pause } from "lucide-react";

const ChallengeWithBlockly: React.FC = () => {
  const { challengeId = "html-basics" } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const {
    isActive,
    settings,
    playAudioCue,
    speak,
    sessionTimer,
    isOnBreak
  } = useNeurodivergentMode();

  useEffect(() => {
    const challengeData = ChallengeService.getChallengeById(challengeId);
    setChallenge(challengeData);
    if (isActive && challengeData) {
      const description = `Challenge loaded: ${challengeData.title}. ${challengeData.description}`;
      if (settings.textToSpeechEnabled) speak(description);
      if (settings.audioCuesEnabled) playAudioCue("notification");
    }
  }, [challengeId, isActive, settings.textToSpeechEnabled, settings.audioCuesEnabled]);

  const handleProgressUpdate = (newProgress: number) => {
    setProgress(newProgress);
    if (isActive && settings.celebrateProgress) {
      if (newProgress === 100) {
        playAudioCue("success");
        if (settings.textToSpeechEnabled) speak("Congratulations! Challenge completed successfully!");
      } else if (newProgress > progress && newProgress % 25 === 0) {
        playAudioCue("notification");
        if (settings.textToSpeechEnabled) speak(`Great progress! You're ${newProgress}% complete.`);
      }
    }
  };

  const handleError = (error: string) => {
    setAttempts(prev => prev + 1);
    if (isActive) {
      playAudioCue("error");
      if (settings.gentleErrorMessages) {
        const gentleMessage = `Don't worry, that's part of learning! ${error}. You can try again.`;
        if (settings.textToSpeechEnabled) speak(gentleMessage);
      }
    }
  };

  const handleRetry = () => {
    setProgress(0);
    setAttempts(0);
    if (isActive) {
      playAudioCue("notification");
      if (settings.textToSpeechEnabled) speak("Starting fresh! Take your time.");
    }
  };

  if (!challenge) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${isActive ? "neurodivergent-mode" : ""} ${showSettings ? "overflow-hidden" : ""}`}>
      {/* Break Mode Overlay */}
      {isActive && isOnBreak && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="w-96 text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Pause className="h-5 w-5" />
                Break Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Take a moment to rest and recharge. Your progress is saved!
              </p>
              <div className="text-2xl font-mono text-primary">
                {/* Timer will be shown here */}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Background Blur Overlay for Settings */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-xl z-[9999]" style={{ backdropFilter: "blur(25px) saturate(200%)" }} />
      )}
      {/* Challenge Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-extrabold mb-1">{challenge.title}</h1>
              <p className="text-lg text-muted-foreground">{challenge.description}</p>
              {challenge.maxBlocks && (
                <span className="text-sm text-blue-700 font-semibold block mt-1">
                  Max Blocks Allowed: {challenge.maxBlocks}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {challenge.difficulty}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {challenge.estimatedTime}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {challenge.xpReward} XP
              </Badge>
              {isActive && settings.allowLessonRepeat && attempts > 0 && (
                <Badge variant="outline">
                  Attempt {attempts + 1}
                </Badge>
              )}
            </div>
            {isActive && settings.allowLessonRepeat && (
              <Button
                variant="outline"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
          {isActive && settings.showProgressIndicators && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <BlocklyWorkspace
            challengeId={challengeId}
            onProgressUpdate={handleProgressUpdate}
            onError={handleError}
            neurodivergentMode={isActive ? settings : null}
          />
        </div>
      </div>
      {/* Neurodivergent Mode Indicator */}
      {isActive && (
        <NeurodivergentModeIndicator onOpenSettings={() => setShowSettings(true)} />
      )}
      {/* Neurodivergent Mode Settings Dialog */}
      <NeurodivergentModeSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
};

export default ChallengeWithBlockly;
