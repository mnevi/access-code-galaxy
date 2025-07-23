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

  // Apply visual changes
  useEffect(() => {
    if (!isActive) return;

    const root = document.documentElement;
    
    // Apply color scheme and contrast directly to data attributes (for theme switching)
    root.setAttribute('data-visual-theme', settings.colorScheme);
    root.setAttribute('data-contrast', settings.contrastMode);
    
    // Apply font size directly to root (using same ratios as neurodivergent mode)
    const fontSizeMap = {
      medium: '1rem',        // same as neurodivergent medium
      large: '1.125rem',     // same as neurodivergent large 
      'extra-large': '1.25rem', // same as neurodivergent extra-large
      huge: '1.375rem',      // scaled proportionally
      massive: '1.5rem'      // scaled proportionally
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];
    
    // Apply font weight directly to root
    const fontWeightMap = {
      normal: '400',
      medium: '500',
      bold: '700',
      'extra-bold': '800'
    };
    root.style.fontWeight = fontWeightMap[settings.fontWeight];
    
    // Apply line spacing directly to root
    const lineSpacingMap = {
      normal: '1.5',
      relaxed: '1.6',
      loose: '1.8',
      'extra-loose': '2.0'
    };
    root.style.lineHeight = lineSpacingMap[settings.lineSpacing];
    
    // Apply letter spacing directly to root
    const letterSpacingMap = {
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    };
    root.style.letterSpacing = letterSpacingMap[settings.letterSpacing];
    
    // Apply font family directly to root
    if (settings.fontFamily === 'sans-serif') {
      root.style.fontFamily = 'Arial, Helvetica, sans-serif';
    } else if (settings.fontFamily === 'high-readability') {
      root.style.fontFamily = 'Verdana, Geneva, sans-serif';
    } else {
      root.style.fontFamily = '';
    }
    
    // Apply CSS classes to the root element with visual-impairment-mode class
    if (settings.highlightLinks) {
      root.classList.add('visual-highlight-links');
    } else {
      root.classList.remove('visual-highlight-links');
    }
    
    if (settings.underlineLinks) {
      root.classList.add('visual-underline-links');
    } else {
      root.classList.remove('visual-underline-links');
    }
    
    if (settings.reduceMotion) {
      root.classList.add('visual-reduce-motion');
    } else {
      root.classList.remove('visual-reduce-motion');
    }
    
    if (settings.increasedSpacing) {
      root.classList.add('visual-increased-spacing');
    } else {
      root.classList.remove('visual-increased-spacing');
    }
    
    if (settings.simplifiedLayout) {
      root.classList.add('visual-simplified-layout');
    } else {
      root.classList.remove('visual-simplified-layout');
    }
    
    if (settings.removeBackgrounds) {
      root.classList.add('visual-remove-backgrounds');
    } else {
      root.classList.remove('visual-remove-backgrounds');
    }
    
    if (settings.monochrome) {
      root.classList.add('visual-monochrome');
    } else {
      root.classList.remove('visual-monochrome');
    }
    
    // Apply custom properties for focus styling
    const focusSizeMap = {
      normal: '2px',
      large: '4px',
      'extra-large': '6px'
    };
    root.style.setProperty('--visual-focus-width', focusSizeMap[settings.focusSize]);
    
    return () => {
      root.removeAttribute('data-visual-theme');
      root.removeAttribute('data-contrast');
      root.style.fontSize = '';
      root.style.fontWeight = '';
      root.style.lineHeight = '';
      root.style.letterSpacing = '';
      root.style.fontFamily = '';
      root.classList.remove(
        'visual-highlight-links',
        'visual-underline-links',
        'visual-reduce-motion',
        'visual-increased-spacing',
        'visual-simplified-layout',
        'visual-remove-backgrounds',
        'visual-monochrome'
      );
      root.style.removeProperty('--visual-focus-width');
    };
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