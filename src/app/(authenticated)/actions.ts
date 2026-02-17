'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth';
import { hasPermission, canAccessLocation } from '@/lib/permissions';
import { vehicleSchema } from '@/lib/validations/vehicle';
import { leadSchema, leadNoteSchema } from '@/lib/validations/lead';
import { dealSchema } from '@/lib/validations/deal';
import { supplierSchema } from '@/lib/validations/supplier';
import { expenseSchema } from '@/lib/validations/expense';
import { userSchema } from '@/lib/validations/user';
import { locationSchema } from '@/lib/validations/location';
import * as inventoryService from '@/services/inventory';
import * as leadService from '@/services/leads';
import * as dealService from '@/services/deals';
import * as supplierService from '@/services/suppliers';
import * as expenseService from '@/services/expenses';
import * as userService from '@/services/users';
import * as locationService from '@/services/locations';

function unauthorized(): never {
  throw new Error('No autorizado');
}

// ─── Vehicles ───────────────────────────────────────────────

export async function createVehicleAction(formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'inventory', 'create')) unauthorized();
  const parsed = vehicleSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await inventoryService.createVehicle(parsed as any, session.user.id);
  revalidatePath('/inventory');
  return { success: true };
}

export async function updateVehicleAction(id: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'inventory', 'update')) unauthorized();
  const parsed = vehicleSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await inventoryService.updateVehicle(id, parsed, session.user.id);
  revalidatePath('/inventory');
  revalidatePath(`/inventory/${id}`);
  return { success: true };
}

export async function deleteVehicleAction(id: string) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'inventory', 'delete')) unauthorized();
  await inventoryService.softDeleteVehicle(id, session.user.id);
  revalidatePath('/inventory');
  return { success: true };
}

// ─── Leads ──────────────────────────────────────────────────

export async function createLeadAction(formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'leads', 'create')) unauthorized();
  const parsed = leadSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await leadService.createLead(parsed, session.user.id);
  revalidatePath('/leads');
  return { success: true };
}

export async function updateLeadAction(id: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'leads', 'update')) unauthorized();
  const parsed = leadSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await leadService.updateLead(id, parsed, session.user.id);
  revalidatePath('/leads');
  revalidatePath(`/leads/${id}`);
  return { success: true };
}

export async function deleteLeadAction(id: string) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'leads', 'delete')) unauthorized();
  await leadService.softDeleteLead(id, session.user.id);
  revalidatePath('/leads');
  return { success: true };
}

export async function addLeadNoteAction(leadId: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'leads', 'update')) unauthorized();
  const parsed = leadNoteSchema.parse(formData);
  await leadService.addLeadNote(leadId, parsed.content, session.user.id);
  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}

// ─── Deals ──────────────────────────────────────────────────

export async function createDealAction(formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'deals', 'create')) unauthorized();
  const parsed = dealSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await dealService.createDeal(parsed, session.user.id);
  revalidatePath('/deals');
  return { success: true };
}

export async function updateDealAction(id: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'deals', 'update')) unauthorized();
  const parsed = dealSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await dealService.updateDeal(id, parsed, session.user.id);
  revalidatePath('/deals');
  revalidatePath(`/deals/${id}`);
  return { success: true };
}

export async function deleteDealAction(id: string) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'deals', 'delete')) unauthorized();
  await dealService.softDeleteDeal(id, session.user.id);
  revalidatePath('/deals');
  return { success: true };
}

// ─── Suppliers ──────────────────────────────────────────────

export async function createSupplierAction(formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'suppliers', 'create')) unauthorized();
  const parsed = supplierSchema.parse(formData);
  await supplierService.createSupplier(parsed, session.user.id);
  revalidatePath('/suppliers');
  return { success: true };
}

export async function updateSupplierAction(id: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'suppliers', 'update')) unauthorized();
  const parsed = supplierSchema.parse(formData);
  await supplierService.updateSupplier(id, parsed, session.user.id);
  revalidatePath('/suppliers');
  revalidatePath(`/suppliers/${id}`);
  return { success: true };
}

export async function deleteSupplierAction(id: string) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'suppliers', 'delete')) unauthorized();
  await supplierService.softDeleteSupplier(id, session.user.id);
  revalidatePath('/suppliers');
  return { success: true };
}

// ─── Expenses ───────────────────────────────────────────────

export async function createExpenseAction(formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'expenses', 'create')) unauthorized();
  const parsed = expenseSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await expenseService.createExpense(parsed, session.user.id);
  revalidatePath('/expenses');
  return { success: true };
}

export async function updateExpenseAction(id: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'expenses', 'update')) unauthorized();
  const parsed = expenseSchema.parse(formData);
  if (!canAccessLocation(session.user.role, session.user.locationIds, parsed.locationId)) unauthorized();
  await expenseService.updateExpense(id, parsed, session.user.id);
  revalidatePath('/expenses');
  revalidatePath(`/expenses/${id}`);
  return { success: true };
}

export async function deleteExpenseAction(id: string) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'expenses', 'delete')) unauthorized();
  await expenseService.softDeleteExpense(id, session.user.id);
  revalidatePath('/expenses');
  return { success: true };
}

// ─── Users ──────────────────────────────────────────────────

export async function createUserAction(formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'users', 'create')) unauthorized();
  const parsed = userSchema.parse(formData);
  await userService.createUser(
    { ...parsed, password: parsed.password || undefined },
    session.user.id,
  );
  revalidatePath('/users');
  return { success: true };
}

export async function updateUserAction(id: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'users', 'update')) unauthorized();
  const parsed = userSchema.parse(formData);
  await userService.updateUser(
    id,
    { ...parsed, password: parsed.password || undefined },
    session.user.id,
  );
  revalidatePath('/users');
  revalidatePath(`/users/${id}`);
  return { success: true };
}

export async function deleteUserAction(id: string) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'users', 'delete')) unauthorized();
  if (id === session.user.id) throw new Error('No puedes eliminarte a ti mismo');
  await userService.softDeleteUser(id, session.user.id);
  revalidatePath('/users');
  return { success: true };
}

// ─── Locations ──────────────────────────────────────────────

export async function createLocationAction(formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'locations', 'create')) unauthorized();
  const parsed = locationSchema.parse(formData);
  await locationService.createLocation(parsed, session.user.id);
  revalidatePath('/locations');
  return { success: true };
}

export async function updateLocationAction(id: string, formData: unknown) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'locations', 'update')) unauthorized();
  const parsed = locationSchema.parse(formData);
  await locationService.updateLocation(id, parsed, session.user.id);
  revalidatePath('/locations');
  revalidatePath(`/locations/${id}`);
  return { success: true };
}

export async function deleteLocationAction(id: string) {
  const session = await requireSession();
  if (!hasPermission(session.user.role, 'locations', 'delete')) unauthorized();
  await locationService.softDeleteLocation(id, session.user.id);
  revalidatePath('/locations');
  return { success: true };
}
