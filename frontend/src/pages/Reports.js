import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { API } from "../App";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  MessageSquare,
  Eye,
  Volume2,
  AlertTriangle,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const Reports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    sector_id: "",
    reporter_name: user?.name || "",
    description: "",
    category: "other"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, sectorsRes] = await Promise.all([
          axios.get(`${API}/reports`, { withCredentials: true }),
          axios.get(`${API}/sectors`, { withCredentials: true })
        ]);
        setReports(reportsRes.data);
        setSectors(sectorsRes.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmitReport = async () => {
    if (!newReport.sector_id || !newReport.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await axios.post(`${API}/reports`, newReport, { withCredentials: true });
      toast.success("Relato registrado com sucesso!");
      setDialogOpen(false);
      setNewReport({
        sector_id: "",
        reporter_name: user?.name || "",
        description: "",
        category: "other"
      });
      // Refresh reports
      const response = await axios.get(`${API}/reports`, { withCredentials: true });
      setReports(response.data);
    } catch (error) {
      toast.error("Erro ao registrar relato");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "smell": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "noise": return <Volume2 className="w-4 h-4 text-blue-500" />;
      case "visual": return <Eye className="w-4 h-4 text-purple-500" />;
      default: return <MessageSquare className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "smell": return "Cheiro";
      case "noise": return "Barulho";
      case "visual": return "Visual";
      default: return "Outro";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "smell": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "noise": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "visual": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const stats = {
    total: reports.length,
    smell: reports.filter(r => r.category === "smell").length,
    noise: reports.filter(r => r.category === "noise").length,
    visual: reports.filter(r => r.category === "visual").length
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Relatos Comportamentais
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Registros de observações dos funcionários
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600" data-testid="new-report-btn">
                <Plus className="w-4 h-4 mr-2" />
                Novo Relato
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121214] border-zinc-800">
              <DialogHeader>
                <DialogTitle className="font-heading text-white">Registrar Novo Relato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Setor *</label>
                  <Select 
                    value={newReport.sector_id} 
                    onValueChange={(v) => setNewReport({...newReport, sector_id: v})}
                  >
                    <SelectTrigger className="bg-[#09090b] border-zinc-800" data-testid="report-sector-select">
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map(sector => (
                        <SelectItem key={sector.sector_id} value={sector.sector_id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Categoria</label>
                  <Select 
                    value={newReport.category} 
                    onValueChange={(v) => setNewReport({...newReport, category: v})}
                  >
                    <SelectTrigger className="bg-[#09090b] border-zinc-800" data-testid="report-category-select">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smell">Cheiro estranho</SelectItem>
                      <SelectItem value="noise">Barulho/Som anormal</SelectItem>
                      <SelectItem value="visual">Observação visual</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Seu Nome</label>
                  <Input 
                    value={newReport.reporter_name}
                    onChange={(e) => setNewReport({...newReport, reporter_name: e.target.value})}
                    placeholder="Nome do relator"
                    className="bg-[#09090b] border-zinc-800"
                    data-testid="report-name-input"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Descrição *</label>
                  <Textarea 
                    value={newReport.description}
                    onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                    placeholder="Descreva o que observou... Ex: Cheiro de queimado perto da máquina 04"
                    className="bg-[#09090b] border-zinc-800 min-h-[100px]"
                    data-testid="report-description-input"
                  />
                </div>

                <Button 
                  onClick={handleSubmitReport}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  data-testid="submit-report-btn"
                >
                  Registrar Relato
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-xs font-heading">TOTAL</p>
            <p className="font-mono text-2xl text-white">{stats.total}</p>
          </div>
          <div className="bg-[#121214] border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-amber-400 text-xs font-heading">CHEIRO</p>
            </div>
            <p className="font-mono text-2xl text-amber-500">{stats.smell}</p>
          </div>
          <div className="bg-[#121214] border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <p className="text-blue-400 text-xs font-heading">BARULHO</p>
            </div>
            <p className="font-mono text-2xl text-blue-500">{stats.noise}</p>
          </div>
          <div className="bg-[#121214] border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <p className="text-purple-400 text-xs font-heading">VISUAL</p>
            </div>
            <p className="font-mono text-2xl text-purple-500">{stats.visual}</p>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report, index) => (
            <motion.div
              key={report.report_id}
              className="bg-[#121214] border border-zinc-800 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              data-testid={`report-${report.report_id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(report.category).split(' ')[0]}`}>
                    {getCategoryIcon(report.category)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{report.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                      <span>{report.reporter_name}</span>
                      <span>•</span>
                      <span>{new Date(report.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(report.category)}`}>
                  {getCategoryLabel(report.category)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhum relato registrado</p>
            <p className="text-zinc-500 text-sm mt-1">Seja o primeiro a registrar uma observação</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
