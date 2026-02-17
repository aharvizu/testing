import { z } from 'zod';

export const dealSchema = z.object({
  leadId: z.string().cuid('Lead requerido'),
  vehicleId: z.string().cuid('Vehículo requerido'),
  locationId: z.string().cuid('Ubicación requerida'),
  salesUserId: z.string().cuid('Vendedor requerido'),
  salePrice: z.coerce.number().positive('Precio de venta requerido'),
  paymentType: z.enum(['CASH', 'FINANCE']),
  status: z.enum(['OPEN', 'CLOSED_WON', 'CLOSED_LOST']),
  closingDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type DealFormData = z.infer<typeof dealSchema>;
