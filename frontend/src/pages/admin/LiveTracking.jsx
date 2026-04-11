import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { socket, connectSocket } from '../../utils/socket';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Navigation, 
  Map as MapIcon, 
  Activity, 
  Wifi, 
  WifiOff, 
  Clock, 
  Building, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  TrendingUp, 
  Radio 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for Leaflet default marker icons in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const center = [12.8707332, 78.1082435];

// Helper to center the map dynamically
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const AdminLiveTracking = () => {
  const { user } = useSelector((state) => state.auth);
  const [agents, setAgents] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchActiveAgents = async () => {
      try {
        const { data } = await axios.get('/api/admin/tracking/active', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAgents(data || {});
      } catch (err) {
        console.error('Initial hydration failed');
      }
    };

    fetchActiveAgents();
    connectSocket(user);
    
    socket.on('location-broadcast', (data) => {
      setAgents(prev => ({ 
        ...prev, 
        [data.userId]: { ...prev[data.userId], ...data, lastSeen: Date.now() } 
      }));
    });

    socket.on('status_update', (data) => {
      setAgents(prev => {
        if (!prev[data.userId]) return prev;
        return { 
          ...prev, 
          [data.userId]: { ...prev[data.userId], status: data.status, lastSeen: Date.now() } 
        };
      });
    });

    return () => {
      socket.off('location-broadcast');
      socket.off('status_update');
    };
  }, [user]);

  const stats = useMemo(() => {
    const vals = Object.values(agents || {});
    return {
      total: vals.length,
      online: vals.filter(a => a.status === 'online').length,
      idle: vals.filter(a => a.status === 'idle').length,
      offline: vals.filter(a => a.status === 'offline').length
    };
  }, [agents]);

  const filteredAgents = useMemo(() => {
    if (activeFilter === 'all') return Object.values(agents);
    return Object.values(agents).filter(a => a.status === activeFilter);
  }, [agents, activeFilter]);

  const mapCenter = useMemo(() => {
    if (selectedAgent?.lat && selectedAgent?.lng) {
      return [selectedAgent.lat, selectedAgent.lng];
    }
    return center;
  }, [selectedAgent]);

  return (
    <div className="min-h-screen -m-8 p-8 bg-white dark:bg-[#0B1220]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-bold uppercase tracking-tight flex items-center">
            <Radio className="w-10 h-10 mr-4 animate-pulse text-[#005DAB] dark:text-[#5AC8FA]" />
            <span className="text-[#005DAB] dark:text-[#5AC8FA]">Live</span>
            <span className="text-[#FFD100] ml-3">Fleet Tracking</span>
          </h2>
          <p className="text-sub font-bold text-[10px] uppercase tracking-widest mt-2 ">Signal Established • Krishnagiri Node Monitoring Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-220px)]">
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active', value: stats.total, color: 'text-blue-500' },
              { label: 'Live', value: stats.online, color: 'text-green-500' },
              { label: 'Idle', value: stats.idle, color: 'text-amber-500' },
              { label: 'Offline', value: stats.offline, color: 'text-red-500' }
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-3xl bg-[#F2F2F7] dark:bg-white/5 border border-transparent hover:border-[#005DAB] dark:hover:border-[#5AC8FA] transition-all">
                <p className="text-[8px] font-bold text-sub uppercase tracking-widest mb-1">{stat.label}</p>
                <h4 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h4>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-white dark:bg-white/5 rounded-[2.5rem] border border-[#E5E5EA] overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b border-[#E5E5EA] bg-[#F9F9FB]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest">
                <span className="text-[#005DAB] dark:text-[#5AC8FA]">Neural</span>{" "}
                <span className="text-[#FFD100]">Node Directory</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredAgents.map(agent => (
                <button 
                   key={agent.userId} 
                   onClick={() => setSelectedAgent(agent)}
                   className={`w-full p-5 rounded-[1.8rem] border text-left transition-all ${selectedAgent?.userId === agent.userId ? "bg-[#005DAB]/10 dark:bg-[#005DAB]/20 border-[#005DAB] dark:border-[#5AC8FA] shadow-lg" : "bg-white dark:bg-white/5 border-[#E5E5EA] dark:border-white/10"}`}
                >
                  <h4 className="text-sm font-bold uppercase">{agent.name || agent.userId.slice(-6)}</h4>
                  <div className="flex justify-between mt-4">
                    <span className="text-[8px] font-bold uppercase text-[#005DAB] dark:text-[#5AC8FA]">{agent.status}</span>
                    <span className="text-[8px] font-bold text-sub uppercase">{new Date(agent.lastSeen).toLocaleTimeString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-[#F2F2F7] rounded-[2.5rem] border border-[#E5E5EA] overflow-hidden relative shadow-2xl z-0">
          <MapContainer 
            center={center} 
            zoom={13} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeView center={mapCenter} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {Object.values(agents).filter(a => a.lat && a.lng).map(agent => (
              <Marker key={agent.userId} position={[agent.lat, agent.lng]}>
                <Popup>
                  <div className="p-2">
                    <h5 className="font-bold text-sm uppercase">{agent.name}</h5>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Status: {agent.status}</p>
                    <p className="text-[10px] text-gray-400 mt-1">LAST SEEN: {new Date(agent.lastSeen).toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveTracking;
