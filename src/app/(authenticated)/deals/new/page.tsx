import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { getSalesUsers } from '@/services/users';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/layout/page-header';
import { DealForm } from '../deal-form';
import { t } from '@/lib/constants';

export default async function NewDealPage() {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'deals', 'create')) redirect('/deals');

  const [locations, salesUsers, leads, vehicles] = await Promise.all([
    isSuperAdmin(session.user.role)
      ? getAllLocations()
      : getUserLocations(session.user.locationIds),
    getSalesUsers(session.user.locationIds),
    prisma.lead.findMany({
      where: { deletedAt: null, status: { in: ['QUALIFIED', 'CONTACTED', 'NEW'] } },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.vehicle.findMany({
      where: { deletedAt: null, status: { in: ['AVAILABLE', 'RESERVED'] } },
      select: { id: true, make: true, model: true, year: true, stockNumber: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  return (
    <div>
      <PageHeader title={`${t.create} ${t.deal}`} backHref="/deals" />
      <DealForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        salesUsers={salesUsers}
        leads={leads}
        vehicles={vehicles.map((v) => ({
          id: v.id,
          label: `${v.stockNumber} — ${v.year} ${v.make} ${v.model}`,
        }))}
      />
    </div>
  );
}
