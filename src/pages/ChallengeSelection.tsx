
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { challenges as baseChallenges, ChallengeService } from "../services/challengeService";
import ChallengeCard from '../components/ChallengeCard';

// Import a shared style if available, or use utility classes
// import '../styles/ChallengeSelection.css';

const ChallengeSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [challengeList, setChallengeList] = useState(baseChallenges);

  useEffect(() => {
    // TODO: Replace with actual user id from auth context if available
    const userId = localStorage.getItem('user_id') || 'demo-user';
    ChallengeService.getChallengesWithProgress(userId).then((list) => {
      setChallengeList(list);
    });
  }, [location]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-yellow-50 to-yellow-200 dark:from-zinc-900 dark:to-zinc-900 flex flex-col">
      <section className="challenge-selection-container mx-auto max-w-5xl p-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg mt-10 mb-10 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
        <h2 className="text-3xl font-bold mb-8 text-primary text-center tracking-tight">Select a Challenge</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {challengeList.map((challenge, idx) => (
            <ChallengeCard
              key={challenge.id || idx}
              {...(challenge as any)}
              isCompleted={typeof challenge.isCompleted === 'boolean' ? challenge.isCompleted : false}
              isLocked={typeof challenge.isLocked === 'boolean' ? challenge.isLocked : false}
              progress={typeof challenge.progress === 'number' ? challenge.progress : 0}
              onClick={() => navigate(`/blockly/${challenge.id}`)}
            />
          ))}
        </div>
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary to-cyan-400 hover:from-cyan-400 hover:to-primary text-white font-semibold px-8 py-2 rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            ← Back to Home
          </button>
        </div>
      </section>
    </div>
  );
}

export default ChallengeSelection;
