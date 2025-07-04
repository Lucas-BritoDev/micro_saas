import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme, ThemeType } from '@/hooks/useTheme';

export default function Perfil() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('perfil');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  // Estados do perfil
  const [perfil, setPerfil] = useState({
    full_name: '',
    company: '',
    avatar_url: '',
    role: '',
  });
  // Estados das preferências de notificação
  const [notificacoes, setNotificacoes] = useState({
    notification_email: true,
    notification_sms: false,
    notification_push: true,
    notification_due_alerts: true,
    notification_weekly_report: true,
  });
  // Estados das preferências do sistema
  const [preferencias, setPreferencias] = useState({
    language: 'Português (Brasil)',
    timezone: 'Brasília (GMT-3)',
    theme: (localStorage.getItem('theme') as ThemeType) || 'claro',
  });
  const [atividades, setAtividades] = useState<any[]>([]);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Aplica o tema ao carregar a página
  useTheme(preferencias.theme as ThemeType);

  // Carregar dados do perfil ao abrir
  useEffect(() => {
    const fetchPerfil = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setPerfil({
          full_name: data.full_name || '',
          company: data.company || '',
          avatar_url: data.avatar_url || '',
          role: data.role || '',
        });
        setNotificacoes({
          notification_email: !!data.notification_email,
          notification_sms: !!data.notification_sms,
          notification_push: !!data.notification_push,
          notification_due_alerts: !!data.notification_due_alerts,
          notification_weekly_report: !!data.notification_weekly_report,
        });
        setPreferencias({
          language: data.language || 'Português (Brasil)',
          timezone: data.timezone || 'Brasília (GMT-3)',
          theme: data.theme || 'claro',
        });
      }
    };
    fetchPerfil();
  }, [user]);

  useEffect(() => {
    const fetchAtividades = async () => {
      if (!user) return;
      const atividadesArr: any[] = [];
      // IMC
      const { data: imc, error: imcError } = await supabase
        .from('sustainability_metrics')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (imc && imc.length > 0) {
        imc.forEach((item: any) => atividadesArr.push({ tipo: 'IMC', descricao: 'Realizou avaliação IMC', data: item.created_at }));
      }
      // ESG
      const { data: esg, error: esgError } = await supabase
        .from('esg_scores')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (esg && esg.length > 0) {
        esg.forEach((item: any) => atividadesArr.push({ tipo: 'ESG', descricao: 'Preencheu relatório ESG', data: item.created_at }));
      }
      // MTR
      const { data: mtr, error: mtrError } = await supabase
        .from('mtr_records')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (mtr && mtr.length > 0) {
        mtr.forEach((item: any) => atividadesArr.push({ tipo: 'MTR', descricao: 'Emitiu um MTR', data: item.created_at }));
      }
      // Financeiro
      const { data: fin, error: finError } = await supabase
        .from('financial_transactions')
        .select('created_at, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (fin && fin.length > 0) {
        fin.forEach((item: any) => atividadesArr.push({ tipo: 'Financeiro', descricao: item.type === 'income' ? 'Lançou receita' : 'Lançou despesa', data: item.created_at }));
      }
      // Chamados
      const { data: chamados, error: chamadosError } = await supabase
        .from('consulting_appointments')
        .select('created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (chamados && chamados.length > 0) {
        chamados.forEach((item: any) => atividadesArr.push({ tipo: 'Suporte', descricao: `Abriu chamado (${item.status})`, data: item.created_at }));
      }
      // Ordenar por data decrescente
      atividadesArr.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setAtividades(atividadesArr.slice(0, 10));
    };
    fetchAtividades();
  }, [user]);

  // Funções de feedback e salvamento
  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!perfil.full_name || !perfil.company) {
      toast({ title: 'Preencha nome e empresa', description: 'Campos obrigatórios.', variant: 'destructive' });
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: perfil.full_name,
        company: perfil.company,
        avatar_url: perfil.avatar_url,
        role: perfil.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (!error) {
      setUser((prev) => prev ? {
        ...prev,
        full_name: perfil.full_name,
        avatar_url: perfil.avatar_url,
        company: perfil.company,
        role: perfil.role,
      } : prev);
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas com sucesso.' });
    } else {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    }
  };
  const handleAlterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!novaSenha || novaSenha.length < 6) {
      toast({ title: 'Senha muito curta', description: 'A nova senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast({ title: 'Senhas não conferem', description: 'A confirmação deve ser igual à nova senha.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (!error) {
        setUser((prev) => prev ? { ...prev, updated_at: new Date().toISOString() } : prev);
        toast({ title: 'Senha alterada', description: 'Sua senha foi alterada com sucesso.' });
        setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      } else {
        toast({ title: 'Erro ao alterar senha', description: error.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Erro ao alterar senha', description: String(err), variant: 'destructive' });
    }
  };
  const handleSalvarNotificacoes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        notification_email: notificacoes.notification_email,
        notification_sms: notificacoes.notification_sms,
        notification_push: notificacoes.notification_push,
        notification_due_alerts: notificacoes.notification_due_alerts,
        notification_weekly_report: notificacoes.notification_weekly_report,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (!error) {
      setUser((prev) => prev ? { ...prev, updated_at: new Date().toISOString() } : prev);
      toast({ title: 'Preferências salvas', description: 'Suas preferências de notificação foram salvas.' });
    } else {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    }
  };
  const handleSalvarPreferencias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        language: preferencias.language,
        timezone: preferencias.timezone,
        theme: preferencias.theme,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (!error) {
      localStorage.setItem('theme', preferencias.theme);
      setPreferencias(prev => ({
        ...prev,
        language: preferencias.language,
        timezone: preferencias.timezone,
        theme: preferencias.theme,
      }));
      useTheme(preferencias.theme as ThemeType);
      setUser((prev) => prev ? { ...prev, updated_at: new Date().toISOString() } : prev);
      toast({ title: 'Preferências salvas', description: 'Suas preferências de uso foram salvas.' });
    } else {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    }
  };
  const handleExportar = async () => {
    if (!user) return;
    // Exemplo: exportar perfil e atividades recentes
    const { data: perfil } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: atividades } = await supabase.from('sustainability_metrics').select('*').eq('user_id', user.id);
    // ...pode adicionar outros dados relevantes...
    const exportData = { perfil, atividades };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meus_dados.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exportação concluída', description: 'Seus dados foram exportados.' });
  };
  const handleExcluirConta = async () => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) return;
    // Excluir dados do usuário nas principais tabelas
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.from('sustainability_metrics').delete().eq('user_id', user.id);
    await supabase.from('esg_scores').delete().eq('user_id', user.id);
    await supabase.from('mtr_records').delete().eq('user_id', user.id);
    await supabase.from('financial_transactions').delete().eq('user_id', user.id);
    // Removendo a linha problemática com support_tickets que não existe no schema
    // Deslogar usuário
    await supabase.auth.signOut();
    toast({ title: 'Conta excluída', description: 'Sua conta foi excluída com sucesso.' });
    window.location.href = '/';
  };

  // ... handlers de input para campos controlados ...
  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };
  const handleNotificacoesChange = (key: string) => {
    setNotificacoes((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };
  const handlePreferenciasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferencias({ ...preferencias, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0 space-y-6 text-center">
      <div className="flex flex-col mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e configurações</p>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full text-center">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 mb-4 bg-gray-50 rounded-xl shadow-sm text-center">
          <TabsTrigger value="perfil" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Segurança</TabsTrigger>
          <TabsTrigger value="notificacoes" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Notificações</TabsTrigger>
          <TabsTrigger value="preferencias" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Preferências</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-center">Informações Pessoais</CardTitle>
              <CardDescription className="text-center">Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleSalvarPerfil}>
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" name="full_name" value={perfil.full_name} onChange={handlePerfilChange} placeholder="Nome Completo" />
                </div>
                <div>
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input id="empresa" name="company" value={perfil.company} onChange={handlePerfilChange} placeholder="Nome da Empresa" />
                </div>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input id="avatar_url" name="avatar_url" value={perfil.avatar_url} onChange={handlePerfilChange} placeholder="URL da foto de perfil" />
                </div>
                <div>
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" name="role" value={perfil.role} onChange={handlePerfilChange} placeholder="Ex: Engenheiro Civil" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-center">Segurança</CardTitle>
              <CardDescription className="text-center">Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAlterarSenha}>
                <div>
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input id="senha-atual" type="password" placeholder="Digite sua senha atual" value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input id="nova-senha" type="password" placeholder="Digite a nova senha" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                  <Input id="confirmar-senha" type="password" placeholder="Confirme a nova senha" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} />
                </div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Alterar Senha</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-center">Notificações</CardTitle>
              <CardDescription className="text-center">Configure suas preferências de notificação</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSalvarNotificacoes}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="email"
                      checked={notificacoes.notification_email}
                      onChange={() => handleNotificacoesChange('notification_email')}
                    />
                    <Label htmlFor="email">Notificações por E-mail</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sms"
                      checked={notificacoes.notification_sms}
                      onChange={() => handleNotificacoesChange('notification_sms')}
                    />
                    <Label htmlFor="sms">Notificações por SMS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="push"
                      checked={notificacoes.notification_push}
                      onChange={() => handleNotificacoesChange('notification_push')}
                    />
                    <Label htmlFor="push">Notificações Push</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="alerts"
                      checked={notificacoes.notification_due_alerts}
                      onChange={() => handleNotificacoesChange('notification_due_alerts')}
                    />
                    <Label htmlFor="alerts">Alertas de Vencimento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="report"
                      checked={notificacoes.notification_weekly_report}
                      onChange={() => handleNotificacoesChange('notification_weekly_report')}
                    />
                    <Label htmlFor="report">Relatório Semanal</Label>
                  </div>
                </div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar Preferências</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-center">Preferências do Sistema</CardTitle>
              <CardDescription className="text-center">Configure suas preferências de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSalvarPreferencias}>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <select
                    id="language"
                    name="language"
                    value={preferencias.language}
                    onChange={handlePreferenciasChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="Português (Brasil)">Português (Brasil)</option>
                    <option value="English">English</option>
                    <option value="Español">Español</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={preferencias.timezone}
                    onChange={handlePreferenciasChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="Brasília (GMT-3)">Brasília (GMT-3)</option>
                    <option value="Manaus (GMT-4)">Manaus (GMT-4)</option>
                    <option value="Acre (GMT-5)">Acre (GMT-5)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <select
                    id="theme"
                    name="theme"
                    value={preferencias.theme}
                    onChange={handlePreferenciasChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="claro">Claro</option>
                    <option value="escuro">Escuro</option>
                    <option value="automático">Automático</option>
                  </select>
                </div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Salvar Preferências</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 