import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { createAuditLog } from './audit';
import { computeDiff } from '@/lib/utils';

export async function getLocations({
  page = 1,
  pageSize = 50,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
} = {}) {
  const where: Prisma.LocationWhereInput = {
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.location.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.location.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getLocationById(id: string) {
  return prisma.location.findFirst({ where: { id, deletedAt: null } });
}

export async function getAllLocations() {
  return prisma.location.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
  });
}

export async function getUserLocations(locationIds: string[]) {
  return prisma.location.findMany({
    where: { id: { in: locationIds }, deletedAt: null },
    orderBy: { name: 'asc' },
  });
}

export async function createLocation(data: Prisma.LocationCreateInput, userId: string) {
  const location = await prisma.location.create({ data });
  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Location',
    entityId: location.id,
    after: location as unknown as Record<string, unknown>,
  });
  return location;
}

export async function updateLocation(
  id: string,
  data: Prisma.LocationUpdateInput,
  userId: string,
) {
  const before = await prisma.location.findUnique({ where: { id } });
  const location = await prisma.location.update({ where: { id }, data });

  const diff = computeDiff(
    before as unknown as Record<string, unknown>,
    location as unknown as Record<string, unknown>,
  );
  if (diff) {
    await createAuditLog({
      userId,
      action: 'UPDATE',
      entity: 'Location',
      entityId: id,
      before: diff,
      after: location as unknown as Record<string, unknown>,
    });
  }

  return location;
}

export async function softDeleteLocation(id: string, userId: string) {
  const location = await prisma.location.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Location',
    entityId: id,
  });

  return location;
}
