import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
import * as BlocklyPython from 'blockly/python';
import * as BlocklyJavaScript from 'blockly/javascript';
import './BlocklyWorkspace.css';
import * as BlocklyUtils from './blocklyUtils';
import { initializeVoiceRecognition, toggleVoiceRecognition, isVoiceActive, cleanup } from './voiceControl.jsx';
import { useChallengeProgress } from '../../hooks/useChallengeProgress';
import { ChallengeService } from '../../services/challengeService';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import AccessibilityControls from './AccessibilityControls';
import VoiceCommands from './VoiceCommands';
import { useScreenReader } from '../../hooks/useScreenReader';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useHapticFeedback, useAccessibilityHaptics } from '../../hooks/useHapticFeedback';
import { useAudioDescriptions } from '../../hooks/useAudioDescriptions';
import { useParams } from 'react-router-dom';

// challenge parameters
import { challenges } from "../../services/challengeService";

const BlocklyWorkspace = () => {

  // load challenge data
  const { challengeId } = useParams();
  const challenge = Array.isArray(challenges)
    ? challenges.find(c => c.id === challengeId)
    : challenges[challengeId];

  const blocklyDiv = useRef(null);
  const { currentProgress, isCompleted, isEvaluating, evaluateWorkspace } = useChallengeProgress(challengeId);
  const { currentMode, features } = useAccessibility();
  // Define the toolbox XML as a string
  const toolboxXml = `
    <xml>
      <category name="Control" colour="#5C81A6">
        <block type="controls_repeat">
          <value name="TIMES">
            <shadow type="math_number"><field name="NUM">5</field></shadow>
          </value>
        </block>
        <block type="controls_whileUntil" />
        <block type="controls_for">
          <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
          <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
          <value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
        </block>
        <block type="controls_if" />
        <block type="controls_ifelse" />
      </category>
      <category name="Text" colour="#5CA68D">
        <block type="text_print" />
        <block type="text" />
        <block type="text_join" />
        <block type="text_length" />
        <block type="text_prompt_ext" />
      </category>
      <category name="Math" colour="#8E5CA6">
        <block type="math_number" />
        <block type="math_arithmetic" />
        <block type="math_single" />
        <block type="math_random_int">
          <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
          <value name="TO"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
        </block>
        <block type="math_round" />
      </category>
      <category name="Logic" colour="#A65C81">
        <block type="logic_compare" />
        <block type="logic_operation" />
        <block type="logic_boolean" />
        <block type="logic_ternary" />
        <block type="logic_null" />
      </category>
      <category name="Variables" colour="#A68E5C" custom="VARIABLE" />
      <category name="Functions" colour="#9b59b6" custom="PROCEDURE" />
      <category name="Lists" colour="#e74c3c">
        <block type="lists_create_with" />
        <block type="lists_length" />
        <block type="lists_isEmpty" />
        <block type="lists_indexOf" />
      </category>
    </xml>
  `;
  const workspaceRef = useRef(null);

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  // const [challenge, setChallenge] = useState(null);
  // ^ not used anymore with dynamic challenges
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const languageRef = useRef(language);
  
  // Initialize accessibility hooks
  const screenReader = useScreenReader({
    enabled: features.screenReader || false,
    announceBlockChanges: true,
    announceWorkspaceChanges: true,
    announceProgress: true
  });
  
  const hapticFeedback = useAccessibilityHaptics(features.tactileFeedback || false);
  
  const audioDescriptions = useAudioDescriptions({
    enabled: (features.audioDescriptions || false) && isAudioEnabled,
    rate: 1,
    pitch: 1,
    volume: 0.8
  });

  const handleAudioToggle = (enabled) => {
    setIsAudioEnabled(enabled);
    if (!enabled) {
      // Stop any ongoing speech when audio is disabled
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  };
  
  const languages = ['python', 'javascript', 'lua', 'php', 'dart'];
  const currentLangIndex = languages.indexOf(language);

  const languageNames = {
    python: 'Python',
    javascript: 'JavaScript',
    lua: 'Lua',
    php: 'PHP',
    dart: 'Dart',
  };

  const commentStyles = {
    python: '#',
    javascript: '//',
    lua: '--',
    php: '//',
    dart: '//',
  };

  const handleRun = async () => {
    hapticFeedback.onUIInteraction('button');

    if (
      code.includes('No blocks in workspace') ||
      code.includes('Workspace cleared') ||
      code.trim() === ''
    ) {
      const errorMsg = 'Please create some blocks before running';
      alert(errorMsg);
      screenReader.announceError('No blocks to run');
      audioDescriptions.describeError('No blocks to run');
      hapticFeedback.onWorkspaceAction('error');
      return;
    }

    // Get current blocks in workspace for block count validation
    const blocks = workspaceRef.current ? workspaceRef.current.getAllBlocks(false) : [];
    if (challenge && challengeId !== 'freeplay' && blocks.length > challenge.maxBlocks) {
      const errorMsg = `You used too many blocks! Limit: ${challenge.maxBlocks}, Used: ${blocks.length}`;
      alert(errorMsg);
      return;
    }

    setOutput('Running...');
    screenReader.announce('Running code');
    audioDescriptions.speak('Running code', 'medium');
    hapticFeedback.onWorkspaceAction('run');

    try {
      const response = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      setOutput(data.output);

      // if freeplay mode, skip challenge validation
      if (challengeId === 'freeplay' || !challenge || challenge.goalOutput === null) {
        return;
      }

      // challenge mode: check correctness seperately
      const normalize = (s) => s.replace(/\r\n/g, '\n').trim();
      const actual = normalize(data.output);
      const expected = normalize(challenge.goalOutput);

      if (actual === expected) {
        screenReader.announceSuccess('Code executed successfully');
        audioDescriptions.describeSuccess('Code executed successfully');
      }
      else {
        screenReader.announceSuccess(`Output did not match. \n\nExpected:\n${expected}\n\nGot:\n${actual}`);
        audioDescriptions.describeSuccess(`Output did not match. \n\nExpected:\n${expected}\n\nGot:\n${actual}`);
      }
    } catch (err) {
      const errorMsg = `Error: ${err.message}`;
      setOutput(errorMsg);
      screenReader.announceError(`Execution error: ${err.message}`);
      audioDescriptions.describeError(`Execution error: ${err.message}`);
      hapticFeedback.onWorkspaceAction('error');
    }
  };

  const handleClear = () => {
    hapticFeedback.onUIInteraction('button');
    
    if (window.confirm('Clear all blocks?')) {
      workspaceRef.current.clear();
      setCode(`${commentStyles[language]} Workspace cleared\n${commentStyles[language]} Drag blocks to get started`);
      setOutput('');
      screenReader.announceWorkspaceAction('cleared');
      audioDescriptions.describeWorkspace(workspaceRef.current);
      hapticFeedback.onWorkspaceAction('clear');
    }
  };
  
  const switchLanguage = (direction) => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentLangIndex + 1) % languages.length;
    } else {
      newIndex = currentLangIndex === 0 ? languages.length - 1 : currentLangIndex - 1;
    }
    const newLanguage = languages[newIndex];
    setLanguage(newLanguage);
    generateCode(newLanguage);
    screenReader.announce(`Switched to ${languageNames[newLanguage]}`);
    audioDescriptions.describeLanguageChange(languageNames[newLanguage]);
    hapticFeedback.onUIInteraction('switch');
  };

  // detailed debugging if challenge not found
  if (!challenge) {
    const availableIds = Array.isArray(challenges)
      ? challenges.map(c => c.id)
      : Object.keys(challenges);
    console.error('[BlocklyWorkspace] Challenge not found:', {
      challengeId,
      availableIds,
      challenges,
      location: window.location.pathname,
    });
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <div>Challenge not found: <b>{challengeId}</b></div>
        <div style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#555' }}>
          <div><b>Available challenge IDs:</b> {availableIds.join(', ')}</div>
          <div><b>Current URL:</b> {window.location.pathname}</div>
          <div><b>Debug:</b> See browser console for details.</div>
        </div>
      </div>
    );
  }
  
  useKeyboardNavigation({
    enabled: features.keyboardNavigation || false,
    workspace: workspaceRef.current,
    onRun: handleRun,
    onClear: handleClear,
    onLanguageChange: switchLanguage
  });


  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    function handleResize() {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    }

    if (blocklyDiv.current && !workspaceRef.current) {
      // Configure workspace options - using only built-in options
      const workspaceOptions = {
        toolbox: toolboxXml,
        scrollbars: true,
        trashcan: true,
        move: {
          scrollbars: true,
          drag: true,
          wheel: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: features.largeText ? 1.2 : 1.0,
          maxScale: features.largeText ? 3.0 : 2.0,
          minScale: 0.5,
          scaleSpeed: 1.2,
        },
        // Remove custom theme and renderer that don't exist
        sounds: features.audioDescriptions || false,
        grid: {
          spacing: features.largeText ? 30 : 20,
          length: 3,
          colour: features.highContrast ? '#ffffff' : '#ccc',
          snap: true,
        },
      };

      workspaceRef.current = Blockly.inject(blocklyDiv.current, workspaceOptions);

      window.blocklyWorkspace = workspaceRef.current;
      window.BlocklyUtils = BlocklyUtils;
      
      // Initialize voice recognition if enabled
      if (features.voiceCommands) {
        const voiceInitialized = initializeVoiceRecognition(workspaceRef.current, BlocklyUtils);
        if (voiceInitialized) {
          screenReader.announce('Voice commands available');
        }
      }

      workspaceRef.current.addChangeListener((event) => {
        generateCode(languageRef.current);
        
        // Provide accessibility feedback for block changes
        if (event.type === Blockly.Events.BLOCK_CREATE) {
          screenReader.announceBlockAction('Created', event.blockType || 'block');
          hapticFeedback.onBlockInteraction('create');
          if (features.audioDescriptions) {
            const block = workspaceRef.current.getBlockById(event.blockId);
            if (block) {
              audioDescriptions.describeBlock(block);
            }
          }
        } else if (event.type === Blockly.Events.BLOCK_DELETE) {
          screenReader.announceBlockAction('Deleted', event.blockType || 'block');
          hapticFeedback.onBlockInteraction('delete');
        } else if (event.type === Blockly.Events.BLOCK_MOVE && event.newParentId) {
          screenReader.announceBlockAction('Connected', event.blockType || 'block');
          hapticFeedback.onBlockInteraction('connect');
        }
        
        // Debounce evaluation to avoid too many calls
        clearTimeout(window.evaluationTimeout);
        window.evaluationTimeout = setTimeout(() => {
          evaluateWorkspace(workspaceRef.current);
        }, 1000);
      });

      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
        window.blocklyWorkspace = null;
        window.BlocklyUtils = null;
      }
      // Cleanup voice recognition
      cleanup();
    };
  }, []);

  const generateCode = (lang) => {
    if (!workspaceRef.current) return;

const generators = {
  python: BlocklyPython.pythonGenerator,
  javascript: BlocklyJavaScript.javascriptGenerator,
  lua: window.Lua || window.Blockly?.Lua,
  php: window.PHP || window.Blockly?.PHP,
  dart: window.Dart || window.Blockly?.Dart,
};

    const generator = generators[lang];
    if (!generator) {
      setCode(`${commentStyles[lang]} Code generator for "${lang}" not loaded.`);
      return;
    }

    const blocks = workspaceRef.current.getAllBlocks(false);
    if (blocks.length === 0) {
      setCode(`${commentStyles[lang]} No blocks in workspace\n${commentStyles[lang]} Drag blocks to get started`);
      return;
    }

    try {
      const generatedCode = generator.workspaceToCode(workspaceRef.current);
      setCode(generatedCode);
    } catch (error) {
      setCode(`${commentStyles[lang]} Error generating code:\n${commentStyles[lang]} ${error.message}`);
    }
  };

  // Function to place a block via voice command
  const placeBlockViaVoice = useCallback((blockType) => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    try {
      // Create the block
      const block = workspace.newBlock(blockType);
      
      // Position the block in the center of the workspace
      const metrics = workspace.getMetrics();
      const x = metrics.viewLeft + (metrics.viewWidth / 2) - 100;
      const y = metrics.viewTop + (metrics.viewHeight / 2) - 50;
      
      block.moveBy(x, y);
      block.initSvg();
      block.render();
      
      // Generate code after placing block
      generateCode(language);
      
      // Provide accessibility feedback
      if (features.screenReader) {
        screenReader.announceBlockCreated(blockType);
      }
      if (features.audioDescriptions && isAudioEnabled) {
        audioDescriptions.speak(`Placed ${blockType} block`, 'medium');
      }
      if (features.tactileFeedback) {
        hapticFeedback.onBlockAction('create');
      }
      
      console.log(`Voice command placed block: ${blockType}`);
      
    } catch (error) {
      console.error('Error placing block via voice:', error);
      if (features.audioDescriptions && isAudioEnabled) {
        audioDescriptions.describeError('Failed to place block');
      }
    }
  }, [language, features, screenReader, audioDescriptions, isAudioEnabled, hapticFeedback]);


  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    generateCode(newLang);
    screenReader.announce(`Switched to ${languageNames[newLang]}`);
    audioDescriptions.describeLanguageChange(languageNames[newLang]);
    hapticFeedback.onUIInteraction('switch');
  };
  
  const handleVoiceToggle = () => {
    if (!features.voiceCommands) return;
    
    const newVoiceState = toggleVoiceRecognition();
    setIsVoiceEnabled(newVoiceState);
    
    if (newVoiceState) {
      screenReader.announce('Voice commands activated');
      audioDescriptions.speak('Voice commands activated', 'high');
    } else {
      screenReader.announce('Voice commands deactivated');
      audioDescriptions.speak('Voice commands deactivated', 'medium');
    }
    hapticFeedback.onUIInteraction('switch');
  };
  
  
  // Provide audio description of challenge when component loads
  useEffect(() => {
    if (challenge && features.audioDescriptions && isAudioEnabled) {
      setTimeout(() => {
        audioDescriptions.describeChallenge(challenge, currentProgress);
      }, 1000);
    }
  }, [challenge, features.audioDescriptions, audioDescriptions, currentProgress, isAudioEnabled]);
  
  // Announce progress changes
  useEffect(() => {
    if (features.screenReader && currentProgress > 0) {
      screenReader.announceProgress(currentProgress, challenge?.title);
    }
    if (features.audioDescriptions && isAudioEnabled) {
      audioDescriptions.describeProgress(currentProgress, isCompleted);
    }
    if (features.tactileFeedback) {
      hapticFeedback.onProgressUpdate(isCompleted, currentProgress % 25 === 0 && currentProgress > 0);
    }
  }, [currentProgress, isCompleted, features, screenReader, audioDescriptions, hapticFeedback, challenge, isAudioEnabled]);

  return (
      <div className={`container ${currentMode ? `mode-${currentMode.id}` : ''} ${features.reducedMotion ? 'reduced-motion' : ''}`}>
        <div className="header">
          <div className="challenge-info">
            <h1>Blockly Accessibility Coding Platform</h1>
            {challengeId && (
              <div className="challenge-progress">
                <span>Challenge: {ChallengeService.getChallengeById(challengeId)?.title}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${currentProgress}%` }}
                  ></div>
                </div>
                <span>{Math.round(currentProgress)}% Complete</span>
                {isCompleted && <span className="completed-badge">✅ Completed!</span>}
              </div>
            )}
          </div>
          <AccessibilityControls 
            onVoiceToggle={handleVoiceToggle}
            isVoiceActive={isVoiceEnabled}
            onAudioToggle={handleAudioToggle}
            isAudioEnabled={isAudioEnabled}
          />
          <VoiceCommands 
            onPlaceBlock={placeBlockViaVoice}
            enabled={features.voiceCommands || currentMode?.id === 'motor'}
          />
          <div className="header-controls">
            <button
              className="clear-btn"
              style={{ background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)', marginRight: 8 }}
              onClick={() => window.location.href = '/'}
            >
              ← Go Back
            </button>
            <select value={language} onChange={handleLanguageChange} className="language-select">
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="lua">Lua</option>
              <option value="php">PHP</option>
              <option value="dart">Dart</option>
            </select>
            <button onClick={handleRun} className="run-btn">Run</button>
            <button onClick={handleClear} className="clear-btn">Clear</button>
            {/* Voice button only shows if not using accessibility controls and not in neurodivergent mode */}
            {!features.voiceCommands && currentMode?.id !== 'motor' && currentMode?.id !== 'neurodivergent' && (
              <button
                  onClick={handleVoiceToggle}
                  className="voice-btn"
              >
                Voice Mode <span className="voice-icon">{isVoiceEnabled ? '✅' : '❌'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="content">
          <div className={`workspace-panel ${features.simplifiedUI ? 'simplified' : ''}`}>
            <div className="workspace-header">Blockly Workspace</div>
            <div className="blockly-container">
              <div ref={blocklyDiv} id="blocklyDiv"></div>
            </div>
          </div>

          <div className={`output-panel ${features.largeText ? 'large-text' : ''}`}>
            <div className="output-header">
              <span>Generated Code</span>
              <span className="status">{languageNames[language]}</span>
            </div>
            <textarea 
              readOnly 
              value={code} 
              id="codeOutput" 
              rows="10"
              style={{ fontSize: features.largeText ? '18px' : '14px' }}
              aria-live={features.screenReader ? 'polite' : 'off'}
            ></textarea>

            <div className="output-header output">
              <span>Program Output</span>
            </div>
            <textarea 
              readOnly 
              value={output} 
              id="programOutput" 
              rows="6"
              style={{ fontSize: features.largeText ? '18px' : '14px' }}
              aria-live={features.screenReader ? 'assertive' : 'off'}
            ></textarea>
          </div>
        </div>

        {/* Toolbox XML is now passed directly to Blockly.inject, not rendered as JSX */}
      </div>
  );
};

export default BlocklyWorkspace;
