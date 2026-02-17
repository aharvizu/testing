'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/forms/delete-dialog';
import { EXPENSE_CATEGORY_LABELS, t } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteExpenseAction } from '../actions';
import { toast } from 'sonner';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date | string;
  supplier: { id: string; name: string } | null;
  location: { id: string; name: string };
}

interface Props {
  expenses: Expense[];
  page: number;
  totalPages: number;
  canEdit: boolean;
  canDelete: boolean;
}

export function ExpensesTable({ expenses, page, totalPages, canEdit, canDelete }: Props) {
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
      await deleteExpenseAction(id);
      toast.success('Gasto eliminado');
      router.refresh();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const columns: ColumnDef<Expense, unknown>[] = [
    { accessorKey: 'description', header: t.description },
    {
      accessorKey: 'amount',
      header: t.amount,
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'category',
      header: t.category,
      cell: ({ row }) => EXPENSE_CATEGORY_LABELS[row.original.category] || row.original.category,
    },
    {
      accessorKey: 'date',
      header: t.date,
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: 'supplier',
      header: t.supplier,
      cell: ({ row }) => row.original.supplier?.name || '—',
    },
    {
      id: 'location',
      header: t.location,
      cell: ({ row }) => row.original.location.name,
    },
    {
      id: 'actions',
      header: t.actions,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
          {canEdit && (
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/expenses/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link>
            </Button>
          )}
          {canDelete && <DeleteDialog onConfirm={() => handleDelete(row.original.id)} />}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={expenses} page={page} pageCount={totalPages} onPageChange={handlePageChange} emptyMessage="No hay gastos registrados" />;
}
