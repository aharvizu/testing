'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  Users,
  UserCircle,
  Handshake,
  MapPin,
  Package,
  Receipt,
  BarChart3,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/constants';
import { hasPermission, type Resource } from '@/lib/permissions';
import type { Role } from '@prisma/client';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  resource?: Resource;
}

const NAV_ITEMS: NavItem[] = [
  { label: t.nav_dashboard, href: '/dashboard', icon: LayoutDashboard },
  { label: t.nav_inventory, href: '/inventory', icon: Car, resource: 'inventory' },
  { label: t.nav_leads, href: '/leads', icon: ClipboardList, resource: 'leads' },
  { label: t.nav_deals, href: '/deals', icon: Handshake, resource: 'deals' },
  { label: t.nav_suppliers, href: '/suppliers', icon: Package, resource: 'suppliers' },
  { label: t.nav_expenses, href: '/expenses', icon: Receipt, resource: 'expenses' },
  { label: t.nav_locations, href: '/locations', icon: MapPin, resource: 'locations' },
  { label: t.nav_users, href: '/users', icon: UserCircle, resource: 'users' },
  { label: t.nav_reports, href: '/reports', icon: BarChart3, resource: 'reports' },
];

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.resource || hasPermission(role, item.resource, 'view'),
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <Car className="h-6 w-6" />
          <span className="text-lg">{t.app_name}</span>
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
