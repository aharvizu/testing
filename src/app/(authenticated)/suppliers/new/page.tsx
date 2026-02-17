import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/layout/page-header';
import { SupplierForm } from '../supplier-form';
import { t } from '@/lib/constants';

export default async function NewSupplierPage() {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'suppliers', 'create')) redirect('/suppliers');

  return (
    <div>
      <PageHeader title={`${t.create} Proveedor`} backHref="/suppliers" />
      <SupplierForm />
    </div>
  );
}
