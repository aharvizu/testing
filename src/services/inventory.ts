import { prisma } from '@/lib/db';
import { VehicleStatus, Prisma, Role } from '@prisma/client';
import { locationFilter } from '@/lib/permissions';
import { createAuditLog } from './audit';
import { computeDiff } from '@/lib/utils';

export interface VehicleListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: VehicleStatus;
  locationId?: string;
  make?: string;
  yearMin?: number;
  yearMax?: number;
  role: Role;
  locationIds: string[];
}

export async function getVehicles({
  page = 1,
  pageSize = 20,
  search,
  status,
  locationId,
  make,
  yearMin,
  yearMax,
  role,
  locationIds,
}: VehicleListParams) {
  const where: Prisma.VehicleWhereInput = {
    deletedAt: null,
    ...locationFilter(role, locationIds),
    ...(status && { status }),
    ...(locationId && { locationId }),
    ...(make && { make: { equals: make, mode: 'insensitive' } }),
    ...(yearMin && { year: { gte: yearMin } }),
    ...(yearMax && { year: { lte: yearMax } }),
    ...(search && {
      OR: [
        { vin: { contains: search, mode: 'insensitive' } },
        { stockNumber: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { location: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getVehicleById(id: string) {
  return prisma.vehicle.findFirst({
    where: { id, deletedAt: null },
    include: { location: true },
  });
}

export async function createVehicle(
  data: Prisma.VehicleCreateInput & { locationId: string },
  userId: string,
) {
  const { locationId, ...rest } = data;
  const vehicle = await prisma.vehicle.create({
    data: {
      ...rest,
      location: { connect: { id: locationId } },
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Vehicle',
    entityId: vehicle.id,
    after: vehicle as unknown as Record<string, unknown>,
  });

  return vehicle;
}

export async function updateVehicle(
  id: string,
  data: Prisma.VehicleUpdateInput,
  userId: string,
) {
  const before = await prisma.vehicle.findUnique({ where: { id } });
  const vehicle = await prisma.vehicle.update({ where: { id }, data });

  const diff = computeDiff(
    before as unknown as Record<string, unknown>,
    vehicle as unknown as Record<string, unknown>,
  );
  if (diff) {
    await createAuditLog({
      userId,
      action: 'UPDATE',
      entity: 'Vehicle',
      entityId: id,
      before: diff,
      after: vehicle as unknown as Record<string, unknown>,
    });
  }

  return vehicle;
}

export async function softDeleteVehicle(id: string, userId: string) {
  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Vehicle',
    entityId: id,
    before: vehicle as unknown as Record<string, unknown>,
  });

  return vehicle;
}

export async function getDistinctMakes(role: Role, locationIds: string[]) {
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null, ...locationFilter(role, locationIds) },
    select: { make: true },
    distinct: ['make'],
    orderBy: { make: 'asc' },
  });
  return vehicles.map((v) => v.make);
}
