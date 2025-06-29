import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Download, TrendingUp, Leaf, Users, Shield, Plus, Calculator, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { exportToXLS } from "@/utils/exportUtils";

const ESG_COLORS = ["#22c55e", "#2563eb", "#a21caf"];
const WASTE_COLORS = ["#22c55e", "#2563eb", "#eab308", "#f97316", "#a21caf", "#06b6d4"];

export default function PainelESG() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [esgScores, setEsgScores] = useState({ environmental: 0, social: 0, governance: 0 });
  const [esgHistory, setEsgHistory] = useState([]); // [{date, environmental, social, governance}]
  const [wasteDist, setWasteDist] = useState([]); // [{name, value}]
  const [goals, setGoals] = useState([]); // [{title, progress}]
  const [showEsgForm, setShowEsgForm] = useState(false);
  const [esgForm, setEsgForm] = useState({ environmental: '', social: '', governance: '', waste: [{ name: '', value: '' }] });
  const [monthsFilter, setMonthsFilter] = useState(3);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [lastScore, setLastScore] = useState(null);

  // Hook para scroll automático ao topo
  useScrollToTop();

  useEffect(() => {
    if (!user) return;
    fetchESGData();
  }, [user]);

  async function fetchESGData() {
    setLoading(true);
    // Buscar scores ESG
    const { data: scores, error: err1 } = await supabase.from('esg_scores').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    // Buscar distribuição resíduos
    const { data: waste, error: err2 } = await supabase.from('waste_distribution').select('*').eq('user_id', user.id);
    // Buscar metas
    const { data: metas, error: err3 } = await supabase.from('esg_goals').select('*').eq('user_id', user.id);
    if (!err1 && scores && scores.length > 0) {
      const last = scores[scores.length - 1];
      setEsgScores({ environmental: last.environmental_score, social: last.social_score, governance: last.governance_score });
      // Pega os últimos 12 meses
      const last12 = scores.slice(-12);
      setEsgHistory(last12.map((s, idx) => ({
        date: s.created_at,
        environmental: s.environmental_score,
        social: s.social_score,
        governance: s.governance_score,
        month: new Date(s.created_at).toLocaleString('pt-BR', { month: 'short' })
      })));
      // Filtra resíduos apenas do último relatório ESG
      if (waste && waste.length > 0) {
        // Se todos resíduos têm created_at, filtra normalmente
        if (waste.every(w => w.created_at)) {
          const lastReportDate = last.created_at;
          const lastWaste = waste.filter(w => w.created_at === lastReportDate);
          setWasteDist(lastWaste);
        } else {
          // Se não tem created_at, pega todos os resíduos cadastrados
          setWasteDist(waste);
        }
      } else {
        setWasteDist([]);
      }
    } else {
      setEsgScores({ environmental: 0, social: 0, governance: 0 });
      setEsgHistory([]);
      setWasteDist([]);
    }
    setGoals(metas || []);
    setLoading(false);
  }

  function handleEsgFormChange(e) {
    if (e.target.name.startsWith('waste-')) {
      const i = parseInt(e.target.name.split('-')[1]);
      const field = e.target.name.split('-')[2];
      const newWaste = [...esgForm.waste];
      newWaste[i][field] = e.target.value;
      setEsgForm({ ...esgForm, waste: newWaste });
    } else {
      setEsgForm({ ...esgForm, [e.target.name]: e.target.value });
    }
  }

  function addWasteField(e) {
    e.preventDefault();
    e.stopPropagation();
    setEsgForm({ ...esgForm, waste: [...esgForm.waste, { name: '', value: '' }] });
  }

  async function handleEsgFormSubmit(e) {
    e.preventDefault();
    if (!user) return;
    // Salvar score ESG
    const now = new Date().toISOString();
    const insertObj = {
      user_id: user.id,
      environmental_score: Number(esgForm.environmental),
      social_score: Number(esgForm.social),
      governance_score: Number(esgForm.governance),
      environmental_change: 0,
      social_change: 0,
      governance_change: 0,
      created_at: now,
    };
    await supabase.from('esg_scores').insert(insertObj);
    // Salvar distribuição resíduos
    await supabase.from('waste_distribution').delete().eq('user_id', user.id);
    for (const w of esgForm.waste) {
      if (w.name && w.value) {
        await supabase.from('waste_distribution').insert({ user_id: user.id, name: w.name, value: Number(w.value), color: '', created_at: now });
      }
    }
    setShowEsgForm(false);
    fetchESGData();
    toast.success('ESG calculado e salvo!');
  }

  async function handleDeleteGoal(id) {
    await supabase.from('esg_goals').delete().eq('id', id);
    fetchESGData();
  }

  function handleMonthsFilterChange(e) {
    setMonthsFilter(Number(e.target.value));
  }

  function handleShowScore() {
    if (esgHistory.length > 0) {
      const last = esgHistory[esgHistory.length - 1];
      const avg = ((last.environmental || 0) + (last.social || 0) + (last.governance || 0)) / 3;
      setLastScore(avg.toFixed(2));
      setShowScoreDialog(true);
    }
  }

  const handleDeleteAllESG = async () => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir TODOS os relatórios ESG? Esta ação não pode ser desfeita.')) return;
    // Exclui de todas as tabelas relacionadas ao ESG do usuário
    const { error: errorScores } = await supabase.from('esg_scores').delete().eq('user_id', user.id);
    const { error: errorWaste } = await supabase.from('waste_distribution').delete().eq('user_id', user.id);
    const { error: errorGoals } = await supabase.from('esg_goals').delete().eq('user_id', user.id);
    console.log('Delete ESG:', { errorScores, errorWaste, errorGoals });
    if (!errorScores && !errorWaste && !errorGoals) {
      setEsgScores({ environmental: 0, social: 0, governance: 0 });
      setEsgHistory([]);
      setWasteDist([]);
      setGoals([]);
      toast.success('Todos os relatórios ESG foram excluídos!');
    } else {
      toast.error('Erro ao excluir relatórios ESG!');
      console.error(errorScores, errorWaste, errorGoals);
    }
  };

  // Função para exportar todos os dados do painel ESG
  function handleExportESG() {
    // Dados dos cards
    const cards = [
      { Categoria: 'Score ESG (Média dos 3 indicadores)', Valor: esgHistory.length > 0 ? (((esgScores.environmental || 0) + (esgScores.social || 0) + (esgScores.governance || 0)) / 3).toFixed(2) + '/100' : '0.00/100' },
      { Categoria: 'Ambiental (E)', Valor: `${esgScores.environmental}/100` },
      { Categoria: 'Social (S)', Valor: `${esgScores.social}/100` },
      { Categoria: 'Governança (G)', Valor: `${esgScores.governance}/100` },
    ];
    // Evolução ESG (histórico)
    const evolucao = esgHistory.map((h, i) => ({
      Tipo: 'Evolução ESG',
      Mês: h.month || `Mês ${i+1}`,
      Ambiental: h.environmental,
      Social: h.social,
      Governança: h.governance,
      Data: h.date ? new Date(h.date).toLocaleDateString('pt-BR') : ''
    }));
    // Distribuição de resíduos
    const residuos = wasteDist.map(w => ({
      Tipo: 'Resíduo',
      Nome: w.name,
      Valor: w.value
    }));
    // Metas ESG
    const metas = goals.map(goal => ({
      Tipo: 'Meta',
      Título: goal.title,
      Descrição: goal.description,
      Progresso: goal.progress,
      Status: goal.status,
      'Data Meta': goal.target_date ? new Date(goal.target_date).toLocaleDateString('pt-BR') : '',
      'Criada em': goal.created_at ? new Date(goal.created_at).toLocaleDateString('pt-BR') : ''
    }));
    // Junta tudo em um único array
    const data = [
      ...cards,
      ...evolucao,
      ...residuos,
      ...metas
    ];
    exportToXLS(data, 'esg-report', 'Painel ESG');
    toast.success('Relatório ESG exportado com sucesso!');
  }

  // Cálculo das médias dos indicadores conforme filtro
  const filteredHistory = esgHistory.slice(-monthsFilter);
  const avg = (arr, key) => arr.length === 0 ? 0 : arr.reduce((sum, h) => sum + (h[key] || 0), 0) / arr.length;
  const avgEnvironmental = avg(filteredHistory, 'environmental');
  const avgSocial = avg(filteredHistory, 'social');
  const avgGovernance = avg(filteredHistory, 'governance');
  const avgScoreESG = (avgEnvironmental + avgSocial + avgGovernance) / 3;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados ESG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 justify-center"><Leaf className="text-green-600" /> Painel ESG</h1>
        <p className="text-gray-600 mt-1">Environmental, Social & Governance</p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Button variant="outline" onClick={handleExportESG} className="w-full flex items-center justify-center text-center">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Button onClick={() => setShowEsgForm(true)} className="w-full flex items-center justify-center text-center">
            <Calculator className="h-4 w-4 mr-2" /> Calcular ESG
          </Button>
          <Button variant="destructive" onClick={handleDeleteAllESG} className="w-full flex items-center justify-center text-center">
            <Trash2 className="h-4 w-4 mr-2" /> Zerar Relatórios
          </Button>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-center">
        <span>Visualizando dados dos últimos {monthsFilter} relatórios</span>
        <select value={monthsFilter} onChange={handleMonthsFilterChange} className="border rounded px-2 py-1 text-sm text-center">
          <option value={3}>3 relatórios</option>
          <option value={6}>6 relatórios</option>
          <option value={9}>9 relatórios</option>
          <option value={12}>12 relatórios</option>
        </select>
      </div>
      {/* Novos cards: Último resultado ESG - agora acima do filtro */}
      <div className="mb-4">
        <div className="font-semibold text-gray-700 mb-2 text-center">Dados do último cálculo ESG</div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">Último Score ESG</span>
              <span className="text-3xl font-bold">
                {esgHistory.length > 0 ? (((esgHistory[esgHistory.length-1].environmental || 0) + (esgHistory[esgHistory.length-1].social || 0) + (esgHistory[esgHistory.length-1].governance || 0)) / 3).toFixed(2) : '0.00'}/100
              </span>
              <span className="text-blue-600 text-xs">Último relatório</span>
              <TrendingUp className="h-6 w-6 mt-2 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">Último Ambiental (E)</span>
              <span className="text-3xl font-bold">{esgHistory.length > 0 ? esgHistory[esgHistory.length-1].environmental : 0}/100</span>
              <span className="text-green-600 text-xs">Último relatório</span>
              <Leaf className="h-6 w-6 mt-2 text-green-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">Último Social (S)</span>
              <span className="text-3xl font-bold">{esgHistory.length > 0 ? esgHistory[esgHistory.length-1].social : 0}/100</span>
              <span className="text-blue-600 text-xs">Último relatório</span>
              <Users className="h-6 w-6 mt-2 text-blue-500" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">Último Governança (G)</span>
              <span className="text-3xl font-bold">{esgHistory.length > 0 ? esgHistory[esgHistory.length-1].governance : 0}/100</span>
              <span className="text-purple-600 text-xs">Último relatório</span>
              <Shield className="h-6 w-6 mt-2 text-purple-500" />
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Cards ESG */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
        {/* Card Score ESG - Média */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Score ESG</span>
            <span className="text-3xl font-bold">
              {filteredHistory.length > 0 ? avgScoreESG.toFixed(2) : '0.00'}/100
            </span>
            <span className="text-blue-600 text-xs">Média dos 3 indicadores</span>
            <TrendingUp className="h-6 w-6 mt-2 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Ambiental (E)</span>
            <span className="text-3xl font-bold">{avgEnvironmental.toFixed(0)}/100</span>
            <span className="text-green-600 text-xs">Média</span>
            <Leaf className="h-6 w-6 mt-2 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Social (S)</span>
            <span className="text-3xl font-bold">{avgSocial.toFixed(0)}/100</span>
            <span className="text-blue-600 text-xs">Média</span>
            <Users className="h-6 w-6 mt-2 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Governança (G)</span>
            <span className="text-3xl font-bold">{avgGovernance.toFixed(0)}/100</span>
            <span className="text-purple-600 text-xs">Média</span>
            <Shield className="h-6 w-6 mt-2 text-purple-500" />
          </CardContent>
        </Card>
      </div>
      {/* Gráficos ESG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Evolução ESG</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={esgHistory.slice(-monthsFilter).map((h, i) => ({ name: h.month || `Mês ${i+1}`, ...h }))}>
                <XAxis dataKey="name" ticks={["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="environmental" stroke="#22c55e" name="Ambiental" />
                <Line type="monotone" dataKey="social" stroke="#2563eb" name="Social" />
                <Line type="monotone" dataKey="governance" stroke="#a21caf" name="Governança" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Resíduos</CardTitle>
          </CardHeader>
          <CardContent>
            {wasteDist.length === 0 ? (
              <div className="text-gray-400 text-center py-8">Nenhum resíduo cadastrado para este relatório.</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={wasteDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {wasteDist.map((entry, idx) => (
                      <Cell key={entry.name} fill={WASTE_COLORS[idx % WASTE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => `Percentual : ${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Metas ESG */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between text-center">
          <div className="w-full text-center">
            <CardTitle className="text-center">Metas ESG</CardTitle>
          </div>
          <Button size="sm" onClick={() => navigate('/nova-meta-esg')} className="text-center">
            <Plus className="h-4 w-4 mr-1" /> Nova Meta
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            {goals.map(goal => (
              <div key={goal.id} className="bg-gray-50 rounded p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{goal.title || 'Meta ESG'}</h4>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                    {goal.target_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Prazo: {new Date(goal.target_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteGoal(goal.id)}>
                    Excluir
                  </Button>
                </div>
                
                {/* Informação básica da meta */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="text-center">
                    <div className="text-sm text-blue-600 mb-1">Meta ESG</div>
                    <div className="text-lg font-bold text-blue-800">
                      {goal.title || 'Melhorar Sustentabilidade'}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Criada em {new Date(goal.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                
                {/* Progresso geral */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${goal.progress || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Progresso: {goal.progress || 0}%</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    goal.status === 'concluída' ? 'bg-green-100 text-green-800' :
                    goal.status === 'atrasada' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {goal.status === 'concluída' ? 'Concluída' :
                     goal.status === 'atrasada' ? 'Atrasada' :
                     goal.status === 'em_andamento' ? 'Em Andamento' :
                     'Ativa'}
                  </span>
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400">Nenhuma meta cadastrada.</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulário ESG */}
      <Dialog open={showEsgForm} onOpenChange={setShowEsgForm}>
        <DialogContent className="max-w-2xl p-0">
          <div className="overflow-y-auto max-h-[80vh] p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle>Calcular ESG</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEsgFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Ambiental (E)</Label>
                  <Input 
                    name="environmental" 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={esgForm.environmental} 
                    onChange={handleEsgFormChange} 
                    required 
                  />
                </div>
                <div>
                  <Label>Social (S)</Label>
                  <Input 
                    name="social" 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={esgForm.social} 
                    onChange={handleEsgFormChange} 
                    required 
                  />
                </div>
                <div>
                  <Label>Governança (G)</Label>
                  <Input name="governance" type="number" min={0} max={100} value={esgForm.governance} onChange={handleEsgFormChange} required />
                </div>
              </div>
              <div>
                <Label>Distribuição de Resíduos (%)</Label>
                {esgForm.waste.map((w, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input name={`waste-${idx}-name`} value={w.name} onChange={handleEsgFormChange} />
                    <Input name={`waste-${idx}-value`} type="number" min={0} max={100} value={w.value} onChange={handleEsgFormChange} />
                  </div>
                ))}
                <Button type="button" onClick={addWasteField} className="w-full mt-2">Adicionar Resíduo</Button>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2">Calcular ESG</button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}