import { requireSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import {
  getDashboardKPIs,
  getSalesByLocation,
  getExpensesByCategory,
} from '@/services/dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EXPENSE_CATEGORY_LABELS, t } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ReportsCharts } from './reports-charts';

export default async function ReportsPage() {
  const session = await requireSession();
  const { role, locationIds } = session.user;
  if (!hasPermission(role, 'reports', 'view')) return <p className="p-8">No tienes acceso.</p>;

  const [kpis, salesByLoc, expensesByCat] = await Promise.all([
    getDashboardKPIs(role, locationIds),
    getSalesByLocation(role, locationIds),
    getExpensesByCategory(role, locationIds),
  ]);

  return (
    <div>
      <PageHeader title={t.nav_reports} description="Resumen de los últimos 30 días" />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventas totales (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.totalSalesAmount)}</p>
            <p className="text-xs text-muted-foreground">{kpis.totalSalesCount} operaciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gastos totales (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(kpis.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margen bruto (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(kpis.totalSalesAmount - kpis.totalExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      <ReportsCharts
        salesByLocation={salesByLoc}
        expensesByCategory={expensesByCat.map((e) => ({
          ...e,
          label: EXPENSE_CATEGORY_LABELS[e.category] || e.category,
        }))}
      />

      {/* Sales by Location Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Ventas por ubicación</CardTitle>
        </CardHeader>
        <CardContent>
          {salesByLoc.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos de ventas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Ubicación</th>
                    <th className="py-2 text-right font-medium">Ventas</th>
                    <th className="py-2 text-right font-medium">Monto total</th>
                    <th className="py-2 text-right font-medium">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByLoc.map((row) => (
                    <tr key={row.name} className="border-b last:border-0">
                      <td className="py-2">{row.name}</td>
                      <td className="py-2 text-right">{formatNumber(row.count)}</td>
                      <td className="py-2 text-right">{formatCurrency(row.total)}</td>
                      <td className="py-2 text-right">
                        {formatCurrency(row.count > 0 ? row.total / row.count : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
