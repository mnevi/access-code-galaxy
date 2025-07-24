import { useNavigate } from 'react-router-dom';

interface Challenge {
  title: string;
  goalOutput: string;
  maxBlocks: number;
}

const challenges: Record<string, Challenge> = {
  printHelloFive: {
    title: "Print 'hello' five times",
    goalOutput: 'hello\nhello\nhello\nhello\nhello\n',
    maxBlocks: 3,
  },
  print123: {
    title: "Print 1 - 5 using only 3 blocks",
    goalOutput: '1\n2\n3\n4\n5\n',
    maxBlocks: 3,
  },
  prime100: {
    title: "Print the prime numbers from 2 - 100",
    goalOutput:
      '\n' +
      '2\\n3\\n5\\n7\\n11\\n13\\n17\\n19\\n23\\n29\\n31\\n37\\n41\\n43\\n47\\n53\\n59\\n61\\n67\\n71\\n73\\n79\\n83\\n89\\n97\\n',
    maxBlocks: 20,
  },
};

const ChallengeSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Select a Challenge</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Max Blocks</th>
            <th>Start</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(challenges).map(([id, { title, maxBlocks }]) => (
            <tr key={id}>
              <td>{title}</td>
              <td>{maxBlocks}</td>
              <td>
                <button onClick={() => navigate(`/blockly/${id}`)}>Go</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChallengeSelection;
