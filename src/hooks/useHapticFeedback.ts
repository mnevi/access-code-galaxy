import { useCallback } from 'react';

interface HapticPattern {
  duration: number;
  delay?: number;
}

export function useHapticFeedback(enabled: boolean) {
  const vibrate = useCallback((pattern: number | number[] | HapticPattern[]) => {
    if (!enabled || !navigator.vibrate) return;
    
    try {
      if (Array.isArray(pattern)) {
        if (pattern.length > 0 && typeof pattern[0] === 'object') {
          // Custom pattern with durations and delays
          const hapticPattern = pattern as HapticPattern[];
          const vibratePattern: number[] = [];
          
          hapticPattern.forEach((p, index) => {
            vibratePattern.push(p.duration);
            if (index < hapticPattern.length - 1) {
              vibratePattern.push(p.delay || 100);
            }
          });
          
          navigator.vibrate(vibratePattern);
        } else {
          // Simple number array
          navigator.vibrate(pattern as number[]);
        }
      } else {
        // Single duration
        navigator.vibrate(pattern as number);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [enabled]);
  
  // Predefined haptic patterns
  const patterns = {
    // Success feedback
    success: () => vibrate([100, 50, 100]),
    
    // Error feedback
    error: () => vibrate([200, 100, 200, 100, 200]),
    
    // Button press
    buttonPress: () => vibrate(50),
    
    // Block connection
    blockConnect: () => vibrate([30, 30, 30]),
    
    // Block creation
    blockCreate: () => vibrate(80),
    
    // Block deletion
    blockDelete: () => vibrate([150, 50, 150]),
    
    // Workspace clear
    workspaceClear: () => vibrate([300, 100, 300]),
    
    // Challenge completion
    challengeComplete: () => vibrate([200, 100, 200, 100, 200, 100, 300]),
    
    // Progress milestone
    progressMilestone: () => vibrate([100, 50, 100, 50, 200]),
    
    // Voice command recognized
    voiceRecognized: () => vibrate(40),
    
    // Voice command failed
    voiceFailed: () => vibrate([100, 50, 100]),
    
    // Language switch
    languageSwitch: () => vibrate([60, 40, 60]),
    
    // Zoom action
    zoom: () => vibrate(25),
    
    // Navigation
    navigate: () => vibrate(30),
    
    // Mode switch
    modeSwitch: () => vibrate([80, 40, 80, 40, 120]),
    
    // Warning
    warning: () => vibrate([150, 100, 150]),
    
    // Notification
    notification: () => vibrate([100, 50, 50, 50, 100]),
    
    // Start activity
    start: () => vibrate([50, 30, 100]),
    
    // End activity
    end: () => vibrate([100, 30, 50])
  };
  
  return {
    vibrate,
    patterns,
    isSupported: typeof navigator !== 'undefined' && 'vibrate' in navigator
  };
}

// Utility functions for common accessibility scenarios
export function useAccessibilityHaptics(enabled: boolean) {
  const { patterns } = useHapticFeedback(enabled);
  
  const onBlockInteraction = useCallback((action: 'create' | 'connect' | 'delete') => {
    switch (action) {
      case 'create':
        patterns.blockCreate();
        break;
      case 'connect':
        patterns.blockConnect();
        break;
      case 'delete':
        patterns.blockDelete();
        break;
    }
  }, [patterns]);
  
  const onWorkspaceAction = useCallback((action: 'clear' | 'run' | 'error') => {
    switch (action) {
      case 'clear':
        patterns.workspaceClear();
        break;
      case 'run':
        patterns.start();
        break;
      case 'error':
        patterns.error();
        break;
    }
  }, [patterns]);
  
  const onProgressUpdate = useCallback((isComplete: boolean, isMilestone: boolean = false) => {
    if (isComplete) {
      patterns.challengeComplete();
    } else if (isMilestone) {
      patterns.progressMilestone();
    }
  }, [patterns]);
  
  const onUIInteraction = useCallback((action: 'button' | 'navigate' | 'switch') => {
    switch (action) {
      case 'button':
        patterns.buttonPress();
        break;
      case 'navigate':
        patterns.navigate();
        break;
      case 'switch':
        patterns.modeSwitch();
        break;
    }
  }, [patterns]);
  
  return {
    onBlockInteraction,
    onWorkspaceAction,
    onProgressUpdate,
    onUIInteraction
  };
}