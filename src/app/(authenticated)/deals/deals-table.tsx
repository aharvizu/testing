'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil, Eye } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/forms/delete-dialog';
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, PAYMENT_TYPE_LABELS, t } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteDealAction } from '../actions';
import { toast } from 'sonner';

interface Deal {
  id: string;
  salePrice: number;
  paymentType: string;
  status: string;
  closingDate: Date | string | null;
  createdAt: Date | string;
  lead: { id: string; name: string; phone: string };
  vehicle: { id: string; make: string; model: string; year: number; stockNumber: string };
  location: { id: string; name: string };
  salesUser: { id: string; name: string | null };
}

interface DealsTableProps {
  deals: Deal[];
  page: number;
  totalPages: number;
  canEdit: boolean;
  canDelete: boolean;
}

export function DealsTable({ deals, page, totalPages, canEdit, canDelete }: DealsTableProps) {
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
      await deleteDealAction(id);
      toast.success('Venta eliminada');
      router.refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Deal, unknown>[] = [
    {
      id: 'customer',
      header: 'Cliente',
      cell: ({ row }) => (
        <Link href={`/deals/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.lead.name}
        </Link>
      ),
    },
    {
      id: 'vehicle',
      header: t.vehicle,
      cell: ({ row }) =>
        `${row.original.vehicle.year} ${row.original.vehicle.make} ${row.original.vehicle.model}`,
    },
    {
      accessorKey: 'salePrice',
      header: t.sale_price,
      cell: ({ row }) => formatCurrency(row.original.salePrice),
    },
    {
      accessorKey: 'paymentType',
      header: t.payment_type,
      cell: ({ row }) => PAYMENT_TYPE_LABELS[row.original.paymentType] || row.original.paymentType,
    },
    {
      accessorKey: 'status',
      header: t.status,
      cell: ({ row }) => (
        <StatusBadge
          label={DEAL_STATUS_LABELS[row.original.status] || row.original.status}
          colorClass={DEAL_STATUS_COLORS[row.original.status] || ''}
        />
      ),
    },
    {
      id: 'salesUser',
      header: 'Vendedor',
      cell: ({ row }) => row.original.salesUser.name || '—',
    },
    {
      id: 'actions',
      header: t.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/deals/${row.original.id}`}><Eye className="h-4 w-4" /></Link>
          </Button>
          {canEdit && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/deals/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
          )}
          {canDelete && <DeleteDialog onConfirm={() => handleDelete(row.original.id)} />}
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={deals} page={page} pageCount={totalPages} onPageChange={handlePageChange} emptyMessage="No hay ventas registradas" />
  );
}
