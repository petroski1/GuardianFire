import DashboardLayout from "../components/DashboardLayout";
import { Badge } from "../components/ui/badge";
import {
  Radio,
  Brain,
  Bell,
  Server,
  Database,
  Cpu,
  MessageSquare,
  Webhook,
  Activity,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";

const Architecture = ({ user }) => {
  const layers = [
    {
      title: "Camada de Ingestão",
      subtitle: 'O "Ouvido" do Sistema',
      icon: <Radio className="w-6 h-6" />,
      color: "blue",
      items: [
        { name: "MQTT Broker", desc: "Mosquitto/HiveMQ para receber dados de sensores IoT", status: "planned" },
        { name: "Driver OPC UA", desc: "Tradução de dados de CLPs industriais para JSON", status: "planned" },
        { name: "Webhooks ERP", desc: "Integração com SAP, Oracle e sistemas de gestão", status: "planned" },
        { name: "API REST", desc: "Endpoints para integração direta", status: "done" }
      ]
    },
    {
      title: "Camada de Processamento",
      subtitle: 'O "Cérebro" de IA',
      icon: <Brain className="w-6 h-6" />,
      color: "orange",
      items: [
        { name: "Gemini 3 Flash", desc: "IA para análise preditiva e prescrição de ações", status: "done" },
        { name: "Análise de Contexto", desc: "Cruza clima, carga de máquinas e fadiga da equipe", status: "done" },
        { name: "Séries Temporais", desc: "InfluxDB/TimescaleDB para histórico otimizado", status: "planned" },
        { name: "Anomaly Detection", desc: "Detecção de comportamentos fora do padrão", status: "planned" }
      ]
    },
    {
      title: "Camada de Notificação",
      subtitle: 'A "Voz" do Sistema',
      icon: <Bell className="w-6 h-6" />,
      color: "emerald",
      items: [
        { name: "Dashboard Web", desc: "Interface de monitoramento em tempo real", status: "done" },
        { name: "Email (Resend)", desc: "Notificações por email para alertas", status: "done" },
        { name: "WhatsApp Business", desc: "Alertas críticos na palma da mão", status: "planned" },
        { name: "Microsoft Teams", desc: "Integração com ambiente corporativo", status: "planned" },
        { name: "Rules Engine", desc: "Motor de regras prescritivas automáticas", status: "planned" }
      ]
    }
  ];

  const getStatusBadge = (status) => {
    if (status === "done") {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Implementado
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
        <Clock className="w-3 h-3 mr-1" />
        Planejado
      </Badge>
    );
  };

  const getColorClasses = (color) => {
    switch (color) {
      case "blue": return { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "text-blue-500" };
      case "orange": return { bg: "bg-orange-500/10", border: "border-orange-500/30", icon: "text-orange-500" };
      case "emerald": return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-500" };
      default: return { bg: "bg-zinc-500/10", border: "border-zinc-500/30", icon: "text-zinc-500" };
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            Arquitetura Enterprise
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Compatível com grandes empresas (P&G, Ambev, etc.)
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-orange-500" />
            <h2 className="font-heading font-semibold text-lg text-white">Visão Geral</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            O GUARDIANFIRE é projetado para integrar com a infraestrutura industrial existente. 
            O sistema não é passivo — ele se conecta diretamente com sensores IoT, CLPs e sistemas de gestão 
            para capturar dados em tempo real e gerar previsões prescritivas.
          </p>
        </div>

        {/* Layers */}
        <div className="space-y-6">
          {layers.map((layer, index) => {
            const colors = getColorClasses(layer.color);
            return (
              <div 
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-xl p-6`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-[#09090b] ${colors.icon}`}>
                    {layer.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-white">{layer.title}</h3>
                    <p className="text-zinc-400 text-sm">{layer.subtitle}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {layer.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#09090b] border border-zinc-800 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-white mb-1">{item.name}</h4>
                          <p className="text-zinc-500 text-sm">{item.desc}</p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules Engine Example */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-5 h-5 text-orange-500" />
            <h2 className="font-heading font-semibold text-lg text-white">Exemplo de Regra Prescritiva</h2>
          </div>
          <div className="bg-[#09090b] rounded-lg p-4 font-mono text-sm">
            <p className="text-blue-400">IF</p>
            <p className="text-zinc-300 ml-4">probabilidade_risco &gt; 70%</p>
            <p className="text-blue-400 ml-4">AND horario == "turno_noite"</p>
            <p className="text-emerald-400">THEN</p>
            <p className="text-orange-400 ml-4">enviar_alerta_urgente_whatsapp</p>
            <p className="text-orange-400 ml-4">gerar_ordem_servico_automatica</p>
            <p className="text-orange-400 ml-4">notificar_supervisor_turno</p>
          </div>
        </div>

        {/* Data Flow */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-orange-500" />
            <h2 className="font-heading font-semibold text-lg text-white">Fluxo de Dados</h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex-1">
              <Server className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-white font-medium">Sensores IoT</p>
              <p className="text-zinc-500 text-xs">MQTT / OPC UA</p>
            </div>
            <div className="text-zinc-600 text-2xl hidden md:block">→</div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex-1">
              <Database className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-white font-medium">Time-Series DB</p>
              <p className="text-zinc-500 text-xs">InfluxDB / TimescaleDB</p>
            </div>
            <div className="text-zinc-600 text-2xl hidden md:block">→</div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 flex-1">
              <Brain className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-white font-medium">Gemini 3 Flash</p>
              <p className="text-zinc-500 text-xs">Análise Preditiva</p>
            </div>
            <div className="text-zinc-600 text-2xl hidden md:block">→</div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex-1">
              <MessageSquare className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-white font-medium">Notificações</p>
              <p className="text-zinc-500 text-xs">WhatsApp / Teams</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Architecture;
