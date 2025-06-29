# Segurança - Configuração de Variáveis de Ambiente

## ⚠️ IMPORTANTE: Proteção de Credenciais

Este projeto usa o Supabase como backend. Para proteger suas credenciais, siga estas instruções:

### 1. Configuração Local (Desenvolvimento)

1. Crie um arquivo `.env.local` na raiz do projeto:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Environment
NODE_ENV=development
```

2. **NUNCA** commite o arquivo `.env.local` no Git!

### 2. Configuração para GitHub Pages (Produção)

Para o GitHub Pages, você precisa configurar as variáveis de ambiente no GitHub:

1. Vá para seu repositório no GitHub
2. Clique em "Settings" > "Secrets and variables" > "Actions"
3. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`: sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: sua chave anônima do Supabase

### 3. Configuração do Workflow do GitHub Actions

Crie ou atualize o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. Verificação de Segurança

- ✅ Arquivo `.env.local` está no `.gitignore`
- ✅ Credenciais não estão hardcoded no código
- ✅ Variáveis de ambiente configuradas no GitHub Secrets
- ✅ Workflow usa secrets para build

### 5. O que fazer agora?

1. **Imediatamente**: Remova as credenciais hardcoded do repositório
2. **Crie o arquivo `.env.local`** com suas credenciais
3. **Configure os GitHub Secrets** para produção
4. **Atualize o workflow** se necessário
5. **Faça um novo deploy** com as configurações seguras

### 6. Chaves do Supabase

- **URL**: https://jdxirshxxjkzqmamcmlr.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeGlyc2h4eGprenFtYW1jbWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxOTc0MTIsImV4cCI6MjA2Mjc3MzQxMn0.l-xnmSosykOQWdmP8IUa4KVYUu94kRu14AA51hYyj08

⚠️ **ATENÇÃO**: Estas chaves já foram expostas publicamente. Considere regenerar suas chaves no Supabase Dashboard para maior segurança. 