
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  created_at: string;
}

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDialog: React.FC<NotificationsDialogProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure type compatibility
      const mappedNotifications: Notification[] = (data || []).map(notification => ({
        ...notification,
        type: ['info', 'warning', 'success'].includes(notification.type) 
          ? notification.type as 'info' | 'warning' | 'success'
          : 'info'
      }));
      
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notificação removida');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Erro ao remover notificação');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Suas últimas notificações e alertas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma notificação encontrada</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <Badge className={getTypeColor(notification.type)}>
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex space-x-1">
                    {!notification.read && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
