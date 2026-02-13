import { useState, useEffect } from "react";
import axios from "axios";

import { API } from "../App";
import DashboardLayout from "../components/DashboardLayout";
import SensorGauge from "../components/SensorGauge";
import {
  Activity,
  Thermometer,
  Zap,
  Wind,
  Radio,
  Flame,
  Loader2,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const Sensors = ({ user }) => {
  const [sensors, setSensors] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSector, setFilterSector] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorsRes, sectorsRes] = await Promise.all([
          axios.get(`${API}/sensors`, { withCredentials: true }),
          axios.get(`${API}/sectors`, { withCredentials: true })
        ]);
        setSensors(sensorsRes.data);
        setSectors(sectorsRes.data);
      } catch (error) {
        console.error("Error fetching sensors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const getSensorIcon = (type) => {
    switch (type) {
      case "temperature": return <Thermometer className="w-4 h-4" />;
      case "energy": return <Zap className="w-4 h-4" />;
      case "humidity": return <Wind className="w-4 h-4" />;
      case "vibration": return <Radio className="w-4 h-4" />;
      case "smoke": return <Flame className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredSensors = sensors.filter(sensor => {
    if (filterSector !== "all" && sensor.sector_id !== filterSector) return false;
    if (filterType !== "all" && sensor.sensor_type !== filterType) return false;
    if (filterStatus !== "all" && sensor.status !== filterStatus) return false;
    return true;
  });

  const sensorTypes = [...new Set(sensors.map(s => s.sensor_type))];

  const stats = {
    total: sensors.length,
    normal: sensors.filter(s => s.status === "normal").length,
    warning: sensors.filter(s => s.status === "warning").length,
    critical: sensors.filter(s => s.status === "critical").length
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            Monitoramento de Sensores
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Visualização em tempo real de todos os sensores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-xs font-heading">TOTAL</p>
            <p className="font-mono text-2xl text-white">{stats.total}</p>
          </div>
          <div className="bg-[#121214] border border-emerald-500/30 rounded-lg p-4">
            <p className="text-emerald-400 text-xs font-heading">NORMAL</p>
            <p className="font-mono text-2xl text-emerald-500">{stats.normal}</p>
          </div>
          <div className="bg-[#121214] border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 text-xs font-heading">ATENÇÃO</p>
            <p className="font-mono text-2xl text-amber-500">{stats.warning}</p>
          </div>
          <div className="bg-[#121214] border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-xs font-heading">CRÍTICO</p>
            <p className="font-mono text-2xl text-red-500">{stats.critical}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filtros:</span>
          </div>
          
          <Select value={filterSector} onValueChange={setFilterSector}>
            <SelectTrigger className="w-40 bg-[#121214] border-zinc-800" data-testid="filter-sector">
              <SelectValue placeholder="Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Setores</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector.sector_id} value={sector.sector_id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 bg-[#121214] border-zinc-800" data-testid="filter-type">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {sensorTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-[#121214] border-zinc-800" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="warning">Atenção</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sensors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSensors.map((sensor, index) => (
            <div
              key={sensor.sensor_id}
              
              
              
            >
              <SensorGauge 
                sensor={sensor}
                icon={getSensorIcon(sensor.sensor_type)}
                expanded
              />
            </div>
          ))}
        </div>

        {filteredSensors.length === 0 && (
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-12 text-center">
            <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhum sensor encontrado</p>
            <p className="text-zinc-500 text-sm mt-1">Ajuste os filtros ou adicione novos sensores</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sensors;
