import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Edit,
  Plus,
  FileText,
  Calendar,
  MapPin,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NewMTRDialog } from "@/components/dialogs/NewMTRDialog";
import { exportMTRData, exportMTRSinirReport } from "@/utils/exportUtils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { useScrollToTop } from "@/hooks/useScrollToTop";

export default function GestaoMTR() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showNewMTRDialog, setShowNewMTRDialog] = useState(false);
  const [mtrData, setMtrData] = useState<any[]>([]);
  const { user } = useAuth();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [issueDateStart, setIssueDateStart] = useState("");
  const [issueDateEnd, setIssueDateEnd] = useState("");
  const [dueDateStart, setDueDateStart] = useState("");
  const [dueDateEnd, setDueDateEnd] = useState("");
  const [searchCNPJ, setSearchCNPJ] = useState("");
  const [editingMTR, setEditingMTR] = useState<any>(null);

  // Hook para scroll automático ao topo
  useScrollToTop();

  useEffect(() => {
    loadMTRData();
  }, [user]);

  const loadMTRData = async () => {
    if (!user) {
      setMtrData([]);
      return;
    }
    
    try {
      const { data, error } = await (supabase as any)
        .from('mtr_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading MTR data:", error.message);
        toast.error("Erro ao carregar dados de MTR.");
        setMtrData([]);
        return;
      }

      setMtrData(data || []);
    } catch (err) {
      console.error("Unexpected error loading MTR data:", err);
      toast.error("Erro inesperado ao buscar dados de MTR.");
      setMtrData([]);
    }
  };

  const filteredData = mtrData.filter(mtr => {
    const matchesSearch = mtr.mtr_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mtr.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || mtr.status.toLowerCase() === statusFilter;
    const matchesType = typeFilter === "all" || mtr.waste_type.toLowerCase().includes(typeFilter);
    // Filtros avançados
    const matchesIssueDate = (!issueDateStart || new Date(mtr.issue_date) >= new Date(issueDateStart)) &&
                            (!issueDateEnd || new Date(mtr.issue_date) <= new Date(issueDateEnd));
    const matchesDueDate = (!dueDateStart || new Date(mtr.due_date) >= new Date(dueDateStart)) &&
                          (!dueDateEnd || new Date(mtr.due_date) <= new Date(dueDateEnd));
    const matchesCNPJ = !searchCNPJ ||
      (mtr.generator_cnpj && mtr.generator_cnpj.includes(searchCNPJ)) ||
      (mtr.transporter_cnpj && mtr.transporter_cnpj.includes(searchCNPJ)) ||
      (mtr.receiver_cnpj && mtr.receiver_cnpj.includes(searchCNPJ));
    return matchesSearch && matchesStatus && matchesType && matchesIssueDate && matchesDueDate && matchesCNPJ;
  });

  const handleExport = () => {
    exportMTRData(filteredData);
    toast.success('Dados exportados com sucesso!');
  };

  const handleExportSinir = (mtr: any) => {
    exportMTRSinirReport(mtr);
    toast.success('Relatório SINIR exportado!');
  };

  const handleDeleteAllMTR = async () => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir TODOS os relatórios MTR? Esta ação não pode ser desfeita.')) return;
    const { error } = await supabase.from('mtr_records').delete().eq('user_id', user.id);
    if (!error) {
      setMtrData([]);
      toast.success('Todos os relatórios MTR foram excluídos!');
    } else {
      toast.error('Erro ao excluir relatórios: ' + error.message);
    }
  };

  const stats = [
    { label: "Total de MTRs", value: mtrData.length.toString(), color: "text-blue-600" },
    { label: "Ativos", value: mtrData.filter(m => m.status === 'ativo').length.toString(), color: "text-green-600" },
    { label: "Vencidos", value: mtrData.filter(m => new Date(m.due_date) < new Date()).length.toString(), color: "text-red-600" },
    { label: "Toneladas Total", value: mtrData.reduce((sum, m) => sum + (m.quantity || 0), 0).toFixed(1), color: "text-purple-600" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold">Gestão de MTR</h1>
        <p className="text-gray-600 mt-1">Manifesto de Transporte de Resíduos</p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Button variant="outline" onClick={handleExport} className="w-full flex items-center justify-center">
            <Download className="h-4 w-4 mr-2" /> Exportar
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 w-full flex items-center justify-center" onClick={() => setShowNewMTRDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo MTR
          </Button>
          <Button variant="destructive" onClick={handleDeleteAllMTR} className="w-full flex items-center justify-center">
            <Trash2 className="h-4 w-4 mr-2" /> Zerar Relatórios
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar por número MTR ou projeto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="concreto">Concreto</SelectItem>
                <SelectItem value="aço">Aço</SelectItem>
                <SelectItem value="madeira">Madeira</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowAdvancedFilters(v => !v)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAdvancedFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 border rounded bg-gray-50">
          <div>
            <label className="block text-xs font-medium mb-1">Data de Emissão (início)</label>
            <input type="date" value={issueDateStart} onChange={e => setIssueDateStart(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Data de Emissão (fim)</label>
            <input type="date" value={issueDateEnd} onChange={e => setIssueDateEnd(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Data de Vencimento (início)</label>
            <input type="date" value={dueDateStart} onChange={e => setDueDateStart(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Data de Vencimento (fim)</label>
            <input type="date" value={dueDateEnd} onChange={e => setDueDateEnd(e.target.value)} className="w-full border rounded px-2 py-1" />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <label className="block text-xs font-medium mb-1">Buscar por CNPJ (Gerador, Transportador ou Receptor)</label>
            <input type="text" value={searchCNPJ} onChange={e => setSearchCNPJ(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Digite o CNPJ" />
          </div>
        </div>
      )}

      {/* MTR List */}
      <div className="space-y-4">
        {filteredData.map((mtr) => (
          <Card key={mtr.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{mtr.mtr_number}</h3>
                    <Badge className={mtr.statusColor}>{mtr.status}</Badge>
                  </div>
                  <p className="text-gray-600">{mtr.project_name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {mtr.waste_type}: {mtr.quantity}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Vence: {mtr.due_date ? format(new Date(mtr.due_date), 'dd/MM/yyyy') : ''}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {mtr.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm" onClick={() => handleExportSinir(mtr)}>
                    <Download className="h-4 w-4 mr-2" />
                    Relatório SINIR
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setEditingMTR(mtr); setShowNewMTRDialog(true); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showNewMTRDialog && (
        <div className="w-full max-w-5xl mx-auto my-6">
          <NewMTRDialog
            isOpen={showNewMTRDialog}
            onClose={() => { setShowNewMTRDialog(false); setEditingMTR(null); }}
            onSuccess={loadMTRData}
            editingMTR={editingMTR}
          />
        </div>
      )}
    </div>
  );
}
