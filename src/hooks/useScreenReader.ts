import { useEffect, useRef } from 'react';

interface ScreenReaderOptions {
  enabled: boolean;
  announceBlockChanges?: boolean;
  announceWorkspaceChanges?: boolean;
  announceProgress?: boolean;
}

export function useScreenReader(options: ScreenReaderOptions) {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!options.enabled) return;
    
    // Create live region for screen reader announcements
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }
    
    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, [options.enabled]);
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!options.enabled || !liveRegionRef.current) return;
    
    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = message;
    
    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 1000);
  };
  
  const announceBlockAction = (action: string, blockType: string) => {
    if (!options.announceBlockChanges) return;
    
    const readableBlockType = blockType.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase();
    announce(`${action} ${readableBlockType} block`);
  };
  
  const announceWorkspaceAction = (action: string) => {
    if (!options.announceWorkspaceChanges) return;
    announce(`Workspace ${action}`);
  };
  
  const announceProgress = (progress: number, challengeTitle?: string) => {
    if (!options.announceProgress) return;
    
    const message = challengeTitle 
      ? `Challenge ${challengeTitle}: ${progress}% complete`
      : `Progress: ${progress}% complete`;
    announce(message);
  };
  
  const announceError = (error: string) => {
    announce(`Error: ${error}`, 'assertive');
  };
  
  const announceSuccess = (message: string) => {
    announce(message, 'assertive');
  };
  
  return {
    announce,
    announceBlockAction,
    announceWorkspaceAction,
    announceProgress,
    announceError,
    announceSuccess
  };
}