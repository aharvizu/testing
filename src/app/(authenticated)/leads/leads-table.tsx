'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil, Eye } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/forms/delete-dialog';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LEAD_SOURCE_LABELS, CUSTOMER_TYPE_LABELS, CUSTOMER_TYPE_COLORS, t } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { deleteLeadAction } from '../actions';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  customerType: string;
  createdAt: Date | string;
  location: { id: string; name: string };
  assignedTo: { id: string; name: string | null } | null;
  vehicle: { id: string; make: string; model: string; year: number; stockNumber: string } | null;
  _count?: { notes: number };
}

interface LeadsTableProps {
  leads: Lead[];
  page: number;
  totalPages: number;
  canEdit: boolean;
  canDelete: boolean;
}

export function LeadsTable({ leads, page, totalPages, canEdit, canDelete }: LeadsTableProps) {
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
      await deleteLeadAction(id);
      toast.success('Lead eliminado');
      router.refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Lead, unknown>[] = [
    {
      accessorKey: 'name',
      header: t.lead_name,
      cell: ({ row }) => (
        <Link href={`/leads/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: 'phone', header: t.lead_phone },
    {
      accessorKey: 'source',
      header: t.lead_source,
      cell: ({ row }) => LEAD_SOURCE_LABELS[row.original.source] || row.original.source,
    },
    {
      accessorKey: 'status',
      header: t.status,
      cell: ({ row }) => (
        <StatusBadge
          label={LEAD_STATUS_LABELS[row.original.status] || row.original.status}
          colorClass={LEAD_STATUS_COLORS[row.original.status] || ''}
        />
      ),
    },
    {
      accessorKey: 'customerType',
      header: t.customer_type,
      cell: ({ row }) => (
        <StatusBadge
          label={CUSTOMER_TYPE_LABELS[row.original.customerType] || row.original.customerType}
          colorClass={CUSTOMER_TYPE_COLORS[row.original.customerType] || ''}
        />
      ),
    },
    {
      id: 'assignedTo',
      header: t.lead_assigned,
      cell: ({ row }) => row.original.assignedTo?.name || '—',
      enableSorting: false,
    },
    {
      id: 'location',
      header: t.location,
      cell: ({ row }) => row.original.location.name,
      enableSorting: false,
    },
    {
      id: 'actions',
      header: t.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/leads/${row.original.id}`}><Eye className="h-4 w-4" /></Link>
          </Button>
          {canEdit && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/leads/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
          )}
          {canDelete && <DeleteDialog onConfirm={() => handleDelete(row.original.id)} />}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={leads}
      page={page}
      pageCount={totalPages}
      onPageChange={handlePageChange}
      emptyMessage="No hay leads registrados"
    />
  );
}
