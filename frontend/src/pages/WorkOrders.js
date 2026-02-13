import { useState, useEffect } from "react";
import axios from "axios";

import { API } from "../App";
import DashboardLayout from "../components/DashboardLayout";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Loader2,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const WorkOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/work-orders`, { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/work-orders/${orderId}/status?status=${newStatus}`,
        {},
        { withCredentials: true }
      );
      toast.success(`Ordem ${newStatus === "completed" ? "concluída" : "atualizada"}!`);
      fetchOrders();
    } catch (error) {
      toast.error("Erro ao atualizar ordem");
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== "all" && order.status !== filterStatus) return false;
    if (filterPriority !== "all" && order.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "in_progress": return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
      case "cancelled": return <AlertCircle className="w-4 h-4 text-zinc-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    completed: orders.filter(o => o.status === "completed").length
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
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            Ordens de Serviço
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Ordens de serviço geradas automaticamente pelo sistema
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121214] border border-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-xs font-heading">TOTAL</p>
            <p className="font-mono text-2xl text-white">{stats.total}</p>
          </div>
          <div className="bg-[#121214] border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-xs font-heading">PENDENTES</p>
            <p className="font-mono text-2xl text-blue-500">{stats.pending}</p>
          </div>
          <div className="bg-[#121214] border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 text-xs font-heading">EM PROGRESSO</p>
            <p className="font-mono text-2xl text-amber-500">{stats.in_progress}</p>
          </div>
          <div className="bg-[#121214] border border-emerald-500/30 rounded-lg p-4">
            <p className="text-emerald-400 text-xs font-heading">CONCLUÍDAS</p>
            <p className="font-mono text-2xl text-emerald-500">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-zinc-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filtros:</span>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-[#121214] border-zinc-800" data-testid="filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40 bg-[#121214] border-zinc-800" data-testid="filter-priority">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <div
              key={order.order_id}
              className={`bg-[#121214] border rounded-xl p-5 ${
                order.priority === "urgent" ? "border-red-500/30" :
                order.priority === "high" ? "border-orange-500/30" :
                "border-zinc-800"
              }`}
              
              
              
              data-testid={`work-order-${order.order_id}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-zinc-500">{order.order_id}</span>
                    <Badge className={getPriorityColor(order.priority)}>
                      {order.priority === "urgent" ? "URGENTE" :
                       order.priority === "high" ? "ALTA" :
                       order.priority === "medium" ? "MÉDIA" : "BAIXA"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      <span className="text-xs text-zinc-400 capitalize">{order.status.replace("_", " ")}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-heading font-semibold text-white mb-1">
                    {order.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-2">{order.description}</p>
                  
                  {order.assigned_to && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <User className="w-3 h-3" />
                      <span>{order.assigned_to}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order.order_id, "in_progress")}
                      className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                      data-testid={`start-order-${order.order_id}`}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  {order.status === "in_progress" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order.order_id, "completed")}
                      className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                      data-testid={`complete-order-${order.order_id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-[#121214] border border-zinc-800 rounded-xl p-12 text-center">
            <Wrench className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhuma ordem de serviço encontrada</p>
            <p className="text-zinc-500 text-sm mt-1">Ajuste os filtros ou aguarde novas ordens</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WorkOrders;
