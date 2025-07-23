import { useEffect, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export interface VisualImpairmentSettings {
  // High Contrast and Color Settings
  contrastMode: 'normal' | 'high' | 'extra-high' | 'inverted';
  colorScheme: 'light' | 'dark' | 'auto';
  reduceColors: boolean;
  monochrome: boolean;
  
  // Text and Typography
  fontSize: 'medium' | 'large' | 'extra-large' | 'huge' | 'massive';
  fontWeight: 'normal' | 'medium' | 'bold' | 'extra-bold';
  lineSpacing: 'normal' | 'relaxed' | 'loose' | 'extra-loose';
  letterSpacing: 'normal' | 'wide' | 'wider' | 'widest';
  fontFamily: 'default' | 'sans-serif' | 'high-readability';
  
  // Screen Reader and Audio
  screenReaderMode: boolean;
  audioDescriptions: boolean;
  speechRate: 'slow' | 'normal' | 'fast';
  speechVolume: number; // 0-100
  audioFeedback: boolean;
  
  // Navigation and Focus
  enhancedFocus: boolean;
  focusSize: 'normal' | 'large' | 'extra-large';
  keyboardNavigation: boolean;
  skipLinks: boolean;
  landmarkNavigation: boolean;
  
  // Visual Enhancements
  cursorSize: 'normal' | 'large' | 'extra-large';
  highlightLinks: boolean;
  underlineLinks: boolean;
  buttonHighlighting: boolean;
  removeBackgrounds: boolean;
  
  // Motion and Animation
  reduceMotion: boolean;
  pauseAnimations: boolean;
  disableParallax: boolean;
  
  // Layout and Spacing
  increasedSpacing: boolean;
  simplifiedLayout: boolean;
  hideDecorative: boolean;
  prominentHeadings: boolean;
}

const DEFAULT_SETTINGS: VisualImpairmentSettings = {
  contrastMode: 'normal',
  colorScheme: 'auto',
  reduceColors: false,
  monochrome: false,
  fontSize: 'medium',
  fontWeight: 'normal',
  lineSpacing: 'normal',
  letterSpacing: 'normal',
  fontFamily: 'default',
  screenReaderMode: false,
  audioDescriptions: true,
  speechRate: 'normal',
  speechVolume: 80,
  audioFeedback: true,
  enhancedFocus: true,
  focusSize: 'normal',
  keyboardNavigation: true,
  skipLinks: true,
  landmarkNavigation: true,
  cursorSize: 'normal',
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

export function useVisualImpairmentMode() {
  const { currentMode, features } = useAccessibility();
  const [settings, setSettings] = useState<VisualImpairmentSettings>(DEFAULT_SETTINGS);
  const [isActive, setIsActive] = useState(false);

  // Check if visual impairment mode is active
  useEffect(() => {
    setIsActive(currentMode?.id === 'visual');
  }, [currentMode]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('visual-impairment-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.warn('Failed to parse visual impairment settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<VisualImpairmentSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('visual-impairment-settings', JSON.stringify(updated));
  };

  // Apply visual changes - DISABLED to prevent any visual styling changes
  useEffect(() => {
    // No visual changes applied - keeping only the non-visual accessibility features
  }, [isActive, settings]);

  // Text-to-speech functionality
  const speak = (text: string) => {
    if (!isActive || !settings.audioDescriptions || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const rateMap = {
      slow: 0.7,
      normal: 1,
      fast: 1.3
    };
    utterance.rate = rateMap[settings.speechRate];
    utterance.volume = settings.speechVolume / 100;
    speechSynthesis.speak(utterance);
  };

  // Audio feedback for interactions
  const playAudioFeedback = (type: 'click' | 'focus' | 'error' | 'success') => {
    if (!isActive || !settings.audioFeedback) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies = {
      click: 800,
      focus: 600,
      error: 300,
      success: 1000
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(settings.speechVolume / 1000, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  // Screen reader announcement
  const announceToScreenReader = (message: string) => {
    if (!isActive || !settings.screenReaderMode) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return {
    isActive,
    settings,
    updateSettings,
    speak,
    playAudioFeedback,
    announceToScreenReader,
  };
}