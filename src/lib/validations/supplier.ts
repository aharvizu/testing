import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  contact: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
