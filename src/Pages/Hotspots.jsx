import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

// Note: You'll need to install these dependencies:
// npm install leaflet react-leaflet
// For MapTiler: Sign up at maptiler.com and get your API key

const Hotspots = () => {
  const [hotspots, setHotspots] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [mapView, setMapView] = useState('satellite');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    riskLevel: '',
    minIncidents: 0,
    timeRange: '7d'
  });
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch hotspots data from your API
  const fetchHotspotsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗺️ Fetching hotspots data from API...');
      
      // Fetch both hotspots and insights data
      const [hotspotsData, insightsData] = await Promise.all([
        api.analytics.getHotspots(),
        api.analytics.getInsights()
      ]);
      
      console.log('✅ Hotspots Data from API:', hotspotsData);
      console.log('📊 Insights Data from API:', insightsData);
      
      // Handle different response structures
      let processedHotspots = [];
      if (Array.isArray(hotspotsData)) {
        processedHotspots = hotspotsData;
      } else if (hotspotsData && hotspotsData.hotspots) {
        processedHotspots = hotspotsData.hotspots;
      } else if (insightsData && insightsData.hotspots) {
        processedHotspots = insightsData.hotspots;
      }
      
      setHotspots(processedHotspots || []);
      setInsights(insightsData);
      
      // Initialize map after data is loaded
      if (processedHotspots.length > 0) {
        setTimeout(() => {
          initializeMap();
        }, 100);
      }
      
    } catch (err) {
      console.error('❌ Error fetching hotspots:', err);
      setError(err.message || 'Failed to load hotspots data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Leaflet map (will work once you install the dependencies)
  const initializeMap = useCallback(() => {
    // This will work once you install leaflet
    if (typeof window !== 'undefined' && window.L && mapRef.current && !mapInstanceRef.current) {
      console.log('🗺️ Initializing Leaflet map...');
      
      try {
        const map = window.L.map(mapRef.current, {
          center: [-1.2921, 36.8219], // Nairobi coordinates
          zoom: 12,
          zoomControl: true
        });

        // MapTiler layer (replace YOUR_MAPTILER_KEY with your actual key)
        const mapTilerKey = '6fhPA3lFtrMCflktkpc2'; // Get this from maptiler.com
        const tileLayer = window.L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${mapTilerKey}`, {
          attribution: '© MapTiler © OpenStreetMap contributors',
          maxZoom: 18
        });
        
        tileLayer.addTo(map);
        mapInstanceRef.current = map;

        // Add markers after map is initialized
        setTimeout(() => {
          updateMapMarkers();
        }, 500);

        console.log('✅ Map initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing map:', error);
      }
    }
  }, [hotspots]);

  // Update map markers with real data
  const updateMapMarkers = useCallback(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined' || !window.L) return;

    console.log('📍 Updating markers with hotspots:', hotspots);

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add markers for each hotspot
    hotspots.forEach((hotspot, index) => {
      if (!hotspot.coordinates || hotspot.coordinates.length !== 2) {
        console.warn(`⚠️ Invalid coordinates for hotspot: ${hotspot.location}`);
        return;
      }

      const [lat, lng] = hotspot.coordinates;
      const riskColor = getRiskColor(hotspot.riskLevel);
      const size = Math.max(20, Math.min(40, hotspot.incidents * 8));

      // Create custom marker
      const marker = window.L.circleMarker([lat, lng], {
        radius: size / 2,
        fillColor: riskColor,
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Add popup with hotspot details
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-[#111b21] mb-1">${hotspot.location}</h3>
          <p class="text-sm text-[#5e5e5e] mb-2">${hotspot.incidents} incidents</p>
          <span class="px-2 py-1 rounded text-xs font-semibold ${getRiskLevelClass(hotspot.riskLevel)}">
            ${hotspot.riskLevel} RISK
          </span>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click event
      marker.on('click', () => {
        setSelectedHotspot(hotspot);
      });

      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });

    console.log(`✅ Added ${markersRef.current.length} markers to map`);
  }, [hotspots]);

  // Helper functions
  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return '#dc2626';
      case 'MEDIUM': return '#ea580c';
      case 'LOW': return '#43cd66';
      default: return '#43cd66';
    }
  };

  const getRiskLevelClass = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredHotspots = () => {
    return hotspots.filter(hotspot => {
      if (filters.riskLevel && hotspot.riskLevel !== filters.riskLevel) return false;
      if (hotspot.incidents < filters.minIncidents) return false;
      return true;
    });
  };

  const testAPIConnection = async () => {
    try {
      console.log('🧪 Testing API Connection...');
      
      // Check token
      const token = localStorage.getItem('token');
      console.log('🔑 Current Token:', token ? `${token.substring(0, 20)}...` : 'No token found');
      
      if (!token) {
        console.log('🔐 No token found, attempting login...');
        const loginResponse = await api.auth.login({
          email: 'movineee@gmail.com',
          password: 'ocholamo1'
        });
        console.log('✅ Login successful:', loginResponse);
      }
      
      // Test endpoints
      const [hotspotsTest, insightsTest] = await Promise.all([
        api.analytics.getHotspots(),
        api.analytics.getInsights()
      ]);
      
      console.log('✅ Hotspots API Test:', hotspotsTest);
      console.log('✅ Insights API Test:', insightsTest);
      
      // Refresh data
      fetchHotspotsData();
      
    } catch (err) {
      console.error('❌ API Test Failed:', err);
    }
  };

  useEffect(() => {
    console.log('🚀 Hotspots component mounted');
    fetchHotspotsData();
  }, [fetchHotspotsData]);

  useEffect(() => {
    updateMapMarkers();
  }, [hotspots, updateMapMarkers]);

  const filteredHotspots = getFilteredHotspots();

  if (loading && hotspots.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111b21] via-[#1c1e21] to-[#000000] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Debug Panel */}
          <div className="mb-4 p-4 bg-[#43cd66]/10 border border-[#43cd66]/20 rounded-xl">
            <button 
              onClick={testAPIConnection}
              className="px-4 py-2 bg-[#43cd66]/20 text-[#43cd66] rounded-lg hover:bg-[#43cd66]/30 transition-all"
            >
              🧪 Test API Connection
            </button>
            <p className="text-[#43cd66] text-sm mt-2">Check browser console for detailed logs</p>
          </div>
          
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-[#5e5e5e]/30 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-[#1c1e21]/60 rounded-2xl"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(item => (
                  <div key={item} className="bg-[#1c1e21]/60 rounded-2xl p-6 border border-[#43cd66]/20">
                    <div className="h-4 bg-[#5e5e5e]/30 rounded w-32 mb-2"></div>
                    <div className="h-6 bg-[#5e5e5e]/30 rounded w-full mb-2"></div>
                    <div className="h-4 bg-[#5e5e5e]/30 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111b21] via-[#1c1e21] to-[#000000] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#43cd66]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#25d366]/20 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e6ffda] via-[#43cd66] to-[#25d366] bg-clip-text text-transparent mb-2">
                  Incident Hotspots
                </h1>
                <p className="text-[#5e5e5e] text-lg">
                  Real-time mapping of community incident hotspots • {hotspots.length} locations tracked
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={testAPIConnection}
                  className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all duration-300"
                >
                  🧪 Test API
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 bg-[#43cd66]/20 text-[#43cd66] rounded-xl hover:bg-[#43cd66]/30 transition-all duration-300"
                >
                  <i className="fas fa-filter mr-2"></i>
                  Filters
                </button>
                <button 
                  onClick={fetchHotspotsData}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#e6ffda] to-[#43cd66] text-[#111b21] rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
                >
                  <i className={`fas fa-sync-alt mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                  Refresh
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-[#1c1e21]/60 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select 
                    value={filters.riskLevel}
                    onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
                    className="bg-[#1c1e21]/60 border border-[#43cd66]/30 text-[#e6ffda] rounded-xl px-4 py-3 focus:outline-none focus:border-[#43cd66]/50 focus:ring-2 focus:ring-[#43cd66]/20"
                  >
                    <option value="">All Risk Levels</option>
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Min incidents..."
                    value={filters.minIncidents}
                    onChange={(e) => setFilters({...filters, minIncidents: parseInt(e.target.value) || 0})}
                    className="bg-[#1c1e21]/60 border border-[#43cd66]/30 text-[#e6ffda] rounded-xl px-4 py-3 focus:outline-none focus:border-[#43cd66]/50 focus:ring-2 focus:ring-[#43cd66]/20 placeholder-[#5e5e5e]"
                  />

                  <select 
                    value={filters.timeRange}
                    onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                    className="bg-[#1c1e21]/60 border border-[#43cd66]/30 text-[#e6ffda] rounded-xl px-4 py-3 focus:outline-none focus:border-[#43cd66]/50 focus:ring-2 focus:ring-[#43cd66]/20"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>

                  <button
                    onClick={() => setFilters({ riskLevel: '', minIncidents: 0, timeRange: '7d' })}
                    className="px-4 py-3 bg-[#5e5e5e]/20 text-[#5e5e5e] rounded-xl hover:bg-[#5e5e5e]/30 transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl mr-3"></i>
                <span className="text-red-300">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          <div className="mb-6 bg-[#111b2133] border border-[#5e5e5e]/30 rounded-2xl p-4">
            <h3 className="text-[#e6ffda] text-sm font-semibold mb-2">Debug Information:</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs text-[#5e5e5e]">
              <div>Hotspots Loaded: <span className="text-[#ffffff]">{hotspots.length}</span></div>
              <div>Filtered Results: <span className="text-[#ffffff]">{filteredHotspots.length}</span></div>
              <div>Loading: <span className="text-[#ffffff]">{loading ? 'Yes' : 'No'}</span></div>
              <div>Error: <span className="text-[#ffffff]">{error ? 'Yes' : 'No'}</span></div>
              <div>Token: <span className="text-[#ffffff]">{localStorage.getItem('token') ? 'Present' : 'Missing'}</span></div>
              <div>API Status: <span className="text-[#43cd66]">Ready</span></div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="bg-[#1c1e21]/60 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[#e6ffda]">Interactive Hotspots Map</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMapView('satellite')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        mapView === 'satellite' 
                          ? 'bg-[#43cd66]/20 text-[#43cd66]' 
                          : 'bg-[#5e5e5e]/20 text-[#5e5e5e] hover:bg-[#5e5e5e]/30'
                      }`}
                    >
                      Satellite
                    </button>
                    <button 
                      onClick={() => setMapView('street')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        mapView === 'street' 
                          ? 'bg-[#43cd66]/20 text-[#43cd66]' 
                          : 'bg-[#5e5e5e]/20 text-[#5e5e5e] hover:bg-[#5e5e5e]/30'
                      }`}
                    >
                      Street
                    </button>
                  </div>
                </div>
                
                {/* Map Container */}
                <div 
                  ref={mapRef} 
                  className="w-full h-96 bg-[#111b2166] rounded-xl border border-[#43cd66]/10 relative overflow-hidden"
                >
                  {/* Fallback content when map isn't loaded */}
                  <div className="absolute inset-0 flex items-center justify-center text-center text-[#5e5e5e]">
                    <div>
                      <i className="fas fa-map text-4xl mb-4 text-[#43cd66]/50"></i>
                      <p>Interactive Map Loading...</p>
                      <p className="text-sm mt-2">Showing {hotspots.length} hotspots from API</p>
                      {hotspots.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {hotspots.slice(0, 3).map((spot, idx) => (
                            <div key={idx} className="text-xs bg-[#1c1e21]/60 px-3 py-1 rounded">
                              {spot.location}: {spot.incidents} incidents
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Legend */}
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                    <span className="text-[#e6ffda]">High Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                    <span className="text-[#e6ffda]">Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#43cd66] rounded-full"></div>
                    <span className="text-[#e6ffda]">Low Risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotspots List */}
            <div className="space-y-4">
              <div className="bg-[#1c1e21]/60 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                <h2 className="text-xl font-semibold text-[#e6ffda] mb-4">Active Hotspots</h2>
                
                {filteredHotspots.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-map-marked-alt text-[#43cd66]/50 text-3xl mb-3"></i>
                    <p className="text-[#5e5e5e]">No hotspots found</p>
                    <button 
                      onClick={testAPIConnection}
                      className="mt-2 px-3 py-1 bg-[#43cd66]/20 text-[#43cd66] rounded-lg text-sm hover:bg-[#43cd66]/30 transition-all"
                    >
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredHotspots.map((hotspot, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:scale-105 ${
                          selectedHotspot?.location === hotspot.location
                            ? 'bg-[#43cd66]/20 border-[#43cd66]/50'
                            : 'bg-[#111b21]/40 border-[#43cd66]/20 hover:border-[#43cd66]/40'
                        }`}
                        onClick={() => setSelectedHotspot(hotspot)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-[#e6ffda]">{hotspot.location}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskLevelClass(hotspot.riskLevel)}`}>
                            {hotspot.riskLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#5e5e5e]">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{hotspot.incidents} incidents</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{hotspot.coordinates?.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              {insights && (
                <div className="bg-[#1c1e21]/60 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                  <h2 className="text-xl font-semibold text-[#e6ffda] mb-4">Quick Insights</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#5e5e5e]">Total Reports</span>
                      <span className="text-[#e6ffda] font-semibold">{insights.trendAnalysis?.totalReports || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#5e5e5e]">Avg Response Time</span>
                      <span className="text-[#e6ffda] font-semibold">{insights.trendAnalysis?.averageResponseTime || 0}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#5e5e5e]">Next Hotspot</span>
                      <span className="text-[#43cd66] font-semibold">{insights.predictions?.nextHotspot || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#5e5e5e]">Budget Forecast</span>
                      <span className="text-[#e6ffda] font-semibold">${insights.predictions?.budgetForecast || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights?.recommendations?.immediateActions && (
                <div className="bg-[#1c1e21]/60 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                  <h2 className="text-xl font-semibold text-[#e6ffda] mb-4">
                    <i className="fas fa-lightbulb text-[#43cd66] mr-2"></i>
                    Recommendations
                  </h2>
                  <div className="space-y-2">
                    {insights.recommendations.immediateActions.slice(0, 3).map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#111b21]/40 rounded-lg">
                        <i className="fas fa-arrow-right text-[#43cd66] text-sm mt-1"></i>
                        <span className="text-[#e6ffda] text-sm">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Analysis Chart */}
              {hotspots.length > 0 && (
                <div className="bg-[#1c1e21]/60 backdrop-blur-sm rounded-2xl border border-[#43cd66]/20 p-6">
                  <h2 className="text-xl font-semibold text-[#e6ffda] mb-4">
                    <i className="fas fa-chart-pie text-[#43cd66] mr-2"></i>
                    Risk Distribution
                  </h2>
                  <div className="space-y-3">
                    {['HIGH', 'MEDIUM', 'LOW'].map(level => {
                      const count = hotspots.filter(h => h.riskLevel === level).length;
                      const percentage = Math.round((count / hotspots.length) * 100);
                      const color = level === 'HIGH' ? 'bg-red-500' : level === 'MEDIUM' ? 'bg-orange-500' : 'bg-[#43cd66]';
                      
                      return (
                        <div key={level} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-[#e6ffda]">{level} Risk</span>
                            <span className="text-[#5e5e5e]">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-[#111b21]/40 rounded-full h-2">
                            <div 
                              className={`${color} h-2 rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
               
            </div>
          </div> 
        </div> 
      </div> 
    </div>
  ); // <-- closes the return statement
}; // <-- closes the Hotspots component


export default Hotspots;