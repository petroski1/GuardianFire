import { motion } from "framer-motion";
import { Progress } from "./ui/progress";

const SensorGauge = ({ sensor, icon, expanded = false }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "critical":
        return {
          border: "border-red-500/30",
          text: "text-red-500",
          bg: "bg-red-500",
          glow: "glow-critical"
        };
      case "warning":
        return {
          border: "border-amber-500/30",
          text: "text-amber-500",
          bg: "bg-amber-500",
          glow: "glow-warning"
        };
      default:
        return {
          border: "border-zinc-800",
          text: "text-emerald-500",
          bg: "bg-emerald-500",
          glow: ""
        };
    }
  };

  const styles = getStatusStyles(sensor.status);
  
  // Calculate percentage of max threshold
  const percentage = Math.min((sensor.current_value / sensor.max_threshold) * 100, 100);

  return (
    <motion.div
      className={`bg-[#121214] border ${styles.border} rounded-lg ${expanded ? "p-4" : "p-3"} ${styles.glow}`}
      whileHover={{ scale: 1.02 }}
      data-testid={`sensor-${sensor.sensor_id}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 ${styles.text}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-white font-medium truncate max-w-[120px]">
              {sensor.name}
            </p>
            <p className="text-xs text-zinc-500 capitalize">{sensor.sensor_type}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono text-lg font-bold ${styles.text}`}>
            {sensor.current_value?.toFixed(1)}
            <span className="text-xs text-zinc-500 ml-1">{sensor.unit}</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${styles.bg} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500 font-mono">
          <span>{sensor.min_threshold}{sensor.unit}</span>
          <span>{sensor.max_threshold}{sensor.unit}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Status</span>
            <span className={`font-medium uppercase ${styles.text}`}>
              {sensor.status === "critical" ? "Crítico" :
               sensor.status === "warning" ? "Atenção" : "Normal"}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SensorGauge;
