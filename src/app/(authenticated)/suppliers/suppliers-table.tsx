'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/forms/delete-dialog';
import { t } from '@/lib/constants';
import { deleteSupplierAction } from '../actions';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
}

interface Props {
  suppliers: Supplier[];
  page: number;
  totalPages: number;
  canEdit: boolean;
  canDelete: boolean;
}

export function SuppliersTable({ suppliers, page, totalPages, canEdit, canDelete }: Props) {
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
      await deleteSupplierAction(id);
      toast.success('Proveedor eliminado');
      router.refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Supplier, unknown>[] = [
    {
      accessorKey: 'name',
      header: t.name,
      cell: ({ row }) => (
        <Link href={`/suppliers/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: 'contact', header: 'Contacto' },
    { accessorKey: 'phone', header: 'Teléfono' },
    { accessorKey: 'email', header: t.email },
    {
      id: 'actions',
      header: t.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {canEdit && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/suppliers/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
          )}
          {canDelete && <DeleteDialog onConfirm={() => handleDelete(row.original.id)} />}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={suppliers} page={page} pageCount={totalPages} onPageChange={handlePageChange} emptyMessage="No hay proveedores" />;
}
