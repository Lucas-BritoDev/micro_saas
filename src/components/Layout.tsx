import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Hook para scroll automático ao topo
  useScrollToTop();
  
  // Ocultar sidebar na página de perfil
  const isProfilePage = location.pathname === "/perfil";
  const shouldShowSidebar = !isProfilePage;

  return (
    <div className="h-screen bg-gray-50 flex w-full overflow-hidden">
      {shouldShowSidebar && (
        <AppSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}
      <main className={cn(
        "flex-1 transition-all duration-300 overflow-y-auto",
        "p-4 md:p-6",
        shouldShowSidebar ? "pt-16 md:pt-6" : "pt-4 md:pt-6"
      )}>
        {children}
      </main>
    </div>
  );
}
