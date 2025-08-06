const LeaderboardPreview = () => {
  const leaders = [
    { id: 1, name: 'Danny Liu', points: 1023, rank: 1 },
    { id: 2, name: 'Belin Deviant', points: 933, rank: 2 },
    { id: 3, name: 'Nataniel D.', points: 845, rank: 3 },
  ];

  return (
    <div className="space-y-3">
      {leaders.map((leader) => (
        <div key={leader.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
          <div className="flex items-center">
            <span className={`mr-3 text-sm ${
              leader.rank === 1 ? 'text-yellow-500' : 'text-gray-500'
            }`}>#{leader.rank}</span>
            <span>{leader.name}</span>
          </div>
          <span className="text-sm font-medium">{leader.points} pts</span>
        </div>
      ))}
      <div className="text-center mt-4">
        <button className="text-sm text-green-600 hover:underline">
          View Full Leaderboard →
        </button>
      </div>
    </div>
  );
};

export default LeaderboardPreview;