'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import type { Role } from '@prisma/client';

interface AppShellProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: Role;
    locationIds: string[];
  };
  locations: { id: string; name: string }[];
}

export function AppShell({ children, user, locations }: AppShellProps) {
  const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLocationChange = useCallback((locationId: string) => {
    setCurrentLocationId(locationId === 'all' ? null : locationId);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar role={user.role} />
      </div>

      {/* Sidebar - desktop */}
      <Sidebar role={user.role} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          userName={user.name}
          userEmail={user.email}
          userRole={user.role}
          locations={locations}
          currentLocationId={currentLocationId}
          onLocationChange={handleLocationChange}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
