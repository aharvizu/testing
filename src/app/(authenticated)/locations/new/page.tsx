import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/layout/page-header';
import { LocationForm } from '../location-form';
import { t } from '@/lib/constants';

export default async function NewLocationPage() {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'locations', 'create')) redirect('/locations');

  return (
    <div>
      <PageHeader title={`${t.create} Ubicación`} backHref="/locations" />
      <LocationForm />
    </div>
  );
}
