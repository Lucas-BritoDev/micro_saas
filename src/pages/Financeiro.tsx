import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2, Download } from "lucide-react";
import { NewTransactionDialog } from "@/components/dialogs/NewTransactionDialog";
import { exportFinancialData } from "@/utils/exportUtils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Label } from "@/components/ui/label";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function Financeiro() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const { user } = useAuth();
  const [filter, setFilter] = useState({
    period: 'all',
    type: '',
    category: '',
    project: '',
    minValue: '',
    maxValue: ''
  });

  // Hook para scroll automático ao topo
  useScrollToTop();

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('financial_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      console.log('Transações carregadas:', data, error);
      if (error) {
        console.error('Error loading transactions from Supabase:', error.message);
        toast.error("Erro ao carregar transações.");
        setTransactions([]);
        return;
      }

      setTransactions(data || []);
    } catch (err) {
      console.error("Unexpected error loading transactions:", err);
      toast.error("Erro inesperado ao buscar transações.");
      setTransactions([]);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowNewTransactionDialog(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Tem certeza que deseja remover esta transação?')) return;
    
    try {
      const { error } = await (supabase as any)
        .from('financial_transactions')
        .delete()
        .eq('id', transactionId);

      if (error) {
        console.error('Error deleting transaction from Supabase:', error.message);
        toast.error('Erro ao remover transação.');
        return;
      }
      
      loadTransactions();
      toast.success('Transação removida com sucesso!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Erro ao remover transação');
    }
  };

  const handleExport = () => {
    exportFinancialData(transactions);
    toast.success('Dados financeiros exportados com sucesso!');
  };

  const handleDeleteAllFinance = async () => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir TODOS os lançamentos financeiros? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('financial_transactions').delete().eq('user_id', user.id);
    if (!error) {
      setTransactions([]);
      toast.success('Todos os lançamentos financeiros foram excluídos!');
    } else {
      toast.error('Erro ao excluir lançamentos: ' + error.message);
    }
  };

  const totalReceitas = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalDespesas = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const saldo = totalReceitas - totalDespesas;

  // Filtros aplicados
  const filteredTransactions = transactions.filter(t => {
    let ok = true;
    if (filter.type && t.type !== filter.type) ok = false;
    if (filter.category && t.category !== filter.category) ok = false;
    if (filter.project && t.project !== filter.project) ok = false;
    if (filter.minValue && t.amount < Number(filter.minValue)) ok = false;
    if (filter.maxValue && t.amount > Number(filter.maxValue)) ok = false;
    // Filtro de período (exemplo: mês atual)
    if (filter.period !== 'all') {
      const now = new Date();
      const date = new Date(t.date);
      if (filter.period === 'month' && (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear())) ok = false;
      if (filter.period === 'year' && date.getFullYear() !== now.getFullYear()) ok = false;
    }
    return ok;
  });

  // Dados para gráficos
  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
  const pieData = categories.map(cat => ({
    name: cat,
    value: transactions.filter(t => t.category === cat && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  }));
  const pieColors = ['#22c55e', '#2563eb', '#eab308', '#f97316', '#a21caf', '#06b6d4', '#f43f5e', '#0ea5e9'];

  // Evolução do saldo por mês
  const months = Array.from({ length: 12 }, (_, i) => i);
  const saldoPorMes = months.map(m => {
    const receitas = transactions.filter(t => new Date(t.date).getMonth() === m && t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const despesas = transactions.filter(t => new Date(t.date).getMonth() === m && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      mes: new Date(2000, m, 1).toLocaleString('pt-BR', { month: 'short' }),
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Painel Financeiro</h1>
        <p className="text-gray-600 mt-1">Controle financeiro por projeto</p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Button variant="outline" onClick={handleExport} className="w-full flex items-center justify-center text-center">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 w-full flex items-center justify-center text-center" onClick={() => setShowNewTransactionDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Transação
          </Button>
          <Button variant="destructive" onClick={handleDeleteAllFinance} className="w-full flex items-center justify-center text-center">
            <Trash2 className="h-4 w-4 mr-2" /> Zerar Lançamentos
          </Button>
        </div>
      </div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-red-600">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros avançados */}
      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end justify-center text-center">
            <div>
              <Label>Período</Label>
              <select value={filter.period} onChange={e => setFilter(f => ({ ...f, period: e.target.value }))} className="border rounded px-2 py-1">
                <option value="all">Todos</option>
                <option value="month">Mês Atual</option>
                <option value="year">Ano Atual</option>
              </select>
            </div>
            <div>
              <Label>Tipo</Label>
              <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="border rounded px-2 py-1">
                <option value="">Todos</option>
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </div>
            <div>
              <Label>Categoria</Label>
              <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} className="border rounded px-2 py-1">
                <option value="">Todas</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <Label>Projeto</Label>
              <input value={filter.project} onChange={e => setFilter(f => ({ ...f, project: e.target.value }))} className="border rounded px-2 py-1" />
            </div>
            <div>
              <Label>Valor Mínimo</Label>
              <input type="number" value={filter.minValue} onChange={e => setFilter(f => ({ ...f, minValue: e.target.value }))} className="border rounded px-2 py-1" />
            </div>
            <div>
              <Label>Valor Máximo</Label>
              <input type="number" value={filter.maxValue} onChange={e => setFilter(f => ({ ...f, maxValue: e.target.value }))} className="border rounded px-2 py-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>Movimentações financeiras</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">Clique em "Nova Transação" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex flex-col space-y-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-start space-x-2">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base">{transaction.description}</h4>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {transaction.project}
                        </Badge>
                      </div>
                      <span className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(transaction.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Nova Transação */}
      <NewTransactionDialog
        isOpen={showNewTransactionDialog}
        onClose={() => {
          setShowNewTransactionDialog(false);
          setEditingTransaction(null);
        }}
        onSuccess={loadTransactions}
        editingTransaction={editingTransaction}
      />

      {/* Gráficos financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={v => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Evolução do Saldo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={saldoPorMes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={v => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Line type="monotone" dataKey="saldo" stroke="#2563eb" name="Saldo" />
                <Line type="monotone" dataKey="receitas" stroke="#22c55e" name="Receitas" />
                <Line type="monotone" dataKey="despesas" stroke="#f43f5e" name="Despesas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela detalhada de transações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Transações Detalhadas</CardTitle>
          <CardDescription className="text-center">Todos os campos e filtros aplicados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">Ajuste os filtros ou clique em "Nova Transação" para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-center">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 border">Descrição</th>
                    <th className="p-2 border">Projeto</th>
                    <th className="p-2 border">Valor</th>
                    <th className="p-2 border">Tipo</th>
                    <th className="p-2 border">Data</th>
                    <th className="p-2 border">Categoria</th>
                    <th className="p-2 border">Observação</th>
                    <th className="p-2 border">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 border">{t.description}</td>
                      <td className="p-2 border">{t.project}</td>
                      <td className="p-2 border">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2 border">{t.type === 'income' ? 'Receita' : 'Despesa'}</td>
                      <td className="p-2 border">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2 border">{t.category}</td>
                      <td className="p-2 border">{t.observacao}</td>
                      <td className="p-2 border">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(t)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
