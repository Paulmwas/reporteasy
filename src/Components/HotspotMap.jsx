const HotspotMap = ({ hotspots }) => {
  // This is a placeholder - in a real app you'd use a mapping library like Leaflet or Google Maps
  return (
    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-500 mb-2">Hotspot Map</div>
        <div className="text-xs text-gray-400">
          {hotspots?.length || 0} hotspots detected
        </div>
      </div>
    </div>
  );
};

export default HotspotMap;