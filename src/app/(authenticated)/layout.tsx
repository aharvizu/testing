import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUserLocations, getAllLocations } from '@/services/locations';
import { AppShell } from '@/components/layout/app-shell';
import { isSuperAdmin } from '@/lib/permissions';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  const { user } = session;
  const locations = isSuperAdmin(user.role)
    ? await getAllLocations()
    : await getUserLocations(user.locationIds);

  return (
    <AppShell
      user={{
        name: user.name || user.email || '',
        email: user.email || '',
        role: user.role,
        locationIds: user.locationIds,
      }}
      locations={locations.map((l) => ({ id: l.id, name: l.name }))}
    >
      {children}
    </AppShell>
  );
}
