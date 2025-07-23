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
import { 
  Eye, 
  Hand, 
  Monitor, 
  Vibrate, 
  TestTube,
  RotateCcw,
  Volume2,
  Zap,
  Bell,
  MousePointer
} from "lucide-react";
import { useHearingImpairmentMode } from "@/hooks/useHearingImpairmentMode";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface HearingImpairmentSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HearingImpairmentSettingsDialog({
  open,
  onOpenChange,
}: HearingImpairmentSettingsDialogProps) {
  const { currentMode } = useAccessibility();
  const {
    isActive,
    settings,
    updateSettings,
    triggerHaptic,
    showVisualNotification,
    hapticSupported,
  } = useHearingImpairmentMode();

  // Test functions
  const testHaptic = (pattern: 'button' | 'alert' | 'success' | 'error') => {
    triggerHaptic(pattern);
  };

  const testVisualNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Success notification test',
      error: 'Error notification test',
      warning: 'Warning notification test',
      info: 'Info notification test'
    };
    showVisualNotification(type, messages[type]);
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      theme: 'light' as const,
      fontSize: 'medium' as const,
      fontWeight: 'normal' as const,
      lineSpacing: 'normal' as const,
      visualNotifications: true,
      flashingAlerts: false,
      colorCodedFeedback: true,
      strongBorders: false,
      enhancedFocus: true,
      buttonSize: 'medium' as const,
      iconSize: 'medium' as const,
      spacing: 'normal' as const,
      hapticEnabled: true,
      hapticIntensity: 'medium' as const,
      hapticForButtons: true,
      hapticForAlerts: true,
      hapticForProgress: true,
      hapticForNavigation: true,
      textCaptions: true,
      visualWaveforms: false,
      vibrationPatterns: true,
      gestureControls: false,
      reducedClutter: true,
      prominentActions: true,
      clearHierarchy: true,
      consistentLayout: true,
    };
    
    updateSettings(defaultSettings);
    triggerHaptic('success');
    showVisualNotification('success', 'Settings reset to defaults');
  };

  if (!isActive) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Hearing Impairment Settings
            </DialogTitle>
            <DialogDescription>
              Please activate Hearing Impairment mode to access these settings. 
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
            <Volume2 className="h-5 w-5" />
            Hearing Impairment Settings
          </DialogTitle>
          <DialogDescription>
            Customize visual and haptic feedback to enhance your coding experience.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="visual" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="sizing" className="flex items-center gap-1">
              <Monitor className="h-3 w-3" />
              Sizing
            </TabsTrigger>
            <TabsTrigger value="haptic" className="flex items-center gap-1">
              <Vibrate className="h-3 w-3" />
              Haptic
            </TabsTrigger>
            <TabsTrigger value="interface" className="flex items-center gap-1">
              <MousePointer className="h-3 w-3" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Visual Enhancements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value: any) => updateSettings({ theme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="high-contrast">High Contrast</SelectItem>
                        <SelectItem value="bright">Bright</SelectItem>
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
                        <SelectItem value="semibold">Semibold</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="visual-notifications">Visual Notifications</Label>
                    <Switch
                      id="visual-notifications"
                      checked={settings.visualNotifications}
                      onCheckedChange={(checked) => updateSettings({ visualNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="flashing-alerts">Flashing Alerts</Label>
                    <Switch
                      id="flashing-alerts"
                      checked={settings.flashingAlerts}
                      onCheckedChange={(checked) => updateSettings({ flashingAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="color-coded-feedback">Color Coded Feedback</Label>
                    <Switch
                      id="color-coded-feedback"
                      checked={settings.colorCodedFeedback}
                      onCheckedChange={(checked) => updateSettings({ colorCodedFeedback: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="strong-borders">Strong Borders</Label>
                    <Switch
                      id="strong-borders"
                      checked={settings.strongBorders}
                      onCheckedChange={(checked) => updateSettings({ strongBorders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enhanced-focus">Enhanced Focus Indicators</Label>
                    <Switch
                      id="enhanced-focus"
                      checked={settings.enhancedFocus}
                      onCheckedChange={(checked) => updateSettings({ enhancedFocus: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sizing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Size & Layout Settings
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
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra-large">Extra Large</SelectItem>
                        <SelectItem value="huge">Huge</SelectItem>
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
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                        <SelectItem value="loose">Loose</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="button-size">Button Size</Label>
                    <Select value={settings.buttonSize} onValueChange={(value: any) => updateSettings({ buttonSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra-large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon-size">Icon Size</Label>
                    <Select value={settings.iconSize} onValueChange={(value: any) => updateSettings({ iconSize: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="extra-large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spacing">Overall Spacing</Label>
                  <Select value={settings.spacing} onValueChange={(value: any) => updateSettings({ spacing: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="relaxed">Relaxed</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="haptic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vibrate className="h-4 w-4" />
                  Haptic Feedback Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="haptic-enabled">Enable Haptic Feedback</Label>
                  <Switch
                    id="haptic-enabled"
                    checked={settings.hapticEnabled && hapticSupported}
                    onCheckedChange={(checked) => updateSettings({ hapticEnabled: checked })}
                    disabled={!hapticSupported}
                  />
                </div>

                {!hapticSupported && (
                  <p className="text-sm text-muted-foreground">
                    Haptic feedback is not supported on this device.
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="haptic-intensity">Haptic Intensity</Label>
                  <Select 
                    value={settings.hapticIntensity} 
                    onValueChange={(value: any) => updateSettings({ hapticIntensity: value })}
                    disabled={!settings.hapticEnabled || !hapticSupported}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="haptic-buttons">Haptic for Button Presses</Label>
                    <Switch
                      id="haptic-buttons"
                      checked={settings.hapticForButtons}
                      onCheckedChange={(checked) => updateSettings({ hapticForButtons: checked })}
                      disabled={!settings.hapticEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="haptic-alerts">Haptic for Alerts</Label>
                    <Switch
                      id="haptic-alerts"
                      checked={settings.hapticForAlerts}
                      onCheckedChange={(checked) => updateSettings({ hapticForAlerts: checked })}
                      disabled={!settings.hapticEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="haptic-progress">Haptic for Progress</Label>
                    <Switch
                      id="haptic-progress"
                      checked={settings.hapticForProgress}
                      onCheckedChange={(checked) => updateSettings({ hapticForProgress: checked })}
                      disabled={!settings.hapticEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="haptic-navigation">Haptic for Navigation</Label>
                    <Switch
                      id="haptic-navigation"
                      checked={settings.hapticForNavigation}
                      onCheckedChange={(checked) => updateSettings({ hapticForNavigation: checked })}
                      disabled={!settings.hapticEnabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interface" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Interface Adaptations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="text-captions">Text Captions</Label>
                    <Switch
                      id="text-captions"
                      checked={settings.textCaptions}
                      onCheckedChange={(checked) => updateSettings({ textCaptions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="visual-waveforms">Visual Waveforms</Label>
                    <Switch
                      id="visual-waveforms"
                      checked={settings.visualWaveforms}
                      onCheckedChange={(checked) => updateSettings({ visualWaveforms: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="vibration-patterns">Vibration Patterns</Label>
                    <Switch
                      id="vibration-patterns"
                      checked={settings.vibrationPatterns}
                      onCheckedChange={(checked) => updateSettings({ vibrationPatterns: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gesture-controls">Gesture Controls</Label>
                    <Switch
                      id="gesture-controls"
                      checked={settings.gestureControls}
                      onCheckedChange={(checked) => updateSettings({ gestureControls: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-clutter">Reduced Clutter</Label>
                    <Switch
                      id="reduced-clutter"
                      checked={settings.reducedClutter}
                      onCheckedChange={(checked) => updateSettings({ reducedClutter: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="prominent-actions">Prominent Actions</Label>
                    <Switch
                      id="prominent-actions"
                      checked={settings.prominentActions}
                      onCheckedChange={(checked) => updateSettings({ prominentActions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="clear-hierarchy">Clear Hierarchy</Label>
                    <Switch
                      id="clear-hierarchy"
                      checked={settings.clearHierarchy}
                      onCheckedChange={(checked) => updateSettings({ clearHierarchy: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="consistent-layout">Consistent Layout</Label>
                    <Switch
                      id="consistent-layout"
                      checked={settings.consistentLayout}
                      onCheckedChange={(checked) => updateSettings({ consistentLayout: checked })}
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
                  Test Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Test Haptic Feedback</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testHaptic('button')}
                        disabled={!settings.hapticEnabled || !hapticSupported}
                      >
                        <Hand className="h-3 w-3 mr-1" />
                        Button
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testHaptic('alert')}
                        disabled={!settings.hapticEnabled || !hapticSupported}
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Alert
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testHaptic('success')}
                        disabled={!settings.hapticEnabled || !hapticSupported}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Success
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testHaptic('error')}
                        disabled={!settings.hapticEnabled || !hapticSupported}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Error
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Test Visual Notifications</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVisualNotification('success')}
                      >
                        Success
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVisualNotification('error')}
                      >
                        Error
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVisualNotification('warning')}
                      >
                        Warning
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testVisualNotification('info')}
                      >
                        Info
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={resetToDefaults}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
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