import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Zap, 
  ArrowRight, 
  CheckCircle2,
  Flame,
  Radio,
  Thermometer
} from "lucide-react";

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const features = [
    {
      icon: <Thermometer className="w-6 h-6" />,
      title: "Camada Sensorial",
      description: "Monitora picos de energia, vibração e micro variações de temperatura que o olho humano não percebe."
    },
    {
      icon: <Radio className="w-6 h-6" />,
      title: "Camada Comportamental",
      description: "Transforma relatos de funcionários em indicadores estatísticos de risco."
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Camada de Contexto",
      description: "Analisa umidade, carga de trabalho e tempo desde última manutenção."
    }
  ];

  const benefits = [
    "Previsão de falhas antes que aconteçam",
    "Ordens de serviço automáticas e prescritivas",
    "Redução de até 90% em incidentes",
    "Integração com sensores existentes"
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1720036237334-9263cd28c3d4?crop=entropy&cs=srgb&fm=jpg&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-[#09090b]/90 to-[#09090b]" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wide">GUARDIANFIRE AI</span>
            </div>
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6"
              data-testid="login-btn-header"
            >
              {isLoading ? "Carregando..." : "Acessar Sistema"}
            </Button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-16 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-8">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-400 font-medium">Sistema de Previsão Ativa</span>
              </div>
              
              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                O Fim da Gestão Reativa
              </h1>
              
              <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
                O sistema de incêndio da sua empresa é como um airbag: ele só serve para o acidente que já aconteceu. 
                <span className="text-orange-400 font-medium"> Nós somos o Sensor de Colisão com Freio Automático</span> — 
                lemos o perigo antes de você e freamos sozinho.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-6 text-lg"
                  data-testid="login-btn-hero"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      Começar Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 pb-24">
          <motion.div 
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-[#121214] border border-zinc-800 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 text-orange-500">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* How it Works */}
        <section className="container mx-auto px-6 pb-24">
          <div className="bg-[#121214] border border-zinc-800 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl mb-6">
                  A IA que entrega a solução pronta
                </h2>
                <p className="text-zinc-400 mb-6">
                  Diferente de um dashboard que apenas exibe alertas vermelhos, o GuardianFire entrega a solução pronta. 
                  Não dizemos "está perigoso" — dizemos exatamente o que fazer.
                </p>
                
                <div className="bg-[#09090b] border-l-4 border-orange-500 rounded-r-lg p-4 mb-6">
                  <p className="text-sm text-zinc-300 font-mono">
                    "Risco de curto-circuito no Setor C subiu para 92%. 
                    <span className="text-orange-400"> Ação: Interromper a máquina 04 por 20 min e substituir o contator X.</span> 
                    O técnico de plantão já foi notificado."
                  </p>
                </div>

                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-zinc-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <div className="bg-[#09090b] rounded-xl p-6 border border-zinc-800">
                  {/* Simulated Alert Card */}
                  <div className="bg-[#121214] border-l-4 border-red-500 rounded-r-lg p-4 mb-4 glow-critical">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="font-heading font-semibold text-red-400">CRÍTICO</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-500">92%</span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-3">Risco de curto-circuito iminente</p>
                    <Button size="sm" className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Executar Ação Prescrita
                    </Button>
                  </div>
                  
                  {/* Warning Card */}
                  <div className="bg-[#121214] border-l-4 border-amber-500 rounded-r-lg p-4 glow-warning">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="font-heading font-semibold text-amber-400">ATENÇÃO</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-500">78%</span>
                    </div>
                    <p className="text-sm text-zinc-300">Acúmulo de poeira detectado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="container mx-auto px-6 pb-16">
          <div className="text-center">
            <p className="text-zinc-500 text-sm mb-4">
              Pronto para antecipar o caos?
            </p>
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              data-testid="login-btn-footer"
            >
              Acessar Sistema com Google
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
