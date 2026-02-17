'use client';

import { signOut } from 'next-auth/react';
import { LogOut, Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLE_LABELS, t } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import type { Role } from '@prisma/client';

interface TopbarProps {
  userName: string;
  userEmail: string;
  userRole: Role;
  locations: { id: string; name: string }[];
  currentLocationId: string | null;
  onLocationChange: (locationId: string) => void;
  onToggleSidebar?: () => void;
}

export function Topbar({
  userName,
  userEmail,
  userRole,
  locations,
  currentLocationId,
  onLocationChange,
  onToggleSidebar,
}: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        {locations.length > 1 && (
          <Select
            value={currentLocationId || 'all'}
            onValueChange={(val) => onLocationChange(val)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Seleccionar ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.all} ubicaciones</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {getInitials(userName || userEmail)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[userRole]}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm">{userName}</p>
            <p className="text-xs font-normal text-muted-foreground">{userEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="mr-2 h-4 w-4" />
            {t.logout}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
