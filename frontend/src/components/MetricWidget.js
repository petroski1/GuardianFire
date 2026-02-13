import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const MetricWidget = ({ label, value, icon, trend = "neutral", trendColor = "zinc", className = "" }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className={`w-4 h-4 text-${trendColor}-500`} />;
      case "down": return <TrendingDown className={`w-4 h-4 text-${trendColor}-500`} />;
      default: return <Minus className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <motion.div
      className={`bg-[#121214] border border-zinc-800 rounded-xl p-4 card-hover ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: "rgba(234, 88, 12, 0.3)" }}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-orange-500">
          {icon}
        </div>
        {getTrendIcon()}
      </div>
      
      <div className="mt-4">
        <p className="font-mono text-3xl font-bold text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-zinc-500 font-heading uppercase tracking-wide mt-1">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

export default MetricWidget;
