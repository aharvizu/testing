import { requireSession } from '@/lib/auth';
import {
  getDashboardKPIs,
  getSalesByLocation,
  getExpensesByCategory,
  getLeadsByStatus,
  getVehiclesByStatus,
} from '@/services/dashboard';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t, EXPENSE_CATEGORY_LABELS, LEAD_STATUS_LABELS, VEHICLE_STATUS_LABELS } from '@/lib/constants';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { DashboardCharts } from './charts';

export default async function DashboardPage() {
  const session = await requireSession();
  const { role, locationIds } = session.user;

  const [kpis, salesByLoc, expensesByCat, leadsByStatus, vehiclesByStatus] = await Promise.all([
    getDashboardKPIs(role, locationIds),
    getSalesByLocation(role, locationIds),
    getExpensesByCategory(role, locationIds),
    getLeadsByStatus(role, locationIds),
    getVehiclesByStatus(role, locationIds),
  ]);

  const kpiCards = [
    { label: t.kpi_available_vehicles, value: formatNumber(kpis.availableVehicles) },
    { label: t.kpi_new_leads_week, value: formatNumber(kpis.newLeadsWeek) },
    { label: t.kpi_conversion_rate, value: `${kpis.conversionRate}%` },
    { label: t.kpi_total_sales, value: formatCurrency(kpis.totalSalesAmount) },
    { label: t.kpi_total_expenses, value: formatCurrency(kpis.totalExpenses) },
    { label: t.kpi_avg_days_to_sell, value: `${kpis.avgDaysToSell} días` },
  ];

  return (
    <div>
      <PageHeader title={t.dashboard} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts
        salesByLocation={salesByLoc}
        expensesByCategory={expensesByCat.map((e) => ({
          ...e,
          label: EXPENSE_CATEGORY_LABELS[e.category] || e.category,
        }))}
        leadsByStatus={leadsByStatus.map((l) => ({
          ...l,
          label: LEAD_STATUS_LABELS[l.status] || l.status,
        }))}
        vehiclesByStatus={vehiclesByStatus.map((v) => ({
          ...v,
          label: VEHICLE_STATUS_LABELS[v.status] || v.status,
        }))}
      />
    </div>
  );
}
