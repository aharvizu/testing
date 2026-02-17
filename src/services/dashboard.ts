import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import { locationFilter } from '@/lib/permissions';

export async function getDashboardKPIs(role: Role, locationIds: string[]) {
  const locFilter = locationFilter(role, locationIds);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    availableVehicles,
    newLeadsWeek,
    totalLeads30d,
    wonLeads30d,
    totalSales30d,
    totalExpenses30d,
    soldVehicles,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: { deletedAt: null, status: 'AVAILABLE', ...locFilter },
    }),
    prisma.lead.count({
      where: { deletedAt: null, createdAt: { gte: weekAgo }, ...locFilter },
    }),
    prisma.lead.count({
      where: { deletedAt: null, createdAt: { gte: monthAgo }, ...locFilter },
    }),
    prisma.lead.count({
      where: { deletedAt: null, status: 'WON', createdAt: { gte: monthAgo }, ...locFilter },
    }),
    prisma.deal.aggregate({
      where: { deletedAt: null, status: 'CLOSED_WON', createdAt: { gte: monthAgo }, ...locFilter },
      _sum: { salePrice: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { deletedAt: null, date: { gte: monthAgo }, ...locFilter },
      _sum: { amount: true },
    }),
    prisma.deal.findMany({
      where: {
        deletedAt: null,
        status: 'CLOSED_WON',
        closingDate: { not: null },
        ...locFilter,
      },
      select: { createdAt: true, closingDate: true },
      take: 100,
      orderBy: { closingDate: 'desc' },
    }),
  ]);

  const conversionRate = totalLeads30d > 0 ? (wonLeads30d / totalLeads30d) * 100 : 0;

  let avgDaysToSell = 0;
  if (soldVehicles.length > 0) {
    const totalDays = soldVehicles.reduce((sum, d) => {
      if (!d.closingDate) return sum;
      const days = (d.closingDate.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    avgDaysToSell = Math.round(totalDays / soldVehicles.length);
  }

  return {
    availableVehicles,
    newLeadsWeek,
    conversionRate: Math.round(conversionRate * 10) / 10,
    totalSalesAmount: totalSales30d._sum.salePrice || 0,
    totalSalesCount: totalSales30d._count,
    totalExpenses: totalExpenses30d._sum.amount || 0,
    avgDaysToSell,
  };
}

export async function getSalesByLocation(role: Role, locationIds: string[]) {
  const locFilter = locationFilter(role, locationIds);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const deals = await prisma.deal.findMany({
    where: {
      deletedAt: null,
      status: 'CLOSED_WON',
      createdAt: { gte: monthAgo },
      ...locFilter,
    },
    include: { location: { select: { name: true } } },
  });

  const byLocation: Record<string, { name: string; count: number; total: number }> = {};
  for (const deal of deals) {
    const key = deal.locationId;
    if (!byLocation[key]) {
      byLocation[key] = { name: deal.location.name, count: 0, total: 0 };
    }
    byLocation[key].count++;
    byLocation[key].total += deal.salePrice;
  }

  return Object.values(byLocation).sort((a, b) => b.total - a.total);
}

export async function getExpensesByCategory(role: Role, locationIds: string[]) {
  const locFilter = locationFilter(role, locationIds);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const expenses = await prisma.expense.groupBy({
    by: ['category'],
    where: { deletedAt: null, date: { gte: monthAgo }, ...locFilter },
    _sum: { amount: true },
    _count: true,
  });

  return expenses
    .map((e) => ({
      category: e.category,
      total: e._sum.amount || 0,
      count: e._count,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getLeadsByStatus(role: Role, locationIds: string[]) {
  const locFilter = locationFilter(role, locationIds);

  const leads = await prisma.lead.groupBy({
    by: ['status'],
    where: { deletedAt: null, ...locFilter },
    _count: true,
  });

  return leads.map((l) => ({
    status: l.status,
    count: l._count,
  }));
}

export async function getVehiclesByStatus(role: Role, locationIds: string[]) {
  const locFilter = locationFilter(role, locationIds);

  const vehicles = await prisma.vehicle.groupBy({
    by: ['status'],
    where: { deletedAt: null, ...locFilter },
    _count: true,
  });

  return vehicles.map((v) => ({
    status: v.status,
    count: v._count,
  }));
}
