import {
  BarChart3,
  Calculator,
  FileText,
  Leaf,
  DollarSign,
  HelpCircle,
  Home,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { UserMenu } from "./UserMenu";

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Calculadora IMC", href: "/calculadora-imc", icon: Calculator },
  { name: "Painel ESG", href: "/painel-esg", icon: Leaf },
  { name: "Gestão MTR", href: "/gestao-mtr", icon: FileText },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
  { name: "Suporte", href: "/suporte", icon: HelpCircle },
];

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-50",
        "fixed lg:relative inset-y-0 left-0",
        isCollapsed ? "w-16" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <img 
                  src={`${import.meta.env.BASE_URL}lovable-uploads/logo.png`} 
                  alt="Canteiro Circular" 
                  className="h-8 w-8"
                />
                <span className="font-bold text-green-600 text-lg">
                  Canteiro Circular
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="hidden lg:flex h-8 w-8 p-0 border-2 border-blue-400 bg-blue-50 hover:bg-blue-100 shadow"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </>
  );
}
