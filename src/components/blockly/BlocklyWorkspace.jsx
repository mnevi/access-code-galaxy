import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import * as BlocklyPython from 'blockly/python';
import * as BlocklyJavaScript from 'blockly/javascript';
import './BlocklyWorkspace.css';
import * as BlocklyUtils from './blocklyUtils';
import { toggleVoiceRecognition } from './voiceControl';
import { useChallengeProgress } from '../../hooks/useChallengeProgress';
import { ChallengeService } from '../../services/challengeService';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import AccessibilityControls from './AccessibilityControls';


const BlocklyWorkspace = ({ challengeId = 'html-basics' }) => {
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
  const [isVoiceOn, setIsVoiceOn] = useState(false);
  const languageRef = useRef(language);

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

      workspaceRef.current.addChangeListener(() => {
        generateCode(languageRef.current);
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

  const handleRun = async () => {
    if (
        code.includes('No blocks in workspace') ||
        code.includes('Workspace cleared') ||
        code.trim() === ''
    ) {
      alert('Please create some blocks before running');
      return;
    }

    setOutput('Running...');

    try {
      const response = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      setOutput(data.output);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all blocks?')) {
      workspaceRef.current.clear();
      setCode(`${commentStyles[language]} Workspace cleared\n${commentStyles[language]} Drag blocks to get started`);
      setOutput('');
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    generateCode(newLang);
  };

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
            onVoiceToggle={() => {
              toggleVoiceRecognition(window.blocklyWorkspace, window.BlocklyUtils);
              setIsVoiceOn(!isVoiceOn);
            }}
            isVoiceActive={isVoiceOn}
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
            {/* Voice button only shows if not using accessibility controls */}
            {!features.voiceCommands && (
              <button
                  onClick={() => {
                    toggleVoiceRecognition(window.blocklyWorkspace, window.BlocklyUtils);
                    setIsVoiceOn(!isVoiceOn);
                  }}
                  className="voice-btn"
              >
                Voice Mode <span className="voice-icon">{isVoiceOn ? '✅' : '❌'}</span>
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
