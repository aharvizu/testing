import { prisma } from '@/lib/db';
import { AuditAction, Prisma } from '@prisma/client';

interface AuditInput {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export async function createAuditLog(input: AuditInput) {
  return prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      before: (input.before as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      after: (input.after as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    },
  });
}

export async function getAuditLogs({
  page = 1,
  pageSize = 50,
  entity,
  entityId,
  userId,
  action,
}: {
  page?: number;
  pageSize?: number;
  entity?: string;
  entityId?: string;
  userId?: string;
  action?: AuditAction;
}) {
  const where = {
    ...(entity && { entity }),
    ...(entityId && { entityId }),
    ...(userId && { userId }),
    ...(action && { action }),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
