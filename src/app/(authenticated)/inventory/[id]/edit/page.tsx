import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getVehicleById } from '@/services/inventory';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { PageHeader } from '@/components/layout/page-header';
import { VehicleForm } from '../../vehicle-form';
import { t } from '@/lib/constants';

interface Props {
  params: { id: string };
}

export default async function EditVehiclePage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'inventory', 'update')) redirect('/inventory');

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) notFound();

  const locations = isSuperAdmin(session.user.role)
    ? await getAllLocations()
    : await getUserLocations(session.user.locationIds);

  return (
    <div>
      <PageHeader title={`${t.edit} — ${vehicle.stockNumber}`} backHref={`/inventory/${params.id}`} />
      <VehicleForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        defaultValues={{
          id: vehicle.id,
          vin: vehicle.vin,
          stockNumber: vehicle.stockNumber,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          trim: vehicle.trim || '',
          color: vehicle.color || '',
          mileage: vehicle.mileage,
          priceList: vehicle.priceList,
          priceSale: vehicle.priceSale,
          status: vehicle.status,
          locationId: vehicle.locationId,
          notes: vehicle.notes || '',
        }}
      />
    </div>
  );
}
