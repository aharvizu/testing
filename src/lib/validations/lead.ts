import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  phone: z.string().min(8, 'Teléfono requerido'),
  source: z.enum(['WHATSAPP', 'WEB', 'FB', 'IG', 'OTHER']),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'WON']),
  assignedToId: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
  locationId: z.string().cuid('Ubicación requerida'),
});

export const leadNoteSchema = z.object({
  content: z.string().min(1, 'Nota requerida'),
});

export type LeadFormData = z.infer<typeof leadSchema>;
