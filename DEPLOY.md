# 🚀 Guia de Deploy - GitHub Pages

Este guia te ajudará a colocar o Micro SaaS online no GitHub Pages.

## 📋 Pré-requisitos

1. **Conta no GitHub**
2. **Projeto no Supabase** configurado
3. **Node.js** instalado (versão 18+)

## 🔧 Passo a Passo

### 1. Preparar o Repositório

```bash
# Clone o repositório (se ainda não fez)
git clone https://github.com/seu-usuario/micro-saas.git
cd micro-saas

# Instale as dependências
npm install

# Teste localmente
npm run dev
```

### 2. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > API
4. Copie:
   - **Project URL**
   - **anon public** key

### 3. Configurar Secrets no GitHub

1. Vá para seu repositório no GitHub
2. Clique em **Settings**
3. No menu lateral, clique em **Secrets and variables** > **Actions**
4. Clique em **New repository secret**
5. Adicione os seguintes secrets:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Configurar o Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Execute o script completo de `database_schema.sql`
3. Verifique se todas as tabelas foram criadas

### 5. Ativar GitHub Pages

1. No GitHub, vá em **Settings** > **Pages**
2. Em **Source**, selecione **Deploy from a branch**
3. Em **Branch**, selecione **gh-pages**
4. Em **Folder**, deixe **/(root)**
5. Clique em **Save**

### 6. Fazer o Deploy

```bash
# Adicione todas as mudanças
git add .

# Faça o commit
git commit -m "Setup deploy GitHub Pages"

# Push para a branch main
git push origin main
```

### 7. Verificar o Deploy

1. Vá em **Actions** no seu repositório
2. Você verá o workflow **Deploy to GitHub Pages** rodando
3. Aguarde a conclusão (cerca de 2-3 minutos)
4. Vá em **Settings** > **Pages** para ver o link

## 🔗 URLs

Após o deploy, sua aplicação estará disponível em:
```
https://seu-usuario.github.io/micro-saas
```

## 🛠️ Troubleshooting

### Erro: "Build failed"

1. Verifique se os secrets estão configurados corretamente
2. Verifique se o Supabase está acessível
3. Veja os logs em **Actions** > **Deploy to GitHub Pages**

### Erro: "Page not found"

1. Verifique se o GitHub Pages está ativado
2. Aguarde alguns minutos após o deploy
3. Verifique se a branch `gh-pages` foi criada

### Erro: "Supabase connection failed"

1. Verifique se as variáveis de ambiente estão corretas
2. Verifique se o projeto Supabase está ativo
3. Verifique se as políticas RLS estão configuradas

## 🔄 Deploy Manual (Alternativo)

Se preferir fazer deploy manual:

```bash
# Instale o gh-pages globalmente
npm install -g gh-pages

# Configure as variáveis de ambiente
export VITE_SUPABASE_URL=sua_url
export VITE_SUPABASE_ANON_KEY=sua_chave

# Faça o build
npm run build

# Deploy
npm run deploy
```

## 📱 Testando

Após o deploy, teste:

1. **Registro/Login**: Crie uma conta e faça login
2. **Dashboard**: Verifique se carrega corretamente
3. **Módulos**: Teste IMC, ESG, MTR, Financeiro
4. **Responsividade**: Teste em mobile e desktop

## 🔒 Segurança

- ✅ HTTPS obrigatório no GitHub Pages
- ✅ Variáveis sensíveis em secrets
- ✅ RLS habilitado no Supabase
- ✅ Validação de dados

## 📊 Monitoramento

Para monitorar o deploy:

1. **GitHub Actions**: Veja o status dos deploys
2. **Supabase Dashboard**: Monitore o banco de dados
3. **Analytics**: Configure Google Analytics se necessário

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs em **Actions**
2. Teste localmente primeiro
3. Verifique a documentação do Supabase
4. Abra uma issue no GitHub

---

**🎉 Parabéns! Seu Micro SaaS está online!** 