import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, LogOut, User2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { NotificationsDialog } from './dialogs/NotificationsDialog';
import { SettingsDialog } from './dialogs/SettingsDialog';
import { useNavigate } from 'react-router-dom';

interface Profile {
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  avatar_url?: string;
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [perfil, setPerfil] = useState<{ full_name?: string } | null>(null);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPerfil() {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setPerfil(data);
      }
    }
    fetchPerfil();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const nomeParaExibir = perfil?.full_name || user?.email || '';

  function getInitials(fullName?: string) {
    if (!fullName) return '';
    const words = fullName.trim().split(' ').filter(Boolean);
    const ignore = ['de', 'da', 'do', 'das', 'dos', 'e'];
    if (words.length === 1) return words[0][0].toUpperCase();
    const first = words[0][0];
    let last = '';
    for (let i = words.length - 1; i >= 0; i--) {
      if (!ignore.includes(words[i].toLowerCase())) {
        last = words[i][0];
        break;
      }
    }
    return (first + last).toUpperCase();
  }

  const getDisplayName = () => {
    if (perfil?.first_name && perfil?.last_name) {
      return `${perfil.first_name} ${perfil.last_name}`;
    }
    return user?.email || 'Usuário';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full flex items-center justify-center text-center"
            aria-label="Abrir menu do usuário"
          >
            <span className="font-bold text-lg text-center">
              {getInitials(nomeParaExibir)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 text-center">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-semibold leading-none">
                {nomeParaExibir}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/perfil')}>
            <User2 className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
