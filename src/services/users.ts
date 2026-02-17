import { prisma } from '@/lib/db';
import { Role, Prisma } from '@prisma/client';
import { hash } from 'bcryptjs';
import { createAuditLog } from './audit';

export async function getUsers({
  page = 1,
  pageSize = 20,
  search,
  role,
  locationId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: Role;
  locationId?: string;
}) {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(role && { role }),
    ...(locationId && { locations: { some: { locationId } } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        locations: {
          include: { location: { select: { id: true, name: true } } },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      locations: {
        include: { location: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function createUser(
  data: {
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    locationIds: string[];
    password?: string;
  },
  actorId: string,
) {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: data.isActive,
      hashedPassword: data.password ? await hash(data.password, 12) : null,
      locations: {
        create: data.locationIds.map((lid) => ({ locationId: lid })),
      },
    },
  });

  await createAuditLog({
    userId: actorId,
    action: 'CREATE',
    entity: 'User',
    entityId: user.id,
    after: { name: user.name, email: user.email, role: user.role },
  });

  return user;
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: Role;
    isActive?: boolean;
    locationIds?: string[];
    password?: string;
  },
  actorId: string,
) {
  const updateData: Prisma.UserUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.password) updateData.hashedPassword = await hash(data.password, 12);

  // Update locations if provided
  if (data.locationIds) {
    await prisma.userLocation.deleteMany({ where: { userId: id } });
    await prisma.userLocation.createMany({
      data: data.locationIds.map((lid) => ({ userId: id, locationId: lid })),
    });
  }

  const user = await prisma.user.update({ where: { id }, data: updateData });

  await createAuditLog({
    userId: actorId,
    action: 'UPDATE',
    entity: 'User',
    entityId: id,
    after: { name: user.name, email: user.email, role: user.role },
  });

  return user;
}

export async function softDeleteUser(id: string, actorId: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });

  await createAuditLog({
    userId: actorId,
    action: 'DELETE',
    entity: 'User',
    entityId: id,
  });

  return user;
}

export async function getSalesUsers(locationIds?: string[]) {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      role: { in: ['SALES', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
      ...(locationIds?.length
        ? { locations: { some: { locationId: { in: locationIds } } } }
        : {}),
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
}
