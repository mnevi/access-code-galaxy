import React from "react";
import BlocklyWorkspace from "../components/blockly/BlocklyWorkspace.jsx";

const Challenge: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <h2 className="text-3xl font-bold mb-6">Coding Challenge</h2>
      <div className="w-full max-w-5xl shadow-lg rounded-xl bg-white p-6">
        <BlocklyWorkspace />
      </div>
    </div>
  );
};

export default Challenge;
