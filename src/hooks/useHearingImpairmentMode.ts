import { useEffect, useState } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useHapticFeedback, useAccessibilityHaptics } from './useHapticFeedback';

export interface HearingImpairmentSettings {
  // Visual Enhancement Settings
  theme: 'light' | 'dark' | 'high-contrast' | 'bright';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large' | 'huge';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  lineSpacing: 'compact' | 'normal' | 'relaxed' | 'loose';
  
  // Visual Feedback Enhancement
  visualNotifications: boolean;
  flashingAlerts: boolean;
  colorCodedFeedback: boolean;
  strongBorders: boolean;
  enhancedFocus: boolean;
  
  // Size and Layout Adaptations
  buttonSize: 'small' | 'medium' | 'large' | 'extra-large';
  iconSize: 'small' | 'medium' | 'large' | 'extra-large';
  spacing: 'compact' | 'normal' | 'relaxed' | 'spacious';
  
  // Haptic Feedback Settings
  hapticEnabled: boolean;
  hapticIntensity: 'light' | 'medium' | 'strong';
  hapticForButtons: boolean;
  hapticForAlerts: boolean;
  hapticForProgress: boolean;
  hapticForNavigation: boolean;
  
  // Communication Aids
  textCaptions: boolean;
  visualWaveforms: boolean;
  vibrationPatterns: boolean;
  gestureControls: boolean;
  
  // Interface Simplification
  reducedClutter: boolean;
  prominentActions: boolean;
  clearHierarchy: boolean;
  consistentLayout: boolean;
}

const DEFAULT_SETTINGS: HearingImpairmentSettings = {
  theme: 'light',
  fontSize: 'medium',
  fontWeight: 'normal',
  lineSpacing: 'normal',
  visualNotifications: true,
  flashingAlerts: false,
  colorCodedFeedback: true,
  strongBorders: false,
  enhancedFocus: true,
  buttonSize: 'medium',
  iconSize: 'medium',
  spacing: 'normal',
  hapticEnabled: true,
  hapticIntensity: 'medium',
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

export function useHearingImpairmentMode() {
  const { currentMode, features } = useAccessibility();
  const [settings, setSettings] = useState<HearingImpairmentSettings>(DEFAULT_SETTINGS);
  const [isActive, setIsActive] = useState(false);
  
  const { patterns, isSupported: hapticSupported } = useHapticFeedback(settings.hapticEnabled);
  const { onBlockInteraction, onWorkspaceAction, onProgressUpdate, onUIInteraction } = 
    useAccessibilityHaptics(settings.hapticEnabled);

  // Check if hearing impairment mode is active
  useEffect(() => {
    setIsActive(currentMode?.id === 'hearing');
  }, [currentMode]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('hearing-impairment-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.warn('Failed to parse hearing impairment settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<HearingImpairmentSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('hearing-impairment-settings', JSON.stringify(updated));
  };

  // Apply visual changes
  useEffect(() => {
    if (!isActive) return;

    const root = document.documentElement;
    
    // Apply theme
    root.setAttribute('data-hearing-theme', settings.theme);
    
    // Apply font size directly to root
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      'extra-large': '1.25rem',
      huge: '1.5rem'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];
    
    // Apply font weight directly to root
    const fontWeightMap = {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    };
    root.style.fontWeight = fontWeightMap[settings.fontWeight];
    
    // Apply line spacing directly to root
    const lineSpacingMap = {
      compact: '1.2',
      normal: '1.5',
      relaxed: '1.6',
      loose: '1.8'
    };
    root.style.lineHeight = lineSpacingMap[settings.lineSpacing];
    
    // Apply enhanced focus styles
    if (settings.enhancedFocus) {
      root.classList.add('hearing-enhanced-focus');
    } else {
      root.classList.remove('hearing-enhanced-focus');
    }
    
    // Apply reduced clutter
    if (settings.reducedClutter) {
      root.classList.add('hearing-reduced-clutter');
    } else {
      root.classList.remove('hearing-reduced-clutter');
    }
    
    // Apply strong borders via CSS custom property
    if (settings.strongBorders) {
      root.style.setProperty('--hearing-border-width', '3px');
    } else {
      root.style.setProperty('--hearing-border-width', '1px');
    }
    
    return () => {
      root.removeAttribute('data-hearing-theme');
      root.style.fontSize = '';
      root.style.fontWeight = '';
      root.style.lineHeight = '';
      root.classList.remove('hearing-enhanced-focus', 'hearing-reduced-clutter');
      root.style.removeProperty('--hearing-border-width');
    };
  }, [isActive, settings]);

  // Haptic feedback functions with intensity mapping
  const getHapticIntensity = () => {
    const intensityMap = {
      light: 0.3,
      medium: 0.6,
      strong: 1.0
    };
    return intensityMap[settings.hapticIntensity];
  };

  const triggerHaptic = (pattern: 'button' | 'alert' | 'progress' | 'navigation' | 'success' | 'error') => {
    if (!settings.hapticEnabled || !hapticSupported) return;

    const intensity = getHapticIntensity();
    
    switch (pattern) {
      case 'button':
        if (settings.hapticForButtons) patterns.buttonPress();
        break;
      case 'alert':
        if (settings.hapticForAlerts) patterns.warning();
        break;
      case 'progress':
        if (settings.hapticForProgress) patterns.progressMilestone();
        break;
      case 'navigation':
        if (settings.hapticForNavigation) patterns.navigate();
        break;
      case 'success':
        patterns.success();
        break;
      case 'error':
        patterns.error();
        break;
    }
  };

  // Visual notification system
  const showVisualNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    if (!isActive || !settings.visualNotifications) return;

    // Create visual notification element
    const notification = document.createElement('div');
    notification.className = `hearing-visual-notification hearing-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: ${settings.fontWeight === 'normal' ? '600' : '700'};
      font-size: ${settings.fontSize === 'small' ? '1rem' : '1.125rem'};
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      border: var(--hearing-border-width, 1px) solid;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    // Color coding based on type
    const colors = {
      success: { bg: '#10b981', text: '#ffffff', border: '#059669' },
      error: { bg: '#ef4444', text: '#ffffff', border: '#dc2626' },
      warning: { bg: '#f59e0b', text: '#ffffff', border: '#d97706' },
      info: { bg: '#3b82f6', text: '#ffffff', border: '#2563eb' }
    };

    const color = colors[type];
    notification.style.backgroundColor = color.bg;
    notification.style.color = color.text;
    notification.style.borderColor = color.border;

    // Add flashing effect if enabled
    if (settings.flashingAlerts && (type === 'error' || type === 'warning')) {
      notification.style.animation = 'slideInRight 0.3s ease-out, flash 1s ease-in-out 3';
    }

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);

    // Trigger haptic feedback
    triggerHaptic(type === 'success' ? 'success' : type === 'error' ? 'error' : 'alert');
  };

  return {
    isActive,
    settings,
    updateSettings,
    triggerHaptic,
    showVisualNotification,
    hapticSupported,
    onBlockInteraction,
    onWorkspaceAction,
    onProgressUpdate,
    onUIInteraction,
  };
}