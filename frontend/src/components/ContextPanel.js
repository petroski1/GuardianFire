import { motion } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Gauge,
  Clock,
  Users
} from "lucide-react";

const ContextPanel = ({ context }) => {
  const contextItems = [
    {
      icon: <Thermometer className="w-4 h-4" />,
      label: "Temp. Externa",
      value: `${context.temperature_external?.toFixed(1)}°C`,
      warning: context.temperature_external > 30
    },
    {
      icon: <Droplets className="w-4 h-4" />,
      label: "Umidade",
      value: `${context.humidity?.toFixed(0)}%`,
      warning: context.humidity < 40
    },
    {
      icon: <Gauge className="w-4 h-4" />,
      label: "Carga Máquinas",
      value: `${context.machine_load?.toFixed(0)}%`,
      warning: context.machine_load > 90
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Fadiga Equipe",
      value: `${context.team_fatigue?.toFixed(0)}%`,
      warning: context.team_fatigue > 60
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Última Manutenção",
      value: `${context.last_maintenance_days} dias`,
      warning: context.last_maintenance_days > 10
    }
  ];

  const warningCount = contextItems.filter(item => item.warning).length;

  return (
    <motion.div
      className="bg-[#121214] border border-zinc-800 rounded-xl p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-white">Variáveis de Contexto</h3>
        {warningCount > 0 && (
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
            {warningCount} fator{warningCount > 1 ? "es" : ""} de risco
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {contextItems.map((item, index) => (
          <div
            key={index}
            className={`bg-[#09090b] rounded-lg p-3 border ${
              item.warning ? "border-amber-500/30" : "border-zinc-800"
            }`}
          >
            <div className={`flex items-center gap-2 mb-2 ${
              item.warning ? "text-amber-500" : "text-zinc-400"
            }`}>
              {item.icon}
              <span className="text-xs font-heading truncate">{item.label}</span>
            </div>
            <p className={`font-mono text-lg font-bold ${
              item.warning ? "text-amber-400" : "text-white"
            }`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {warningCount >= 3 && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-sm text-amber-400">
            <strong>Atenção:</strong> Múltiplos fatores de contexto elevados. 
            O cenário atual é propício para incidentes. Recomenda-se elevar o nível de vigilância.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ContextPanel;
