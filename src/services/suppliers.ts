import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { createAuditLog } from './audit';
import { computeDiff } from '@/lib/utils';

export async function getSuppliers({
  page = 1,
  pageSize = 20,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const where: Prisma.SupplierWhereInput = {
    deletedAt: null,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supplier.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findFirst({ where: { id, deletedAt: null } });
}

export async function getAllSuppliers() {
  return prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
}

export async function createSupplier(
  data: Prisma.SupplierCreateInput,
  userId: string,
) {
  const supplier = await prisma.supplier.create({ data });
  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Supplier',
    entityId: supplier.id,
    after: supplier as unknown as Record<string, unknown>,
  });
  return supplier;
}

export async function updateSupplier(
  id: string,
  data: Prisma.SupplierUpdateInput,
  userId: string,
) {
  const before = await prisma.supplier.findUnique({ where: { id } });
  const supplier = await prisma.supplier.update({ where: { id }, data });

  const diff = computeDiff(
    before as unknown as Record<string, unknown>,
    supplier as unknown as Record<string, unknown>,
  );
  if (diff) {
    await createAuditLog({
      userId,
      action: 'UPDATE',
      entity: 'Supplier',
      entityId: id,
      before: diff,
      after: supplier as unknown as Record<string, unknown>,
    });
  }

  return supplier;
}

export async function softDeleteSupplier(id: string, userId: string) {
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Supplier',
    entityId: id,
    before: supplier as unknown as Record<string, unknown>,
  });
  return supplier;
}
