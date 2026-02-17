import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES', 'FINANCE', 'SUPPORT', 'VIEWER']),
  isActive: z.boolean().default(true),
  locationIds: z.array(z.string().cuid()).min(1, 'Al menos una ubicación requerida'),
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
});

export type UserFormData = z.infer<typeof userSchema>;
