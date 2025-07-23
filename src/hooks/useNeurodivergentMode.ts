
import { useEffect, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export interface NeurodivergentModeSettings {
  // Sensory and Interface Adaptations
  theme: 'light' | 'dark' | 'high-contrast' | 'color-blind-friendly';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontFamily: 'default' | 'dyslexic' | 'monospace' | 'sans-serif';
  lineSpacing: 'compact' | 'normal' | 'relaxed' | 'loose';
  animationsEnabled: boolean;
  audioCuesEnabled: boolean;
  
  // Learning Style Accommodations
  explanationFormat: 'visual' | 'text' | 'video' | 'interactive' | 'all';
  chunkSize: 'small' | 'medium' | 'large';
  showProgressIndicators: boolean;
  allowLessonRepeat: boolean;
  
  // Executive Function Support
  timerEnabled: boolean;
  breakReminders: boolean;
  sessionDuration: number; // minutes
  breakDuration: number; // minutes
  predictableNavigation: boolean;
  customReminders: boolean;
  
  // Processing and Comprehension Aids
  contentPacing: 'slow' | 'normal' | 'fast';
  textToSpeechEnabled: boolean;
  syntaxHighlighting: boolean;
  glossaryEnabled: boolean;
  
  // Reduced Anxiety Features
  practiceMode: boolean;
  hideLeaderboards: boolean;
  privateMode: boolean;
  gentleErrorMessages: boolean;
  celebrateProgress: boolean;
}

const DEFAULT_SETTINGS: NeurodivergentModeSettings = {
  theme: 'light',
  fontSize: 'medium',
  fontFamily: 'default',
  lineSpacing: 'normal',
  animationsEnabled: true,
  audioCuesEnabled: false,
  explanationFormat: 'all',
  chunkSize: 'medium',
  showProgressIndicators: true,
  allowLessonRepeat: true,
  timerEnabled: false,
  breakReminders: false,
  sessionDuration: 25,
  breakDuration: 5,
  predictableNavigation: true,
  customReminders: false,
  contentPacing: 'normal',
  textToSpeechEnabled: false,
  syntaxHighlighting: true,
  glossaryEnabled: true,
  practiceMode: false,
  hideLeaderboards: false,
  privateMode: false,
  gentleErrorMessages: true,
  celebrateProgress: true,
};

export function useNeurodivergentMode() {
  const { currentMode, features } = useAccessibility();
  const [settings, setSettings] = useState<NeurodivergentModeSettings>(DEFAULT_SETTINGS);
  const [isActive, setIsActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<number | null>(null);
  const [breakTimer, setBreakTimer] = useState<number | null>(null);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Check if neurodivergent mode is active
  useEffect(() => {
    setIsActive(currentMode?.id === 'neurodivergent');
  }, [currentMode]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('neurodivergent-mode-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.warn('Failed to parse neurodivergent mode settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<NeurodivergentModeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('neurodivergent-mode-settings', JSON.stringify(updated));
  };

  // Apply theme changes
  useEffect(() => {
    if (!isActive) return;

    const root = document.documentElement;
    
    // Apply theme
    root.setAttribute('data-theme', settings.theme);
    
    // Apply font size
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      'extra-large': '1.25rem'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];
    
    // Apply font family
    if (settings.fontFamily === 'dyslexic') {
      root.style.fontFamily = 'OpenDyslexic, Arial, sans-serif';
    } else if (settings.fontFamily === 'monospace') {
      root.style.fontFamily = 'Monaco, "Cascadia Code", "Roboto Mono", monospace';
    } else if (settings.fontFamily === 'sans-serif') {
      root.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    } else {
      root.style.fontFamily = '';
    }
    
    // Apply line spacing
    const lineSpacingMap = {
      compact: '1.2',
      normal: '1.5',
      relaxed: '1.6',
      loose: '1.8'
    };
    root.style.lineHeight = lineSpacingMap[settings.lineSpacing];
    
    // Apply animations
    if (!settings.animationsEnabled) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    return () => {
      root.removeAttribute('data-theme');
      root.style.fontSize = '';
      root.style.fontFamily = '';
      root.style.lineHeight = '';
      root.style.removeProperty('--animation-duration');
    };
  }, [isActive, settings.theme, settings.fontSize, settings.fontFamily, settings.lineSpacing, settings.animationsEnabled]);

  // Timer management
  useEffect(() => {
    if (!isActive || !settings.timerEnabled) return;

    let timer: NodeJS.Timeout;
    
    if (isOnBreak && breakTimer !== null) {
      timer = setInterval(() => {
        setBreakTimer(prev => {
          if (prev === null || prev <= 1) {
            setIsOnBreak(false);
            setSessionTimer(settings.sessionDuration * 60);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isOnBreak && sessionTimer !== null) {
      timer = setInterval(() => {
        setSessionTimer(prev => {
          if (prev === null || prev <= 1) {
            setIsOnBreak(true);
            setBreakTimer(settings.breakDuration * 60);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, settings.timerEnabled, settings.sessionDuration, settings.breakDuration, isOnBreak, sessionTimer, breakTimer]);

  // Start session timer
  const startSession = () => {
    if (settings.timerEnabled) {
      setSessionTimer(settings.sessionDuration * 60);
      setIsOnBreak(false);
    }
  };

  // Pause session timer
  const pauseSession = () => {
    setSessionTimer(null);
    setBreakTimer(null);
  };

  // Audio cues
  const playAudioCue = (type: 'success' | 'error' | 'notification' | 'break') => {
    if (!isActive || !settings.audioCuesEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies = {
      success: 800,
      error: 300,
      notification: 600,
      break: 400
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Text to speech
  const speak = (text: string) => {
    if (!isActive || !settings.textToSpeechEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const rateMap = {
      slow: 0.7,
      normal: 1,
      fast: 1.3
    };
    utterance.rate = rateMap[settings.contentPacing];
    speechSynthesis.speak(utterance);
  };

  // Get formatted time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    isActive,
    settings,
    updateSettings,
    sessionTimer,
    breakTimer,
    isOnBreak,
    startSession,
    pauseSession,
    playAudioCue,
    speak,
    formatTime: (seconds: number) => formatTime(seconds),
  };
}
