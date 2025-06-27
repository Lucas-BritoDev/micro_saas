import { Button } from "@/components/ui/button";
import { Calculator, FileText, Leaf, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    title: "Nova Avaliação IMC",
    description: "Calcular maturidade circular",
    icon: Calculator,
    color: "bg-green-500 hover:bg-green-600",
    path: "/calculadora-imc"
  },
  {
    title: "Emitir MTR",
    description: "Gerar manifesto de resíduos",
    icon: FileText,
    color: "bg-blue-500 hover:bg-blue-600",
    path: "/gestao-mtr"
  },
  {
    title: "Relatório ESG",
    description: "Visualizar indicadores",
    icon: Leaf,
    color: "bg-purple-500 hover:bg-purple-600",
    path: "/painel-esg"
  },
  {
    title: "Controle Financeiro",
    description: "Gestão de recursos",
    icon: DollarSign,
    color: "bg-orange-500 hover:bg-orange-600",
    path: "/financeiro"
  }
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.path}>
              <Button
                variant="outline"
                className="w-full h-auto p-3 md:p-4 justify-start hover:shadow-md transition-all"
              >
                <div className={`p-2 rounded-lg ${action.color} mr-3 md:mr-4 flex-shrink-0`}>
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-sm md:text-base truncate">{action.title}</p>
                  <p className="text-xs md:text-sm text-gray-500 truncate">{action.description}</p>
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
