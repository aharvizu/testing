'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/forms/delete-dialog';
import { ROLE_LABELS, t } from '@/lib/constants';
import { deleteUserAction } from '../actions';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  locations: { location: { id: string; name: string } }[];
}

interface Props {
  users: User[];
  page: number;
  totalPages: number;
  canEdit: boolean;
  canDelete: boolean;
  currentUserId: string;
}

export function UsersTable({ users, page, totalPages, canEdit, canDelete, currentUserId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUserAction(id);
      toast.success('Usuario eliminado');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    }
  };

  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: 'name',
      header: t.name,
      cell: ({ row }) => (
        <Link href={`/users/${row.original.id}/edit`} className="font-medium text-primary hover:underline">
          {row.original.name || row.original.email}
        </Link>
      ),
    },
    { accessorKey: 'email', header: t.email },
    {
      accessorKey: 'role',
      header: t.role,
      cell: ({ row }) => (
        <Badge variant="outline">{ROLE_LABELS[row.original.role] || row.original.role}</Badge>
      ),
    },
    {
      id: 'locations',
      header: 'Ubicaciones',
      cell: ({ row }) =>
        row.original.locations
          .slice(0, 3)
          .map((l) => l.location.name)
          .join(', ') + (row.original.locations.length > 3 ? ` +${row.original.locations.length - 3}` : ''),
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: t.active,
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: t.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {canEdit && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/users/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
          )}
          {canDelete && row.original.id !== currentUserId && (
            <DeleteDialog onConfirm={() => handleDelete(row.original.id)} />
          )}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={users} page={page} pageCount={totalPages} onPageChange={handlePageChange} emptyMessage="No hay usuarios" />;
}
