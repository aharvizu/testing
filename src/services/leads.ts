import { prisma } from '@/lib/db';
import { LeadStatus, LeadSource, Prisma, Role } from '@prisma/client';
import { locationFilter } from '@/lib/permissions';
import { createAuditLog } from './audit';
import { computeDiff } from '@/lib/utils';

export interface LeadListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  locationId?: string;
  assignedToId?: string;
  role: Role;
  locationIds: string[];
}

export async function getLeads({
  page = 1,
  pageSize = 20,
  search,
  status,
  source,
  locationId,
  assignedToId,
  role,
  locationIds,
}: LeadListParams) {
  const where: Prisma.LeadWhereInput = {
    deletedAt: null,
    ...locationFilter(role, locationIds),
    ...(status && { status }),
    ...(source && { source }),
    ...(locationId && { locationId }),
    ...(assignedToId && { assignedToId }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        location: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        vehicle: { select: { id: true, make: true, model: true, year: true, stockNumber: true } },
        _count: { select: { notes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getLeadById(id: string) {
  return prisma.lead.findFirst({
    where: { id, deletedAt: null },
    include: {
      location: true,
      assignedTo: { select: { id: true, name: true, email: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, stockNumber: true } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function createLead(
  data: {
    name: string;
    email?: string | null;
    phone: string;
    source: LeadSource;
    status: LeadStatus;
    assignedToId?: string | null;
    vehicleId?: string | null;
    locationId: string;
  },
  userId: string,
) {
  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      source: data.source,
      status: data.status,
      assignedTo: data.assignedToId ? { connect: { id: data.assignedToId } } : undefined,
      vehicle: data.vehicleId ? { connect: { id: data.vehicleId } } : undefined,
      location: { connect: { id: data.locationId } },
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Lead',
    entityId: lead.id,
    after: lead as unknown as Record<string, unknown>,
  });

  return lead;
}

export async function updateLead(
  id: string,
  data: Prisma.LeadUpdateInput,
  userId: string,
) {
  const before = await prisma.lead.findUnique({ where: { id } });
  const lead = await prisma.lead.update({ where: { id }, data });

  const diff = computeDiff(
    before as unknown as Record<string, unknown>,
    lead as unknown as Record<string, unknown>,
  );
  if (diff) {
    await createAuditLog({
      userId,
      action: 'UPDATE',
      entity: 'Lead',
      entityId: id,
      before: diff,
      after: lead as unknown as Record<string, unknown>,
    });
  }

  return lead;
}

export async function softDeleteLead(id: string, userId: string) {
  const lead = await prisma.lead.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Lead',
    entityId: id,
    before: lead as unknown as Record<string, unknown>,
  });

  return lead;
}

export async function addLeadNote(leadId: string, content: string, userId: string) {
  const note = await prisma.leadNote.create({
    data: { leadId, content },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'LeadNote',
    entityId: note.id,
    after: { leadId, content },
  });

  return note;
}
