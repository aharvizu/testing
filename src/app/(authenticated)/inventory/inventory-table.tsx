'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil, Eye } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/forms/delete-dialog';
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS, t } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { deleteVehicleAction } from '../actions';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  stockNumber: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  mileage: number;
  priceList: number;
  priceSale: number | null;
  status: string;
  location: { id: string; name: string };
}

interface InventoryTableProps {
  vehicles: Vehicle[];
  page: number;
  totalPages: number;
  canEdit: boolean;
  canDelete: boolean;
}

export function InventoryTable({ vehicles, page, totalPages, canEdit, canDelete }: InventoryTableProps) {
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
      await deleteVehicleAction(id);
      toast.success('Vehículo eliminado');
      router.refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Vehicle, unknown>[] = [
    {
      accessorKey: 'stockNumber',
      header: t.stock_number,
      cell: ({ row }) => (
        <Link href={`/inventory/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.stockNumber}
        </Link>
      ),
    },
    {
      id: 'vehicle',
      header: t.vehicle,
      cell: ({ row }) => `${row.original.year} ${row.original.make} ${row.original.model}`,
      enableSorting: false,
    },
    { accessorKey: 'color', header: t.color },
    {
      accessorKey: 'mileage',
      header: t.mileage,
      cell: ({ row }) => `${formatNumber(row.original.mileage)} km`,
    },
    {
      accessorKey: 'priceList',
      header: t.price_list,
      cell: ({ row }) => formatCurrency(row.original.priceList),
    },
    {
      accessorKey: 'status',
      header: t.status,
      cell: ({ row }) => (
        <StatusBadge
          label={VEHICLE_STATUS_LABELS[row.original.status] || row.original.status}
          colorClass={VEHICLE_STATUS_COLORS[row.original.status] || ''}
        />
      ),
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
            <Link href={`/inventory/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canEdit && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/inventory/${row.original.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
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
      data={vehicles}
      page={page}
      pageCount={totalPages}
      onPageChange={handlePageChange}
      emptyMessage="No hay vehículos registrados"
    />
  );
}
