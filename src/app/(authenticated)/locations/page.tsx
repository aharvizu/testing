import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getLocations } from '@/services/locations';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/constants';
import { LocationsTable } from './locations-table';

interface Props {
  searchParams: { page?: string; search?: string };
}

export default async function LocationsPage({ searchParams }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'locations', 'view')) return <p className="p-8">No tienes acceso.</p>;

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const result = await getLocations({ page, pageSize: 50, search: searchParams.search });

  return (
    <div>
      <PageHeader
        title={t.nav_locations}
        description={`${result.total} ubicaciones`}
        actions={
          hasPermission(session.user.role, 'locations', 'create') ? (
            <Button asChild>
              <Link href="/locations/new"><Plus className="mr-2 h-4 w-4" />{t.create}</Link>
            </Button>
          ) : undefined
        }
      />
      <LocationsTable
        locations={result.items}
        page={result.page}
        totalPages={result.totalPages}
        canEdit={hasPermission(session.user.role, 'locations', 'update')}
        canDelete={hasPermission(session.user.role, 'locations', 'delete')}
      />
    </div>
  );
}
