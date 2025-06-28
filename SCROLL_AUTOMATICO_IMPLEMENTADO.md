# Scroll Automático ao Topo - Implementado

## Descrição
Implementação de um sistema que garante que quando o usuário navegar entre páginas, sempre volte ao início da nova página.

## Funcionalidades Implementadas

### 1. Hook Personalizado `useScrollToTop`
- **Arquivo**: `src/hooks/useScrollToTop.tsx`
- **Funcionalidade**: Hook que monitora mudanças de rota e faz scroll suave para o topo
- **Comportamento**: Executa automaticamente quando o `pathname` da URL muda

### 2. Aplicação Global no Layout
- **Arquivo**: `src/components/Layout.tsx`
- **Implementação**: Hook aplicado no Layout principal para funcionar em todas as páginas
- **Benefício**: Não precisa aplicar individualmente em cada página

### 3. Aplicação Individual em Páginas Específicas
Para garantir funcionamento robusto, o hook foi aplicado também individualmente em páginas com conteúdo extenso:

- **Dashboard** (`src/pages/Dashboard.tsx`)
- **Painel ESG** (`src/pages/PainelESG.tsx`)
- **Calculadora IMC** (`src/pages/CalculadoraIMC.tsx`)
- **Gestão MTR** (`src/pages/GestaoMTR.tsx`)
- **Financeiro** (`src/pages/Financeiro.tsx`)
- **Nova Meta ESG** (`src/pages/NovaMetaESG.tsx`)

## Como Funciona

### Hook `useScrollToTop`
```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll suave para o topo quando a rota mudar
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  }, [location.pathname]); // Executa quando o pathname mudar
}
```

### Aplicação no Layout
```typescript
import { useScrollToTop } from "@/hooks/useScrollToTop";

export function Layout({ children }: LayoutProps) {
  // Hook para scroll automático ao topo
  useScrollToTop();
  
  // ... resto do código
}
```

## Benefícios

1. **Experiência do Usuário**: Sempre inicia a navegação no topo da nova página
2. **Consistência**: Comportamento uniforme em todo o aplicativo
3. **Acessibilidade**: Facilita a navegação para usuários com dificuldades motoras
4. **Performance**: Scroll suave que não causa saltos bruscos
5. **Manutenibilidade**: Código centralizado e reutilizável

## Comportamento

- **Scroll Suave**: Utiliza `behavior: 'smooth'` para transição suave
- **Trigger Automático**: Executa sempre que o usuário navegar para uma nova rota
- **Compatibilidade**: Funciona com todas as formas de navegação (links, programática, etc.)
- **Não Interfere**: Não afeta scrolls manuais do usuário dentro da mesma página

## Testes Recomendados

1. Navegar entre todas as páginas do aplicativo
2. Verificar se o scroll sempre volta ao topo
3. Testar navegação rápida entre páginas
4. Verificar se não há conflitos com scrolls manuais
5. Testar em diferentes tamanhos de tela

## Observações

- O hook é leve e não impacta a performance
- Funciona em conjunto com o scroll global já implementado
- Não interfere com funcionalidades existentes de scroll
- Compatível com todas as versões do React Router 