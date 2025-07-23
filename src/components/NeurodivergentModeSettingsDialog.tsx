import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNeurodivergentMode } from '@/hooks/useNeurodivergentMode';
import { 
  Palette, 
  Type, 
  Clock, 
  Brain, 
  Volume2, 
  Shield, 
  Eye, 
  Timer,
  BookOpen,
  Settings2,
  Play,
  Pause,
  Coffee,
  RotateCcw,
  Save,
  TestTube,
  Zap
} from 'lucide-react';

interface NeurodivergentModeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NeurodivergentModeSettingsDialog: React.FC<NeurodivergentModeSettingsDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { 
    isActive, 
    settings, 
    updateSettings, 
    sessionTimer, 
    breakTimer, 
    isOnBreak, 
    startSession, 
    pauseSession, 
    formatTime,
    playAudioCue,
    speak 
  } = useNeurodivergentMode();

  if (!isActive) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Neurodivergent Mode Settings
            </DialogTitle>
            <DialogDescription>
              Please select Neurodivergent Mode from the accessibility options to access these settings.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const testAudioCue = (type: 'success' | 'error' | 'notification' | 'break') => {
    playAudioCue(type);
  };

  const testTextToSpeech = () => {
    speak('This is a test of the text-to-speech feature. You can adjust the speaking rate in the processing settings.');
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      theme: 'light' as const,
      fontSize: 'medium' as const,
      fontFamily: 'default' as const,
      lineSpacing: 'normal' as const,
      animationsEnabled: true,
      audioCuesEnabled: false,
      explanationFormat: 'all' as const,
      chunkSize: 'medium' as const,
      showProgressIndicators: true,
      allowLessonRepeat: true,
      timerEnabled: false,
      breakReminders: false,
      sessionDuration: 25,
      breakDuration: 5,
      predictableNavigation: true,
      customReminders: false,
      contentPacing: 'normal' as const,
      textToSpeechEnabled: false,
      syntaxHighlighting: true,
      glossaryEnabled: true,
      practiceMode: false,
      hideLeaderboards: false,
      privateMode: false,
      gentleErrorMessages: true,
      celebrateProgress: true,
    };
    
    Object.entries(defaultSettings).forEach(([key, value]) => {
      updateSettings({ [key]: value });
    });
    
    playAudioCue('notification');
    speak('Settings have been reset to default values.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto z-[60]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Neurodivergent Mode Settings
          </DialogTitle>
          <DialogDescription>
            Customize your learning experience with these accessibility features. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Status Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Neurodivergent Mode Active</span>
                  </div>
                  
                  {settings.timerEnabled && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-background/60 rounded-full">
                      {isOnBreak ? (
                        <Coffee className="h-4 w-4 text-warning" />
                      ) : (
                        <Timer className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm font-mono">
                        {sessionTimer !== null ? formatTime(sessionTimer) : 
                         breakTimer !== null ? formatTime(breakTimer) : '--:--'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={sessionTimer !== null || breakTimer !== null ? pauseSession : startSession}
                        className="h-6 w-6 p-0"
                      >
                        {sessionTimer !== null || breakTimer !== null ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaults}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="interface" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="interface" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Interface</span>
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Learning</span>
              </TabsTrigger>
              <TabsTrigger value="executive" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Executive</span>
              </TabsTrigger>
              <TabsTrigger value="processing" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Processing</span>
              </TabsTrigger>
              <TabsTrigger value="anxiety" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Anxiety</span>
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                <span className="hidden sm:inline">Testing</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interface" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visual Interface</CardTitle>
                  <CardDescription>
                    Customize the visual appearance to reduce sensory overload and improve readability.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="theme">Visual Theme</Label>
                      <Select value={settings.theme} onValueChange={(value: any) => updateSettings({ theme: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light Theme</SelectItem>
                          <SelectItem value="dark">Dark Theme</SelectItem>
                          <SelectItem value="high-contrast">High Contrast</SelectItem>
                          <SelectItem value="color-blind-friendly">Color Blind Friendly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="fontSize">Text Size</Label>
                      <Select value={settings.fontSize} onValueChange={(value: any) => updateSettings({ fontSize: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (14px)</SelectItem>
                          <SelectItem value="medium">Medium (16px)</SelectItem>
                          <SelectItem value="large">Large (18px)</SelectItem>
                          <SelectItem value="extra-large">Extra Large (20px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <Select value={settings.fontFamily} onValueChange={(value: any) => updateSettings({ fontFamily: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select font family" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default System Font</SelectItem>
                          <SelectItem value="dyslexic">OpenDyslexic (Dyslexia-friendly)</SelectItem>
                          <SelectItem value="monospace">Monospace (Code-friendly)</SelectItem>
                          <SelectItem value="sans-serif">Sans Serif (Clean)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="lineSpacing">Line Spacing</Label>
                      <Select value={settings.lineSpacing} onValueChange={(value: any) => updateSettings({ lineSpacing: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select line spacing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact (1.2)</SelectItem>
                          <SelectItem value="normal">Normal (1.5)</SelectItem>
                          <SelectItem value="relaxed">Relaxed (1.6)</SelectItem>
                          <SelectItem value="loose">Loose (1.8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="animations">Enable Animations</Label>
                        <div className="text-sm text-muted-foreground">
                          Disable if motion causes discomfort
                        </div>
                      </div>
                      <Switch
                        id="animations"
                        checked={settings.animationsEnabled}
                        onCheckedChange={(checked) => updateSettings({ animationsEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="audioCues">Audio Cues</Label>
                        <div className="text-sm text-muted-foreground">
                          Sound feedback for actions
                        </div>
                      </div>
                      <Switch
                        id="audioCues"
                        checked={settings.audioCuesEnabled}
                        onCheckedChange={(checked) => updateSettings({ audioCuesEnabled: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Preferences</CardTitle>
                  <CardDescription>
                    Customize how content is presented to match your learning style.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="explanationFormat">Preferred Explanation Format</Label>
                      <Select value={settings.explanationFormat} onValueChange={(value: any) => updateSettings({ explanationFormat: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual">Visual Diagrams Only</SelectItem>
                          <SelectItem value="text">Step-by-step Text</SelectItem>
                          <SelectItem value="video">Video Tutorials</SelectItem>
                          <SelectItem value="interactive">Interactive Examples</SelectItem>
                          <SelectItem value="all">All Formats Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="chunkSize">Content Chunk Size</Label>
                      <Select value={settings.chunkSize} onValueChange={(value: any) => updateSettings({ chunkSize: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chunk size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (1-2 concepts)</SelectItem>
                          <SelectItem value="medium">Medium (3-4 concepts)</SelectItem>
                          <SelectItem value="large">Large (5+ concepts)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="progressIndicators">Show Progress Indicators</Label>
                        <div className="text-sm text-muted-foreground">
                          Visual progress bars and completion status
                        </div>
                      </div>
                      <Switch
                        id="progressIndicators"
                        checked={settings.showProgressIndicators}
                        onCheckedChange={(checked) => updateSettings({ showProgressIndicators: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="lessonRepeat">Allow Lesson Repeat</Label>
                        <div className="text-sm text-muted-foreground">
                          Option to restart lessons without penalty
                        </div>
                      </div>
                      <Switch
                        id="lessonRepeat"
                        checked={settings.allowLessonRepeat}
                        onCheckedChange={(checked) => updateSettings({ allowLessonRepeat: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="executive" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Executive Function Support</CardTitle>
                  <CardDescription>
                    Tools to help with time management, focus, and task organization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="timer">Session Timer</Label>
                          <div className="text-sm text-muted-foreground">
                            Pomodoro-style focus sessions
                          </div>
                        </div>
                        <Switch
                          id="timer"
                          checked={settings.timerEnabled}
                          onCheckedChange={(checked) => updateSettings({ timerEnabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="breakReminders">Break Reminders</Label>
                          <div className="text-sm text-muted-foreground">
                            Notifications to take breaks
                          </div>
                        </div>
                        <Switch
                          id="breakReminders"
                          checked={settings.breakReminders}
                          onCheckedChange={(checked) => updateSettings({ breakReminders: checked })}
                        />
                      </div>
                    </div>

                    {settings.timerEnabled && (
                      <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="sessionDuration">Focus Session Duration</Label>
                            <div className="mt-2">
                              <Slider
                                id="sessionDuration"
                                min={5}
                                max={60}
                                step={5}
                                value={[settings.sessionDuration]}
                                onValueChange={(value) => updateSettings({ sessionDuration: value[0] })}
                                className="w-full"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                <span>5 min</span>
                                <span className="font-medium">{settings.sessionDuration} minutes</span>
                                <span>60 min</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="breakDuration">Break Duration</Label>
                            <div className="mt-2">
                              <Slider
                                id="breakDuration"
                                min={1}
                                max={15}
                                step={1}
                                value={[settings.breakDuration]}
                                onValueChange={(value) => updateSettings({ breakDuration: value[0] })}
                                className="w-full"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                <span>1 min</span>
                                <span className="font-medium">{settings.breakDuration} minutes</span>
                                <span>15 min</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <div className="flex items-center gap-2">
                              {isOnBreak ? (
                                <Coffee className="h-4 w-4 text-warning" />
                              ) : (
                                <Timer className="h-4 w-4 text-primary" />
                              )}
                              <span className="font-medium">
                                {isOnBreak ? 'Break Time' : 'Focus Time'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-mono">
                                {sessionTimer !== null ? formatTime(sessionTimer) : 
                                 breakTimer !== null ? formatTime(breakTimer) : '--:--'}
                              </span>
                              <Button
                                onClick={sessionTimer !== null || breakTimer !== null ? pauseSession : startSession}
                                size="sm"
                                variant={sessionTimer !== null || breakTimer !== null ? "destructive" : "default"}
                              >
                                {sessionTimer !== null || breakTimer !== null ? (
                                  <>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="processing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Aids</CardTitle>
                  <CardDescription>
                    Features to support reading, comprehension, and information processing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="contentPacing">Content Pacing</Label>
                      <Select value={settings.contentPacing} onValueChange={(value: any) => updateSettings({ contentPacing: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pacing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="slow">Slow (0.7x speed)</SelectItem>
                          <SelectItem value="normal">Normal (1x speed)</SelectItem>
                          <SelectItem value="fast">Fast (1.3x speed)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="textToSpeech">Text-to-Speech</Label>
                        <div className="text-sm text-muted-foreground">
                          Read content aloud automatically
                        </div>
                      </div>
                      <Switch
                        id="textToSpeech"
                        checked={settings.textToSpeechEnabled}
                        onCheckedChange={(checked) => updateSettings({ textToSpeechEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="syntaxHighlighting">Code Syntax Highlighting</Label>
                        <div className="text-sm text-muted-foreground">
                          Color-coded programming syntax
                        </div>
                      </div>
                      <Switch
                        id="syntaxHighlighting"
                        checked={settings.syntaxHighlighting}
                        onCheckedChange={(checked) => updateSettings({ syntaxHighlighting: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="glossary">Glossary Tooltips</Label>
                        <div className="text-sm text-muted-foreground">
                          Hover definitions for technical terms
                        </div>
                      </div>
                      <Switch
                        id="glossary"
                        checked={settings.glossaryEnabled}
                        onCheckedChange={(checked) => updateSettings({ glossaryEnabled: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anxiety" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Anxiety Reduction</CardTitle>
                  <CardDescription>
                    Features designed to create a supportive, low-pressure learning environment.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="practiceMode">Practice Mode</Label>
                        <div className="text-sm text-muted-foreground">
                          No grades or permanent records
                        </div>
                      </div>
                      <Switch
                        id="practiceMode"
                        checked={settings.practiceMode}
                        onCheckedChange={(checked) => updateSettings({ practiceMode: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hideLeaderboards">Hide Leaderboards</Label>
                        <div className="text-sm text-muted-foreground">
                          Remove competitive elements
                        </div>
                      </div>
                      <Switch
                        id="hideLeaderboards"
                        checked={settings.hideLeaderboards}
                        onCheckedChange={(checked) => updateSettings({ hideLeaderboards: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="privateMode">Private Mode</Label>
                        <div className="text-sm text-muted-foreground">
                          Keep progress and activity private
                        </div>
                      </div>
                      <Switch
                        id="privateMode"
                        checked={settings.privateMode}
                        onCheckedChange={(checked) => updateSettings({ privateMode: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="gentleErrors">Gentle Error Messages</Label>
                        <div className="text-sm text-muted-foreground">
                          Supportive, encouraging feedback
                        </div>
                      </div>
                      <Switch
                        id="gentleErrors"
                        checked={settings.gentleErrorMessages}
                        onCheckedChange={(checked) => updateSettings({ gentleErrorMessages: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="celebrateProgress">Celebrate Progress</Label>
                        <div className="text-sm text-muted-foreground">
                          Positive reinforcement for achievements
                        </div>
                      </div>
                      <Switch
                        id="celebrateProgress"
                        checked={settings.celebrateProgress}
                        onCheckedChange={(checked) => updateSettings({ celebrateProgress: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="testing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Features</CardTitle>
                  <CardDescription>
                    Test your configured accessibility features to ensure they work as expected.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label>Audio Cues Test</Label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testAudioCue('success')}
                          disabled={!settings.audioCuesEnabled}
                        >
                          Success
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testAudioCue('error')}
                          disabled={!settings.audioCuesEnabled}
                        >
                          Error
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testAudioCue('notification')}
                          disabled={!settings.audioCuesEnabled}
                        >
                          Notification
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testAudioCue('break')}
                          disabled={!settings.audioCuesEnabled}
                        >
                          Break
                        </Button>
                      </div>
                      {!settings.audioCuesEnabled && (
                        <p className="text-sm text-muted-foreground">
                          Enable audio cues in Interface settings to test
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label>Text-to-Speech Test</Label>
                      <Button
                        variant="outline"
                        onClick={testTextToSpeech}
                        disabled={!settings.textToSpeechEnabled}
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        Test TTS
                      </Button>
                      {!settings.textToSpeechEnabled && (
                        <p className="text-sm text-muted-foreground">
                          Enable text-to-speech in Processing settings to test
                        </p>
                      )}
                    </div>

                    <div className="col-span-1 md:col-span-2 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Current Active Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          settings.timerEnabled && 'Session Timer',
                          settings.textToSpeechEnabled && 'Text-to-Speech',
                          settings.audioCuesEnabled && 'Audio Cues',
                          settings.practiceMode && 'Practice Mode',
                          settings.gentleErrorMessages && 'Gentle Errors',
                          settings.celebrateProgress && 'Progress Celebration',
                          settings.syntaxHighlighting && 'Syntax Highlighting',
                          settings.glossaryEnabled && 'Glossary Tooltips',
                          settings.hideLeaderboards && 'Hidden Leaderboards',
                          settings.privateMode && 'Private Mode',
                        ].filter(Boolean).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NeurodivergentModeSettingsDialog;