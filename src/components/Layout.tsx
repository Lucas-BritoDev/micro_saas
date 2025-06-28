import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Hook para scroll automático ao topo
  useScrollToTop();

  return (
    <div className="h-screen bg-gray-50 flex w-full overflow-hidden">
      <AppSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main className={cn(
        "flex-1 transition-all duration-300 overflow-y-auto",
        "p-4 md:p-6",
        "pt-16 md:pt-6"
      )}>
        {children}
      </main>
    </div>
  );
}
