import { useNavigate } from 'react-router-dom';
import { challenges } from "../services/challengeService";

const ChallengeSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="challenge-selection-container" style={{
      maxWidth: 600,
      margin: '2rem auto',
      padding: '2rem',
      background: 'var(--background, #fff)',
      borderRadius: '16px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    }}>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: 'var(--primary, #2196f3)'
      }}>Select a Challenge</h2>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'transparent',
        marginBottom: '1rem',
      }}>
        <thead>
          <tr style={{ background: 'var(--primary-light, #e3f2fd)' }}>
            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: 600, color: '#333', borderBottom: '2px solid #2196f3' }}>Title</th>
            <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 600, color: '#333', borderBottom: '2px solid #2196f3' }}>Difficulty</th>
            <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 600, color: '#333', borderBottom: '2px solid #2196f3' }}>XP</th>
            <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 600, color: '#333', borderBottom: '2px solid #2196f3' }}>Estimated Time</th>
            <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: 600, color: '#333', borderBottom: '2px solid #2196f3' }}>Start</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge, idx) => (
            <tr key={challenge.id} style={{ background: idx % 2 === 0 ? '#f7fafd' : '#fff' }}>
              <td style={{ padding: '0.75rem', fontSize: '1rem', color: '#222' }}>{challenge.title}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '1rem', color: '#222' }}>{challenge.difficulty}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '1rem', color: '#222' }}>{challenge.xpReward}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '1rem', color: '#222' }}>{challenge.estimatedTime}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <button
                  onClick={() => navigate(`/blockly/${challenge.id}`)}
                  style={{
                    background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1.25rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(33,150,243,0.08)',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #21cbf3 0%, #2196f3 100%)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)')}
                >
                  Start
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1.5rem',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(33,150,243,0.08)',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #21cbf3 0%, #2196f3 100%)')}
          onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)')}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default ChallengeSelection;
