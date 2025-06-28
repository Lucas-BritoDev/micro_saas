# 📊 Scroll Automático na Calculadora IMC

## ✅ **Funcionalidade Implementada**

### 🎯 **Objetivo**
Quando o usuário responde as perguntas do questionário IMC e clica no botão "Próximo", a página automaticamente volta ao topo da tela para começar a responder o próximo indicador.

## 🔧 **Mudanças Realizadas**

### 1. **Função `handleNextGroup`**
```javascript
const handleNextGroup = () => {
  if (currentGroup < questionGroups.length - 1) {
    setCurrentGroup(prev => prev + 1);
    // Scroll para o topo da tela
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
```

### 2. **Função `handlePreviousGroup`**
```javascript
const handlePreviousGroup = () => {
  if (currentGroup > 0) {
    setCurrentGroup(prev => prev - 1);
    // Scroll para o topo da tela
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
```

### 3. **Função `handleRestart`**
```javascript
const handleRestart = () => {
  setCurrentGroup(0);
  setAnswers({});
  setAssessment(null);
  // Scroll para o topo da tela
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

## 🚀 **Como Funciona**

### **Navegação Entre Grupos**
- **Botão "Próximo"**: Avança para o próximo grupo de perguntas e volta ao topo
- **Botão "Anterior"**: Volta para o grupo anterior e volta ao topo
- **Scroll Suave**: Usa `behavior: 'smooth'` para transição suave

### **Reiniciar Avaliação**
- **Botão "Reiniciar Avaliação"**: Volta ao primeiro grupo e ao topo da tela
- **Limpa Respostas**: Remove todas as respostas anteriores
- **Scroll Automático**: Posiciona o usuário no início do questionário

## 📱 **Benefícios**

1. **UX Melhorada**: Usuário sempre vê o início do novo grupo de perguntas
2. **Navegação Intuitiva**: Não precisa rolar manualmente para encontrar as perguntas
3. **Consistência**: Comportamento uniforme em todas as navegações
4. **Acessibilidade**: Facilita o uso em dispositivos móveis
5. **Eficiência**: Reduz o tempo para encontrar e responder as perguntas

## 🎨 **Experiência do Usuário**

### **Fluxo de Navegação**
1. Usuário responde perguntas do grupo atual
2. Clica em "Próximo"
3. Página automaticamente volta ao topo
4. Próximo grupo de perguntas aparece no topo
5. Usuário pode começar a responder imediatamente

### **Transições Suaves**
- Scroll com animação suave (`behavior: 'smooth'`)
- Não causa desconforto visual
- Mantém o contexto da navegação

## 🔍 **Detalhes Técnicos**

### **API Utilizada**
```javascript
window.scrollTo({ 
  top: 0,           // Posição do topo
  behavior: 'smooth' // Animação suave
});
```

### **Compatibilidade**
- ✅ Todos os navegadores modernos
- ✅ Dispositivos móveis
- ✅ Tablets e desktops
- ✅ Funciona com o scroll global implementado

## 📋 **Grupos de Perguntas**

O scroll automático funciona para todos os grupos:

1. **Governança** - Políticas e gestão
2. **Materiais** - Uso de materiais sustentáveis
3. **Energia** - Eficiência energética
4. **Resíduos** - Gestão de resíduos
5. **Água** - Gestão hídrica
6. **Design Circular** - Princípios de design

## 🎯 **Resultado**

Agora quando o usuário navega entre os grupos de perguntas da calculadora IMC, a página automaticamente volta ao topo, proporcionando uma experiência mais fluida e intuitiva para responder o questionário. 