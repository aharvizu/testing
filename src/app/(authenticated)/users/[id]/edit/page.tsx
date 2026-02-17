import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getUserById } from '@/services/users';
import { getAllLocations } from '@/services/locations';
import { PageHeader } from '@/components/layout/page-header';
import { UserForm } from '../../user-form';
import { t } from '@/lib/constants';

interface Props {
  params: { id: string };
}

export default async function EditUserPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'users', 'update')) redirect('/users');

  const user = await getUserById(params.id);
  if (!user) notFound();

  const locations = await getAllLocations();

  return (
    <div>
      <PageHeader title={`${t.edit} — ${user.name || user.email}`} backHref="/users" />
      <UserForm
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        defaultValues={{
          id: user.id,
          name: user.name || '',
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          locationIds: user.locations.map((l) => l.location.id),
          password: '',
        }}
      />
    </div>
  );
}
