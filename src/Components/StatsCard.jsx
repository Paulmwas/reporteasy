const StatsCard = ({ title, value, change, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value || '0'}</p>
          <p className="text-green-500 text-xs mt-2">{change}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full text-green-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;