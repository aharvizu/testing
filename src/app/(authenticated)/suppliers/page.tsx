import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getSuppliers } from '@/services/suppliers';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/constants';
import { SuppliersTable } from './suppliers-table';

interface Props {
  searchParams: { page?: string; search?: string };
}

export default async function SuppliersPage({ searchParams }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'suppliers', 'view')) return <p className="p-8">No tienes acceso.</p>;

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const result = await getSuppliers({ page, pageSize: 20, search: searchParams.search });

  return (
    <div>
      <PageHeader
        title={t.suppliers}
        description={`${result.total} proveedores`}
        actions={
          hasPermission(session.user.role, 'suppliers', 'create') ? (
            <Button asChild>
              <Link href="/suppliers/new"><Plus className="mr-2 h-4 w-4" />{t.create}</Link>
            </Button>
          ) : undefined
        }
      />
      <SuppliersTable
        suppliers={result.items}
        page={result.page}
        totalPages={result.totalPages}
        canEdit={hasPermission(session.user.role, 'suppliers', 'update')}
        canDelete={hasPermission(session.user.role, 'suppliers', 'delete')}
      />
    </div>
  );
}
