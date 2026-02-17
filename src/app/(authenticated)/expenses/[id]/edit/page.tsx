import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getExpenseById } from '@/services/expenses';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { getAllSuppliers } from '@/services/suppliers';
import { PageHeader } from '@/components/layout/page-header';
import { ExpenseForm } from '../../expense-form';
import { t } from '@/lib/constants';

interface Props {
  params: { id: string };
}

export default async function EditExpensePage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'expenses', 'update')) redirect('/expenses');

  const expense = await getExpenseById(params.id);
  if (!expense) notFound();

  const [locations, suppliers] = await Promise.all([
    isSuperAdmin(session.user.role) ? getAllLocations() : getUserLocations(session.user.locationIds),
    getAllSuppliers(),
  ]);

  return (
    <div>
      <PageHeader title={`${t.edit} Gasto`} backHref="/expenses" />
      <ExpenseForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        defaultValues={{
          id: expense.id,
          supplierId: expense.supplierId,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          locationId: expense.locationId,
          notes: expense.notes || '',
        }}
      />
    </div>
  );
}
