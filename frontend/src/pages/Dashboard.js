import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import DashboardLayout from "../components/DashboardLayout";
import RiskCard from "../components/RiskCard";
import MetricWidget from "../components/MetricWidget";
import SensorGauge from "../components/SensorGauge";
import ContextPanel from "../components/ContextPanel";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Wrench, 
  Thermometer,
  Zap,
  Wind,
  Radio,
  RefreshCw,
  Loader2
} from "lucide-react";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, alertsRes, sensorsRes, contextRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { withCredentials: true }),
        axios.get(`${API}/alerts?status=active`, { withCredentials: true }),
        axios.get(`${API}/sensors`, { withCredentials: true }),
        axios.get(`${API}/context`, { withCredentials: true })
      ]);
      
      setStats(statsRes.data);
      setAlerts(alertsRes.data);
      setSensors(sensorsRes.data);
      setContext(contextRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSeedData = async () => {
    try {
      await axios.post(`${API}/seed-demo-data`, {}, { withCredentials: true });
      toast.success("Dados de demonstração carregados!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao carregar dados de demonstração");
    }
  };

  const handleAnalyzeRisk = async (sectorId) => {
    setAnalyzing(true);
    try {
      const response = await axios.post(
        `${API}/analyze-risk`,
        { sector_id: sectorId },
        { withCredentials: true }
      );
      toast.success(`Análise concluída! Risco: ${response.data.risk_score}%`);
      fetchData();
    } catch (error) {
      toast.error("Erro na análise de risco");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await axios.put(
        `${API}/alerts/${alertId}/status?status=resolved`,
        {},
        { withCredentials: true }
      );
      toast.success("Alerta resolvido!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao resolver alerta");
    }
  };

  // Calculate overall risk
  const overallRisk = stats?.average_risk || 0;
  const riskStatus = overallRisk > 70 ? "critical" : overallRisk > 40 ? "warning" : "safe";

  const getSensorIcon = (type) => {
    switch (type) {
      case "temperature": return <Thermometer className="w-4 h-4" />;
      case "energy": return <Zap className="w-4 h-4" />;
      case "humidity": return <Wind className="w-4 h-4" />;
      case "vibration": return <Radio className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400 font-heading">Carregando dados...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Painel de Saúde de Risco
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Monitoramento em tempo real de todos os setores
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSeedData}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              data-testid="seed-data-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Dados Demo
            </Button>
          </div>
        </div>

        {/* Overall Risk Indicator */}
        <div 
          className={`relative overflow-hidden rounded-xl p-6 border ${
            riskStatus === "critical" ? "border-red-500/50 bg-red-500/5" :
            riskStatus === "warning" ? "border-amber-500/50 bg-amber-500/5" :
            "border-emerald-500/50 bg-emerald-500/5"
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                riskStatus === "critical" ? "bg-red-500/20" :
                riskStatus === "warning" ? "bg-amber-500/20" :
                "bg-emerald-500/20"
              }`}>
                <Shield className={`w-8 h-8 ${
                  riskStatus === "critical" ? "text-red-500" :
                  riskStatus === "warning" ? "text-amber-500" :
                  "text-emerald-500"
                }`} />
              </div>
              <div>
                <p className="text-zinc-400 text-sm font-medium">Risco Geral da Operação</p>
                <div className="flex items-baseline gap-2">
                  <span className={`font-mono font-bold text-4xl ${
                    riskStatus === "critical" ? "text-red-500" :
                    riskStatus === "warning" ? "text-amber-500" :
                    "text-emerald-500"
                  }`}>
                    {overallRisk.toFixed(1)}%
                  </span>
                  <span className={`font-heading font-semibold uppercase text-sm ${
                    riskStatus === "critical" ? "text-red-400" :
                    riskStatus === "warning" ? "text-amber-400" :
                    "text-emerald-400"
                  }`}>
                    {riskStatus === "critical" ? "CRÍTICO" : riskStatus === "warning" ? "ATENÇÃO" : "SEGURO"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Risk Bar */}
            <div className="w-full md:w-64">
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full risk-meter rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallRisk}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-zinc-500 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricWidget
            label="Setores Ativos"
            value={stats?.total_sectors || 0}
            icon={<Activity className="w-5 h-5" />}
            trend="neutral"
            data-testid="metric-sectors"
          />
          <MetricWidget
            label="Sensores Online"
            value={stats?.total_sensors || 0}
            icon={<Radio className="w-5 h-5" />}
            trend="neutral"
            data-testid="metric-sensors"
          />
          <MetricWidget
            label="Alertas Ativos"
            value={stats?.active_alerts || 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={stats?.active_alerts > 0 ? "up" : "neutral"}
            trendColor={stats?.active_alerts > 0 ? "red" : "zinc"}
            data-testid="metric-alerts"
          />
          <MetricWidget
            label="Ordens Pendentes"
            value={stats?.pending_orders || 0}
            icon={<Wrench className="w-5 h-5" />}
            trend="neutral"
            data-testid="metric-orders"
          />
        </div>

        {/* Context Panel */}
        {context && <ContextPanel context={context} />}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alerts Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-lg text-white">
                Alertas Prescritivos
              </h2>
              <span className="text-xs text-zinc-500 font-mono">
                {alerts.length} ativos
              </span>
            </div>
            
            <AnimatePresence mode="popLayout">
              {alerts.length > 0 ? (
                alerts.slice(0, 5).map((alert, index) => (
                  <motion.div
                    key={alert.alert_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <RiskCard 
                      alert={alert} 
                      onResolve={() => handleResolveAlert(alert.alert_id)}
                      onAnalyze={() => handleAnalyzeRisk(alert.sector_id)}
                      analyzing={analyzing}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="bg-[#121214] border border-zinc-800 rounded-xl p-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-zinc-400 font-heading">Nenhum alerta ativo</p>
                  <p className="text-zinc-500 text-sm mt-1">Todos os sistemas operando normalmente</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sectors & Sensors Column */}
          <div className="space-y-6">
            {/* Sectors */}
            <div>
              <h2 className="font-heading font-semibold text-lg text-white mb-4">
                Setores
              </h2>
              <div className="space-y-3">
                {stats?.sectors?.map((sector) => (
                  <motion.div
                    key={sector.sector_id}
                    className={`bg-[#121214] border rounded-lg p-4 cursor-pointer transition-all card-hover ${
                      sector.status === "critical" ? "border-red-500/50" :
                      sector.status === "warning" ? "border-amber-500/50" :
                      "border-zinc-800"
                    }`}
                    onClick={() => navigate(`/sector/${sector.sector_id}`)}
                    whileHover={{ scale: 1.02 }}
                    data-testid={`sector-${sector.sector_id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-heading font-medium text-white text-sm">
                          {sector.name}
                        </p>
                        <p className={`text-xs font-mono ${
                          sector.status === "critical" ? "text-red-400" :
                          sector.status === "warning" ? "text-amber-400" :
                          "text-emerald-400"
                        }`}>
                          {sector.risk_level?.toFixed(1)}% risco
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        sector.status === "critical" ? "bg-red-500 animate-pulse" :
                        sector.status === "warning" ? "bg-amber-500" :
                        "bg-emerald-500"
                      }`} />
                    </div>
                  </motion.div>
                ))}
                
                {(!stats?.sectors || stats.sectors.length === 0) && (
                  <div className="bg-[#121214] border border-zinc-800 rounded-lg p-6 text-center">
                    <p className="text-zinc-500 text-sm">Nenhum setor cadastrado</p>
                    <Button 
                      variant="link" 
                      className="text-orange-500 text-sm mt-2"
                      onClick={handleSeedData}
                    >
                      Carregar dados demo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Critical Sensors */}
            <div>
              <h2 className="font-heading font-semibold text-lg text-white mb-4">
                Sensores Críticos
              </h2>
              <div className="space-y-3">
                {sensors
                  .filter(s => s.status !== "normal")
                  .slice(0, 4)
                  .map((sensor) => (
                    <SensorGauge 
                      key={sensor.sensor_id} 
                      sensor={sensor}
                      icon={getSensorIcon(sensor.sensor_type)}
                    />
                  ))}
                
                {sensors.filter(s => s.status !== "normal").length === 0 && (
                  <div className="bg-[#121214] border border-zinc-800 rounded-lg p-4 text-center">
                    <p className="text-zinc-500 text-sm">Todos os sensores normais</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
