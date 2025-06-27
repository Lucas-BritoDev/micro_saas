import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

interface NewTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTransaction?: any;
}

export const NewTransactionDialog: React.FC<NewTransactionDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingTransaction 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: editingTransaction?.description || '',
    project: editingTransaction?.project || '',
    amount: editingTransaction?.amount?.toString().replace(/[^.-]/g, '') || '',
    type: editingTransaction?.type || 'expense',
    date: editingTransaction?.date ? new Date(editingTransaction.date) : new Date(),
    category: editingTransaction?.category || '',
    observacao: editingTransaction?.observacao || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Removido - coluna comprovante não existe no schema
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!formData.description || !formData.project || !formData.amount) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Removido upload de arquivo - coluna comprovante não existe
      const transactionData = {
        user_id: user.id,
        description: formData.description,
        project: formData.project,
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date.toISOString().split('T')[0],
        category: formData.category,
        observacao: formData.observacao,
      };

      let error = null;

      if (editingTransaction) {
        const { error: updateError } = await (supabase as any)
          .from('financial_transactions')
          .update(transactionData)
          .eq('id', editingTransaction.id);
        error = updateError;
        toast.success('Transação atualizada com sucesso!');
      } else {
        const { error: insertError } = await (supabase as any)
          .from('financial_transactions')
          .insert([transactionData]);
        error = insertError;
        toast.success('Transação criada com sucesso!');
      }
      
      if (error) {
        console.error('Error saving transaction to Supabase:', error.message);
        toast.error('Erro ao salvar transação.');
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            Adicione uma nova entrada financeira ao sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="project">Projeto *</Label>
            <Input
              id="project"
              value={formData.project}
              onChange={(e) => handleInputChange('project', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sustentabilidade">Sustentabilidade</SelectItem>
                <SelectItem value="materiais">Materiais</SelectItem>
                <SelectItem value="mao-obra">Mão de Obra</SelectItem>
                <SelectItem value="equipamentos">Equipamentos</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Input id="observacao" value={formData.observacao} onChange={e => handleInputChange('observacao', e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Salvando...' : (editingTransaction ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
