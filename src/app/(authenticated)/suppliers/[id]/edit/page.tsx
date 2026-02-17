import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getSupplierById } from '@/services/suppliers';
import { PageHeader } from '@/components/layout/page-header';
import { SupplierForm } from '../../supplier-form';
import { t } from '@/lib/constants';

interface Props {
  params: { id: string };
}

export default async function EditSupplierPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'suppliers', 'update')) redirect('/suppliers');

  const supplier = await getSupplierById(params.id);
  if (!supplier) notFound();

  return (
    <div>
      <PageHeader title={`${t.edit} — ${supplier.name}`} backHref="/suppliers" />
      <SupplierForm defaultValues={{ ...supplier, id: supplier.id }} />
    </div>
  );
}
