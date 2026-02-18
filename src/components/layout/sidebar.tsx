'use client';

import { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  Truck,
  ShoppingBag,
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
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: t.nav_dashboard, href: '/dashboard', icon: LayoutDashboard },
  { label: t.nav_inventory, href: '/inventory', icon: Car, resource: 'inventory' },
  { label: t.nav_leads, href: '/leads', icon: ClipboardList, resource: 'leads' },
  {
    label: t.nav_deals,
    href: '/deals',
    icon: Handshake,
    resource: 'deals',
    children: [
      { label: t.nav_deals_flotillas, href: '/deals/flotillas', icon: Truck, resource: 'deals' },
      { label: t.nav_deals_menudeo, href: '/deals/menudeo', icon: ShoppingBag, resource: 'deals' },
    ],
  },
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Auto-expand parent if a child route is active
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((child) => pathname.startsWith(child.href))) {
        initial.add(item.href);
      }
    });
    return initial;
  });

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.resource || hasPermission(role, item.resource, 'view'),
  );

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

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
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.has(item.href);
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isChildActive = item.children?.some(
            (child) => pathname === child.href || pathname.startsWith(child.href + '/'),
          );

          return (
            <div key={item.href}>
              <div className="flex items-center">
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive && !isChildActive
                      ? 'bg-primary text-primary-foreground'
                      : isChildActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.href)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                  {item.children!
                    .filter((child) => !child.resource || hasPermission(role, child.resource, 'view'))
                    .map((child) => {
                      const isChildItemActive =
                        pathname === child.href || pathname.startsWith(child.href + '/');
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            isChildItemActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          {child.label}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
