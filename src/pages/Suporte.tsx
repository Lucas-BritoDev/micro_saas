import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MessageSquare,
  Phone,
  Mail,
  Calculator,
  FileText,
  Leaf,
  DollarSign,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mappings for Lucide Icons from string names
const iconMap: { [key: string]: any } = {
  Calculator: Calculator,
  FileText: FileText,
  Leaf: Leaf,
  DollarSign: DollarSign,
  HelpCircle: HelpCircle,
};

export default function Suporte() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [faqData, setFaqData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("perguntas-frequentes");
  const [novoChamado, setNovoChamado] = useState({
    subject: '',
    description: '',
    category: '',
    priority: '',
    assigned_to: '',
  });
  const [chamados, setChamados] = useState<any[]>([]);
  const [statusFiltro, setStatusFiltro] = useState('todos');

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        // Dados estáticos de exemplo
        const fallbackData = [
          {
            category: 'Calculadora IMC',
            question: 'O que é o Score IMC?',
            answer: 'O Score IMC (Índice de Maturidade Circular) é uma avaliação que mede o nível de maturidade da sua empresa em práticas de economia circular e sustentabilidade.',
            icon_name: 'Calculator',
            color_class: 'bg-green-100 text-green-800'
          },
          {
            category: 'MTR',
            question: 'O que é um MTR?',
            answer: 'MTR significa Manifesto de Transporte de Resíduos. É um documento obrigatório para o transporte de resíduos de construção e demolição.',
            icon_name: 'FileText',
            color_class: 'bg-blue-100 text-blue-800'
          },
          {
            category: 'ESG',
            question: 'Como funciona o Painel ESG?',
            answer: 'O Painel ESG permite monitorar indicadores de Environmental, Social e Governance da sua empresa, calculando scores baseados em métricas específicas.',
            icon_name: 'Leaf',
            color_class: 'bg-purple-100 text-purple-800'
          },
          {
            category: 'Financeiro',
            question: 'Como exportar relatórios?',
            answer: 'Você pode exportar relatórios em formato Excel clicando no botão "Exportar" presente em cada módulo do sistema.',
            icon_name: 'DollarSign',
            color_class: 'bg-yellow-100 text-yellow-800'
          }
        ];
        
        const formattedData = fallbackData.map(faq => ({
          ...faq,
          icon: iconMap[faq.icon_name] || HelpCircle,
          color: faq.color_class,
        }));
        
        setFaqData(formattedData);
      } catch (err) {
        console.error("Erro ao carregar FAQs:", err);
        toast.error("Erro ao carregar perguntas frequentes.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchChamados = async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setChamados(data);
    };
    fetchChamados();
  }, [user]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Agrupar FAQs por categoria
  const groupedFAQs = faqData.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = {
        category: faq.category,
        icon: faq.icon,
        color: faq.color,
        questions: []
      };
    }
    acc[faq.category].questions.push({
      question: faq.question,
      answer: faq.answer
    });
    return acc;
  }, {} as any);

  const filteredFAQ = Object.values(groupedFAQs)
    .map((category: any) => ({
      ...category,
      questions: category.questions.filter((q: any) => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter((category: any) => category.questions.length > 0);

  const handleAbrirChamado = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    if (!novoChamado.subject || !novoChamado.description || !novoChamado.category) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    // Montar objeto apenas com campos válidos
    const chamado = {
      user_id: user.id,
      subject: novoChamado.subject,
      description: novoChamado.description,
      category: novoChamado.category,
      status: 'aberto',
      priority: novoChamado.priority || 'média',
      created_at: new Date().toISOString()
    };
    if (novoChamado.assigned_to) chamado.assigned_to = novoChamado.assigned_to;
    console.log('Enviando chamado:', chamado);
    const { error } = await supabase.from('support_tickets').insert(chamado);
    if (!error) {
      toast.success('Chamado aberto com sucesso!');
      setNovoChamado({ subject: '', description: '', category: '', priority: '', assigned_to: '' });
      // Atualizar lista
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setChamados(data);
    } else {
      toast.error('Erro ao abrir chamado.');
      console.error('Erro Supabase:', error);
    }
  };

  const handleStatusChamado = async (id: string, novoStatus: string) => {
    await supabase.from('support_tickets').update({ status: novoStatus }).eq('id', id);
    setChamados(chamados.map(c => c.id === id ? { ...c, status: novoStatus } : c));
    toast.success('Status do chamado atualizado!');
  };

  const chamadosFiltrados = useMemo(() => {
    if (statusFiltro === 'todos') return chamados;
    return chamados.filter(c => c.status === statusFiltro);
  }, [chamados, statusFiltro]);

  const handleZerarChamados = async () => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir TODOS os chamados? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('support_tickets').delete().eq('user_id', user.id);
    if (!error) {
      setChamados([]);
      toast.success('Todos os chamados foram excluídos!');
    } else {
      toast.error('Erro ao excluir chamados: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Central de Suporte</h1>
            <p className="text-gray-600 mt-1">Tire suas dúvidas e solicite ajuda</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando central de suporte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Central de Suporte</h1>
          <p className="text-gray-600 mt-1">Tire suas dúvidas e solicite ajuda</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setActiveTab('contato-direto')}>
            <Phone className="h-4 w-4 mr-2" />
            Contato
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => setActiveTab('abrir-chamado')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Novo Chamado
          </Button>
          <Button variant="destructive" onClick={handleZerarChamados} className="w-full sm:w-auto">
            Zerar Chamados
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          <TabsTrigger value="perguntas-frequentes" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <div className="flex flex-col items-center space-y-1">
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Perguntas Frequentes</span>
              <span className="sm:hidden">FAQ</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="abrir-chamado" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <div className="flex flex-col items-center space-y-1">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Abrir Chamado</span>
              <span className="sm:hidden">Chamado</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="meus-chamados" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <div className="flex flex-col items-center space-y-1">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Meus Chamados</span>
              <span className="sm:hidden">Meus</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="contato-direto" className="text-xs sm:text-sm py-2 px-1 sm:px-3">
            <div className="flex flex-col items-center space-y-1">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contato Direto</span>
              <span className="sm:hidden">Contato</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perguntas-frequentes" className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Buscar em Perguntas e Respostas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  placeholder="Buscar perguntas, respostas ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          <div className="space-y-6">
            {filteredFAQ.map((category: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <category.icon className="h-5 w-5 mr-2" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.questions.map((faq: any, faqIndex: number) => (
                      <div key={faqIndex} className="border rounded-lg p-4">
                        <button
                          onClick={() => toggleItem(`${category.category}-${faqIndex}`)}
                          className="w-full text-left flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-900 text-sm sm:text-base">{faq.question}</span>
                          <Badge variant="outline" className={`${category.color} text-xs`}>
                            {category.category}
                          </Badge>
                        </button>
                        {openItems.includes(`${category.category}-${faqIndex}`) && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700 text-sm sm:text-base">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="abrir-chamado" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abrir Novo Chamado</CardTitle>
              <CardDescription>Descreva seu problema para nossa equipe de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAbrirChamado}>
                <div>
                  <label className="text-sm font-medium">Assunto</label>
                  <Input placeholder="Assunto do chamado" value={novoChamado.subject} onChange={e => setNovoChamado(n => ({ ...n, subject: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <select className="w-full p-2 border rounded-md" value={novoChamado.category} onChange={e => setNovoChamado(n => ({ ...n, category: e.target.value }))}>
                    <option value="">Selecione uma categoria</option>
                    <option>Problema Técnico</option>
                    <option>Dúvida sobre Funcionalidade</option>
                    <option>Solicitação de Melhoria</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <select className="w-full p-2 border rounded-md" value={novoChamado.priority} onChange={e => setNovoChamado(n => ({ ...n, priority: e.target.value }))}>
                    <option value="">Selecione a prioridade</option>
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <textarea 
                    className="w-full p-2 border rounded-md h-32"
                    placeholder="Descreva detalhadamente o problema ou dúvida..."
                    value={novoChamado.description}
                    onChange={e => setNovoChamado(n => ({ ...n, description: e.target.value }))}
                  />
                </div>
                <Button className="w-full sm:w-auto" type="submit">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Chamado
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meus-chamados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Chamados</CardTitle>
              <CardDescription>Acompanhe o status dos seus chamados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2 items-center">
                <label>Status:</label>
                <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className="border rounded px-2 py-1">
                  <option value="todos">Todos</option>
                  <option value="aberto">Aberto</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="resolvido">Resolvido</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>
              {chamadosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum chamado encontrado</p>
                  <p className="text-sm">Seus chamados aparecerão aqui</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 border">Assunto</th>
                        <th className="p-2 border">Categoria</th>
                        <th className="p-2 border">Prioridade</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Descrição</th>
                        <th className="p-2 border">Data</th>
                        <th className="p-2 border">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chamadosFiltrados.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 border">{c.subject}</td>
                          <td className="p-2 border">{c.category}</td>
                          <td className="p-2 border">{c.priority}</td>
                          <td className="p-2 border">{c.status}</td>
                          <td className="p-2 border">{c.description}</td>
                          <td className="p-2 border">{new Date(c.created_at).toLocaleString('pt-BR')}</td>
                          <td className="p-2 border">
                            {c.status !== 'finalizado' && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChamado(c.id, 'finalizado')}>Finalizar</Button>
                            )}
                            {c.status === 'finalizado' && (
                              <Button size="sm" variant="outline" onClick={() => handleStatusChamado(c.id, 'ativo')}>Reabrir</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contato-direto" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Telefone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">0800 123 4567</p>
                <p className="text-sm text-gray-600">Segunda a Sexta, 8h às 18h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  E-mail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">suporte@canteirocircular.com</p>
                <p className="text-sm text-gray-600">Resposta em até 24h</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
