import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { PageHeader } from '@/components/layout/page-header';
import { VehicleForm } from '../vehicle-form';
import { t } from '@/lib/constants';
import { redirect } from 'next/navigation';

export default async function NewVehiclePage() {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'inventory', 'create')) redirect('/inventory');

  const locations = isSuperAdmin(session.user.role)
    ? await getAllLocations()
    : await getUserLocations(session.user.locationIds);

  return (
    <div>
      <PageHeader title={`${t.create} ${t.vehicle}`} backHref="/inventory" />
      <VehicleForm locations={locations.map((l) => ({ id: l.id, name: l.name }))} />
    </div>
  );
}
