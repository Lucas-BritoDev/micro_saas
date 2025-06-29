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

      // Buscar último score IMC do usuário
      try {
        const { data, error } = await supabase
          .from('sustainability_metrics')
          .select('total_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        console.log('Último IMC:', data);
        if (!error && data && 'total_score' in data && data.total_score !== undefined) {
          setImcScore(`${data.total_score}/100`);
        } else {
          setImcScore("0/100");
        }
      } catch (err) {
        setImcScore("0/100");
      }

      // Buscar média do IMC do usuário
      try {
        const { data: imcData, error: imcError } = await supabase
          .from('sustainability_metrics')
          .select('total_score')
          .eq('user_id', user.id);
        if (imcError || !imcData || imcData.length === 0) {
          setImcAverage("0/100");
        } else {
          const sum = imcData.reduce((acc: number, curr: any) => acc + (curr.total_score || 0), 0);
          const avg = Math.round(sum / imcData.length);
          setImcAverage(`${avg}/100`);
        }
      } catch (err) {
        setImcAverage("0/100");
      }

      // Buscar MTRs ativos e vencidos
      try {
        const { data: mtrData, error: mtrError } = await supabase
          .from("mtr_records")
          .select("status")
          .eq("user_id", user.id);
        if (mtrError) {
          setActiveMTRs("0");
          setExpiredMTRs("0");
        } else {
          const ativos = (mtrData || []).filter((m: any) => m.status === 'ativo').length;
          const vencidos = (mtrData || []).filter((m: any) => m.status === 'vencido').length;
          setActiveMTRs(String(ativos));
          setExpiredMTRs(String(vencidos));
        }
      } catch (err) {
        setActiveMTRs("0");
        setExpiredMTRs("0");
      }

      // Buscar transações financeiras do mês atual
      try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const { data: transactions, error: transError } = await supabase
          .from('financial_transactions')
          .select('*')
          .eq('user_id', user.id);
        if (transError) {
          setMonthlyRevenue("R$ 0");
          setMonthlyBalance("R$ 0");
          setMonthlyExpense("R$ 0");
        } else {
          const receitasMes = (transactions || []).filter((t: any) => {
            const date = new Date(t.date);
            return t.type === 'income' && date >= firstDay && date <= lastDay;
          }).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const despesasMes = (transactions || []).filter((t: any) => {
            const date = new Date(t.date);
            return t.type === 'expense' && date >= firstDay && date <= lastDay;
          }).reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const saldoMes = receitasMes - despesasMes;
          setMonthlyRevenue(`R$ ${receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
          setMonthlyBalance(`R$ ${saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
          setMonthlyExpense(`R$ ${despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        }
      } catch (err) {
        setMonthlyRevenue("R$ 0");
        setMonthlyBalance("R$ 0");
        setMonthlyExpense("R$ 0");
      }

      // Buscar último score ESG do relatório
      try {
        const { data: esgScoreData, error: esgScoreError } = await supabase
          .from('esg_scores')
          .select('environmental_score, social_score, governance_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        console.log('Último ESG:', esgScoreData);

        if (!esgScoreError && esgScoreData && typeof esgScoreData === 'object') {
          // Média dos três pilares do último relatório
          const avg = Math.round(((esgScoreData.environmental_score || 0) + (esgScoreData.social_score || 0) + (esgScoreData.governance_score || 0)) / 3);
          setEsgScore(`${avg}/100`);
        } else {
          setEsgScore("0/100");
        }
      } catch (err) {
        setEsgScore("0/100");
      }

      // Buscar média do ESG do usuário
      try {
        const { data: esgData, error: esgError } = await supabase
          .from('esg_scores')
          .select('environmental_score, social_score, governance_score')
          .eq('user_id', user.id);
        if (esgError || !esgData || esgData.length === 0) {
          setEsgAverage("0/100");
        } else {
          // Calcular a média dos três indicadores para cada relatório, depois a média geral
          const esgMedias = esgData.map((item: any) => ((item.environmental_score || 0) + (item.social_score || 0) + (item.governance_score || 0)) / 3);
          const avg = Math.round(esgMedias.reduce((acc: number, curr: number) => acc + curr, 0) / esgMedias.length);
          setEsgAverage(`${avg}/100`);
        }
      } catch (err) {
        setEsgAverage("0/100");
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleExport = () => {
    try {
      exportDashboardData({
        imcScore,
        imcAverage,
        activeMTRs,
        esgScore,
        esgAverage,
        monthlyRevenue,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu canteiro sustentável</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atual">Mês Atual</SelectItem>
              <SelectItem value="anterior">Mês Anterior</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
