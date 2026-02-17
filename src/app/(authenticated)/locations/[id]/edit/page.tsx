import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getLocationById } from '@/services/locations';
import { PageHeader } from '@/components/layout/page-header';
import { LocationForm } from '../../location-form';
import { t } from '@/lib/constants';

interface Props {
  params: { id: string };
}

export default async function EditLocationPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'locations', 'update')) redirect('/locations');

  const location = await getLocationById(params.id);
  if (!location) notFound();

  return (
    <div>
      <PageHeader title={`${t.edit} — ${location.name}`} backHref="/locations" />
      <LocationForm defaultValues={{ ...location, id: location.id }} />
    </div>
  );
}
