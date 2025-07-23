// Register all custom block definitions with the provided Blockly instance
export function registerCustomBlocks(Blockly) {
  // Text blocks
  Blockly.Blocks['text'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldTextInput(""), "TEXT");
      this.setOutput(true, "String");
      // Allow text blocks to be used as statements as well (optional)
      // this.setPreviousStatement(true, null);
      // this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Text value");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['text_print'] = {
    init: function() {
      this.appendValueInput("TEXT")
          .setCheck("String")
          .appendField("print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Prints text to the console.");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['text_join'] = {
    init: function() {
      this.appendValueInput("A").setCheck("String");
      this.appendValueInput("B").setCheck("String");
      this.setOutput(true, "String");
      this.setColour(160);
      this.setTooltip("Join two pieces of text together");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['text_length'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck("String");
      this.setOutput(true, "Number");
      this.setColour(160);
      this.setTooltip("Length of text");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['text_prompt_ext'] = {
    init: function() {
      this.appendDummyInput().appendField("prompt user for input");
      this.setOutput(true, "String");
      this.setColour(160);
      this.setTooltip("Prompt user for input");
      this.setHelpUrl("");
    }
  };

  // Math blocks
  Blockly.Blocks['math_number'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldNumber(0), "NUM");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Number value");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['math_arithmetic'] = {
    init: function() {
      this.appendValueInput("A").setCheck("Number");
      this.appendValueInput("B").setCheck("Number");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Basic arithmetic operations");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['math_single'] = {
    init: function() {
      this.appendValueInput("NUM").setCheck("Number");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Single-operand math functions");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['math_random_int'] = {
    init: function() {
      this.appendValueInput("FROM").setCheck("Number");
      this.appendValueInput("TO").setCheck("Number");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Random integer between two values");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['math_round'] = {
    init: function() {
      this.appendValueInput("NUM").setCheck("Number");
      this.setOutput(true, "Number");
      this.setColour(230);
      this.setTooltip("Round a number");
      this.setHelpUrl("");
    }
  };

  // Logic blocks
  Blockly.Blocks['logic_compare'] = {
    init: function() {
      this.appendValueInput("A").setCheck("Number");
      this.appendValueInput("B").setCheck("Number");
      this.setOutput(true, "Boolean");
      this.setColour(210);
      this.setTooltip("Comparison");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['logic_operation'] = {
    init: function() {
      this.appendValueInput("A").setCheck("Boolean");
      this.appendValueInput("B").setCheck("Boolean");
      this.setOutput(true, "Boolean");
      this.setColour(210);
      this.setTooltip("Logic operation");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['logic_boolean'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([["true", "TRUE"], ["false", "FALSE"]]), "BOOL");
      this.setOutput(true, "Boolean");
      this.setColour(210);
      this.setTooltip("Boolean value");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['logic_ternary'] = {
    init: function() {
      this.appendValueInput("IF").setCheck("Boolean");
      this.appendValueInput("THEN");
      this.appendValueInput("ELSE");
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip("Ternary operator");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['logic_null'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("null");
      this.setOutput(true, null);
      this.setColour(210);
      this.setTooltip("Null value");
      this.setHelpUrl("");
    }
  };

  // List blocks
  Blockly.Blocks['lists_create_with'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("create list");
      this.setOutput(true, "Array");
      this.setColour(260);
      this.setTooltip("Create a list");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['lists_length'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck("Array");
      this.setOutput(true, "Number");
      this.setColour(260);
      this.setTooltip("List length");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['lists_isEmpty'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck("Array");
      this.setOutput(true, "Boolean");
      this.setColour(260);
      this.setTooltip("Is list empty");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['lists_indexOf'] = {
    init: function() {
      this.appendValueInput("VALUE").setCheck("Array");
      this.appendValueInput("FIND");
      this.setOutput(true, "Number");
      this.setColour(260);
      this.setTooltip("Find item in list");
      this.setHelpUrl("");
    }
  };

  // Control blocks (repeat, while, for, if, ifelse)
  Blockly.Blocks['controls_repeat'] = {
    init: function() {
      this.appendValueInput("TIMES").setCheck("Number");
      this.appendStatementInput("DO");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("Repeat n times");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['controls_whileUntil'] = {
    init: function() {
      this.appendValueInput("BOOL").setCheck("Boolean");
      this.appendStatementInput("DO");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("While/Until loop");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['controls_for'] = {
    init: function() {
      this.appendValueInput("FROM").setCheck("Number");
      this.appendValueInput("TO").setCheck("Number");
      this.appendValueInput("BY").setCheck("Number");
      this.appendStatementInput("DO");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("For loop");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['controls_if'] = {
    init: function() {
      this.appendValueInput("IF0").setCheck("Boolean");
      this.appendStatementInput("DO0");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("If statement");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['controls_ifelse'] = {
    init: function() {
      this.appendValueInput("IF0").setCheck("Boolean");
      this.appendStatementInput("DO0");
      this.appendStatementInput("ELSE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip("If/Else statement");
      this.setHelpUrl("");
    }
  };
}