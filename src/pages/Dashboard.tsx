import { useState, useEffect } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AlertsNotifications } from "@/components/dashboard/AlertsNotifications";
import { 
  BarChart3, 
  FileText, 
  Leaf, 
  DollarSign,
  Calendar,
  Download 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { exportDashboardData } from "@/utils/exportUtils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("atual");
  const { toast } = useToast();
  const { user } = useAuth();

  // Hook para scroll automático ao topo
  useScrollToTop();

  // State for metrics
  const [imcScore, setImcScore] = useState("0/100");
  const [imcAverage, setImcAverage] = useState("0/100");
  const [activeMTRs, setActiveMTRs] = useState("0");
  const [expiredMTRs, setExpiredMTRs] = useState("0");
  const [esgScore, setEsgScore] = useState("0/100");
  const [esgAverage, setEsgAverage] = useState("0/100");
  const [monthlyRevenue, setMonthlyRevenue] = useState("R$ 0");
  const [monthlyBalance, setMonthlyBalance] = useState("R$ 0");
  const [monthlyExpense, setMonthlyExpense] = useState("R$ 0");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      // Definir datas de início e fim conforme filtro
      const now = new Date();
      let startDate, endDate;
      if (selectedPeriod === "atual") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (selectedPeriod === "anterior") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      } else {
        let months = 3;
        if (selectedPeriod === "6meses") months = 6;
        if (selectedPeriod === "9meses") months = 9;
        if (selectedPeriod === "12meses") months = 12;
        startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // Buscar e filtrar IMC
      try {
        const { data: imcData, error: imcError } = await supabase
          .from('sustainability_metrics')
          .select('total_score, created_at')
          .eq('user_id', user.id);
        let filteredIMC: any[] = [];
        if (Array.isArray(imcData)) {
          filteredIMC = imcData
            .filter((item: any) => item && typeof item.total_score === 'number' && item.created_at)
            .filter((item: any) => {
              const d = new Date(item.created_at);
              return d >= startDate && d <= endDate;
            });
        }
        if (filteredIMC.length > 0 && typeof filteredIMC[filteredIMC.length - 1].total_score === 'number') {
          const last = filteredIMC[filteredIMC.length - 1];
          setImcScore(`${last.total_score}/100`);
          const avg = Math.round(filteredIMC.reduce((acc: number, curr: any) => acc + (curr.total_score || 0), 0) / filteredIMC.length);
          setImcAverage(`${avg}/100`);
        } else {
          setImcScore("0/100");
          setImcAverage("0/100");
        }
      } catch (err) {
        setImcScore("0/100");
        setImcAverage("0/100");
      }

      // Buscar e filtrar MTRs
      try {
        const { data: mtrData, error: mtrError } = await supabase
          .from("mtr_records")
          .select("status, created_at")
          .eq("user_id", user.id);
        const filteredMTRs = (mtrData || []).filter((m: any) => {
          const d = new Date(m.created_at);
          return d >= startDate && d <= endDate;
        });
        const ativos = filteredMTRs.filter((m: any) => m.status === 'ativo').length;
        const vencidos = filteredMTRs.filter((m: any) => m.status === 'vencido').length;
        setActiveMTRs(String(ativos));
        setExpiredMTRs(String(vencidos));
      } catch (err) {
        setActiveMTRs("0");
        setExpiredMTRs("0");
      }

      // Buscar e filtrar transações financeiras
      try {
        const { data: transactions, error: transError } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', user.id);
        const filteredTrans = (transactions || []).filter((t: any) => {
          const d = new Date(t.date);
          return d >= startDate && d <= endDate;
        });
        const receitas = filteredTrans.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        const despesas = filteredTrans.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        const saldo = receitas - despesas;
        setMonthlyRevenue(`R$ ${receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        setMonthlyExpense(`R$ ${despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        setMonthlyBalance(`R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      } catch (err) {
        setMonthlyRevenue("R$ 0");
        setMonthlyExpense("R$ 0");
        setMonthlyBalance("R$ 0");
      }

      // Buscar e filtrar ESG
      try {
        const { data: esgData, error: esgError } = await supabase
          .from('esg_scores')
          .select('environmental_score, social_score, governance_score, created_at')
          .eq('user_id', user.id);
        const filteredESG = (esgData || []).filter((item: any) => {
          const d = new Date(item.created_at);
          return d >= startDate && d <= endDate;
        });
        if (filteredESG.length > 0) {
          const last = filteredESG[filteredESG.length - 1];
          const avg = Math.round(filteredESG.reduce((acc: number, curr: any) => acc + ((curr.environmental_score || 0) + (curr.social_score || 0) + (curr.governance_score || 0)) / 3, 0) / filteredESG.length);
          setEsgScore(`${Math.round(((last.environmental_score || 0) + (last.social_score || 0) + (last.governance_score || 0)) / 3)}/100`);
          setEsgAverage(`${avg}/100`);
        } else {
          setEsgScore("0/100");
          setEsgAverage("0/100");
        }
      } catch (err) {
        setEsgScore("0/100");
        setEsgAverage("0/100");
      }
    };

    fetchDashboardData();
  }, [user, selectedPeriod]);

  const handleExport = () => {
    try {
      exportDashboardData({
        imcScore,
        imcAverage,
        activeMTRs,
        expiredMTRs,
        esgScore,
        esgAverage,
        monthlyRevenue,
        monthlyExpense,
        monthlyBalance
      });
      toast({
        title: "Relatório exportado",
        description: "O relatório do dashboard foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  function getInitials(fullName) {
    if (!fullName) return '';
    const words = fullName.trim().split(' ').filter(Boolean);
    const ignore = ['de', 'da', 'do', 'das', 'dos', 'e'];
    const first = words[0][0];
    let last = '';
    for (let i = words.length - 1; i >= 0; i--) {
      if (!ignore.includes(words[i].toLowerCase())) {
        last = words[i][0];
        break;
      }
    }
    return (first + last).toUpperCase();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu canteiro sustentável</p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Button onClick={handleExport} className="w-full flex items-center justify-center text-center">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full text-center">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atual">Mês Atual</SelectItem>
              <SelectItem value="anterior">Mês Anterior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center">
        <MetricCard
          title="Score IMC"
          value={imcScore}
          icon={BarChart3}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Média IMC"
          value={imcAverage}
          icon={BarChart3}
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Score ESG"
          value={esgScore}
          icon={Leaf}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Média ESG"
          value={esgAverage}
          icon={Leaf}
          iconColor="text-green-400"
        />
        <MetricCard
          title="MTRs Ativos"
          value={activeMTRs}
          icon={FileText}
          iconColor="text-green-500"
        />
        <MetricCard
          title="MTRs Vencidos"
          value={expiredMTRs}
          icon={FileText}
          iconColor="text-red-500"
        />
        <MetricCard
          title="Receita Mensal"
          value={monthlyRevenue}
          icon={DollarSign}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Despesa Mensal"
          value={monthlyExpense}
          icon={DollarSign}
          iconColor="text-red-500"
        />
        <MetricCard
          title="Saldo Mensal"
          value={monthlyBalance}
          icon={DollarSign}
          iconColor={monthlyBalance.startsWith('R$ -') ? "text-red-500" : "text-blue-500"}
        />
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <AlertsNotifications />
        </div>
      </div>
    </div>
  );
}
