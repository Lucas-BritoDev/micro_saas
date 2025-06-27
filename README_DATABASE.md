# Script SQL para o Projeto Canteiro Circular

Este arquivo contém o script SQL completo para configurar o banco de dados do Supabase para o projeto **Canteiro Circular**.

## 📋 Estrutura do Banco de Dados

### Tabelas Principais

1. **`profiles`** - Perfis dos usuários
   - Informações pessoais (nome, empresa, telefone)
   - Scores IMC e ESG
   - Dados de autenticação

2. **`sustainability_metrics`** - Métricas de Sustentabilidade (IMC)
   - Scores por categoria (ambiental, social, governança)
   - Respostas das perguntas em JSONB
   - Métricas de impacto (CO2, energia, água, materiais reciclados)

3. **`mtr_records`** - Manifesto de Transporte de Resíduos
   - Número do MTR, projeto, status
   - Informações do gerador, transportador e receptor
   - Datas de emissão e vencimento
   - Quantidade e tipo de resíduo

4. **`financial_transactions`** - Transações Financeiras
   - Receitas e despesas
   - Projeto associado
   - Categoria e data

5. **`esg_scores`** - Scores ESG
   - Scores individuais (Environmental, Social, Governance)
   - Variações dos scores
   - Score total calculado automaticamente

6. **`esg_evolution_data`** - Evolução dos Scores ESG
   - Histórico mensal dos scores
   - Para gráficos de evolução

7. **`waste_distribution`** - Distribuição de Resíduos
   - Dados para gráficos de pizza
   - Tipos de resíduo e quantidades

8. **`esg_goals`** - Metas ESG
   - Metas personalizadas dos usuários
   - Progresso e status

9. **`notifications`** - Notificações do Sistema
   - Alertas e mensagens para os usuários
   - Status de leitura

10. **`faqs`** - Perguntas Frequentes
    - Sistema de suporte
    - Categorias e ícones

11. **`support_tickets`** - Chamados de Suporte
    - Sistema de tickets
    - Prioridade e status

12. **`ticket_responses`** - Respostas aos Chamados
    - Histórico de conversas
    - Respostas internas e externas

## 🔧 Funcionalidades Implementadas

### Triggers Automáticos
- **Criação automática de perfil** quando usuário se registra
- **Atualização automática de timestamps** (updated_at)
- **Verificação de MTRs vencidos** automaticamente
- **Cálculo automático do score ESG total**

### Índices de Performance
- Índices otimizados para consultas frequentes
- Índices em campos de busca e filtros
- Índices em relacionamentos (user_id)

### Row Level Security (RLS)
- **Segurança por usuário**: Cada usuário só acessa seus próprios dados
- **Políticas específicas** para cada operação (SELECT, INSERT, UPDATE, DELETE)
- **Acesso público** apenas para FAQs

### Permissões
- **Usuários autenticados**: Acesso completo às suas tabelas
- **Usuários anônimos**: Apenas leitura de FAQs
- **Permissões granulares** por tabela

## 🚀 Como Usar

### 1. No Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Cole todo o conteúdo do arquivo `database_schema.sql`
5. Clique em **Run** para executar

### 2. Via Supabase CLI

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
supabase link --project-ref YOUR_PROJECT_REF

# Executar o script
supabase db reset
```

### 3. Verificação

Após executar o script, verifique se:

1. **Tabelas foram criadas**: Vá em **Table Editor** no Supabase
2. **RLS está ativo**: Verifique as políticas em cada tabela
3. **Triggers funcionam**: Teste criando um usuário
4. **Dados iniciais**: FAQs devem estar disponíveis

## 📊 Dados Iniciais

O script inclui dados de exemplo para:

- **10 FAQs** organizadas por categoria
- **Categorias**: Calculadora IMC, MTR, Financeiro, ESG, Suporte
- **Ícones e cores** para interface

## 🔒 Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só acessam seus próprios dados
- Políticas específicas para cada operação

### Validações
- **Check constraints** em campos importantes
- **Foreign keys** para integridade referencial
- **Campos obrigatórios** definidos

### Extensões
- **uuid-ossp**: Para geração de UUIDs
- **pgcrypto**: Para criptografia

## 📈 Performance

### Índices Otimizados
- Índices em `user_id` para todas as tabelas
- Índices em campos de data para consultas temporais
- Índices em campos de status para filtros

### Consultas Eficientes
- Uso de `JSONB` para dados flexíveis
- Campos calculados (`GENERATED ALWAYS AS`)
- Relacionamentos otimizados

## 🛠️ Manutenção

### Backup
```sql
-- Backup das tabelas importantes
pg_dump -t public.profiles -t public.sustainability_metrics -t public.mtr_records your_database
```

### Monitoramento
```sql
-- Verificar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';
```

### Limpeza
```sql
-- Limpar dados antigos (exemplo)
DELETE FROM public.notifications 
WHERE created_at < NOW() - INTERVAL '90 days';
```

## 🔄 Migrações Futuras

Para adicionar novas funcionalidades:

1. **Crie um novo arquivo SQL** para a migração
2. **Teste em ambiente de desenvolvimento**
3. **Execute no Supabase** via SQL Editor
4. **Atualize os tipos TypeScript** se necessário

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** no Supabase Dashboard
2. **Teste as políticas RLS** individualmente
3. **Confirme as permissões** do usuário
4. **Verifique os triggers** estão funcionando

## 📝 Notas Importantes

- **Backup**: Sempre faça backup antes de executar scripts em produção
- **Teste**: Execute primeiro em ambiente de desenvolvimento
- **Monitoramento**: Acompanhe o desempenho das consultas
- **Atualizações**: Mantenha o script atualizado com mudanças no código

---

**Desenvolvido para o Projeto Canteiro Circular** 🏗️♻️ 