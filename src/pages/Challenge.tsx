import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BlocklyWorkspace from "../components/blockly/BlocklyWorkspace.jsx";
import { ChallengeService } from "../services/challengeService";

const Challenge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('id') || 'html-basics';
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    const challengeData = ChallengeService.getChallengeById(challengeId);
    setChallenge(challengeData);
  }, [challengeId]);

  if (!challenge) {
    return <div className="flex justify-center items-center h-screen">Loading challenge...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-6xl shadow-lg rounded-xl bg-white p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
          <p className="text-gray-600 mb-2">{challenge.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Difficulty: {challenge.difficulty}</span>
            <span>Time: {challenge.estimatedTime}</span>
            <span>XP Reward: {challenge.xpReward}</span>
          </div>
        </div>
        <BlocklyWorkspace challengeId={challengeId} />
      </div>
    </div>
  );
};

export default Challenge;
