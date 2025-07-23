import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilityMode {
  id: string;
  title: string;
  features: {
    highContrast?: boolean;
    largeText?: boolean;
    voiceCommands?: boolean;
    screenReader?: boolean;
    reducedMotion?: boolean;
    keyboardNavigation?: boolean;
    visualFeedback?: boolean;
    simplifiedUI?: boolean;
    audioDescriptions?: boolean;
    tactileFeedback?: boolean;
  };
}

export const accessibilityModes: AccessibilityMode[] = [
  {
    id: "neurodivergent",
    title: "Neurodivergent",
    features: {
      simplifiedUI: true,
      reducedMotion: true,
      visualFeedback: true,
      largeText: true
    }
  },
  {
    id: "visual",
    title: "Visual Impairment",
    features: {
      highContrast: true,
      screenReader: true,
      keyboardNavigation: true,
      audioDescriptions: true,
      largeText: true
    }
  },
  {
    id: "hearing",
    title: "Hearing Impairment",
    features: {
      visualFeedback: true,
      tactileFeedback: true,
      simplifiedUI: true
    }
  },
  {
    id: "motor",
    title: "Motor Impairment",
    features: {
      voiceCommands: true,
      keyboardNavigation: true,
      largeText: true,
      simplifiedUI: true
    }
  }
];

interface AccessibilityContextType {
  currentMode: AccessibilityMode | null;
  setMode: (mode: AccessibilityMode | null) => void;
  features: AccessibilityMode['features'];
  neurodivergentSettings?: any;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [currentMode, setCurrentMode] = useState<AccessibilityMode | null>(null);

  // Load saved mode from localStorage
  useEffect(() => {
    const savedModeId = localStorage.getItem('accessibility-mode');
    if (savedModeId) {
      const mode = accessibilityModes.find(m => m.id === savedModeId);
      if (mode) setCurrentMode(mode);
    }
  }, []);

  // Save mode to localStorage and apply theme changes
  const setMode = (mode: AccessibilityMode | null) => {
    setCurrentMode(mode);
    if (mode) {
      localStorage.setItem('accessibility-mode', mode.id);
      
      // Apply immediate theme changes for accessibility modes
      if (mode.id === 'neurodivergent') {
        document.documentElement.classList.add('neurodivergent-mode');
        document.documentElement.classList.remove('visual-impairment-mode');
      } else if (mode.id === 'visual') {
        document.documentElement.classList.add('visual-impairment-mode');
        document.documentElement.classList.remove('neurodivergent-mode');
      } else {
        document.documentElement.classList.remove('neurodivergent-mode', 'visual-impairment-mode');
      }
    } else {
      localStorage.removeItem('accessibility-mode');
      document.documentElement.classList.remove('neurodivergent-mode', 'visual-impairment-mode');
    }
  };

  const features = currentMode?.features || {};

  return (
    <AccessibilityContext.Provider value={{ currentMode, setMode, features }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
