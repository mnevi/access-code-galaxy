import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Eye, 
  Type, 
  Volume2, 
  Focus, 
  Palette,
  TestTube,
  RotateCcw,
  Navigation,
  MousePointer,
  Accessibility
} from "lucide-react";
import { useVisualImpairmentMode } from "@/hooks/useVisualImpairmentMode";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface VisualImpairmentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisualImpairmentSettingsDialog({
  open,
  onOpenChange,
}: VisualImpairmentSettingsDialogProps) {
  const { currentMode } = useAccessibility();
  const {
    isActive,
    settings,
    updateSettings,
    speak,
    playAudioFeedback,
    announceToScreenReader,
  } = useVisualImpairmentMode();

  // Test functions
  const testTextToSpeech = () => {
    speak("This is a test of the text-to-speech feature. You can adjust the speech rate and volume in the audio settings.");
  };

  const testAudioFeedback = (type: 'click' | 'focus' | 'error' | 'success') => {
    playAudioFeedback(type);
  };

  const testScreenReaderAnnouncement = () => {
    announceToScreenReader("This is a test announcement for screen readers.");
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      contrastMode: 'normal' as const,
      colorScheme: 'auto' as const,
      reduceColors: false,
      monochrome: false,
      fontSize: 'medium' as const,
      fontWeight: 'normal' as const,
      lineSpacing: 'normal' as const,
      letterSpacing: 'normal' as const,
      fontFamily: 'default' as const,
      screenReaderMode: false,
      audioDescriptions: true,
      speechRate: 'normal' as const,
      speechVolume: 80,
      audioFeedback: true,
      enhancedFocus: true,
      focusSize: 'normal' as const,
      keyboardNavigation: true,
      skipLinks: true,
      landmarkNavigation: true,
      cursorSize: 'normal' as const,
      highlightLinks: true,
      underlineLinks: true,
      buttonHighlighting: true,
      removeBackgrounds: false,
      reduceMotion: true,
      pauseAnimations: false,
      disableParallax: true,
      increasedSpacing: true,
      simplifiedLayout: false,
      hideDecorative: false,
      prominentHeadings: true,
    };
    
    updateSettings(defaultSettings);
    playAudioFeedback('success');
    announceToScreenReader('Settings have been reset to defaults');
  };

  if (!isActive) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Visual Impairment Settings
            </DialogTitle>
            <DialogDescription>
              Please activate Visual Impairment mode to access these settings. 
              You can do this from the accessibility mode selector.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Impairment Settings
          </DialogTitle>
          <DialogDescription>
            Customize visual, audio, and navigation features to enhance your coding experience.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contrast" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="contrast" className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Contrast
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="navigation" className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              Navigation
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center gap-1">
              <MousePointer className="h-3 w-3" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contrast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color & Contrast Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contrast-mode">Contrast Mode</Label>
                    <Select value={settings.contrastMode} onValueChange={(value: any) => updateSettings({ contrastMode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High Contrast</SelectItem>
                        <SelectItem value="extra-high">Extra High Contrast</SelectItem>
                        <SelectItem value="inverted">Inverted Colors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <Select value={settings.colorScheme} onValueChange={(value: any) => updateSettings({ colorScheme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-colors">Reduce Color Complexity</Label>
                    <Switch
                      id="reduce-colors"
                      checked={settings.reduceColors}
                      onCheckedChange={(checked) => updateSettings({ reduceColors: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="monochrome">Monochrome Mode</Label>
                    <Switch
                      id="monochrome"
                      checked={settings.monochrome}
                      onCheckedChange={(checked) => updateSettings({ monochrome: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="remove-backgrounds">Remove Background Images</Label>
                    <Switch
                      id="remove-backgrounds"
                      checked={settings.removeBackgrounds}
                      onCheckedChange={(checked) => updateSettings({ removeBackgrounds: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text & Typography Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select value={settings.fontSize} onValueChange={(value: any) => updateSettings({ fontSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medium">Medium (16px)</SelectItem>
                        <SelectItem value="large">Large (18px)</SelectItem>
                        <SelectItem value="extra-large">Extra Large (20px)</SelectItem>
                        <SelectItem value="huge">Huge (22px)</SelectItem>
                        <SelectItem value="massive">Massive (24px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-weight">Font Weight</Label>
                    <Select value={settings.fontWeight} onValueChange={(value: any) => updateSettings({ fontWeight: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="extra-bold">Extra Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="line-spacing">Line Spacing</Label>
                    <Select value={settings.lineSpacing} onValueChange={(value: any) => updateSettings({ lineSpacing: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal (1.5)</SelectItem>
                        <SelectItem value="relaxed">Relaxed (1.6)</SelectItem>
                        <SelectItem value="loose">Loose (1.8)</SelectItem>
                        <SelectItem value="extra-loose">Extra Loose (2.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="letter-spacing">Letter Spacing</Label>
                    <Select value={settings.letterSpacing} onValueChange={(value: any) => updateSettings({ letterSpacing: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="wide">Wide</SelectItem>
                        <SelectItem value="wider">Wider</SelectItem>
                        <SelectItem value="widest">Widest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select value={settings.fontFamily} onValueChange={(value: any) => updateSettings({ fontFamily: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="sans-serif">Sans Serif</SelectItem>
                        <SelectItem value="high-readability">High Readability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="highlight-links">Highlight Links</Label>
                    <Switch
                      id="highlight-links"
                      checked={settings.highlightLinks}
                      onCheckedChange={(checked) => updateSettings({ highlightLinks: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="underline-links">Underline Links</Label>
                    <Switch
                      id="underline-links"
                      checked={settings.underlineLinks}
                      onCheckedChange={(checked) => updateSettings({ underlineLinks: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="prominent-headings">Prominent Headings</Label>
                    <Switch
                      id="prominent-headings"
                      checked={settings.prominentHeadings}
                      onCheckedChange={(checked) => updateSettings({ prominentHeadings: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Audio & Speech Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen-reader-mode">Screen Reader Mode</Label>
                    <Switch
                      id="screen-reader-mode"
                      checked={settings.screenReaderMode}
                      onCheckedChange={(checked) => updateSettings({ screenReaderMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                    <Switch
                      id="audio-descriptions"
                      checked={settings.audioDescriptions}
                      onCheckedChange={(checked) => updateSettings({ audioDescriptions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-feedback">Audio Feedback</Label>
                    <Switch
                      id="audio-feedback"
                      checked={settings.audioFeedback}
                      onCheckedChange={(checked) => updateSettings({ audioFeedback: checked })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="speech-rate">Speech Rate</Label>
                    <Select value={settings.speechRate} onValueChange={(value: any) => updateSettings({ speechRate: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="speech-volume">Speech Volume: {settings.speechVolume}%</Label>
                    <Slider
                      id="speech-volume"
                      min={0}
                      max={100}
                      step={10}
                      value={[settings.speechVolume]}
                      onValueChange={(value) => updateSettings({ speechVolume: value[0] })}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Navigation & Focus Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enhanced-focus">Enhanced Focus Indicators</Label>
                    <Switch
                      id="enhanced-focus"
                      checked={settings.enhancedFocus}
                      onCheckedChange={(checked) => updateSettings({ enhancedFocus: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboard-navigation">Keyboard Navigation</Label>
                    <Switch
                      id="keyboard-navigation"
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="skip-links">Skip Links</Label>
                    <Switch
                      id="skip-links"
                      checked={settings.skipLinks}
                      onCheckedChange={(checked) => updateSettings({ skipLinks: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="landmark-navigation">Landmark Navigation</Label>
                    <Switch
                      id="landmark-navigation"
                      checked={settings.landmarkNavigation}
                      onCheckedChange={(checked) => updateSettings({ landmarkNavigation: checked })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="focus-size">Focus Indicator Size</Label>
                    <Select value={settings.focusSize} onValueChange={(value: any) => updateSettings({ focusSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra-large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cursor-size">Cursor Size</Label>
                    <Select value={settings.cursorSize} onValueChange={(value: any) => updateSettings({ cursorSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra-large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Layout & Motion Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="increased-spacing">Increased Spacing</Label>
                    <Switch
                      id="increased-spacing"
                      checked={settings.increasedSpacing}
                      onCheckedChange={(checked) => updateSettings({ increasedSpacing: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="simplified-layout">Simplified Layout</Label>
                    <Switch
                      id="simplified-layout"
                      checked={settings.simplifiedLayout}
                      onCheckedChange={(checked) => updateSettings({ simplifiedLayout: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="hide-decorative">Hide Decorative Elements</Label>
                    <Switch
                      id="hide-decorative"
                      checked={settings.hideDecorative}
                      onCheckedChange={(checked) => updateSettings({ hideDecorative: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="button-highlighting">Button Highlighting</Label>
                    <Switch
                      id="button-highlighting"
                      checked={settings.buttonHighlighting}
                      onCheckedChange={(checked) => updateSettings({ buttonHighlighting: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-motion">Reduce Motion</Label>
                    <Switch
                      id="reduce-motion"
                      checked={settings.reduceMotion}
                      onCheckedChange={(checked) => updateSettings({ reduceMotion: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="pause-animations">Pause Animations</Label>
                    <Switch
                      id="pause-animations"
                      checked={settings.pauseAnimations}
                      onCheckedChange={(checked) => updateSettings({ pauseAnimations: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="disable-parallax">Disable Parallax</Label>
                    <Switch
                      id="disable-parallax"
                      checked={settings.disableParallax}
                      onCheckedChange={(checked) => updateSettings({ disableParallax: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  Test Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Text-to-Speech</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Test the speech synthesis with current rate and volume settings.
                    </p>
                    <Button
                      onClick={testTextToSpeech}
                      disabled={!settings.audioDescriptions}
                      variant="outline"
                      className="w-full"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Test Text-to-Speech
                    </Button>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Audio Feedback</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Test different types of audio feedback sounds.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => testAudioFeedback('click')}
                        disabled={!settings.audioFeedback}
                        variant="outline"
                        size="sm"
                      >
                        Click Sound
                      </Button>
                      <Button
                        onClick={() => testAudioFeedback('focus')}
                        disabled={!settings.audioFeedback}
                        variant="outline"
                        size="sm"
                      >
                        Focus Sound
                      </Button>
                      <Button
                        onClick={() => testAudioFeedback('success')}
                        disabled={!settings.audioFeedback}
                        variant="outline"
                        size="sm"
                      >
                        Success Sound
                      </Button>
                      <Button
                        onClick={() => testAudioFeedback('error')}
                        disabled={!settings.audioFeedback}
                        variant="outline"
                        size="sm"
                      >
                        Error Sound
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Screen Reader</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Test screen reader announcements (ARIA live regions).
                    </p>
                    <Button
                      onClick={testScreenReaderAnnouncement}
                      disabled={!settings.screenReaderMode}
                      variant="outline"
                      className="w-full"
                    >
                      <Accessibility className="h-4 w-4 mr-2" />
                      Test Screen Reader
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={resetToDefaults}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset All Settings to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}