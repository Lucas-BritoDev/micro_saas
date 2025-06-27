import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Download, TrendingUp, Leaf, Users, Shield, Plus, Calculator, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const ESG_COLORS = ["#22c55e", "#2563eb", "#a21caf"];
const WASTE_COLORS = ["#22c55e", "#2563eb", "#eab308", "#f97316", "#a21caf", "#06b6d4"];

export default function PainelESG() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [esgScores, setEsgScores] = useState({ environmental: 0, social: 0, governance: 0 });
  const [esgHistory, setEsgHistory] = useState([]); // [{date, environmental, social, governance}]
  const [wasteDist, setWasteDist] = useState([]); // [{name, value}]
  const [goals, setGoals] = useState([]); // [{title, progress}]
  const [showEsgForm, setShowEsgForm] = useState(false);
  const [esgForm, setEsgForm] = useState({ environmental: '', social: '', governance: '', waste: [{ name: '', value: '' }] });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', progress: '', e: '', s: '', g: '' });
  const [monthsFilter, setMonthsFilter] = useState(3);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [lastScore, setLastScore] = useState(null);

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

  function handleEsgFormChange(e, idx) {
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

  function addWasteField() {
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

  function handleGoalFormChange(e) {
    setGoalForm({ ...goalForm, [e.target.name]: e.target.value });
  }

  async function handleGoalFormSubmit(e) {
    e.preventDefault();
    if (!user) return;
    await supabase.from('esg_goals').insert({ user_id: user.id, title: goalForm.title, progress: Number(goalForm.progress), created_at: new Date().toISOString(), color: '' });
    setShowGoalForm(false);
    setGoalForm({ title: '', progress: '', e: '', s: '', g: '' });
    fetchESGData();
    toast.success('Meta adicionada!');
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"><Leaf className="text-green-600" /> Painel ESG</h1>
        <Button variant="destructive" onClick={handleDeleteAllESG} className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Zerar Relatórios
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <p className="text-gray-600 mt-1">Environmental, Social & Governance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" onClick={() => toast.info('Exportação em desenvolvimento!')} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button onClick={handleShowScore} className="w-full sm:w-auto bg-blue-600 text-white">
            Score ESG
          </Button>
          <Button onClick={() => setShowEsgForm(true)} className="w-full sm:w-auto">
            <Calculator className="h-4 w-4 mr-2" />
            Calcular ESG
          </Button>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span>Visualizando dados dos últimos {monthsFilter} relatórios</span>
        <select value={monthsFilter} onChange={handleMonthsFilterChange} className="border rounded px-2 py-1 text-sm">
          <option value={3}>3 relatórios</option>
          <option value={6}>6 relatórios</option>
          <option value={9}>9 relatórios</option>
          <option value={12}>12 relatórios</option>
        </select>
      </div>
      {/* Cards ESG */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Card Score ESG */}
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Score ESG</span>
            <span className="text-3xl font-bold">
              {esgHistory.length > 0 ? (((esgScores.environmental || 0) + (esgScores.social || 0) + (esgScores.governance || 0)) / 3).toFixed(2) : '0.00'}/100
            </span>
            <span className="text-blue-600 text-xs">Média dos 3 indicadores</span>
            <TrendingUp className="h-6 w-6 mt-2 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Ambiental (E)</span>
            <span className="text-3xl font-bold">{esgScores.environmental}/100</span>
            <span className="text-green-600 text-xs">{esgHistory.length > 1 ? `+${esgScores.environmental - esgHistory[esgHistory.length-2].environmental} pts` : '+0 pts'}</span>
            <Leaf className="h-6 w-6 mt-2 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Social (S)</span>
            <span className="text-3xl font-bold">{esgScores.social}/100</span>
            <span className="text-blue-600 text-xs">{esgHistory.length > 1 ? `+${esgScores.social - esgHistory[esgHistory.length-2].social} pts` : '+0 pts'}</span>
            <Users className="h-6 w-6 mt-2 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-gray-500 text-xs mb-1">Governança (G)</span>
            <span className="text-3xl font-bold">{esgScores.governance}/100</span>
            <span className="text-purple-600 text-xs">{esgHistory.length > 1 ? `+${esgScores.governance - esgHistory[esgHistory.length-2].governance} pts` : '+0 pts'}</span>
            <Shield className="h-6 w-6 mt-2 text-purple-500" />
          </CardContent>
        </Card>
      </div>
      {/* Gráficos ESG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Metas ESG 2024</CardTitle>
          </div>
          <Button size="sm" onClick={() => setShowGoalForm(true)}><Plus className="h-4 w-4 mr-1" /> Nova Meta</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map(goal => (
              <div key={goal.id} className="bg-gray-50 rounded p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span>{goal.title}</span>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteGoal(goal.id)}>Excluir</Button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                </div>
                <span className="text-xs text-gray-500">Progresso: {goal.progress}%</span>
              </div>
            ))}
            {goals.length === 0 && <div className="text-gray-400">Nenhuma meta cadastrada.</div>}
          </div>
        </CardContent>
      </Card>

      {/* Formulário ESG */}
      <Dialog open={showEsgForm} onOpenChange={setShowEsgForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Calcular ESG</DialogTitle>
          </DialogHeader>
          <div className="mb-4 text-xs text-gray-600 whitespace-pre-line">
            Vários métodos e relatórios de ESG e sustentabilidade estão disponíveis para as empresas, e uma crítica em torno desses métodos reside no princípio da autodeclaração, ou seja, as empresas podem escolher os indicadores ESG que serão divulgados, podendo gerar inconsistência e falta de objetividade. Com essa ressalva, destacamos quais os são norteadores importantes.

GRI 
O método mais conhecido e utilizado para relatórios de sustentabilidade é o GRI Standards, da Global Reporting Initiative.

Desde 2018, as normas GRI compilam dados para a divulgação pública de informações ESG e seus impactos econômicos, ambientais e sociais. Muitos pesquisadores e estudiosos do tema da sustentabilidade nas micro e pequenas empresas colocam que este método não atende plenamente às especificidades das MPE's, sendo mais voltados para as grandes corporações. 
          </div>
          <form onSubmit={handleEsgFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Ambiental (E)</Label>
                <Input name="environmental" type="number" min={0} max={100} value={esgForm.environmental} onChange={handleEsgFormChange} required />
              </div>
              <div>
                <Label>Social (S)</Label>
                <Input name="social" type="number" min={0} max={100} value={esgForm.social} onChange={handleEsgFormChange} required />
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
                  <Input name={`waste-${idx}-name`} placeholder="Tipo (ex: Concreto)" value={w.name} onChange={e => handleEsgFormChange(e, idx)} required className="flex-1" />
                  <Input name={`waste-${idx}-value`} placeholder="%" type="number" min={0} max={100} value={w.value} onChange={e => handleEsgFormChange(e, idx)} required className="w-20" />
                </div>
              ))}
              <Button type="button" size="sm" onClick={addWasteField}>Adicionar Tipo</Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowEsgForm(false)}>Cancelar</Button>
              <Button type="submit" className="bg-green-600 text-white">Salvar ESG</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Formulário de Meta ESG */}
      <Dialog open={showGoalForm} onOpenChange={setShowGoalForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Meta ESG</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGoalFormSubmit} className="space-y-4">
            <div>
              <Label>Título da Meta</Label>
              <Input name="title" value={goalForm.title} onChange={handleGoalFormChange} required />
            </div>
            <div>
              <Label>Progresso (%)</Label>
              <Input name="progress" type="number" min={0} max={100} value={goalForm.progress} onChange={handleGoalFormChange} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <Label>Melhorar Ambiental (%)</Label>
                <Input name="e" type="number" min={0} max={100} value={goalForm.e} onChange={handleGoalFormChange} required />
              </div>
              <div>
                <Label>Melhorar Social (%)</Label>
                <Input name="s" type="number" min={0} max={100} value={goalForm.s} onChange={handleGoalFormChange} required />
              </div>
              <div>
                <Label>Melhorar Governança (%)</Label>
                <Input name="g" type="number" min={0} max={100} value={goalForm.g} onChange={handleGoalFormChange} required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowGoalForm(false)}>Cancelar</Button>
              <Button type="submit" className="bg-green-600 text-white">Salvar Meta</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Score ESG */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Score ESG</DialogTitle>
          </DialogHeader>
          <div className="text-center text-2xl font-bold py-4">{lastScore}</div>
          <div className="text-center text-gray-500">Média dos 3 indicadores do último relatório ESG</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}