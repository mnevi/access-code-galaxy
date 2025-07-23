
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings2
} from 'lucide-react';

const NeurodivergentModeSettings: React.FC = () => {
  const { isActive, settings, updateSettings, sessionTimer, breakTimer, isOnBreak, startSession, pauseSession, formatTime } = useNeurodivergentMode();

  if (!isActive) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Neurodivergent Mode
          </CardTitle>
          <CardDescription>
            Please select Neurodivergent Mode from the main page to access these settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Neurodivergent Mode Settings
        </CardTitle>
        <CardDescription>
          Customize your learning experience with these accessibility features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="interface" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="interface" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="executive" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Executive
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Processing
            </TabsTrigger>
            <TabsTrigger value="anxiety" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Anxiety
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interface" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="theme">Visual Theme</Label>
                <Select value={settings.theme} onValueChange={(value: any) => updateSettings({ theme: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="high-contrast">High Contrast</SelectItem>
                    <SelectItem value="color-blind-friendly">Color Blind Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select value={settings.fontSize} onValueChange={(value: any) => updateSettings({ fontSize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
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
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="dyslexic">OpenDyslexic</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
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
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="loose">Loose</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="animations"
                  checked={settings.animationsEnabled}
                  onCheckedChange={(checked) => updateSettings({ animationsEnabled: checked })}
                />
                <Label htmlFor="animations">Enable Animations</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="audioCues"
                  checked={settings.audioCuesEnabled}
                  onCheckedChange={(checked) => updateSettings({ audioCuesEnabled: checked })}
                />
                <Label htmlFor="audioCues">Audio Cues</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="explanationFormat">Explanation Format</Label>
                <Select value={settings.explanationFormat} onValueChange={(value: any) => updateSettings({ explanationFormat: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual Diagrams</SelectItem>
                    <SelectItem value="text">Step-by-step Text</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="all">All Formats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label htmlFor="chunkSize">Lesson Chunk Size</Label>
                <Select value={settings.chunkSize} onValueChange={(value: any) => updateSettings({ chunkSize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chunk size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="progressIndicators"
                  checked={settings.showProgressIndicators}
                  onCheckedChange={(checked) => updateSettings({ showProgressIndicators: checked })}
                />
                <Label htmlFor="progressIndicators">Show Progress Indicators</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="lessonRepeat"
                  checked={settings.allowLessonRepeat}
                  onCheckedChange={(checked) => updateSettings({ allowLessonRepeat: checked })}
                />
                <Label htmlFor="lessonRepeat">Allow Lesson Repeat</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="executive" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="timer"
                  checked={settings.timerEnabled}
                  onCheckedChange={(checked) => updateSettings({ timerEnabled: checked })}
                />
                <Label htmlFor="timer">Enable Session Timer</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="breakReminders"
                  checked={settings.breakReminders}
                  onCheckedChange={(checked) => updateSettings({ breakReminders: checked })}
                />
                <Label htmlFor="breakReminders">Break Reminders</Label>
              </div>

              {settings.timerEnabled && (
                <>
                  <div className="space-y-4">
                    <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
                    <Slider
                      id="sessionDuration"
                      min={5}
                      max={60}
                      step={5}
                      value={[settings.sessionDuration]}
                      onValueChange={(value) => updateSettings({ sessionDuration: value[0] })}
                    />
                    <div className="text-sm text-muted-foreground">{settings.sessionDuration} minutes</div>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                    <Slider
                      id="breakDuration"
                      min={1}
                      max={15}
                      step={1}
                      value={[settings.breakDuration]}
                      onValueChange={(value) => updateSettings({ breakDuration: value[0] })}
                    />
                    <div className="text-sm text-muted-foreground">{settings.breakDuration} minutes</div>
                  </div>

                  <div className="col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        <span className="font-medium">
                          {isOnBreak ? 'Break Time' : 'Focus Time'}
                        </span>
                      </div>
                      <div className="text-2xl font-mono">
                        {sessionTimer !== null ? formatTime(sessionTimer) : 
                         breakTimer !== null ? formatTime(breakTimer) : '--:--'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={startSession} size="sm">
                        Start Session
                      </Button>
                      <Button onClick={pauseSession} variant="outline" size="sm">
                        Pause
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="contentPacing">Content Pacing</Label>
                <Select value={settings.contentPacing} onValueChange={(value: any) => updateSettings({ contentPacing: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pacing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="textToSpeech"
                  checked={settings.textToSpeechEnabled}
                  onCheckedChange={(checked) => updateSettings({ textToSpeechEnabled: checked })}
                />
                <Label htmlFor="textToSpeech">Text-to-Speech</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="syntaxHighlighting"
                  checked={settings.syntaxHighlighting}
                  onCheckedChange={(checked) => updateSettings({ syntaxHighlighting: checked })}
                />
                <Label htmlFor="syntaxHighlighting">Syntax Highlighting</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="glossary"
                  checked={settings.glossaryEnabled}
                  onCheckedChange={(checked) => updateSettings({ glossaryEnabled: checked })}
                />
                <Label htmlFor="glossary">Glossary Tooltips</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="anxiety" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="practiceMode"
                  checked={settings.practiceMode}
                  onCheckedChange={(checked) => updateSettings({ practiceMode: checked })}
                />
                <Label htmlFor="practiceMode">Practice Mode (No Grades)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hideLeaderboards"
                  checked={settings.hideLeaderboards}
                  onCheckedChange={(checked) => updateSettings({ hideLeaderboards: checked })}
                />
                <Label htmlFor="hideLeaderboards">Hide Leaderboards</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="privateMode"
                  checked={settings.privateMode}
                  onCheckedChange={(checked) => updateSettings({ privateMode: checked })}
                />
                <Label htmlFor="privateMode">Private Mode</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="gentleErrors"
                  checked={settings.gentleErrorMessages}
                  onCheckedChange={(checked) => updateSettings({ gentleErrorMessages: checked })}
                />
                <Label htmlFor="gentleErrors">Gentle Error Messages</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="celebrateProgress"
                  checked={settings.celebrateProgress}
                  onCheckedChange={(checked) => updateSettings({ celebrateProgress: checked })}
                />
                <Label htmlFor="celebrateProgress">Celebrate Progress</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NeurodivergentModeSettings;
