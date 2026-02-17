import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getVehicles, getDistinctMakes } from '@/services/inventory';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/constants';
import { InventoryTable } from './inventory-table';
import { InventoryFilters } from './inventory-filters';

interface Props {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    make?: string;
    locationId?: string;
  };
}

export default async function InventoryPage({ searchParams }: Props) {
  const session = await requireSession();
  const { role, locationIds } = session.user;

  if (!hasPermission(role, 'inventory', 'view')) {
    return <p className="p-8">No tienes acceso a este módulo.</p>;
  }

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const result = await getVehicles({
    page,
    pageSize: 20,
    search: searchParams.search,
    status: searchParams.status as any,
    make: searchParams.make,
    locationId: searchParams.locationId,
    role,
    locationIds,
  });

  const makes = await getDistinctMakes(role, locationIds);
  const canCreate = hasPermission(role, 'inventory', 'create');

  return (
    <div>
      <PageHeader
        title={t.vehicles}
        description={`${result.total} vehículos en total`}
        actions={
          canCreate ? (
            <Button asChild>
              <Link href="/inventory/new">
                <Plus className="mr-2 h-4 w-4" />
                {t.create} {t.vehicle}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <InventoryFilters makes={makes} />
      <InventoryTable
        vehicles={result.items}
        page={result.page}
        totalPages={result.totalPages}
        canEdit={hasPermission(role, 'inventory', 'update')}
        canDelete={hasPermission(role, 'inventory', 'delete')}
      />
    </div>
  );
}
