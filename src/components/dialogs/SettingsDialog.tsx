
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Moon, Sun, Bell, Mail, Shield } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: false,
    dataSharing: false,
    analytics: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurações
          </DialogTitle>
          <DialogDescription>
            Personalize suas preferências
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Aparência */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              {settings.darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
              Aparência
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="text-sm">Modo escuro</Label>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(value) => handleSettingChange('darkMode', value)}
              />
            </div>
          </div>

          <Separator />

          {/* Notificações */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm">Notificações por email</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">Notificações push</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(value) => handleSettingChange('pushNotifications', value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Relatórios */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Relatórios
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-reports" className="text-sm">Relatórios semanais</Label>
                <Switch
                  id="weekly-reports"
                  checked={settings.weeklyReports}
                  onCheckedChange={(value) => handleSettingChange('weeklyReports', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly-reports" className="text-sm">Relatórios mensais</Label>
                <Switch
                  id="monthly-reports"
                  checked={settings.monthlyReports}
                  onCheckedChange={(value) => handleSettingChange('monthlyReports', value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacidade */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Privacidade
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing" className="text-sm">Compartilhamento de dados</Label>
                <Switch
                  id="data-sharing"
                  checked={settings.dataSharing}
                  onCheckedChange={(value) => handleSettingChange('dataSharing', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="text-sm">Analytics de uso</Label>
                <Switch
                  id="analytics"
                  checked={settings.analytics}
                  onCheckedChange={(value) => handleSettingChange('analytics', value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
