import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook personalizado para scroll automático ao topo da página
 * quando o usuário navegar entre rotas
 */
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