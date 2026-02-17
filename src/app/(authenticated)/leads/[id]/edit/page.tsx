import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getLeadById } from '@/services/leads';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { getSalesUsers } from '@/services/users';
import { PageHeader } from '@/components/layout/page-header';
import { LeadForm } from '../../lead-form';
import { t } from '@/lib/constants';

interface Props {
  params: { id: string };
}

export default async function EditLeadPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'leads', 'update')) redirect('/leads');

  const lead = await getLeadById(params.id);
  if (!lead) notFound();

  const [locations, salesUsers] = await Promise.all([
    isSuperAdmin(session.user.role) ? getAllLocations() : getUserLocations(session.user.locationIds),
    getSalesUsers(session.user.locationIds),
  ]);

  return (
    <div>
      <PageHeader title={`${t.edit} Lead — ${lead.name}`} backHref={`/leads/${params.id}`} />
      <LeadForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        salesUsers={salesUsers}
        defaultValues={{
          id: lead.id,
          name: lead.name,
          email: lead.email || '',
          phone: lead.phone,
          source: lead.source,
          status: lead.status,
          assignedToId: lead.assignedToId,
          vehicleId: lead.vehicleId,
          locationId: lead.locationId,
        }}
      />
    </div>
  );
}
