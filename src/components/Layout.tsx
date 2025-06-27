import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Ocultar sidebar na página de perfil
  const isProfilePage = location.pathname === "/perfil";
  const shouldShowSidebar = !isProfilePage;

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {shouldShowSidebar && (
        <AppSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      )}
      <main className={cn(
        "flex-1 transition-all duration-300",
        "p-4 md:p-6",
        shouldShowSidebar ? "pt-16 md:pt-6" : "pt-4 md:pt-6"
      )}>
        {children}
      </main>
    </div>
  );
}
