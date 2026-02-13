import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Brain,
  Loader2
} from "lucide-react";

const RiskCard = ({ alert, onResolve, onAnalyze, analyzing = false, compact = false }) => {
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "critical":
        return {
          border: "border-red-500/50",
          bg: "bg-red-500/5",
          icon: "text-red-500",
          badge: "bg-red-500/20 text-red-400",
          glow: "glow-critical"
        };
      case "high":
        return {
          border: "border-orange-500/50",
          bg: "bg-orange-500/5",
          icon: "text-orange-500",
          badge: "bg-orange-500/20 text-orange-400",
          glow: ""
        };
      case "medium":
        return {
          border: "border-amber-500/50",
          bg: "bg-amber-500/5",
          icon: "text-amber-500",
          badge: "bg-amber-500/20 text-amber-400",
          glow: "glow-warning"
        };
      default:
        return {
          border: "border-zinc-700",
          bg: "bg-zinc-800/30",
          icon: "text-zinc-400",
          badge: "bg-zinc-500/20 text-zinc-400",
          glow: ""
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  return (
    <div
      className={`${styles.bg} border-l-4 ${styles.border} rounded-r-xl ${compact ? "p-4" : "p-5"} ${styles.glow} transition-transform hover:scale-[1.01]`}
      data-testid={`risk-card-${alert.alert_id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
          <div>
            <span className={`text-xs font-heading font-semibold uppercase ${styles.icon}`}>
              {alert.severity === "critical" ? "CRÍTICO" :
               alert.severity === "high" ? "ALTO" :
               alert.severity === "medium" ? "MÉDIO" : "BAIXO"}
            </span>
            {alert.alert_type && (
              <span className="text-xs text-zinc-500 ml-2">
                • {alert.alert_type === "prediction" ? "Previsão" : 
                   alert.alert_type === "incident" ? "Incidente" : "Manutenção"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-white">
            {alert.probability?.toFixed(0)}%
          </span>
          <span className="text-xs text-zinc-500">prob.</span>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="font-heading font-semibold text-white mb-2">
        {alert.title}
      </h3>
      <p className="text-sm text-zinc-400 mb-4">
        {alert.description}
      </p>

      {/* Prescribed Action */}
      {alert.prescribed_action && (
        <div className="bg-[#09090b] rounded-lg p-3 mb-4 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1 font-heading">AÇÃO PRESCRITA:</p>
          <p className="text-sm text-orange-400 font-medium">
            {alert.prescribed_action}
          </p>
        </div>
      )}

      {/* Actions */}
      {!compact && (
        <div className="flex gap-3 flex-wrap">
          <Button
            size="sm"
            onClick={onResolve}
            className={`${styles.badge} border ${styles.border} hover:opacity-80`}
            data-testid={`resolve-alert-${alert.alert_id}`}
          >
            <Zap className="w-4 h-4 mr-1" />
            Executar Ação
          </Button>
          {onAnalyze && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAnalyze}
              disabled={analyzing}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              data-testid={`analyze-alert-${alert.alert_id}`}
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-1" />
              )}
              Reanalisar
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onResolve}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            data-testid={`complete-alert-${alert.alert_id}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Resolver
          </Button>
        </div>
      )}

      {compact && (
        <Button
          size="sm"
          onClick={onResolve}
          className={`w-full ${styles.badge} border ${styles.border} hover:opacity-80`}
        >
          <Zap className="w-4 h-4 mr-1" />
          Executar Ação Prescrita
        </Button>
      )}
    </div>
  );
};

export default RiskCard;
