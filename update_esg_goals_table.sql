-- Script para atualizar a tabela esg_goals com novos campos para metas ESG detalhadas
-- Execute este script no seu banco de dados Supabase

-- Adicionar novos campos à tabela esg_goals
ALTER TABLE public.esg_goals 
ADD COLUMN IF NOT EXISTS current_environmental INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_social INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_governance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_environmental INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_social INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_governance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS improvement_environmental DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS improvement_social DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS improvement_governance DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deadline DATE,
ADD COLUMN IF NOT EXISTS status_new TEXT DEFAULT 'active' CHECK (status_new IN ('active', 'completed', 'overdue'));

-- Atualizar o status padrão para 'active' em vez de 'em_andamento'
UPDATE public.esg_goals SET status_new = 'active' WHERE status = 'em_andamento';
UPDATE public.esg_goals SET status_new = 'completed' WHERE status = 'concluída';
UPDATE public.esg_goals SET status_new = 'overdue' WHERE status = 'atrasada';

-- Remover a coluna status antiga e renomear a nova
ALTER TABLE public.esg_goals DROP COLUMN IF EXISTS status;
ALTER TABLE public.esg_goals RENAME COLUMN status_new TO status;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN public.esg_goals.current_environmental IS 'Score ambiental atual quando a meta foi criada';
COMMENT ON COLUMN public.esg_goals.current_social IS 'Score social atual quando a meta foi criada';
COMMENT ON COLUMN public.esg_goals.current_governance IS 'Score de governança atual quando a meta foi criada';
COMMENT ON COLUMN public.esg_goals.target_environmental IS 'Score ambiental alvo da meta';
COMMENT ON COLUMN public.esg_goals.target_social IS 'Score social alvo da meta';
COMMENT ON COLUMN public.esg_goals.target_governance IS 'Score de governança alvo da meta';
COMMENT ON COLUMN public.esg_goals.improvement_environmental IS 'Percentual de melhoria desejada no score ambiental';
COMMENT ON COLUMN public.esg_goals.improvement_social IS 'Percentual de melhoria desejada no score social';
COMMENT ON COLUMN public.esg_goals.improvement_governance IS 'Percentual de melhoria desejada no score de governança';
COMMENT ON COLUMN public.esg_goals.deadline IS 'Data limite para atingir a meta';
COMMENT ON COLUMN public.esg_goals.status IS 'Status da meta: active, completed, overdue'; 