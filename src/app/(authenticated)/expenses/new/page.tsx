import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission, isSuperAdmin } from '@/lib/permissions';
import { getAllLocations, getUserLocations } from '@/services/locations';
import { getAllSuppliers } from '@/services/suppliers';
import { PageHeader } from '@/components/layout/page-header';
import { ExpenseForm } from '../expense-form';
import { t } from '@/lib/constants';

export default async function NewExpensePage() {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'expenses', 'create')) redirect('/expenses');

  const [locations, suppliers] = await Promise.all([
    isSuperAdmin(session.user.role) ? getAllLocations() : getUserLocations(session.user.locationIds),
    getAllSuppliers(),
  ]);

  return (
    <div>
      <PageHeader title={`${t.create} Gasto`} backHref="/expenses" />
      <ExpenseForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
