import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type LocationFormData = z.infer<typeof locationSchema>;
