import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface NewMTRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMTR?: any;
}

interface MTRFormData {
  project_name: string;
  waste_type: string;
  quantity: string;
  unit: string;
  description: string;
  generator_name: string;
  generator_cnpj: string;
  generator_address: string;
  transporter_name: string;
  transporter_cnpj: string;
  transporter_license: string;
  receiver_name: string;
  receiver_cnpj: string;
  receiver_license: string;
  issue_date: Date | undefined;
  due_date: Date | undefined;
  location: string;
}

export const NewMTRDialog: React.FC<NewMTRDialogProps> = ({ isOpen, onClose, onSuccess, editingMTR }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MTRFormData>({
    project_name: editingMTR?.project_name || '',
    waste_type: editingMTR?.waste_type || '',
    quantity: editingMTR?.quantity?.toString() || '',
    unit: editingMTR?.unit || 't',
    description: editingMTR?.description || '',
    generator_name: editingMTR?.generator_name || '',
    generator_cnpj: editingMTR?.generator_cnpj || '',
    generator_address: editingMTR?.generator_address || '',
    transporter_name: editingMTR?.transporter_name || '',
    transporter_cnpj: editingMTR?.transporter_cnpj || '',
    transporter_license: editingMTR?.transporter_license || '',
    receiver_name: editingMTR?.receiver_name || '',
    receiver_cnpj: editingMTR?.receiver_cnpj || '',
    receiver_license: editingMTR?.receiver_license || '',
    issue_date: editingMTR?.issue_date ? new Date(editingMTR.issue_date) : undefined,
    due_date: editingMTR?.due_date ? new Date(editingMTR.due_date) : undefined,
    location: editingMTR?.location || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        project_name: editingMTR?.project_name || '',
        waste_type: editingMTR?.waste_type || '',
        quantity: editingMTR?.quantity?.toString() || '',
        unit: editingMTR?.unit || 't',
        description: editingMTR?.description || '',
        generator_name: editingMTR?.generator_name || '',
        generator_cnpj: editingMTR?.generator_cnpj || '',
        generator_address: editingMTR?.generator_address || '',
        transporter_name: editingMTR?.transporter_name || '',
        transporter_cnpj: editingMTR?.transporter_cnpj || '',
        transporter_license: editingMTR?.transporter_license || '',
        receiver_name: editingMTR?.receiver_name || '',
        receiver_cnpj: editingMTR?.receiver_cnpj || '',
        receiver_license: editingMTR?.receiver_license || '',
        issue_date: editingMTR?.issue_date ? new Date(editingMTR.issue_date) : undefined,
        due_date: editingMTR?.due_date ? new Date(editingMTR.due_date) : undefined,
        location: editingMTR?.location || '',
      });
    }
  }, [isOpen, editingMTR]);

  const handleInputChange = (field: keyof MTRFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'issue_date' | 'due_date', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const generateMTRNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MTR-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Validate required fields
    const requiredFields = [
      'project_name', 'waste_type', 'quantity', 'generator_name', 
      'generator_cnpj', 'issue_date', 'due_date'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof MTRFormData];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const mtrDataToSave = {
        user_id: user.id,
        mtr_number: editingMTR?.mtr_number || generateMTRNumber(),
        project_name: formData.project_name,
        waste_type: formData.waste_type,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        description: formData.description,
        generator_name: formData.generator_name,
        generator_cnpj: formData.generator_cnpj,
        generator_address: formData.generator_address,
        transporter_name: formData.transporter_name,
        transporter_cnpj: formData.transporter_cnpj,
        transporter_license: formData.transporter_license,
        receiver_name: formData.receiver_name,
        receiver_cnpj: formData.receiver_cnpj,
        receiver_license: formData.receiver_license,
        issue_date: formData.issue_date?.toISOString().split('T')[0],
        due_date: formData.due_date?.toISOString().split('T')[0],
        location: formData.location,
        status: editingMTR?.status || 'ativo',
      };

      let error = null;

      if (editingMTR) {
        // Update existing MTR
        const { error: updateError } = await (supabase as any)
          .from('mtr_records')
          .update(mtrDataToSave)
          .eq('id', editingMTR.id);
        error = updateError;
        toast.success('MTR atualizado com sucesso!');
      } else {
        // Insert new MTR
        const { error: insertError } = await (supabase as any)
          .from('mtr_records')
          .insert([mtrDataToSave]);
        error = insertError;
        toast.success('MTR criado com sucesso!');
      }
      
      if (error) {
        console.error('Error saving MTR to Supabase:', error.message);
        toast.error('Erro ao salvar MTR.');
        return;
      }

      onSuccess();
      onClose();
      
      // Reset form only if not editing
      if (!editingMTR) {
        setFormData({
          project_name: '',
          waste_type: '',
          quantity: '',
          unit: 't',
          description: '',
          generator_name: '',
          generator_cnpj: '',
          generator_address: '',
          transporter_name: '',
          transporter_cnpj: '',
          transporter_license: '',
          receiver_name: '',
          receiver_cnpj: '',
          receiver_license: '',
          issue_date: undefined,
          due_date: undefined,
          location: '',
        });
      }
    } catch (error) {
      console.error('Error creating MTR:', error);
      toast.error('Erro ao criar MTR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMTR ? 'Editar MTR' : 'Novo MTR'}
          </DialogTitle>
          <DialogDescription>
            Manifesto de Transporte de Resíduos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Projeto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações do Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_name">Nome do Projeto *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => handleInputChange('project_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Informações do Resíduo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações do Resíduo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="waste_type">Tipo de Resíduo *</Label>
                <Select value={formData.waste_type} onValueChange={(value) => handleInputChange('waste_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concreto">Concreto</SelectItem>
                    <SelectItem value="aco">Aço</SelectItem>
                    <SelectItem value="madeira">Madeira</SelectItem>
                    <SelectItem value="plastico">Plástico</SelectItem>
                    <SelectItem value="gesso">Gesso</SelectItem>
                    <SelectItem value="ceramica">Cerâmica</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t">Toneladas (t)</SelectItem>
                    <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    <SelectItem value="m3">Metros cúbicos (m³)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Informações do Gerador */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Gerador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="generator_name">Nome do Gerador *</Label>
                <Input
                  id="generator_name"
                  value={formData.generator_name}
                  onChange={(e) => handleInputChange('generator_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="generator_cnpj">CNPJ *</Label>
                <Input
                  id="generator_cnpj"
                  value={formData.generator_cnpj}
                  onChange={(e) => handleInputChange('generator_cnpj', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="generator_address">Endereço</Label>
              <Input
                id="generator_address"
                value={formData.generator_address}
                onChange={(e) => handleInputChange('generator_address', e.target.value)}
              />
            </div>
          </div>

          {/* Informações do Transportador */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Transportador</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="transporter_name">Nome do Transportador</Label>
                <Input
                  id="transporter_name"
                  value={formData.transporter_name}
                  onChange={(e) => handleInputChange('transporter_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="transporter_cnpj">CNPJ</Label>
                <Input
                  id="transporter_cnpj"
                  value={formData.transporter_cnpj}
                  onChange={(e) => handleInputChange('transporter_cnpj', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="transporter_license">Licença</Label>
                <Input
                  id="transporter_license"
                  value={formData.transporter_license}
                  onChange={(e) => handleInputChange('transporter_license', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Informações do Receptor */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Receptor</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="receiver_name">Nome do Receptor</Label>
                <Input
                  id="receiver_name"
                  value={formData.receiver_name}
                  onChange={(e) => handleInputChange('receiver_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="receiver_cnpj">CNPJ</Label>
                <Input
                  id="receiver_cnpj"
                  value={formData.receiver_cnpj}
                  onChange={(e) => handleInputChange('receiver_cnpj', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="receiver_license">Licença</Label>
                <Input
                  id="receiver_license"
                  value={formData.receiver_license}
                  onChange={(e) => handleInputChange('receiver_license', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Datas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data de Emissão *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.issue_date ? format(formData.issue_date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.issue_date}
                      onSelect={(date) => handleDateChange('issue_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Data de Vencimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => handleDateChange('due_date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Criando...' : 'Criar MTR'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
