import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getUsers } from '@/services/users';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/constants';
import { UsersTable } from './users-table';

interface Props {
  searchParams: { page?: string; search?: string; role?: string };
}

export default async function UsersPage({ searchParams }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'users', 'view')) return <p className="p-8">No tienes acceso.</p>;

  const page = Math.max(1, parseInt(searchParams.page || '1'));
  const result = await getUsers({
    page,
    pageSize: 20,
    search: searchParams.search,
    role: searchParams.role as any,
  });

  return (
    <div>
      <PageHeader
        title={t.users}
        description={`${result.total} usuarios`}
        actions={
          hasPermission(session.user.role, 'users', 'create') ? (
            <Button asChild>
              <Link href="/users/new"><Plus className="mr-2 h-4 w-4" />{t.create}</Link>
            </Button>
          ) : undefined
        }
      />
      <UsersTable
        users={result.items}
        page={result.page}
        totalPages={result.totalPages}
        canEdit={hasPermission(session.user.role, 'users', 'update')}
        canDelete={hasPermission(session.user.role, 'users', 'delete')}
        currentUserId={session.user.id}
      />
    </div>
  );
}
