import { prisma } from '@/lib/db';
import { DealStatus, PaymentType, Prisma, Role } from '@prisma/client';
import { locationFilter } from '@/lib/permissions';
import { createAuditLog } from './audit';
import { computeDiff } from '@/lib/utils';

export interface DealListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: DealStatus;
  locationId?: string;
  salesUserId?: string;
  paymentType?: PaymentType;
  role: Role;
  locationIds: string[];
}

export async function getDeals({
  page = 1,
  pageSize = 20,
  search,
  status,
  locationId,
  salesUserId,
  paymentType,
  role,
  locationIds,
}: DealListParams) {
  const where: Prisma.DealWhereInput = {
    deletedAt: null,
    ...locationFilter(role, locationIds),
    ...(status && { status }),
    ...(locationId && { locationId }),
    ...(salesUserId && { salesUserId }),
    ...(paymentType && { paymentType }),
    ...(search && {
      OR: [
        { lead: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { stockNumber: { contains: search, mode: 'insensitive' } } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        vehicle: { select: { id: true, make: true, model: true, year: true, stockNumber: true } },
        location: { select: { id: true, name: true } },
        salesUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.deal.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getDealById(id: string) {
  return prisma.deal.findFirst({
    where: { id, deletedAt: null },
    include: {
      lead: true,
      vehicle: true,
      location: true,
      salesUser: { select: { id: true, name: true, email: true } },
      invoices: true,
    },
  });
}

export async function createDeal(
  data: {
    leadId: string;
    vehicleId: string;
    locationId: string;
    salesUserId: string;
    salePrice: number;
    paymentType: PaymentType;
    status: DealStatus;
    closingDate?: Date | null;
    notes?: string | null;
  },
  userId: string,
) {
  const deal = await prisma.deal.create({
    data: {
      lead: { connect: { id: data.leadId } },
      vehicle: { connect: { id: data.vehicleId } },
      location: { connect: { id: data.locationId } },
      salesUser: { connect: { id: data.salesUserId } },
      salePrice: data.salePrice,
      paymentType: data.paymentType,
      status: data.status,
      closingDate: data.closingDate || null,
      notes: data.notes || null,
    },
  });

  // Mark vehicle as SOLD if deal is won
  if (data.status === 'CLOSED_WON') {
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'SOLD', priceSale: data.salePrice },
    });
  } else if (data.status === 'OPEN') {
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'RESERVED' },
    });
  }

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Deal',
    entityId: deal.id,
    after: deal as unknown as Record<string, unknown>,
  });

  return deal;
}

export async function updateDeal(
  id: string,
  data: Prisma.DealUpdateInput,
  userId: string,
) {
  const before = await prisma.deal.findUnique({ where: { id } });
  const deal = await prisma.deal.update({ where: { id }, data });

  const diff = computeDiff(
    before as unknown as Record<string, unknown>,
    deal as unknown as Record<string, unknown>,
  );
  if (diff) {
    await createAuditLog({
      userId,
      action: 'UPDATE',
      entity: 'Deal',
      entityId: id,
      before: diff,
      after: deal as unknown as Record<string, unknown>,
    });
  }

  return deal;
}

export async function softDeleteDeal(id: string, userId: string) {
  const deal = await prisma.deal.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Deal',
    entityId: id,
    before: deal as unknown as Record<string, unknown>,
  });

  return deal;
}
