import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getDeals } from '@/services/deals';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/constants';
import { DealsTable } from '../deals-table';

interface Props {
  searchParams: { page?: string; search?: string; status?: string };
}

export default async function FlotillasPage({ searchParams }: Props) {
  const session = await requireSession();
  const { role, locationIds } = session.user;
  if (!hasPermission(role, 'deals', 'view')) return <p className="p-8">No tienes acceso.</p>;

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const result = await getDeals({
    page,
    pageSize: 20,
    search: searchParams.search,
    status: searchParams.status as any,
    customerType: 'FLOTILLAS',
    role,
    locationIds,
  });

  return (
    <div>
      <PageHeader
        title={`${t.deals} — ${t.customer_type_flotillas}`}
        description={`${result.total} ventas de flotillas`}
        actions={
          hasPermission(role, 'deals', 'create') ? (
            <Button asChild>
              <Link href="/deals/new">
                <Plus className="mr-2 h-4 w-4" />{t.create} {t.deal}
              </Link>
            </Button>
          ) : undefined
        }
      />
      <DealsTable
        deals={result.items}
        page={result.page}
        totalPages={result.totalPages}
        canEdit={hasPermission(role, 'deals', 'update')}
        canDelete={hasPermission(role, 'deals', 'delete')}
      />
    </div>
  );
}
