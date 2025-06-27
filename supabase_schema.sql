-- =====================================================
-- SCRIPT SQL COMPLETO PARA O PROJETO CANTEIRO CIRCULAR
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- 1. Tabela de Perfis de Usuário (extensão da auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    company TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    imc_score INTEGER DEFAULT 0,
    esg_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Métricas de Sustentabilidade (IMC)
CREATE TABLE IF NOT EXISTS public.sustainability_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assessment_date DATE DEFAULT CURRENT_DATE,
    total_score INTEGER NOT NULL,
    environmental_score INTEGER NOT NULL,
    social_score INTEGER NOT NULL,
    governance_score INTEGER NOT NULL,
    answers JSONB NOT NULL, -- Respostas das perguntas
    category_scores JSONB, -- Scores por categoria
    co2_saved DECIMAL(10,2) DEFAULT 0,
    energy_efficiency DECIMAL(5,2) DEFAULT 0,
    recycled_material DECIMAL(5,2) DEFAULT 0,
    water_saved DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Registros MTR (Manifesto de Transporte de Resíduos)
CREATE TABLE IF NOT EXISTS public.mtr_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mtr_number TEXT UNIQUE NOT NULL,
    project_name TEXT NOT NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'vencido', 'concluído', 'cancelado')),
    waste_type TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT DEFAULT 't',
    description TEXT,
    generator_name TEXT NOT NULL,
    generator_cnpj TEXT,
    generator_address TEXT,
    transporter_name TEXT,
    transporter_cnpj TEXT,
    transporter_license TEXT,
    receiver_name TEXT,
    receiver_cnpj TEXT,
    receiver_license TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    project TEXT NOT NULL,
    category TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Scores ESG
CREATE TABLE IF NOT EXISTS public.esg_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    environmental_score INTEGER DEFAULT 0,
    social_score INTEGER DEFAULT 0,
    governance_score INTEGER DEFAULT 0,
    environmental_change INTEGER DEFAULT 0,
    social_change INTEGER DEFAULT 0,
    governance_change INTEGER DEFAULT 0,
    total_score INTEGER GENERATED ALWAYS AS (environmental_score + social_score + governance_score) STORED,
    assessment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Dados de Evolução ESG
CREATE TABLE IF NOT EXISTS public.esg_evolution_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month DATE NOT NULL,
    environmental_score INTEGER DEFAULT 0,
    social_score INTEGER DEFAULT 0,
    governance_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Distribuição de Resíduos
CREATE TABLE IF NOT EXISTS public.waste_distribution (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Metas ESG
CREATE TABLE IF NOT EXISTS public.esg_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluída', 'atrasada')),
    color TEXT DEFAULT '#3B82F6',
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de Perguntas Frequentes (FAQ)
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    icon_name TEXT DEFAULT 'HelpCircle',
    color_class TEXT DEFAULT 'bg-blue-100 text-blue-800',
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabela de Chamados de Suporte
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
    priority TEXT DEFAULT 'média' CHECK (priority IN ('baixa', 'média', 'alta', 'crítica')),
    category TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Tabela de Respostas aos Chamados
CREATE TABLE IF NOT EXISTS public.ticket_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company);

-- Índices para sustainability_metrics
CREATE INDEX IF NOT EXISTS idx_sustainability_metrics_user_id ON public.sustainability_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_sustainability_metrics_date ON public.sustainability_metrics(assessment_date);

-- Índices para mtr_records
CREATE INDEX IF NOT EXISTS idx_mtr_records_user_id ON public.mtr_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mtr_records_status ON public.mtr_records(status);
CREATE INDEX IF NOT EXISTS idx_mtr_records_due_date ON public.mtr_records(due_date);
CREATE INDEX IF NOT EXISTS idx_mtr_records_mtr_number ON public.mtr_records(mtr_number);

-- Índices para financial_transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON public.financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON public.financial_transactions(date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);

-- Índices para esg_scores
CREATE INDEX IF NOT EXISTS idx_esg_scores_user_id ON public.esg_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_esg_scores_date ON public.esg_scores(assessment_date);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Índices para support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sustainability_metrics_updated_at BEFORE UPDATE ON public.sustainability_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mtr_records_updated_at BEFORE UPDATE ON public.mtr_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esg_scores_updated_at BEFORE UPDATE ON public.esg_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esg_goals_updated_at BEFORE UPDATE ON public.esg_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, company, phone)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'company',
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar status de MTRs vencidos
CREATE OR REPLACE FUNCTION update_mtr_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar MTRs vencidos
    UPDATE public.mtr_records 
    SET status = 'vencido'
    WHERE due_date < CURRENT_DATE AND status = 'ativo';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar MTRs vencidos diariamente
CREATE TRIGGER check_mtr_due_dates
    AFTER INSERT OR UPDATE ON public.mtr_records
    FOR EACH ROW EXECUTE FUNCTION update_mtr_status();

-- Função para calcular score ESG total
CREATE OR REPLACE FUNCTION calculate_esg_total_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_score = NEW.environmental_score + NEW.social_score + NEW.governance_score;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular score ESG total
CREATE TRIGGER calculate_esg_total
    BEFORE INSERT OR UPDATE ON public.esg_scores
    FOR EACH ROW EXECUTE FUNCTION calculate_esg_total_score();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mtr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_evolution_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para sustainability_metrics
CREATE POLICY "Users can view own sustainability metrics" ON public.sustainability_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sustainability metrics" ON public.sustainability_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sustainability metrics" ON public.sustainability_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sustainability metrics" ON public.sustainability_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para mtr_records
CREATE POLICY "Users can view own MTR records" ON public.mtr_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MTR records" ON public.mtr_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MTR records" ON public.mtr_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own MTR records" ON public.mtr_records
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para financial_transactions
CREATE POLICY "Users can view own financial transactions" ON public.financial_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial transactions" ON public.financial_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial transactions" ON public.financial_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial transactions" ON public.financial_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para esg_scores
CREATE POLICY "Users can view own ESG scores" ON public.esg_scores
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ESG scores" ON public.esg_scores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ESG scores" ON public.esg_scores
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para esg_evolution_data
CREATE POLICY "Users can view own ESG evolution data" ON public.esg_evolution_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ESG evolution data" ON public.esg_evolution_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para waste_distribution
CREATE POLICY "Users can view own waste distribution" ON public.waste_distribution
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own waste distribution" ON public.waste_distribution
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para esg_goals
CREATE POLICY "Users can view own ESG goals" ON public.esg_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ESG goals" ON public.esg_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ESG goals" ON public.esg_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ESG goals" ON public.esg_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para support_tickets
CREATE POLICY "Users can view own support tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own support tickets" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para ticket_responses
CREATE POLICY "Users can view ticket responses" ON public.ticket_responses
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE id = ticket_responses.ticket_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ticket responses" ON public.ticket_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política especial para FAQs (leitura pública)
CREATE POLICY "Anyone can view FAQs" ON public.faqs
    FOR SELECT USING (active = true);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir dados de exemplo para FAQs
INSERT INTO public.faqs (category, question, answer, icon_name, color_class, order_index) VALUES
('Calculadora IMC', 'O que é o Score IMC?', 'O Score IMC (Índice de Maturidade Circular) é uma avaliação que mede o nível de maturidade da sua empresa em práticas de economia circular e sustentabilidade.', 'Calculator', 'bg-green-100 text-green-800', 1),
('Calculadora IMC', 'Como é calculado o score?', 'O score é calculado com base em 10 perguntas que avaliam diferentes aspectos da sustentabilidade: gestão de materiais, sustentabilidade, gestão de resíduos, tecnologia, fornecedores, monitoramento, certificações, inovação, treinamento e governança.', 'Calculator', 'bg-green-100 text-green-800', 2),
('MTR', 'O que é um MTR?', 'MTR significa Manifesto de Transporte de Resíduos. É um documento obrigatório para o transporte de resíduos de construção e demolição.', 'FileText', 'bg-blue-100 text-blue-800', 1),
('MTR', 'Quando um MTR vence?', 'O MTR deve ser apresentado ao órgão ambiental competente antes do início do transporte e tem validade conforme a legislação local.', 'FileText', 'bg-blue-100 text-blue-800', 2),
('Financeiro', 'Como registrar uma transação?', 'Clique em "Nova Transação" e preencha os campos obrigatórios: descrição, projeto, valor, tipo (receita ou despesa) e data.', 'DollarSign', 'bg-orange-100 text-orange-800', 1),
('Financeiro', 'Posso exportar os dados financeiros?', 'Sim, você pode exportar os dados financeiros clicando no botão "Exportar" no painel financeiro.', 'DollarSign', 'bg-orange-100 text-orange-800', 2),
('ESG', 'O que significa ESG?', 'ESG significa Environmental (Ambiental), Social e Governance (Governança). São critérios que avaliam o desempenho sustentável de uma empresa.', 'Leaf', 'bg-purple-100 text-purple-800', 1),
('ESG', 'Como melhorar meu score ESG?', 'Para melhorar seu score ESG, implemente práticas sustentáveis, invista em treinamento da equipe, adote tecnologias verdes e estabeleça políticas de governança.', 'Leaf', 'bg-purple-100 text-purple-800', 2),
('Suporte', 'Como abrir um chamado de suporte?', 'Na aba "Abrir Chamado" da central de suporte, preencha o assunto e descrição do problema. Nossa equipe entrará em contato em até 24 horas.', 'HelpCircle', 'bg-gray-100 text-gray-800', 1),
('Suporte', 'Posso acompanhar meus chamados?', 'Sim, na aba "Meus Chamados" você pode visualizar o status e histórico de todos os seus chamados de suporte.', 'HelpCircle', 'bg-gray-100 text-gray-800', 2);

-- =====================================================
-- PERMISSÕES DE ACESSO
-- =====================================================

-- Conceder permissões para o role anon (usuários não autenticados)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.faqs TO anon;

-- Conceder permissões para o role authenticated (usuários autenticados)
GRANT USAGE ON SCHEMA public TO authenticated;

-- Profiles
GRANT ALL ON public.profiles TO authenticated;

-- Sustainability metrics
GRANT ALL ON public.sustainability_metrics TO authenticated;

-- MTR records
GRANT ALL ON public.mtr_records TO authenticated;

-- Financial transactions
GRANT ALL ON public.financial_transactions TO authenticated;

-- ESG scores
GRANT ALL ON public.esg_scores TO authenticated;

-- ESG evolution data
GRANT ALL ON public.esg_evolution_data TO authenticated;

-- Waste distribution
GRANT ALL ON public.waste_distribution TO authenticated;

-- ESG goals
GRANT ALL ON public.esg_goals TO authenticated;

-- Notifications
GRANT ALL ON public.notifications TO authenticated;

-- Support tickets
GRANT ALL ON public.support_tickets TO authenticated;

-- Ticket responses
GRANT ALL ON public.ticket_responses TO authenticated;

-- Conceder permissões para sequences (se existirem)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Perfis dos usuários com informações adicionais';
COMMENT ON TABLE public.sustainability_metrics IS 'Métricas de sustentabilidade e scores IMC';
COMMENT ON TABLE public.mtr_records IS 'Registros de Manifesto de Transporte de Resíduos';
COMMENT ON TABLE public.financial_transactions IS 'Transações financeiras dos usuários';
COMMENT ON TABLE public.esg_scores IS 'Scores ESG dos usuários';
COMMENT ON TABLE public.esg_evolution_data IS 'Dados de evolução dos scores ESG ao longo do tempo';
COMMENT ON TABLE public.waste_distribution IS 'Distribuição de resíduos por tipo';
COMMENT ON TABLE public.esg_goals IS 'Metas ESG dos usuários';
COMMENT ON TABLE public.notifications IS 'Notificações do sistema';
COMMENT ON TABLE public.faqs IS 'Perguntas frequentes';
COMMENT ON TABLE public.support_tickets IS 'Chamados de suporte';
COMMENT ON TABLE public.ticket_responses IS 'Respostas aos chamados de suporte';

-- =====================================================
-- FIM DO SCRIPT
-- ===================================================== 