import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { getDealById } from '@/services/deals';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, PAYMENT_TYPE_LABELS, t } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export default async function DealDetailPage({ params }: Props) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'deals', 'view')) notFound();

  const deal = await getDealById(params.id);
  if (!deal) notFound();

  return (
    <div>
      <PageHeader
        title={`Venta — ${deal.lead.name}`}
        backHref="/deals"
        actions={
          hasPermission(session.user.role, 'deals', 'update') ? (
            <Button asChild>
              <Link href={`/deals/${deal.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />{t.edit}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <StatusBadge
          label={DEAL_STATUS_LABELS[deal.status] || deal.status}
          colorClass={DEAL_STATUS_COLORS[deal.status] || ''}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Detalles de la venta</CardTitle></CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Cliente</dt>
                <dd className="text-sm">
                  <Link href={`/leads/${deal.lead.id}`} className="text-primary hover:underline">{deal.lead.name}</Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.vehicle}</dt>
                <dd className="text-sm">
                  <Link href={`/inventory/${deal.vehicle.id}`} className="text-primary hover:underline">
                    {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model} ({deal.vehicle.stockNumber})
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.sale_price}</dt>
                <dd className="text-sm font-semibold">{formatCurrency(deal.salePrice)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.payment_type}</dt>
                <dd className="text-sm">{PAYMENT_TYPE_LABELS[deal.paymentType]}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Vendedor</dt>
                <dd className="text-sm">{deal.salesUser.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">{t.location}</dt>
                <dd className="text-sm">{deal.location.name}</dd>
              </div>
              {deal.closingDate && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">{t.closing_date}</dt>
                  <dd className="text-sm">{formatDate(deal.closingDate)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t.documents}</CardTitle></CardHeader>
          <CardContent>
            {deal.documents ? (
              <ul className="space-y-2">
                {(typeof deal.documents === 'string' ? JSON.parse(deal.documents) : deal.documents).map(
                  (doc: { title: string; completed: boolean }, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className={doc.completed ? 'text-green-600' : 'text-muted-foreground'}>
                        {doc.completed ? '[x]' : '[ ]'}
                      </span>
                      {doc.title}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Sin documentos registrados.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
