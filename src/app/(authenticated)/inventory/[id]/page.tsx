import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getVehicleById } from '@/services/inventory';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS, t } from '@/lib/constants';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export default async function VehicleDetailPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'inventory', 'view')) notFound();

  const vehicle = await getVehicleById(params.id);
  if (!vehicle) notFound();

  const canEdit = hasPermission(session.user.role, 'inventory', 'update');

  const fields = [
    { label: t.vin, value: vehicle.vin },
    { label: t.stock_number, value: vehicle.stockNumber },
    { label: t.make, value: vehicle.make },
    { label: t.model, value: vehicle.model },
    { label: t.year, value: vehicle.year },
    { label: t.trim, value: vehicle.trim || '—' },
    { label: t.color, value: vehicle.color || '—' },
    { label: t.mileage, value: `${formatNumber(vehicle.mileage)} km` },
    { label: t.price_list, value: formatCurrency(vehicle.priceList) },
    { label: t.price_sale, value: vehicle.priceSale ? formatCurrency(vehicle.priceSale) : '—' },
    { label: t.location, value: vehicle.location.name },
    { label: 'Creado', value: formatDate(vehicle.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        backHref="/inventory"
        actions={
          canEdit ? (
            <Button asChild>
              <Link href={`/inventory/${vehicle.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t.edit}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <StatusBadge
          label={VEHICLE_STATUS_LABELS[vehicle.status] || vehicle.status}
          colorClass={VEHICLE_STATUS_COLORS[vehicle.status] || ''}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalles del vehículo</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-sm font-medium text-muted-foreground">{f.label}</dt>
                <dd className="mt-1 text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
          {vehicle.notes && (
            <div className="mt-6">
              <dt className="text-sm font-medium text-muted-foreground">Notas</dt>
              <dd className="mt-1 text-sm whitespace-pre-wrap">{vehicle.notes}</dd>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
