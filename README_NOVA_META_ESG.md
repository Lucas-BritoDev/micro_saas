# Nova Funcionalidade: Metas ESG

## Visão Geral

Foi implementada uma nova funcionalidade no Painel ESG que permite aos usuários criar metas detalhadas de melhoria para cada quesito ESG (Environmental, Social, Governance).

## Funcionalidades Implementadas

### 1. Nova Página: Nova Meta ESG
- **Rota**: `/nova-meta-esg`
- **Acesso**: Através do botão "Nova Meta" no Painel ESG
- **Funcionalidades**:
  - Formulário para definir metas de melhoria em cada quesito ESG
  - Campos para percentual de melhoria desejada (E, S, G)
  - Título e descrição opcionais da meta
  - Prazo opcional para atingir a meta
  - Resumo visual em tempo real dos impactos das metas

### 2. Campos de Melhoria ESG
- **Ambiental (E)**: Percentual de melhoria desejada no score ambiental
- **Social (S)**: Percentual de melhoria desejada no score social  
- **Governança (G)**: Percentual de melhoria desejada no score de governança

### 3. Visualização Melhorada das Metas
- Cards detalhados mostrando:
  - Título e descrição da meta
  - Prazo (se definido)
  - Scores atuais e metas para cada quesito ESG
  - Percentuais de melhoria
  - Status da meta (Ativa, Concluída, Atrasada)
  - Barra de progresso

## Como Usar

### 1. Acessar a Funcionalidade
1. Vá para o **Painel ESG** no menu lateral
2. Clique no botão **"Nova Meta"** na seção de Metas ESG

### 2. Criar uma Nova Meta
1. **Título** (opcional): Dê um nome para sua meta
2. **Prazo** (opcional): Defina uma data limite
3. **Descrição** (opcional): Detalhe os objetivos da meta
4. **Melhorias Desejadas**:
   - **Ambiental**: Digite o percentual que deseja melhorar (ex: 15)
   - **Social**: Digite o percentual que deseja melhorar (ex: 10)
   - **Governança**: Digite o percentual que deseja melhorar (ex: 20)

### 3. Visualizar o Resumo
- O painel lateral mostra em tempo real:
  - Scores atuais vs metas
  - Percentuais de melhoria
  - Score ESG médio projetado

### 4. Salvar a Meta
- Clique em **"Criar Meta"** para salvar
- Você será redirecionado de volta ao Painel ESG
- A nova meta aparecerá na lista de metas

## Atualizações no Banco de Dados

### Script de Migração
Execute o arquivo `update_esg_goals_table.sql` no seu banco Supabase para adicionar os novos campos:

```sql
-- Novos campos adicionados:
- current_environmental: Score ambiental atual
- current_social: Score social atual  
- current_governance: Score governança atual
- target_environmental: Score ambiental alvo
- target_social: Score social alvo
- target_governance: Score governança alvo
- improvement_environmental: % melhoria ambiental
- improvement_social: % melhoria social
- improvement_governance: % melhoria governança
- deadline: Data limite
- status: Status atualizado (active, completed, overdue)
```

## Benefícios

1. **Planejamento Estratégico**: Permite definir metas específicas para cada quesito ESG
2. **Acompanhamento Visual**: Interface clara mostrando progresso e objetivos
3. **Flexibilidade**: Campos opcionais permitem personalização
4. **Integração**: Funciona com o sistema existente de scores ESG
5. **Usabilidade**: Interface intuitiva e responsiva

## Próximos Passos Sugeridos

1. **Atualização Automática de Progresso**: Implementar cálculo automático do progresso baseado nos scores ESG atuais
2. **Notificações**: Alertas quando metas estiverem próximas do prazo
3. **Relatórios**: Exportação de relatórios de progresso das metas
4. **Edição de Metas**: Permitir editar metas existentes
5. **Histórico**: Rastreamento de mudanças nas metas ao longo do tempo

## Arquivos Modificados

- `src/pages/NovaMetaESG.tsx` (novo)
- `src/pages/PainelESG.tsx` (atualizado)
- `src/App.tsx` (nova rota adicionada)
- `update_esg_goals_table.sql` (script de migração)

## Tecnologias Utilizadas

- React Router para navegação
- Supabase para persistência de dados
- Tailwind CSS para estilização
- Lucide React para ícones
- Sonner para notificações 