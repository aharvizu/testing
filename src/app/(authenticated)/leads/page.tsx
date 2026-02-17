import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getLeads } from '@/services/leads';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/constants';
import { LeadsTable } from './leads-table';
import { LeadsFilters } from './leads-filters';

interface Props {
  searchParams: { page?: string; search?: string; status?: string; source?: string };
}

export default async function LeadsPage({ searchParams }: Props) {
  const session = await requireSession();
  const { role, locationIds } = session.user;
  if (!hasPermission(role, 'leads', 'view')) return <p className="p-8">No tienes acceso.</p>;

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const result = await getLeads({
    page,
    pageSize: 20,
    search: searchParams.search,
    status: searchParams.status as any,
    source: searchParams.source as any,
    role,
    locationIds,
  });

  return (
    <div>
      <PageHeader
        title={t.leads}
        description={`${result.total} leads en total`}
        actions={
          hasPermission(role, 'leads', 'create') ? (
            <Button asChild>
              <Link href="/leads/new">
                <Plus className="mr-2 h-4 w-4" />
                {t.create} Lead
              </Link>
            </Button>
          ) : undefined
        }
      />
      <LeadsFilters />
      <LeadsTable
        leads={result.items}
        page={result.page}
        totalPages={result.totalPages}
        canEdit={hasPermission(role, 'leads', 'update')}
        canDelete={hasPermission(role, 'leads', 'delete')}
      />
    </div>
  );
}
