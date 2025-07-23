// Voice Control Implementation for Blockly Workspace
let recognition = null;
let isListening = false;
let workspace = null;
let utils = null;
let selectedBlock = null;
let highlightedBlocks = [];

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
  
  // Block selection commands
  'select first block': () => selectBlockByPosition('first'),
  'select last block': () => selectBlockByPosition('last'),
  'select next block': () => selectAdjacentBlock('next'),
  'select previous block': () => selectAdjacentBlock('previous'),
  'select block': () => selectBlockByType(),
  'deselect block': () => deselectBlock(),
  'select all blocks': () => selectAllBlocks(),
  
  // Block movement commands
  'move up': () => moveSelectedBlock(0, -50),
  'move down': () => moveSelectedBlock(0, 50),
  'move left': () => moveSelectedBlock(-50, 0),
  'move right': () => moveSelectedBlock(50, 0),
  'move block up': () => moveSelectedBlock(0, -50),
  'move block down': () => moveSelectedBlock(0, 50),
  'move block left': () => moveSelectedBlock(-50, 0),
  'move block right': () => moveSelectedBlock(50, 0),
  
  // Fine movement commands
  'nudge up': () => moveSelectedBlock(0, -10),
  'nudge down': () => moveSelectedBlock(0, 10),
  'nudge left': () => moveSelectedBlock(-10, 0),
  'nudge right': () => moveSelectedBlock(10, 0),
  
  // Block manipulation commands
  'delete selected block': () => deleteSelectedBlock(),
  'duplicate selected block': () => duplicateSelectedBlock(),
  'connect blocks': () => connectSelectedBlocks(),
  'disconnect block': () => disconnectSelectedBlock(),

  // Set value of selected block (text/number)
  // Matches: 'set block value to X' or 'set value to X'
  'set block value to': (transcript) => {
    const match = transcript.match(/set (?:block )?value to (.+)/);
    if (match && match[1]) {
      setSelectedBlockValue(match[1].trim());
    } else {
      announceToScreenReader('Please specify a value to set');
    }
  },
  'set value to': (transcript) => {
    const match = transcript.match(/set value to (.+)/);
    if (match && match[1]) {
      setSelectedBlockValue(match[1].trim());
    } else {
      announceToScreenReader('Please specify a value to set');
    }
  },
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

export function announceToScreenReader(message) {
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
      transcript.startsWith(cmd) || transcript.includes(cmd)
    );
    
    if (command) {
      try {
        // If the command expects the transcript (for value setting), pass it
        if (command === 'set block value to' || command === 'set value to') {
          voiceCommands[command](transcript);
        } else {
          voiceCommands[command]();
        }
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

// Block selection and manipulation functions
export function selectBlockByPosition(position) {
  if (!workspace) return;
  
  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) {
    announceToScreenReader('No blocks in workspace');
    return;
  }
  
  let blockToSelect;
  if (position === 'first') {
    blockToSelect = topBlocks[0];
  } else if (position === 'last') {
    blockToSelect = topBlocks[topBlocks.length - 1];
  }
  
  if (blockToSelect) {
    selectBlock(blockToSelect);
    announceToScreenReader(`Selected ${position} block: ${blockToSelect.type.replace(/_/g, ' ')}`);
  }
}

export function selectAdjacentBlock(direction) {
  if (!workspace) return;
  
  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) {
    announceToScreenReader('No blocks in workspace');
    return;
  }
  
  if (!selectedBlock) {
    // If no block selected, select first one
    selectBlockByPosition('first');
    return;
  }
  
  const currentIndex = topBlocks.indexOf(selectedBlock);
  if (currentIndex === -1) {
    selectBlockByPosition('first');
    return;
  }
  
  let newIndex;
  if (direction === 'next') {
    newIndex = (currentIndex + 1) % topBlocks.length;
  } else {
    newIndex = currentIndex === 0 ? topBlocks.length - 1 : currentIndex - 1;
  }
  
  selectBlock(topBlocks[newIndex]);
  announceToScreenReader(`Selected ${direction} block: ${topBlocks[newIndex].type.replace(/_/g, ' ')}`);
}

export function selectBlockByType() {
  if (!workspace) return;
  
  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) {
    announceToScreenReader('No blocks in workspace');
    return;
  }
  
  // If no block selected, select first one
  if (!selectedBlock) {
    selectBlockByPosition('first');
  } else {
    // Cycle through blocks of the same type
    const sameTypeBlocks = topBlocks.filter(block => block.type === selectedBlock.type);
    if (sameTypeBlocks.length > 1) {
      const currentIndex = sameTypeBlocks.indexOf(selectedBlock);
      const nextIndex = (currentIndex + 1) % sameTypeBlocks.length;
      selectBlock(sameTypeBlocks[nextIndex]);
      announceToScreenReader(`Selected next ${selectedBlock.type.replace(/_/g, ' ')} block`);
    }
  }
}

function selectBlock(block) {
  // For single block selection, clear previous highlights
  clearBlockHighlight();
  
  selectedBlock = block;
  
  // Add visual highlight
  highlightBlock(block);
  
  // Focus the block for keyboard navigation
  if (block.getSvgRoot) {
    const svgRoot = block.getSvgRoot();
    if (svgRoot) {
      svgRoot.setAttribute('stroke', '#ff0000');
      svgRoot.setAttribute('stroke-width', '3');
    }
  }
}

function highlightBlock(block) {
  if (block && block.getSvgRoot) {
    const svgRoot = block.getSvgRoot();
    if (svgRoot) {
      svgRoot.classList.add('voice-selected');
      highlightedBlocks.push(block);
    }
  }
}

function clearBlockHighlight() {
  highlightedBlocks.forEach(block => {
    if (block && block.getSvgRoot) {
      const svgRoot = block.getSvgRoot();
      if (svgRoot) {
        svgRoot.classList.remove('voice-selected');
        svgRoot.removeAttribute('stroke');
        svgRoot.removeAttribute('stroke-width');
      }
    }
  });
  highlightedBlocks = [];
}

export function deselectBlock() {
  if (selectedBlock) {
    clearBlockHighlight();
    selectedBlock = null;
    announceToScreenReader('Block deselected');
  } else {
    announceToScreenReader('No block selected');
  }
}

export function selectAllBlocks() {
  if (!workspace) return;
  
  const topBlocks = workspace.getTopBlocks(false);
  if (topBlocks.length === 0) {
    announceToScreenReader('No blocks in workspace');
    return;
  }
  
  clearBlockHighlight();
  topBlocks.forEach(block => highlightBlock(block));
  selectedBlock = topBlocks[0]; // Set first block as primary selection
  announceToScreenReader(`Selected all ${topBlocks.length} blocks`);
}

export function moveSelectedBlock(deltaX, deltaY) {
  if (!selectedBlock) {
    announceToScreenReader('No block selected to move');
    return;
  }
  
  try {
    selectedBlock.moveBy(deltaX, deltaY);
    
    // Get current position for feedback
    const xy = selectedBlock.getRelativeToSurfaceXY();
    announceToScreenReader(`Moved block to position ${Math.round(xy.x)}, ${Math.round(xy.y)}`);
    
    // Re-render the block
    selectedBlock.render();
  } catch (error) {
    announceToScreenReader('Could not move block');
    console.error('Error moving block:', error);
  }
}

export function deleteSelectedBlock() {
  if (!selectedBlock) {
    announceToScreenReader('No block selected to delete');
    return;
  }
  
  try {
    const blockType = selectedBlock.type;
    selectedBlock.dispose();
    selectedBlock = null;
    clearBlockHighlight();
    announceToScreenReader(`Deleted ${blockType.replace(/_/g, ' ')} block`);
  } catch (error) {
    announceToScreenReader('Could not delete block');
    console.error('Error deleting block:', error);
  }
}

export function duplicateSelectedBlock() {
  if (!selectedBlock) {
    announceToScreenReader('No block selected to duplicate');
    return;
  }
  
  try {
    // Create a new block of the same type
    const newBlock = workspace.newBlock(selectedBlock.type);
    newBlock.initSvg();
    newBlock.render();
    
    // Position it near the original block
    const originalXY = selectedBlock.getRelativeToSurfaceXY();
    newBlock.moveBy(originalXY.x + 50, originalXY.y + 50);
    
    // Select the new block
    selectBlock(newBlock);
    
    announceToScreenReader(`Duplicated ${selectedBlock.type.replace(/_/g, ' ')} block`);
  } catch (error) {
    announceToScreenReader('Could not duplicate block');
    console.error('Error duplicating block:', error);
  }
}

export function connectSelectedBlocks() {
  if (!workspace) return;
  
  // If we have multiple highlighted blocks, use those
  if (highlightedBlocks.length >= 2) {
    try {
      const [block1, block2] = highlightedBlocks;
      
      // Try to find compatible connections
      const connections1 = block1.getConnections_(false);
      const connections2 = block2.getConnections_(false);
      
      for (const conn1 of connections1) {
        for (const conn2 of connections2) {
          if (conn1.checkType_(conn2) && !conn1.isConnected() && !conn2.isConnected()) {
            conn1.connect(conn2);
            announceToScreenReader('Blocks connected successfully');
            return;
          }
        }
      }
      
      announceToScreenReader('Could not find compatible connection points between selected blocks');
    } catch (error) {
      announceToScreenReader('Error connecting selected blocks');
      console.error('Error connecting blocks:', error);
    }
    return;
  }
  
  // If we only have one selected block, try to connect it to nearby blocks
  if (selectedBlock) {
    try {
      const allBlocks = workspace.getTopBlocks(false);
      const nearbyBlocks = allBlocks.filter(block => 
        block !== selectedBlock && 
        isBlockNearby(selectedBlock, block, 100) // Within 100 pixels
      );
      
      if (nearbyBlocks.length === 0) {
        announceToScreenReader('No nearby blocks to connect to. Select multiple blocks first.');
        return;
      }
      
      // Try to connect to the nearest compatible block
      for (const nearbyBlock of nearbyBlocks) {
        const connections1 = selectedBlock.getConnections_(false);
        const connections2 = nearbyBlock.getConnections_(false);
        
        for (const conn1 of connections1) {
          for (const conn2 of connections2) {
            if (conn1.checkType_(conn2) && !conn1.isConnected() && !conn2.isConnected()) {
              conn1.connect(conn2);
              announceToScreenReader(`Connected to nearby ${nearbyBlock.type.replace(/_/g, ' ')} block`);
              return;
            }
          }
        }
      }
      
      announceToScreenReader('Could not find compatible connection points with nearby blocks');
    } catch (error) {
      announceToScreenReader('Error connecting to nearby blocks');
      console.error('Error connecting blocks:', error);
    }
  } else {
    announceToScreenReader('No blocks selected. Select blocks first to connect them.');
  }
}

export function disconnectSelectedBlock() {
  if (!selectedBlock) {
    announceToScreenReader('No block selected to disconnect');
    return;
  }
  
  try {
    const connections = selectedBlock.getConnections_(false);
    let disconnected = false;
    
    connections.forEach(conn => {
      if (conn.isConnected()) {
        conn.disconnect();
        disconnected = true;
      }
    });
    
    if (disconnected) {
      announceToScreenReader('Block disconnected');
    } else {
      announceToScreenReader('Block has no connections to disconnect');
    }
  } catch (error) {
    announceToScreenReader('Could not disconnect block');
    console.error('Error disconnecting block:', error);
  }
}

// Set the value of the selected block (text or number blocks only)
export function setSelectedBlockValue(value) {
  if (!selectedBlock) {
    announceToScreenReader('No block selected to set value');
    return;
  }
  // Text block
  if (selectedBlock.type === 'text') {
    selectedBlock.setFieldValue(String(value), 'TEXT');
    announceToScreenReader(`Set text block to: ${value}`);
  }
  // Number block
  else if (selectedBlock.type === 'math_number') {
    selectedBlock.setFieldValue(String(value), 'NUM');
    announceToScreenReader(`Set number block to: ${value}`);
  }
  else {
    announceToScreenReader('Selected block is not a text or number block');
  }
}

// Helper function to check if two blocks are nearby
function isBlockNearby(block1, block2, threshold = 100) {
  try {
    const pos1 = block1.getRelativeToSurfaceXY();
    const pos2 = block2.getRelativeToSurfaceXY();
    const distance = Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    );
    return distance <= threshold;
  } catch (error) {
    return false;
  }
}

// Add a function to select multiple blocks for connection
export function selectBlockForConnection() {
  if (!selectedBlock) {
    announceToScreenReader('No block selected to add to connection group');
    return;
  }
  
  // Add current selected block to highlighted blocks if not already there
  if (!highlightedBlocks.includes(selectedBlock)) {
    highlightBlock(selectedBlock);
    announceToScreenReader(`Added ${selectedBlock.type.replace(/_/g, ' ')} block to connection group. Total: ${highlightedBlocks.length}`);
  } else {
    announceToScreenReader('Block already in connection group');
  }
}

// Cleanup function
export function cleanup() {
  if (recognition && isListening) {
    recognition.stop();
  }
  
  // Clear block selection
  clearBlockHighlight();
  selectedBlock = null;
  
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
