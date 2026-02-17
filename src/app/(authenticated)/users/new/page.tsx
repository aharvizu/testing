import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getAllLocations } from '@/services/locations';
import { PageHeader } from '@/components/layout/page-header';
import { UserForm } from '../user-form';
import { t } from '@/lib/constants';

export default async function NewUserPage() {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'users', 'create')) redirect('/users');

  const locations = await getAllLocations();

  return (
    <div>
      <PageHeader title={`${t.create} Usuario`} backHref="/users" />
      <UserForm locations={locations.map((l) => ({ id: l.id, name: l.name }))} />
    </div>
  );
}
