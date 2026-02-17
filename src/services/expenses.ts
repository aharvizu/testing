import { prisma } from '@/lib/db';
import { ExpenseCategory, Prisma, Role } from '@prisma/client';
import { locationFilter } from '@/lib/permissions';
import { createAuditLog } from './audit';
import { computeDiff } from '@/lib/utils';

export interface ExpenseListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: ExpenseCategory;
  locationId?: string;
  supplierId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  role: Role;
  locationIds: string[];
}

export async function getExpenses({
  page = 1,
  pageSize = 20,
  search,
  category,
  locationId,
  supplierId,
  dateFrom,
  dateTo,
  role,
  locationIds,
}: ExpenseListParams) {
  const where: Prisma.ExpenseWhereInput = {
    deletedAt: null,
    ...locationFilter(role, locationIds),
    ...(category && { category }),
    ...(locationId && { locationId }),
    ...(supplierId && { supplierId }),
    ...(dateFrom && { date: { gte: dateFrom } }),
    ...(dateTo && { date: { lte: dateTo } }),
    ...(search && {
      OR: [
        { description: { contains: search, mode: 'insensitive' } },
        { supplier: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getExpenseById(id: string) {
  return prisma.expense.findFirst({
    where: { id, deletedAt: null },
    include: { supplier: true, location: true },
  });
}

export async function createExpense(
  data: {
    supplierId?: string | null;
    category: ExpenseCategory;
    description: string;
    amount: number;
    date: Date;
    locationId: string;
    notes?: string | null;
    attachmentUrl?: string | null;
  },
  userId: string,
) {
  const expense = await prisma.expense.create({
    data: {
      supplier: data.supplierId ? { connect: { id: data.supplierId } } : undefined,
      category: data.category,
      description: data.description,
      amount: data.amount,
      date: data.date,
      location: { connect: { id: data.locationId } },
      notes: data.notes || null,
      attachmentUrl: data.attachmentUrl || null,
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Expense',
    entityId: expense.id,
    after: expense as unknown as Record<string, unknown>,
  });

  return expense;
}

export async function updateExpense(
  id: string,
  data: Prisma.ExpenseUpdateInput,
  userId: string,
) {
  const before = await prisma.expense.findUnique({ where: { id } });
  const expense = await prisma.expense.update({ where: { id }, data });

  const diff = computeDiff(
    before as unknown as Record<string, unknown>,
    expense as unknown as Record<string, unknown>,
  );
  if (diff) {
    await createAuditLog({
      userId,
      action: 'UPDATE',
      entity: 'Expense',
      entityId: id,
      before: diff,
      after: expense as unknown as Record<string, unknown>,
    });
  }

  return expense;
}

export async function softDeleteExpense(id: string, userId: string) {
  const expense = await prisma.expense.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Expense',
    entityId: id,
    before: expense as unknown as Record<string, unknown>,
  });

  return expense;
}
