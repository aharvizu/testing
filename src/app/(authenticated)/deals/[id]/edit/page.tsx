import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getDealById } from '@/services/deals';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { getSalesUsers } from '@/services/users';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/layout/page-header';
import { DealForm } from '../../deal-form';
import { t } from '@/lib/constants';

interface Props {
  params: { id: string };
}

export default async function EditDealPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'deals', 'update')) redirect('/deals');

  const deal = await getDealById(params.id);
  if (!deal) notFound();

  const [locations, salesUsers, leads, vehicles] = await Promise.all([
    isSuperAdmin(session.user.role) ? getAllLocations() : getUserLocations(session.user.locationIds),
    getSalesUsers(session.user.locationIds),
    prisma.lead.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.vehicle.findMany({
      where: { deletedAt: null },
      select: { id: true, make: true, model: true, year: true, stockNumber: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  return (
    <div>
      <PageHeader title={`${t.edit} Venta`} backHref={`/deals/${params.id}`} />
      <DealForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        salesUsers={salesUsers}
        leads={leads}
        vehicles={vehicles.map((v) => ({
          id: v.id,
          label: `${v.stockNumber} — ${v.year} ${v.make} ${v.model}`,
        }))}
        defaultValues={{
          id: deal.id,
          leadId: deal.leadId,
          vehicleId: deal.vehicleId,
          locationId: deal.locationId,
          salesUserId: deal.salesUserId,
          salePrice: deal.salePrice,
          paymentType: deal.paymentType,
          status: deal.status,
          closingDate: deal.closingDate,
          notes: deal.notes || '',
        }}
      />
    </div>
  );
}
