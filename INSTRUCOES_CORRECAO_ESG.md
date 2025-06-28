# 🔧 Instruções para Corrigir o Erro das Metas ESG

## ❌ Problema Identificado
O erro 400 ocorre porque a tabela `esg_goals` no banco de dados não tem os novos campos que o código está tentando inserir.

## ✅ Solução

### Passo 1: Executar o Script de Migração
1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script `fix_esg_goals_table.sql` que foi criado

### Passo 2: Verificar se a Migração Funcionou
Execute esta query no SQL Editor para verificar se os campos foram adicionados:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'esg_goals' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Passo 3: Testar a Funcionalidade
1. Vá para o **Painel ESG** na aplicação
2. Clique em **"Nova Meta"**
3. Preencha os campos e teste criar uma meta

## 🔄 Versão Temporária (Já Implementada)

Se você não conseguir executar o script de migração imediatamente, o código já foi modificado para funcionar com a estrutura atual da tabela:

- ✅ Funciona com os campos existentes
- ✅ Permite criar metas básicas
- ✅ Exibe as metas no Painel ESG
- ⚠️ Não salva os percentuais de melhoria específicos (E, S, G)

## 📋 Campos que Serão Adicionados

Após executar o script, a tabela terá estes novos campos:

```sql
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

## 🚀 Após a Migração

Quando o script for executado com sucesso, você pode:

1. **Reativar a funcionalidade completa** editando o arquivo `src/pages/NovaMetaESG.tsx`
2. **Descomentar** as linhas que usam os novos campos
3. **Testar** a criação de metas com percentuais específicos

## 📞 Suporte

Se o erro persistir após executar o script:
1. Verifique se há erros no console do SQL Editor
2. Confirme se todos os campos foram adicionados
3. Teste inserir uma meta diretamente via SQL para verificar a estrutura

## 🔍 Debug

Para debugar problemas, adicione este código temporariamente:

```javascript
// No handleSubmit da NovaMetaESG.tsx
console.log('Dados sendo enviados:', metaData);
console.log('Erro detalhado:', error);
``` 