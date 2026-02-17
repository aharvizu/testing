'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/forms/delete-dialog';
import { t } from '@/lib/constants';
import { deleteLocationAction } from '../actions';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  isActive: boolean;
}

interface Props {
  locations: Location[];
  page: number;
  totalPages: number;
  canEdit: boolean;
  canDelete: boolean;
}

export function LocationsTable({ locations, page, totalPages, canEdit, canDelete }: Props) {
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
      await deleteLocationAction(id);
      toast.success('Ubicación eliminada');
      router.refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Location, unknown>[] = [
    {
      accessorKey: 'name',
      header: t.name,
      cell: ({ row }) => (
        <Link href={`/locations/${row.original.id}/edit`} className="font-medium text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: 'city', header: 'Ciudad' },
    { accessorKey: 'state', header: 'Estado' },
    { accessorKey: 'phone', header: 'Teléfono' },
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
              <Link href={`/locations/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
          )}
          {canDelete && <DeleteDialog onConfirm={() => handleDelete(row.original.id)} />}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={locations} page={page} pageCount={totalPages} onPageChange={handlePageChange} emptyMessage="No hay ubicaciones" />;
}
