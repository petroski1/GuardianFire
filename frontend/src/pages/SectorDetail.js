import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import DashboardLayout from "../components/DashboardLayout";
import SensorGauge from "../components/SensorGauge";
import RiskCard from "../components/RiskCard";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Thermometer,
  Zap,
  Wind,
  Radio,
  Flame,
  Loader2,
  Brain
} from "lucide-react";

const SectorDetail = ({ user }) => {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const [sector, setSector] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectorRes, sensorsRes, alertsRes, reportsRes] = await Promise.all([
          axios.get(`${API}/sectors/${sectorId}`, { withCredentials: true }),
          axios.get(`${API}/sensors?sector_id=${sectorId}`, { withCredentials: true }),
          axios.get(`${API}/alerts?sector_id=${sectorId}&status=active`, { withCredentials: true }),
          axios.get(`${API}/reports?sector_id=${sectorId}`, { withCredentials: true })
        ]);
        
        setSector(sectorRes.data);
        setSensors(sensorsRes.data);
        setAlerts(alertsRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error("Error fetching sector data:", error);
        if (error.response?.status === 404) {
          toast.error("Setor não encontrado");
          navigate("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sectorId, navigate]);

  const handleAnalyzeRisk = async () => {
    setAnalyzing(true);
    try {
      const response = await axios.post(
        `${API}/analyze-risk`,
        { sector_id: sectorId },
        { withCredentials: true }
      );
      
      toast.success(`Análise concluída! Novo nível de risco: ${response.data.risk_score}%`);
      
      // Refresh sector data
      const sectorRes = await axios.get(`${API}/sectors/${sectorId}`, { withCredentials: true });
      setSector(sectorRes.data);
      
      // Refresh alerts
      const alertsRes = await axios.get(`${API}/alerts?sector_id=${sectorId}&status=active`, { withCredentials: true });
      setAlerts(alertsRes.data);
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
      setAlerts(alerts.filter(a => a.alert_id !== alertId));
    } catch (error) {
      toast.error("Erro ao resolver alerta");
    }
  };

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

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!sector) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <p className="text-zinc-400">Setor não encontrado</p>
          <Button variant="link" onClick={() => navigate("/dashboard")} className="text-orange-500">
            Voltar ao Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const riskStatus = sector.status || "safe";

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="text-zinc-400 hover:text-white"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading font-bold text-2xl text-white">
                {sector.name}
              </h1>
              <p className="text-zinc-400 text-sm">{sector.description}</p>
            </div>
          </div>
          
          <Button
            onClick={handleAnalyzeRisk}
            disabled={analyzing}
            className="bg-orange-500 hover:bg-orange-600"
            data-testid="analyze-risk-btn"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Análise de Risco IA
              </>
            )}
          </Button>
        </div>

        {/* Risk Overview */}
        <motion.div 
          className={`relative overflow-hidden rounded-xl p-6 border ${
            riskStatus === "critical" ? "border-red-500/50 bg-red-500/5 glow-critical" :
            riskStatus === "warning" ? "border-amber-500/50 bg-amber-500/5 glow-warning" :
            "border-emerald-500/50 bg-emerald-500/5 glow-safe"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${
                riskStatus === "critical" ? "bg-red-500/20" :
                riskStatus === "warning" ? "bg-amber-500/20" :
                "bg-emerald-500/20"
              }`}>
                <span className={`font-mono font-bold text-3xl ${
                  riskStatus === "critical" ? "text-red-500" :
                  riskStatus === "warning" ? "text-amber-500" :
                  "text-emerald-500"
                }`}>
                  {sector.risk_level?.toFixed(0)}%
                </span>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Nível de Risco</p>
                <p className={`font-heading font-bold text-xl uppercase ${
                  riskStatus === "critical" ? "text-red-500" :
                  riskStatus === "warning" ? "text-amber-500" :
                  "text-emerald-500"
                }`}>
                  {riskStatus === "critical" ? "CRÍTICO" : 
                   riskStatus === "warning" ? "ATENÇÃO" : "SEGURO"}
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-80">
              <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full risk-meter rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${sector.risk_level || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sensors */}
          <div className="space-y-4">
            <h2 className="font-heading font-semibold text-lg text-white">
              Sensores ({sensors.length})
            </h2>
            <div className="grid gap-3">
              {sensors.map((sensor) => (
                <SensorGauge 
                  key={sensor.sensor_id} 
                  sensor={sensor}
                  icon={getSensorIcon(sensor.sensor_type)}
                  expanded
                />
              ))}
              {sensors.length === 0 && (
                <div className="bg-[#121214] border border-zinc-800 rounded-lg p-6 text-center">
                  <p className="text-zinc-500">Nenhum sensor cadastrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts & Reports */}
          <div className="space-y-6">
            {/* Active Alerts */}
            <div className="space-y-4">
              <h2 className="font-heading font-semibold text-lg text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas Ativos ({alerts.length})
              </h2>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <RiskCard 
                    key={alert.alert_id}
                    alert={alert} 
                    onResolve={() => handleResolveAlert(alert.alert_id)}
                    compact
                  />
                ))
              ) : (
                <div className="bg-[#121214] border border-emerald-500/30 rounded-lg p-4 text-center">
                  <p className="text-emerald-400 text-sm">Nenhum alerta ativo</p>
                </div>
              )}
            </div>

            {/* Behavioral Reports */}
            <div className="space-y-4">
              <h2 className="font-heading font-semibold text-lg text-white">
                Relatos Comportamentais
              </h2>
              <div className="space-y-2">
                {reports.slice(0, 5).map((report) => (
                  <div 
                    key={report.report_id}
                    className="bg-[#121214] border border-zinc-800 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-white">{report.description}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Por {report.reporter_name} • {report.category}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        report.category === "smell" ? "bg-amber-500/20 text-amber-400" :
                        report.category === "noise" ? "bg-blue-500/20 text-blue-400" :
                        report.category === "visual" ? "bg-purple-500/20 text-purple-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      }`}>
                        {report.category}
                      </span>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="bg-[#121214] border border-zinc-800 rounded-lg p-4 text-center">
                    <p className="text-zinc-500 text-sm">Nenhum relato recente</p>
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

export default SectorDetail;
