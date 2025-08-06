const ActivityFeed = () => {
  const activities = [
    { id: 1, action: 'New report submitted', time: 'Just now', type: 'report' },
    { id: 2, action: 'Issue marked as resolved', time: '5 mins ago', type: 'status' },
    { id: 3, action: 'New user registered', time: '1 hour ago', type: 'user' },
    { id: 4, action: 'Urgent report received', time: '2 hours ago', type: 'alert' },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'report': return '📋';
      case 'status': return '✅';
      case 'user': return '👤';
      case 'alert': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start">
          <div className="mr-3 mt-1">{getIcon(activity.type)}</div>
          <div>
            <p className="text-sm">{activity.action}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;