import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Leaf, Users, Shield, Target, Save, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function NovaMetaESG() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentScores, setCurrentScores] = useState({ environmental: 0, social: 0, governance: 0 });
  const [metaForm, setMetaForm] = useState({
    title: '',
    environmental: '',
    social: '',
    governance: '',
    deadline: '',
    description: ''
  });
  const [existingGoal, setExistingGoal] = useState<any>(null);

  // Hook para scroll automático ao topo
  useScrollToTop();

  useEffect(() => {
    if (!user) return;
    fetchCurrentScores();
  }, [user]);

  async function fetchCurrentScores() {
    try {
      const { data: scores, error } = await supabase
        .from('esg_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && scores && scores.length > 0) {
        const lastScore = scores[0];
        setCurrentScores({
          environmental: lastScore.environmental_score || 0,
          social: lastScore.social_score || 0,
          governance: lastScore.governance_score || 0
        });
      }
    } catch (error) {
      console.error('Erro ao buscar scores atuais:', error);
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setMetaForm(prev => ({ ...prev, [name]: value }));
  }

  function calculateTargetScore(current, improvement) {
    const improvementValue = parseFloat(improvement) || 0;
    return Math.min(100, current + improvementValue);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const targetEnvironmental = calculateTargetScore(currentScores.environmental, metaForm.environmental);
      const targetSocial = calculateTargetScore(currentScores.social, metaForm.social);
      const targetGovernance = calculateTargetScore(currentScores.governance, metaForm.governance);

      const metaData = {
        user_id: user.id,
        title: metaForm.title || 'Meta ESG Geral',
        description: metaForm.description || '',
        progress: 0,
        status: 'em_andamento',
        color: '#3B82F6',
        target_date: metaForm.deadline || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('esg_goals').insert(metaData);

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      toast.success('Meta ESG criada com sucesso!');
      navigate('/painel-esg');
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta ESG. Verifique se o banco foi atualizado.');
    } finally {
      setLoading(false);
    }
  }

  const targetEnvironmental = calculateTargetScore(currentScores.environmental, metaForm.environmental);
  const targetSocial = calculateTargetScore(currentScores.social, metaForm.social);
  const targetGovernance = calculateTargetScore(currentScores.governance, metaForm.governance);

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0 space-y-6 text-center">
      <div className="flex flex-col mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nova Meta ESG</h1>
        <p className="text-gray-600 mt-1">Defina uma nova meta de sustentabilidade</p>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-center">Informações da Meta</CardTitle>
          <CardDescription className="text-center">Preencha os campos abaixo para criar uma nova meta ESG</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div>
                <Label htmlFor="title">Título da Meta (opcional)</Label>
                <Input
                  id="title"
                  name="title"
                  value={metaForm.title}
                  onChange={handleFormChange}
                  placeholder="Ex: Melhorar sustentabilidade em 2024"
                />
              </div>

              <div>
                <Label htmlFor="deadline">Prazo (opcional)</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={metaForm.deadline}
                  onChange={handleFormChange}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <textarea
                  id="description"
                  name="description"
                  value={metaForm.description}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  placeholder="Descreva os objetivos desta meta..."
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Melhorias Desejadas (%)</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="environmental" className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      Ambiental (E)
                    </Label>
                    <Input
                      id="environmental"
                      name="environmental"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={metaForm.environmental}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="social" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Social (S)
                    </Label>
                    <Input
                      id="social"
                      name="social"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={metaForm.social}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="governance" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      Governança (G)
                    </Label>
                    <Input
                      id="governance"
                      name="governance"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={metaForm.governance}
                      onChange={handleFormChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Criar Meta
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Meta</CardTitle>
            <CardDescription>
              Visualize o impacto das suas metas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Ambiental */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Ambiental (E)</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Atual:</span>
                    <span className="font-medium">{currentScores.environmental}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Melhoria:</span>
                    <span className="font-medium text-green-600">
                      +{parseFloat(metaForm.environmental) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Meta:</span>
                    <span className="text-green-700">{targetEnvironmental}/100</span>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Social (S)</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Atual:</span>
                    <span className="font-medium">{currentScores.social}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Melhoria:</span>
                    <span className="font-medium text-blue-600">
                      +{parseFloat(metaForm.social) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Meta:</span>
                    <span className="text-blue-700">{targetSocial}/100</span>
                  </div>
                </div>
              </div>

              {/* Governança */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Governança (G)</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Atual:</span>
                    <span className="font-medium">{currentScores.governance}/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Melhoria:</span>
                    <span className="font-medium text-purple-600">
                      +{parseFloat(metaForm.governance) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Meta:</span>
                    <span className="text-purple-700">{targetGovernance}/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Médio */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Score ESG Médio</div>
                <div className="text-2xl font-bold text-gray-800">
                  {((targetEnvironmental + targetSocial + targetGovernance) / 3).toFixed(1)}/100
                </div>
                <div className="text-xs text-gray-500">
                  Média das metas dos 3 indicadores
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 