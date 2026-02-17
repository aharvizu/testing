import { z } from 'zod';

export const expenseSchema = z.object({
  supplierId: z.string().optional().nullable(),
  category: z.enum([
    'VEHICLE_PURCHASE',
    'REPAIR',
    'TRANSPORT',
    'MARKETING',
    'RENT',
    'UTILITIES',
    'PAYROLL',
    'INSURANCE',
    'OTHER',
  ]),
  description: z.string().min(1, 'Descripción requerida'),
  amount: z.coerce.number().positive('Monto debe ser positivo'),
  date: z.coerce.date(),
  locationId: z.string().cuid('Ubicación requerida'),
  notes: z.string().optional().nullable(),
  attachmentUrl: z.string().url().optional().nullable(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
