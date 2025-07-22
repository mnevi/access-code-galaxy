import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  enabled: boolean;
  workspace?: any;
  onRun?: () => void;
  onClear?: () => void;
  onLanguageChange?: (direction: 'next' | 'prev') => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!options.enabled) return;
    
    // Check if we're in an input field
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }
    
    const { ctrlKey, altKey, shiftKey, key } = event;
    
    // Workspace navigation (Ctrl + Arrow keys)
    if (ctrlKey && options.workspace) {
      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          options.workspace.scroll(0, -50);
          break;
        case 'ArrowDown':
          event.preventDefault();
          options.workspace.scroll(0, 50);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          options.workspace.scroll(-50, 0);
          break;
        case 'ArrowRight':
          event.preventDefault();
          options.workspace.scroll(50, 0);
          break;
        case '=':
        case '+':
          event.preventDefault();
          options.workspace.zoomCenter(1);
          break;
        case '-':
          event.preventDefault();
          options.workspace.zoomCenter(-1);
          break;
        case '0':
          event.preventDefault();
          options.workspace.setScale(1);
          options.workspace.scrollCenter();
          break;
      }
    }
    
    // Action shortcuts (Ctrl + key)
    if (ctrlKey && !altKey && !shiftKey) {
      switch (key) {
        case 'Enter':
          event.preventDefault();
          options.onRun?.();
          break;
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          if (window.confirm('Clear the workspace?')) {
            options.onClear?.();
          }
          break;
        case 'z':
          event.preventDefault();
          options.workspace?.undo();
          break;
        case 'y':
          event.preventDefault();
          options.workspace?.redo();
          break;
      }
    }
    
    // Language switching (Alt + number keys)
    if (altKey && !ctrlKey && !shiftKey) {
      const languages = ['html', 'css', 'javascript', 'python'];
      const num = parseInt(key);
      if (num >= 1 && num <= languages.length) {
        event.preventDefault();
        const select = document.querySelector('.language-select') as HTMLSelectElement;
        if (select) {
          select.value = languages[num - 1];
          select.dispatchEvent(new Event('change'));
        }
      }
      
      // Alt + Left/Right for language cycling
      if (key === 'ArrowLeft') {
        event.preventDefault();
        options.onLanguageChange?.('prev');
      } else if (key === 'ArrowRight') {
        event.preventDefault();
        options.onLanguageChange?.('next');
      }
    }
    
    // Quick block creation (Shift + letter keys)
    if (shiftKey && !ctrlKey && !altKey && options.workspace) {
      switch (key.toLowerCase()) {
        case 't':
          event.preventDefault();
          createQuickBlock('text', options.workspace);
          break;
        case 'n':
          event.preventDefault();
          createQuickBlock('math_number', options.workspace);
          break;
        case 'p':
          event.preventDefault();
          createQuickBlock('text_print', options.workspace);
          break;
        case 'i':
          event.preventDefault();
          createQuickBlock('controls_if', options.workspace);
          break;
        case 'r':
          event.preventDefault();
          createQuickBlock('controls_repeat_ext', options.workspace);
          break;
        case 'v':
          event.preventDefault();
          createQuickBlock('variables_get', options.workspace);
          break;
        case 'f':
          event.preventDefault();
          createQuickBlock('procedures_defnoreturn', options.workspace);
          break;
        case 'l':
          event.preventDefault();
          createQuickBlock('controls_for', options.workspace);
          break;
        case 'w':
          event.preventDefault();
          createQuickBlock('controls_whileUntil', options.workspace);
          break;
      }
    }
    
    // Help shortcut
    if (key === 'F1' || (ctrlKey && key === '/')) {
      event.preventDefault();
      showKeyboardHelp();
    }
  }, [options]);
  
  useEffect(() => {
    if (!options.enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Add visual indicator for keyboard mode
    document.body.classList.add('keyboard-navigation-enabled');
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('keyboard-navigation-enabled');
    };
  }, [handleKeyDown, options.enabled]);
  
  return {
    // Return any utility functions if needed
  };
}

function createQuickBlock(blockType: string, workspace: any) {
  try {
    const block = workspace.newBlock(blockType);
    if (block) {
      block.initSvg();
      block.render();
      
      // Position at center of visible area
      const metrics = workspace.getMetrics();
      block.moveBy(
        metrics.viewLeft + metrics.viewWidth / 2 - block.width / 2,
        metrics.viewTop + metrics.viewHeight / 2 - block.height / 2
      );
      
      // Focus on the new block
      block.select();
    }
  } catch (error) {
    console.warn(`Could not create block type: ${blockType}`, error);
  }
}

function showKeyboardHelp() {
  const helpText = `
Keyboard Shortcuts:

Navigation:
• Ctrl + Arrow Keys: Pan workspace
• Ctrl + Plus/Minus: Zoom in/out
• Ctrl + 0: Reset zoom and center

Actions:
• Ctrl + Enter: Run code
• Ctrl + Delete: Clear workspace
• Ctrl + Z: Undo
• Ctrl + Y: Redo

Language Switching:
• Alt + 1: HTML
• Alt + 2: CSS  
• Alt + 3: JavaScript
• Alt + 4: Python
• Alt + Left/Right: Cycle languages

Quick Blocks (Shift + Key):
• T: Text block
• N: Number block
• P: Print block
• I: If block
• R: Repeat block
• V: Variable block
• F: Function block
• L: For loop
• W: While loop

Help:
• F1 or Ctrl + /: Show this help
  `;
  
  alert(helpText);
}