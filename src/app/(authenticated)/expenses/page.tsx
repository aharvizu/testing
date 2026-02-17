import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getExpenses } from '@/services/expenses';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/constants';
import { ExpensesTable } from './expenses-table';

interface Props {
  searchParams: { page?: string; search?: string; category?: string };
}

export default async function ExpensesPage({ searchParams }: Props) {
  const session = await requireSession();
  const { role, locationIds } = session.user;
  if (!hasPermission(role, 'expenses', 'view')) return <p className="p-8">No tienes acceso.</p>;

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const result = await getExpenses({
    page,
    pageSize: 20,
    search: searchParams.search,
    category: searchParams.category as any,
    role,
    locationIds,
  });

  return (
    <div>
      <PageHeader
        title={t.expenses}
        description={`${result.total} gastos registrados`}
        actions={
          hasPermission(role, 'expenses', 'create') ? (
            <Button asChild>
              <Link href="/expenses/new"><Plus className="mr-2 h-4 w-4" />{t.create}</Link>
            </Button>
          ) : undefined
        }
      />
      <ExpensesTable
        expenses={result.items}
        page={result.page}
        totalPages={result.totalPages}
        canEdit={hasPermission(role, 'expenses', 'update')}
        canDelete={hasPermission(role, 'expenses', 'delete')}
      />
    </div>
  );
}
