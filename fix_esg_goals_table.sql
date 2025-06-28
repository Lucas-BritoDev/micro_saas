-- Script para corrigir e atualizar a tabela esg_goals
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar a estrutura atual da tabela
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'esg_goals' AND table_schema = 'public';

-- 2. Adicionar novos campos se não existirem
DO $$ 
BEGIN
    -- Adicionar current_environmental se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'current_environmental') THEN
        ALTER TABLE public.esg_goals ADD COLUMN current_environmental INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar current_social se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'current_social') THEN
        ALTER TABLE public.esg_goals ADD COLUMN current_social INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar current_governance se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'current_governance') THEN
        ALTER TABLE public.esg_goals ADD COLUMN current_governance INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar target_environmental se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'target_environmental') THEN
        ALTER TABLE public.esg_goals ADD COLUMN target_environmental INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar target_social se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'target_social') THEN
        ALTER TABLE public.esg_goals ADD COLUMN target_social INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar target_governance se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'target_governance') THEN
        ALTER TABLE public.esg_goals ADD COLUMN target_governance INTEGER DEFAULT 0;
    END IF;
    
    -- Adicionar improvement_environmental se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'improvement_environmental') THEN
        ALTER TABLE public.esg_goals ADD COLUMN improvement_environmental DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Adicionar improvement_social se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'improvement_social') THEN
        ALTER TABLE public.esg_goals ADD COLUMN improvement_social DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Adicionar improvement_governance se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'improvement_governance') THEN
        ALTER TABLE public.esg_goals ADD COLUMN improvement_governance DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Adicionar deadline se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'esg_goals' AND column_name = 'deadline') THEN
        ALTER TABLE public.esg_goals ADD COLUMN deadline DATE;
    END IF;
    
    -- Verificar se a coluna status existe e atualizar se necessário
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'esg_goals' AND column_name = 'status') THEN
        -- Atualizar valores antigos para novos
        UPDATE public.esg_goals SET status = 'active' WHERE status = 'em_andamento';
        UPDATE public.esg_goals SET status = 'completed' WHERE status = 'concluída';
        UPDATE public.esg_goals SET status = 'overdue' WHERE status = 'atrasada';
        
        -- Atualizar a constraint se necessário
        ALTER TABLE public.esg_goals DROP CONSTRAINT IF EXISTS esg_goals_status_check;
        ALTER TABLE public.esg_goals ADD CONSTRAINT esg_goals_status_check 
            CHECK (status IN ('active', 'completed', 'overdue'));
    END IF;
    
END $$;

-- 3. Adicionar comentários para documentar os campos
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

-- 4. Verificar se a estrutura foi atualizada corretamente
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'esg_goals' AND table_schema = 'public'
-- ORDER BY ordinal_position; 