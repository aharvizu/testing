import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { getSalesUsers } from '@/services/users';
import { PageHeader } from '@/components/layout/page-header';
import { LeadForm } from '../lead-form';
import { t } from '@/lib/constants';

export default async function NewLeadPage() {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'leads', 'create')) redirect('/leads');

  const [locations, salesUsers] = await Promise.all([
    isSuperAdmin(session.user.role)
      ? getAllLocations()
      : getUserLocations(session.user.locationIds),
    getSalesUsers(session.user.locationIds),
  ]);

  return (
    <div>
      <PageHeader title={`${t.create} Lead`} backHref="/leads" />
      <LeadForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        salesUsers={salesUsers}
      />
    </div>
  );
}
