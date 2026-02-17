import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getLeadById } from '@/services/leads';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_SOURCE_LABELS,
  t,
} from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { NoteForm } from './note-form';

interface Props {
  params: { id: string };
}

export default async function LeadDetailPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'leads', 'view')) notFound();

  const lead = await getLeadById(params.id);
  if (!lead) notFound();

  const canEdit = hasPermission(session.user.role, 'leads', 'update');

  return (
    <div>
      <PageHeader
        title={lead.name}
        backHref="/leads"
        actions={
          canEdit ? (
            <Button asChild>
              <Link href={`/leads/${lead.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                {t.edit}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex gap-2">
        <StatusBadge
          label={LEAD_STATUS_LABELS[lead.status] || lead.status}
          colorClass={LEAD_STATUS_COLORS[lead.status] || ''}
        />
        <StatusBadge label={LEAD_SOURCE_LABELS[lead.source] || lead.source} colorClass="bg-gray-100 text-gray-800" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del lead</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.lead_phone}</dt>
                <dd className="text-sm">{lead.phone}</dd>
              </div>
              {lead.email && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.email}</dt>
                  <dd className="text-sm">{lead.email}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.lead_assigned}</dt>
                <dd className="text-sm">{lead.assignedTo?.name || 'Sin asignar'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.location}</dt>
                <dd className="text-sm">{lead.location.name}</dd>
              </div>
              {lead.vehicle && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.vehicle}</dt>
                  <dd className="text-sm">
                    <Link href={`/inventory/${lead.vehicle.id}`} className="text-primary hover:underline">
                      {lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model} ({lead.vehicle.stockNumber})
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas ({lead.notes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {canEdit && (
              <>
                <NoteForm leadId={lead.id} />
                <Separator className="my-4" />
              </>
            )}
            {lead.notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin notas aún.</p>
            ) : (
              <div className="space-y-3">
                {lead.notes.map((note) => (
                  <div key={note.id} className="rounded-md bg-muted p-3">
                    <p className="text-sm">{note.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
