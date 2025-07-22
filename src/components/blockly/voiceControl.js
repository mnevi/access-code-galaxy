// Voice Control Implementation for Blockly Workspace
let recognition = null;
let isListening = false;
let workspace = null;
let utils = null;

// Voice commands mapping
const voiceCommands = {
  // Navigation commands
  'zoom in': () => workspace && workspace.zoomCenter(1),
  'zoom out': () => workspace && workspace.zoomCenter(-1),
  'center workspace': () => workspace && workspace.scrollCenter(),
  'clear workspace': () => workspace && workspace.clear(),
  
  // Block creation commands
  'add text block': () => createBlock('text'),
  'add number block': () => createBlock('math_number'),
  'add variable block': () => createBlock('variables_get'),
  'add print block': () => createBlock('text_print'),
  'add if block': () => createBlock('controls_if'),
  'add repeat block': () => createBlock('controls_repeat_ext'),
  'add function block': () => createBlock('procedures_defnoreturn'),
  
  // HTML blocks
  'add heading block': () => createBlock('html_heading'),
  'add paragraph block': () => createBlock('html_paragraph'),
  'add image block': () => createBlock('html_image'),
  'add link block': () => createBlock('html_link'),
  
  // Python blocks
  'add for loop': () => createBlock('controls_for'),
  'add while loop': () => createBlock('controls_whileUntil'),
  'add list block': () => createBlock('lists_create_with'),
  
  // JavaScript blocks
  'add alert block': () => createBlock('js_alert'),
  'add console log': () => createBlock('js_console_log'),
  
  // Workspace actions
  'undo': () => workspace && workspace.undo(),
  'redo': () => workspace && workspace.redo(),
  'run code': () => document.querySelector('.run-btn')?.click(),
  'clear code': () => document.querySelector('.clear-btn')?.click(),
  
  // Language switching
  'switch to python': () => switchLanguage('python'),
  'switch to javascript': () => switchLanguage('javascript'),
  'switch to html': () => switchLanguage('html'),
  'switch to css': () => switchLanguage('css'),
};

function createBlock(blockType) {
  if (!workspace) return;
  
  try {
    const block = workspace.newBlock(blockType);
    if (block) {
      block.initSvg();
      block.render();
      // Position the block in the center of the visible area
      const metrics = workspace.getMetrics();
      block.moveBy(metrics.viewLeft + 50, metrics.viewTop + 50);
      
      // Announce block creation
      announceToScreenReader(`Created ${blockType.replace(/_/g, ' ')} block`);
    }
  } catch (error) {
    console.warn(`Could not create block type: ${blockType}`, error);
    announceToScreenReader(`Could not create ${blockType.replace(/_/g, ' ')} block`);
  }
}

function switchLanguage(language) {
  const select = document.querySelector('.language-select');
  if (select) {
    select.value = language;
    select.dispatchEvent(new Event('change'));
    announceToScreenReader(`Switched to ${language}`);
  }
}

function announceToScreenReader(message) {
  // Create a live region for screen reader announcements
  let liveRegion = document.getElementById('voice-announcements');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'voice-announcements';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }
  
  liveRegion.textContent = message;
  
  // Also show visual feedback
  showVoiceFeedback(message);
}

function showVoiceFeedback(message) {
  // Create or update voice feedback element
  let feedback = document.getElementById('voice-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'voice-feedback';
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(feedback);
  }
  
  feedback.textContent = message;
  feedback.style.opacity = '1';
  
  // Hide after 3 seconds
  setTimeout(() => {
    feedback.style.opacity = '0';
  }, 3000);
}

export function initializeVoiceRecognition(workspaceInstance, blocklyUtils) {
  workspace = workspaceInstance;
  utils = blocklyUtils;
  
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn('Speech recognition not supported in this browser');
    announceToScreenReader('Voice commands not available in this browser');
    return false;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  recognition.onstart = () => {
    isListening = true;
    announceToScreenReader('Voice commands activated');
    showVoiceFeedback('🎤 Listening for voice commands...');
  };
  
  recognition.onend = () => {
    isListening = false;
    showVoiceFeedback('Voice commands deactivated');
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    announceToScreenReader(`Voice recognition error: ${event.error}`);
    showVoiceFeedback(`❌ Voice error: ${event.error}`);
  };
  
  recognition.onresult = (event) => {
    const lastResultIndex = event.results.length - 1;
    const transcript = event.results[lastResultIndex][0].transcript.toLowerCase().trim();
    
    console.log('Voice command received:', transcript);
    
    // Find and execute matching command
    const command = Object.keys(voiceCommands).find(cmd => 
      transcript.includes(cmd) || cmd.includes(transcript)
    );
    
    if (command) {
      try {
        voiceCommands[command]();
        announceToScreenReader(`Executed: ${command}`);
        showVoiceFeedback(`✅ ${command}`);
      } catch (error) {
        console.error('Error executing voice command:', error);
        announceToScreenReader(`Error executing command: ${command}`);
        showVoiceFeedback(`❌ Error: ${command}`);
      }
    } else {
      announceToScreenReader(`Command not recognized: ${transcript}`);
      showVoiceFeedback(`❓ Unknown: ${transcript}`);
    }
  };
  
  return true;
}

export function toggleVoiceRecognition() {
  if (!recognition) {
    announceToScreenReader('Voice recognition not initialized');
    return false;
  }
  
  if (isListening) {
    recognition.stop();
    return false;
  } else {
    try {
      recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      announceToScreenReader('Could not start voice recognition');
      return false;
    }
  }
}

export function isVoiceActive() {
  return isListening;
}

export function getAvailableCommands() {
  return Object.keys(voiceCommands);
}

// Cleanup function
export function cleanup() {
  if (recognition && isListening) {
    recognition.stop();
  }
  
  // Remove feedback elements
  const feedback = document.getElementById('voice-feedback');
  const announcements = document.getElementById('voice-announcements');
  
  if (feedback) feedback.remove();
  if (announcements) announcements.remove();
  
  recognition = null;
  workspace = null;
  utils = null;
  isListening = false;
}
