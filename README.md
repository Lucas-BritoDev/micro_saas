# Micro SaaS - Sistema de Gestão de Sustentabilidade para Canteiros

Sistema web completo para gestão de sustentabilidade em canteiros de obras, desenvolvido para engenheiros civis, ambientais, técnicos de edificações e segurança.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral com métricas e indicadores
- **IMC (Índice de Maturidade Circular)**: Avaliação de sustentabilidade
- **ESG**: Relatórios de Environmental, Social e Governance
- **MTR (Manifesto de Transporte de Resíduos)**: Gestão de documentos
- **Financeiro**: Controle de receitas e despesas
- **Suporte**: Sistema de tickets e atendimento
- **Perfil**: Gestão de conta e dados pessoais

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Gráficos**: Recharts
- **Roteamento**: React Router DOM
- **Deploy**: GitHub Pages

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/micro-saas.git
cd micro-saas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

## ⚙️ Configuração

1. **Crie um projeto no Supabase**:
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Copie a URL e a chave anônima

2. **Configure as variáveis de ambiente**:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

3. **Execute o script SQL**:
   - Copie o conteúdo de `database_schema.sql`
   - Execute no SQL Editor do Supabase

## 🚀 Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🌐 Deploy no GitHub Pages

### Configuração Automática (Recomendado)

1. **Configure os Secrets no GitHub**:
   - Vá para Settings > Secrets and variables > Actions
   - Adicione:
     - `VITE_SUPABASE_URL`: Sua URL do Supabase
     - `VITE_SUPABASE_ANON_KEY`: Sua chave anônima

2. **Ative o GitHub Pages**:
   - Vá para Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

3. **Faça push para a branch main**:
   ```bash
   git add .
   git commit -m "Deploy setup"
   git push origin main
   ```

O GitHub Actions irá automaticamente fazer o build e deploy quando houver push na branch main.

### Deploy Manual

```bash
# Instale o gh-pages
npm install -g gh-pages

# Faça o deploy
npm run deploy
```

## 📊 Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- `profiles`: Dados dos usuários
- `imc_scores`: Avaliações IMC
- `esg_scores`: Relatórios ESG
- `mtr_documents`: Documentos MTR
- `financial_transactions`: Transações financeiras
- `support_tickets`: Tickets de suporte

## 🎨 Design System

O sistema utiliza um design system consistente com:

- **Cores**: Azul gradiente (#3B82F6 → #60A5FA), Laranja (#F97316), Branco (#FFFFFF)
- **Tipografia**: Inter (sans-serif)
- **Componentes**: Shadcn/ui customizados
- **Responsividade**: Mobile-first design

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) habilitado
- Validação de dados no frontend e backend
- HTTPS obrigatório em produção

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do sistema de suporte integrado.

---

**Desenvolvido com ❤️ para a construção sustentável**
