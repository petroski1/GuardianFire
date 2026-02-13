import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  MessageSquare,
  Shield,
  Save
} from "lucide-react";

const Settings = ({ user }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    criticalAlerts: true,
    dailyReport: false,
    emailAddress: user?.email || "",
    riskThreshold: 70
  });

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            Configurações
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Personalize as notificações e limites do sistema
          </p>
        </div>

        {/* Notifications Section */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-orange-500" />
            <h2 className="font-heading font-semibold text-lg text-white">Notificações</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Notificações por Email</p>
                <p className="text-zinc-500 text-sm">Receba alertas diretamente no seu email</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                data-testid="email-notifications-switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Alertas Críticos Imediatos</p>
                <p className="text-zinc-500 text-sm">Notificação instantânea para riscos acima do limite</p>
              </div>
              <Switch 
                checked={settings.criticalAlerts}
                onCheckedChange={(checked) => setSettings({...settings, criticalAlerts: checked})}
                data-testid="critical-alerts-switch"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Relatório Diário</p>
                <p className="text-zinc-500 text-sm">Resumo diário de todos os setores</p>
              </div>
              <Switch 
                checked={settings.dailyReport}
                onCheckedChange={(checked) => setSettings({...settings, dailyReport: checked})}
                data-testid="daily-report-switch"
              />
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-orange-500" />
            <h2 className="font-heading font-semibold text-lg text-white">Contato</h2>
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Email para notificações</label>
            <Input 
              type="email"
              value={settings.emailAddress}
              onChange={(e) => setSettings({...settings, emailAddress: e.target.value})}
              placeholder="seu@email.com"
              className="bg-[#09090b] border-zinc-800"
              data-testid="email-input"
            />
          </div>
        </div>

        {/* Risk Threshold Section */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-orange-500" />
            <h2 className="font-heading font-semibold text-lg text-white">Limites de Risco</h2>
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">
              Limite para alerta crítico (%)
            </label>
            <div className="flex items-center gap-4">
              <Input 
                type="number"
                min="0"
                max="100"
                value={settings.riskThreshold}
                onChange={(e) => setSettings({...settings, riskThreshold: parseInt(e.target.value) || 0})}
                className="bg-[#09090b] border-zinc-800 w-24"
                data-testid="risk-threshold-input"
              />
              <p className="text-zinc-500 text-sm">
                Alertas críticos serão disparados quando o risco ultrapassar este valor
              </p>
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <div className="bg-[#121214] border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-orange-500" />
            <h2 className="font-heading font-semibold text-lg text-white">Integrações</h2>
          </div>
          
          <div className="bg-[#09090b] rounded-lg p-4 border border-zinc-700">
            <p className="text-zinc-400 text-sm">
              Para integrar com <span className="text-white">WhatsApp Business API</span> ou <span className="text-white">Microsoft Teams</span>, 
              entre em contato com o suporte técnico.
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              Essas integrações requerem configuração adicional de tokens e webhooks.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
          data-testid="save-settings-btn"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
