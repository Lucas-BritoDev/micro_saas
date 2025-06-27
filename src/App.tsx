import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CalculadoraIMC from "./pages/CalculadoraIMC";
import GestaoMTR from "./pages/GestaoMTR";
import PainelESG from "./pages/PainelESG";
import Financeiro from "./pages/Financeiro";
import Suporte from "./pages/Suporte";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Perfil from "./pages/Perfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calculadora-imc" element={<CalculadoraIMC />} />
                    <Route path="/gestao-mtr" element={<GestaoMTR />} />
                    <Route path="/painel-esg" element={<PainelESG />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/suporte" element={<Suporte />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
