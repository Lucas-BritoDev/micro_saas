import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle, Clock, MessageSquare, Calculator, FileText, Leaf, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function AlertsNotifications() {
  const { user } = useAuth();
  const [atividades, setAtividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtividades = async () => {
      if (!user) return;
      setLoading(true);
      const atividadesArr: any[] = [];
      
      // IMC
      const { data: imc } = await supabase
        .from('sustainability_metrics')
        .select('created_at, total_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (imc && imc.length > 0) {
        imc.forEach((item: any) => atividadesArr.push({ 
          tipo: 'IMC', 
          descricao: `Avaliação IMC realizada - Score: ${item.total_score}/100`, 
          data: item.created_at,
          icon: Calculator,
          color: 'border-green-200 bg-green-50',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        }));
      }
      
      // ESG
      const { data: esg } = await supabase
        .from('esg_scores')
        .select('created_at, environmental_score, social_score, governance_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (esg && esg.length > 0) {
        esg.forEach((item: any) => {
          const avg = Math.round(((item.environmental_score || 0) + (item.social_score || 0) + (item.governance_score || 0)) / 3);
          atividadesArr.push({ 
            tipo: 'ESG', 
            descricao: `Relatório ESG preenchido - Score: ${avg}/100`, 
            data: item.created_at,
            icon: Leaf,
            color: 'border-purple-200 bg-purple-50',
            textColor: 'text-purple-800',
            iconColor: 'text-purple-600'
          });
        });
      }
      
      // MTR
      const { data: mtr } = await supabase
        .from('mtr_records')
        .select('created_at, mtr_number, status, due_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (mtr && mtr.length > 0) {
        mtr.forEach((item: any) => {
          const isVencendo = new Date(item.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
          atividadesArr.push({ 
            tipo: 'MTR', 
            descricao: `${isVencendo ? '⚠️ MTR vencendo: ' : 'MTR emitido: '}${item.mtr_number} (${item.status})`, 
            data: item.created_at,
            icon: FileText,
            color: isVencendo ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50',
            textColor: isVencendo ? 'text-red-800' : 'text-blue-800',
            iconColor: isVencendo ? 'text-red-600' : 'text-blue-600'
          });
        });
      }
      
      // Financeiro
      const { data: fin } = await supabase
        .from('financial_transactions')
        .select('created_at, type, amount, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (fin && fin.length > 0) {
        fin.forEach((item: any) => atividadesArr.push({ 
          tipo: 'Financeiro', 
          descricao: `${item.type === 'income' ? 'Receita' : 'Despesa'} lançada: R$ ${item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
          data: item.created_at,
          icon: DollarSign,
          color: item.type === 'income' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
          textColor: item.type === 'income' ? 'text-green-800' : 'text-red-800',
          iconColor: item.type === 'income' ? 'text-green-600' : 'text-red-600'
        }));
      }
      
      // Chamados
      const { data: chamados } = await supabase
        .from('support_tickets')
        .select('created_at, status, subject')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      if (chamados && chamados.length > 0) {
        chamados.forEach((item: any) => {
          if (['aberto', 'em_andamento', 'resolvido', 'fechado'].includes(item.status)) {
            atividadesArr.push({ 
              tipo: 'Suporte', 
              descricao: `Chamado ${item.status}: ${item.subject}`, 
              data: item.created_at,
              icon: MessageSquare,
              color: 'border-orange-200 bg-orange-50',
              textColor: 'text-orange-800',
              iconColor: 'text-orange-600'
            });
          }
        });
      }
      
      // Ordenar por data decrescente e pegar as 5 mais recentes
      atividadesArr.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setAtividades(atividadesArr.slice(0, 5));
      setLoading(false);
    };
    
    fetchAtividades();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-gray-900">Alertas e Notificações</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
        <h3 className="text-lg font-semibold text-gray-900">Alertas e Notificações</h3>
      </div>
      
      <div className="space-y-3">
        {atividades.length === 0 ? (
          <Alert className="border-gray-200 bg-gray-50">
            <Info className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
            <AlertDescription className="text-gray-800">
              <div className="space-y-1">
                <div className="font-semibold">Nenhuma atividade recente</div>
                <div className="text-sm">Suas atividades aparecerão aqui</div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          atividades.map((atividade, index) => {
            const Icon = atividade.icon;
            return (
              <Alert key={index} className={atividade.color}>
                <Icon className={`h-4 w-4 ${atividade.iconColor} flex-shrink-0 mt-0.5`} />
                <AlertDescription className={atividade.textColor}>
                  <div className="space-y-1">
                    <div className="font-semibold">{atividade.descricao}</div>
                    <div className="text-xs opacity-75">{new Date(atividade.data).toLocaleString('pt-BR')}</div>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })
        )}
      </div>
    </div>
  );
}
