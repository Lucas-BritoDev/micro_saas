import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IMCQuestions } from '@/components/imc/IMCQuestions';
import { IMCResults } from '@/components/imc/IMCResults';
import { ArrowLeft, FileDown, Calendar, ChevronRight, ChevronLeft, Download, Trash2 } from 'lucide-react';
import { exportIMCResults } from '@/utils/exportUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChartContainer } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface Question {
  id: string;
  category: string;
  question: string;
  options: { value: string; label: string; points: number }[];
}

interface AssessmentResult {
  score: number;
  category_scores: {
    environmental: number;
    social: number;
    governance: number;
  };
}

// Estrutura das perguntas por tipo
const questionGroups = [
  {
    type: 'Governança',
    icon: 'User',
    questions: [
      {
        id: 'gov1',
        question: 'A empresa possui políticas formais de sustentabilidade?',
        options: [
          { value: '1', label: 'Não possui políticas formais', points: 1 },
          { value: '2', label: 'Possui algumas diretrizes básicas', points: 2 },
          { value: '3', label: 'Possui políticas documentadas', points: 3 },
          { value: '4', label: 'Políticas implementadas', points: 4 },
          { value: '5', label: 'Políticas auditadas e certificadas', points: 5 }
        ]
      },
      {
        id: 'gov2',
        question: 'Como é o comprometimento da alta direção com sustentabilidade?',
        options: [
          { value: '1', label: 'Nenhum comprometimento formal', points: 1 },
          { value: '2', label: 'Comprometimento básico', points: 2 },
          { value: '3', label: 'Comprometimento declarado', points: 3 },
          { value: '4', label: 'Comprometimento com recursos', points: 4 },
          { value: '5', label: 'Liderança ativa em sustentabilidade', points: 5 }
        ]
      },
      {
        id: 'gov3',
        question: 'A empresa realiza treinamentos em sustentabilidade?',
        options: [
          { value: '1', label: 'Não realiza treinamentos', points: 1 },
          { value: '2', label: 'Treinamentos esporádicos', points: 2 },
          { value: '3', label: 'Treinamentos anuais', points: 3 },
          { value: '4', label: 'Programa estruturado de treinamentos', points: 4 },
          { value: '5', label: 'Cultura de aprendizado contínuo', points: 5 }
        ]
      },
      {
        id: 'gov4',
        question: 'A empresa possui código de ética relacionado à sustentabilidade?',
        options: [
          { value: '1', label: 'Não possui', points: 1 },
          { value: '2', label: 'Em elaboração', points: 2 },
          { value: '3', label: 'Possui, mas não divulgado', points: 3 },
          { value: '4', label: 'Divulgado para colaboradores', points: 4 },
          { value: '5', label: 'Divulgado e monitorado', points: 5 }
        ]
      },
      {
        id: 'gov5',
        question: 'A empresa possui auditorias de sustentabilidade?',
        options: [
          { value: '1', label: 'Nunca realizou auditorias', points: 1 },
          { value: '2', label: 'Auditorias esporádicas', points: 2 },
          { value: '3', label: 'Auditorias anuais', points: 3 },
          { value: '4', label: 'Auditorias externas', points: 4 },
          { value: '5', label: 'Auditorias externas e certificações', points: 5 }
        ]
      }
    ]
  },
  {
    type: 'Materiais',
    icon: 'Package',
    questions: [
      {
        id: 'mat1',
        question: 'Qual percentual de materiais reciclados é utilizado?',
        options: [
          { value: '1', label: '0-10% materiais reciclados', points: 1 },
          { value: '2', label: '11-25% materiais reciclados', points: 2 },
          { value: '3', label: '26-50% materiais reciclados', points: 3 },
          { value: '4', label: '51-75% materiais reciclados', points: 4 },
          { value: '5', label: 'Mais de 75% materiais reciclados', points: 5 }
        ]
      },
      {
        id: 'mat2',
        question: 'A empresa possui fornecedores certificados ambientalmente?',
        options: [
          { value: '1', label: 'Não verifica certificações', points: 1 },
          { value: '2', label: 'Verifica ocasionalmente', points: 2 },
          { value: '3', label: 'Metade dos fornecedores certificados', points: 3 },
          { value: '4', label: 'Maioria dos fornecedores certificados', points: 4 },
          { value: '5', label: 'Todos os fornecedores certificados', points: 5 }
        ]
      },
      {
        id: 'mat3',
        question: 'A empresa utiliza materiais de baixo impacto ambiental?',
        options: [
          { value: '1', label: 'Nunca utiliza', points: 1 },
          { value: '2', label: 'Raramente utiliza', points: 2 },
          { value: '3', label: 'Utiliza em alguns projetos', points: 3 },
          { value: '4', label: 'Utiliza na maioria dos projetos', points: 4 },
          { value: '5', label: 'Utiliza em todos os projetos', points: 5 }
        ]
      },
      {
        id: 'mat4',
        question: 'A empresa possui controle de origem dos materiais?',
        options: [
          { value: '1', label: 'Não possui controle', points: 1 },
          { value: '2', label: 'Controle manual', points: 2 },
          { value: '3', label: 'Controle digital básico', points: 3 },
          { value: '4', label: 'Controle digital avançado', points: 4 },
          { value: '5', label: 'Controle digital integrado com fornecedores', points: 5 }
        ]
      },
      {
        id: 'mat5',
        question: 'A empresa realiza análise de ciclo de vida dos materiais?',
        options: [
          { value: '1', label: 'Nunca realiza', points: 1 },
          { value: '2', label: 'Raramente realiza', points: 2 },
          { value: '3', label: 'Realiza em alguns projetos', points: 3 },
          { value: '4', label: 'Realiza na maioria dos projetos', points: 4 },
          { value: '5', label: 'Realiza em todos os projetos', points: 5 }
        ]
      }
    ]
  },
  {
    type: 'Energia',
    icon: 'Zap',
    questions: [
      {
        id: 'ene1',
        question: 'A empresa utiliza fontes de energia renovável?',
        options: [
          { value: '1', label: 'Não utiliza energia renovável', points: 1 },
          { value: '2', label: '1-25% energia renovável', points: 2 },
          { value: '3', label: '26-50% energia renovável', points: 3 },
          { value: '4', label: '51-75% energia renovável', points: 4 },
          { value: '5', label: 'Mais de 75% energia renovável', points: 5 }
        ]
      },
      {
        id: 'ene2',
        question: 'Como é o monitoramento do consumo energético?',
        options: [
          { value: '1', label: 'Não monitora', points: 1 },
          { value: '2', label: 'Controle básico mensal', points: 2 },
          { value: '3', label: 'Monitoramento semanal', points: 3 },
          { value: '4', label: 'Monitoramento diário', points: 4 },
          { value: '5', label: 'Monitoramento em tempo real', points: 5 }
        ]
      },
      {
        id: 'ene3',
        question: 'A empresa possui metas de redução de consumo energético?',
        options: [
          { value: '1', label: 'Não possui metas', points: 1 },
          { value: '2', label: 'Metas informais', points: 2 },
          { value: '3', label: 'Metas anuais', points: 3 },
          { value: '4', label: 'Metas monitoradas', points: 4 },
          { value: '5', label: 'Metas monitoradas e revisadas', points: 5 }
        ]
      },
      {
        id: 'ene4',
        question: 'A empresa investe em eficiência energética?',
        options: [
          { value: '1', label: 'Não investe', points: 1 },
          { value: '2', label: 'Investimentos pontuais', points: 2 },
          { value: '3', label: 'Projetos de eficiência em alguns setores', points: 3 },
          { value: '4', label: 'Projetos em toda a empresa', points: 4 },
          { value: '5', label: 'Projetos contínuos e inovadores', points: 5 }
        ]
      },
      {
        id: 'ene5',
        question: 'A empresa divulga publicamente seu desempenho energético?',
        options: [
          { value: '1', label: 'Não divulga', points: 1 },
          { value: '2', label: 'Divulga internamente', points: 2 },
          { value: '3', label: 'Divulga em relatórios anuais', points: 3 },
          { value: '4', label: 'Divulga em relatórios públicos', points: 4 },
          { value: '5', label: 'Divulga e compara com benchmarks', points: 5 }
        ]
      }
    ]
  },
  {
    type: 'Design Circular',
    icon: 'RefreshCcw',
    questions: [
      {
        id: 'des1',
        question: 'Os projetos consideram princípios de economia circular?',
        options: [
          { value: '1', label: 'Não consideram princípios circulares', points: 1 },
          { value: '2', label: 'Considera ocasionalmente', points: 2 },
          { value: '3', label: 'Considera na maioria dos projetos', points: 3 },
          { value: '4', label: 'Sempre considera com metodologia', points: 4 },
          { value: '5', label: 'Design circular é padrão obrigatório', points: 5 }
        ]
      },
      {
        id: 'des2',
        question: 'Como é feita a seleção de materiais nos projetos?',
        options: [
          { value: '1', label: 'Apenas por custo', points: 1 },
          { value: '2', label: 'Custo e qualidade básica', points: 2 },
          { value: '3', label: 'Inclui critérios ambientais básicos', points: 3 },
          { value: '4', label: 'Avaliação de ciclo de vida simplificada', points: 4 },
          { value: '5', label: 'ACV completa e certificações', points: 5 }
        ]
      },
      {
        id: 'des3',
        question: 'A empresa utiliza design para desmontagem e reutilização?',
        options: [
          { value: '1', label: 'Nunca utiliza', points: 1 },
          { value: '2', label: 'Raramente utiliza', points: 2 },
          { value: '3', label: 'Utiliza em alguns projetos', points: 3 },
          { value: '4', label: 'Utiliza na maioria dos projetos', points: 4 },
          { value: '5', label: 'Utiliza em todos os projetos', points: 5 }
        ]
      },
      {
        id: 'des4',
        question: 'A empresa adota BIM para otimizar recursos?',
        options: [
          { value: '1', label: 'Não utiliza BIM', points: 1 },
          { value: '2', label: 'Utiliza BIM em projetos piloto', points: 2 },
          { value: '3', label: 'Utiliza BIM em alguns projetos', points: 3 },
          { value: '4', label: 'Utiliza BIM na maioria dos projetos', points: 4 },
          { value: '5', label: 'Utiliza BIM em todos os projetos', points: 5 }
        ]
      },
      {
        id: 'des5',
        question: 'A empresa realiza análise de ciclo de vida dos projetos?',
        options: [
          { value: '1', label: 'Nunca realiza', points: 1 },
          { value: '2', label: 'Raramente realiza', points: 2 },
          { value: '3', label: 'Realiza em alguns projetos', points: 3 },
          { value: '4', label: 'Realiza na maioria dos projetos', points: 4 },
          { value: '5', label: 'Realiza em todos os projetos', points: 5 }
        ]
      }
    ]
  },
  {
    type: 'Resíduos',
    icon: 'Recycle',
    questions: [
      {
        id: 'res1',
        question: 'Como é feita a segregação de resíduos na obra?',
        options: [
          { value: '1', label: 'Não há segregação', points: 1 },
          { value: '2', label: 'Segregação básica (2-3 tipos)', points: 2 },
          { value: '3', label: 'Segregação intermediária (4-6 tipos)', points: 3 },
          { value: '4', label: 'Segregação avançada (7+ tipos)', points: 4 },
          { value: '5', label: 'Segregação total com rastreabilidade', points: 5 }
        ]
      },
      {
        id: 'res2',
        question: 'Qual percentual de resíduos é destinado para reciclagem?',
        options: [
          { value: '1', label: '0-20% reciclado', points: 1 },
          { value: '2', label: '21-40% reciclado', points: 2 },
          { value: '3', label: '41-60% reciclado', points: 3 },
          { value: '4', label: '61-80% reciclado', points: 4 },
          { value: '5', label: 'Mais de 80% reciclado', points: 5 }
        ]
      },
      {
        id: 'res3',
        question: 'A empresa possui plano de gerenciamento de resíduos?',
        options: [
          { value: '1', label: 'Não possui', points: 1 },
          { value: '2', label: 'Plano básico', points: 2 },
          { value: '3', label: 'Plano documentado', points: 3 },
          { value: '4', label: 'Plano implementado', points: 4 },
          { value: '5', label: 'Plano auditado e certificado', points: 5 }
        ]
      },
      {
        id: 'res4',
        question: 'A empresa monitora a geração de resíduos?',
        options: [
          { value: '1', label: 'Não monitora', points: 1 },
          { value: '2', label: 'Monitoramento esporádico', points: 2 },
          { value: '3', label: 'Monitoramento mensal', points: 3 },
          { value: '4', label: 'Monitoramento semanal', points: 4 },
          { value: '5', label: 'Monitoramento em tempo real', points: 5 }
        ]
      },
      {
        id: 'res5',
        question: 'A empresa realiza ações para redução de resíduos?',
        options: [
          { value: '1', label: 'Não realiza ações', points: 1 },
          { value: '2', label: 'Ações pontuais', points: 2 },
          { value: '3', label: 'Ações em alguns projetos', points: 3 },
          { value: '4', label: 'Ações em todos os projetos', points: 4 },
          { value: '5', label: 'Ações contínuas e inovadoras', points: 5 }
        ]
      }
    ]
  },
  {
    type: 'Água',
    icon: 'Droplet',
    questions: [
      {
        id: 'agu1',
        question: 'A empresa implementa sistemas de reuso de água?',
        options: [
          { value: '1', label: 'Não reutiliza água', points: 1 },
          { value: '2', label: 'Reuso básico eventual', points: 2 },
          { value: '3', label: 'Sistema simples de reuso', points: 3 },
          { value: '4', label: 'Sistema avançado de reuso', points: 4 },
          { value: '5', label: 'Circuito fechado de água', points: 5 }
        ]
      },
      {
        id: 'agu2',
        question: 'Como é feito o controle do consumo de água?',
        options: [
          { value: '1', label: 'Sem controle específico', points: 1 },
          { value: '2', label: 'Controle mensal básico', points: 2 },
          { value: '3', label: 'Monitoramento semanal', points: 3 },
          { value: '4', label: 'Controle diário com metas', points: 4 },
          { value: '5', label: 'Monitoramento em tempo real', points: 5 }
        ]
      },
      {
        id: 'agu3',
        question: 'A empresa possui metas de redução de consumo de água?',
        options: [
          { value: '1', label: 'Não possui metas', points: 1 },
          { value: '2', label: 'Metas informais', points: 2 },
          { value: '3', label: 'Metas anuais', points: 3 },
          { value: '4', label: 'Metas monitoradas', points: 4 },
          { value: '5', label: 'Metas monitoradas e revisadas', points: 5 }
        ]
      },
      {
        id: 'agu4',
        question: 'A empresa investe em eficiência hídrica?',
        options: [
          { value: '1', label: 'Não investe', points: 1 },
          { value: '2', label: 'Investimentos pontuais', points: 2 },
          { value: '3', label: 'Projetos de eficiência em alguns setores', points: 3 },
          { value: '4', label: 'Projetos em toda a empresa', points: 4 },
          { value: '5', label: 'Projetos contínuos e inovadores', points: 5 }
        ]
      },
      {
        id: 'agu5',
        question: 'A empresa divulga publicamente seu desempenho hídrico?',
        options: [
          { value: '1', label: 'Não divulga', points: 1 },
          { value: '2', label: 'Divulga internamente', points: 2 },
          { value: '3', label: 'Divulga em relatórios anuais', points: 3 },
          { value: '4', label: 'Divulga em relatórios públicos', points: 4 },
          { value: '5', label: 'Divulga e compara com benchmarks', points: 5 }
        ]
      }
    ]
  },
];

export default function CalculadoraIMC() {
  const [currentGroup, setCurrentGroup] = useState(0); // etapa atual (tipo)
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState<string>('');
  const { user } = useAuth();
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultForm, setConsultForm] = useState({ nome: '', email: '', telefone: '', data: '', observacao: '' });
  const [consultLoading, setConsultLoading] = useState(false);

  // Hook para scroll automático ao topo
  useScrollToTop();

  // Buscar histórico ao carregar
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('sustainability_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setHistory(data);
    };
    fetchHistory();
  }, [user, assessment]);

  // Handler para respostas
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Navegação entre grupos
  const handleNextGroup = () => {
    if (currentGroup < questionGroups.length - 1) {
      setCurrentGroup(prev => prev + 1);
      // Scroll para o topo da tela
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handlePreviousGroup = () => {
    if (currentGroup > 0) {
      setCurrentGroup(prev => prev - 1);
      // Scroll para o topo da tela
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Progresso
  const progress = ((currentGroup + 1) / questionGroups.length) * 100;

  // Renderização das perguntas do grupo atual
  const group = questionGroups[currentGroup];

  // Função para calcular os scores reais a partir das respostas
  function calculateAssessment(answers: Record<string, string>) {
    // Inicializar scores
    let scores = {
      governance: 0,
      design: 0,
      materials: 0,
      waste: 0,
      energy: 0,
      water: 0,
    };
    // Para cada grupo (indicador)
    questionGroups.forEach(group => {
      // Padrão: cada questão tem peso igual
      const numQuestions = group.questions.length;
      const questionWeight = 100 / numQuestions;
      group.questions.forEach(q => {
        const val = answers[q.id];
        // Peso proporcional da alternativa (20%, 40%, 60%, 80%, 100%)
        const idx = q.options.findIndex(opt => opt.value === val);
        const numOptions = q.options.length;
        const altWeight = ((idx + 1) / numOptions); // 1/5=20%, 2/5=40%, ...
        const questionScore = questionWeight * altWeight;
        switch (group.type.toLowerCase()) {
          case 'governança':
            scores.governance += questionScore;
            break;
          case 'design circular':
            scores.design += questionScore;
            break;
          case 'materiais':
            scores.materials += questionScore;
            break;
          case 'resíduos':
            scores.waste += questionScore;
            break;
          case 'energia':
            scores.energy += questionScore;
            break;
          case 'água':
            scores.water += questionScore;
            break;
        }
      });
    });
    // Arredondar para inteiro
    const governance_score = Math.round(scores.governance);
    const design_score = Math.round(scores.design);
    const materials_score = Math.round(scores.materials);
    const waste_score = Math.round(scores.waste);
    const energy_score = Math.round(scores.energy);
    const water_score = Math.round(scores.water);
    // Scores ambientais e sociais (exemplo: média de algumas categorias)
    const environmental_score = Math.round((materials_score + waste_score + energy_score + water_score) / 4);
    const social_score = 0; // Adapte se necessário
    const total_score = Math.round((governance_score + design_score + materials_score + waste_score + energy_score + water_score) / 6);
    return {
      total_score,
      environmental_score,
      social_score,
      governance_score,
      design_score,
      materials_score,
      waste_score,
      energy_score,
      water_score,
      category_scores: {
        governance: governance_score,
        design: design_score,
        materials: materials_score,
        waste: waste_score,
        energy: energy_score,
        water: water_score,
        environmental: environmental_score,
        social: social_score,
      }
    };
  }

  const handleSubmit = async () => {
    setLoading(true);
    const assessmentResult = calculateAssessment(answers);
    if (user) {
      const insertObj = {
        user_id: user.id,
        total_score: assessmentResult.total_score,
        environmental_score: assessmentResult.environmental_score,
        social_score: assessmentResult.social_score,
        governance_score: assessmentResult.governance_score,
        design_score: assessmentResult.design_score,
        materials_score: assessmentResult.materials_score,
        waste_score: assessmentResult.waste_score,
        energy_score: assessmentResult.energy_score,
        water_score: assessmentResult.water_score,
        answers: answers,
        category_scores: assessmentResult.category_scores,
        created_at: new Date().toISOString(),
      };
      console.log('IMC Insert:', insertObj);
      const { data, error } = await supabase.from('sustainability_metrics').insert(insertObj).select();
      if (!error && data && data[0]) {
        setAssessment(assessmentResult);
        setHistory(prev => [data[0], ...prev]);
        toast.success('Avaliação IMC concluída com sucesso!');
      } else {
        toast.error('Erro ao salvar avaliação: ' + (error?.message || '')); 
        console.error(error);
      }
    } else {
      setAssessment(assessmentResult);
    }
    setLoading(false);
  };

  const handleExportReport = () => {
    if (assessment) {
      exportIMCResults(assessment);
      toast.success('Relatório exportado com sucesso!');
    }
  };

  const handleScheduleConsulting = () => {
    setShowConsultModal(true);
  };

  const handleConsultFormChange = (e: any) => {
    setConsultForm({ ...consultForm, [e.target.name]: e.target.value });
  };

  const handleConsultSubmit = async (e: any) => {
    e.preventDefault();
    setConsultLoading(true);
    if (!user) {
      toast.error('Você precisa estar logado para agendar.');
      setConsultLoading(false);
      return;
    }
    const insertObj = {
      user_id: user.id,
      nome: consultForm.nome,
      email: consultForm.email,
      telefone: consultForm.telefone,
      data: consultForm.data,
      observacao: consultForm.observacao,
      created_at: new Date().toISOString(),
    };
    const { error: insertError } = await supabase
      .from('consulting_appointments')
      .insert([insertObj]);
    if (!insertError) {
      toast.success('Agendamento realizado com sucesso!');
      setShowConsultModal(false);
      setConsultForm({ nome: '', email: '', telefone: '', data: '', observacao: '' });
    } else {
      toast.error('Erro ao agendar: ' + insertError.message);
    }
    setConsultLoading(false);
  };

  const handleRestart = () => {
    setCurrentGroup(0);
    setAnswers({});
    setAssessment(null);
    // Scroll para o topo da tela
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Novo: função para exportar relatório de avaliações do histórico
  const handleExportHistory = (item: any) => {
    exportIMCResults({
      total_score: item.total_score,
      environmental_score: item.environmental_score,
      social_score: item.social_score,
      governance_score: item.governance_score,
      category_scores: {
        environmental: item.environmental_score,
        social: item.social_score,
        governance: item.governance_score,
        design: item.design_score,
        materials: item.materials_score,
        waste: item.waste_score,
        energy: item.energy_score,
        water: item.water_score,
      }
    });
    toast.success('Relatório exportado com sucesso!');
  };

  // Função para deletar avaliação do histórico
  const handleDeleteHistory = async (item: any) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) return;
    await supabase.from('sustainability_metrics').delete().eq('id', item.id);
    setHistory(history.filter(h => h.id !== item.id));
    toast.success('Relatório excluído com sucesso!');
  };

  // Radar chart color mapping para histórico
  const radarColors = {
    Governança: '#22c55e', // verde
    Design: '#2563eb', // azul
    Materiais: '#eab308', // amarelo
    Resíduos: '#f97316', // laranja
    Energia: '#a21caf', // roxo
    Água: '#06b6d4', // ciano
  };

  // Histórico filtrado por data
  const filteredHistory = filterDate
    ? history.filter(item => item.created_at && new Date(item.created_at).toISOString().slice(0, 10) === filterDate)
    : history;

  const handleDeleteAllIMC = async () => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir TODOS os relatórios IMC? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('sustainability_metrics').delete().eq('user_id', user.id);
    if (!error) {
      setHistory([]);
      toast.success('Todos os relatórios IMC foram excluídos!');
    } else {
      toast.error('Erro ao excluir relatórios: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calculadora IMC</h1>
          <p className="text-gray-600 mt-1">Índice de Maturidade de Construção</p>
        </div>
        {assessment && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Button onClick={handleExportReport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" onClick={handleScheduleConsulting}>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Consultoria
            </Button>
          </div>
        )}
      </div>

      {/* Barra de Progresso */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div
          className="h-2 bg-green-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header do grupo */}
      <div className="flex items-center mb-2">
        {/* Ícone do grupo (opcional: pode usar um componente de ícone real) */}
        <span className="mr-2 text-2xl">
          {/* Aqui pode-se usar um componente de ícone real, ex: <Zap /> */}
        </span>
        <h2 className="text-xl font-bold">{group.type} <span className="text-gray-500 text-base">({currentGroup + 1}/{questionGroups.length})</span></h2>
      </div>

      {/* Perguntas do grupo atual */}
      <div className="space-y-6">
        {group.questions.map((q, idx) => (
          <div key={q.id} className="mb-4">
            <div className="font-medium mb-2">{idx + 1}. {q.question}</div>
            <div className="space-y-2">
              {q.options.map(opt => (
                <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => handleAnswerChange(q.id, opt.value)}
                    className="form-radio text-green-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navegação entre grupos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <Button
          variant="outline"
          onClick={handlePreviousGroup}
          disabled={currentGroup === 0}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {currentGroup + 1} de {questionGroups.length}
          </span>
        </div>
        
        {currentGroup === questionGroups.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={group.questions.some(q => !answers[q.id])}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            Concluir Avaliação
          </Button>
        ) : (
          <Button
            onClick={handleNextGroup}
            disabled={group.questions.some(q => !answers[q.id])}
            className="w-full sm:w-auto"
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Resultado da Avaliação */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processando avaliação...</p>
          </div>
        </div>
      ) : assessment ? (
        <div className="space-y-6 imc-result-section">
          <IMCResults 
            score={assessment.total_score || assessment.score}
            categoryScores={assessment.category_scores || {
              governance: assessment.governance_score,
              design: assessment.design_score,
              materials: assessment.materials_score,
              waste: assessment.waste_score,
              energy: assessment.energy_score,
              water: assessment.water_score
            }}
            onDownloadReport={handleExportReport}
            onScheduleConsultation={handleScheduleConsulting}
            radarColors={radarColors}
          />
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRestart}>
              Reiniciar Avaliação
            </Button>
          </div>
          {/* Modal de Agendamento de Consultoria */}
          <Dialog open={showConsultModal} onOpenChange={setShowConsultModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agendar Consultoria</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <Input name="nome" placeholder="Nome completo" value={consultForm.nome} onChange={handleConsultFormChange} required />
                <Input name="email" type="email" placeholder="E-mail" value={consultForm.email} onChange={handleConsultFormChange} required />
                <Input name="telefone" placeholder="Telefone" value={consultForm.telefone} onChange={handleConsultFormChange} required />
                <Input name="data" type="datetime-local" placeholder="Data e hora desejada" value={consultForm.data} onChange={handleConsultFormChange} required />
                <Textarea name="observacao" placeholder="Observação (opcional)" value={consultForm.observacao} onChange={handleConsultFormChange} />
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={consultLoading}>
                  {consultLoading ? 'Agendando...' : 'Agendar'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}

      {/* Histórico de Avaliações */}
      {history.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Histórico de Avaliações IMC</h2>
            <Button variant="destructive" onClick={handleDeleteAllIMC} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Zerar Relatórios
            </Button>
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="font-medium text-sm">Filtrar por data:</label>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              max={new Date().toISOString().slice(0, 10)}
            />
            {filterDate && (
              <Button variant="outline" size="sm" onClick={() => setFilterDate('')}>Limpar filtro</Button>
            )}
          </div>
          {filteredHistory.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Nenhuma avaliação encontrada para a data selecionada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHistory.map((item, idx) => (
                <Card key={item.id || idx} className="p-4">
                  <CardHeader>
                    <CardTitle className="text-lg">{new Date(item.created_at).toLocaleString('pt-BR')}</CardTitle>
                    <CardDescription>Score Total: <span className="font-bold">{item.total_score}/100</span></CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="outline">Governança: {item.governance_score}</Badge>
                      <Badge variant="outline">Design: {item.design_score}</Badge>
                      <Badge variant="outline">Materiais: {item.materials_score}</Badge>
                      <Badge variant="outline">Resíduos: {item.waste_score}</Badge>
                      <Badge variant="outline">Energia: {item.energy_score}</Badge>
                      <Badge variant="outline">Água: {item.water_score}</Badge>
                    </div>
                    {/* Gráfico Radar com preenchimento verde */}
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <RadarChart data={[
                          { categoria: 'Governança', valor: item.governance_score },
                          { categoria: 'Design', valor: item.design_score },
                          { categoria: 'Materiais', valor: item.materials_score },
                          { categoria: 'Resíduos', valor: item.waste_score },
                          { categoria: 'Energia', valor: item.energy_score },
                          { categoria: 'Água', valor: item.water_score },
                        ]}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="categoria" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Pontuação"
                            dataKey="valor"
                            stroke="#22c55e"
                            fill="#22c55e"
                            fillOpacity={0.35}
                            dot={true}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleExportHistory(item)} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Relatório
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteHistory(item)} className="flex-1">
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
