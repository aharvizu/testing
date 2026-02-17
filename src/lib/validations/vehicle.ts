import { z } from 'zod';

export const vehicleSchema = z.object({
  vin: z
    .string()
    .min(17, 'VIN debe tener 17 caracteres')
    .max(17, 'VIN debe tener 17 caracteres')
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'VIN inválido'),
  stockNumber: z.string().min(1, 'Número de stock requerido'),
  make: z.string().min(1, 'Marca requerida'),
  model: z.string().min(1, 'Modelo requerido'),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 2),
  trim: z.string().optional(),
  color: z.string().optional(),
  mileage: z.coerce.number().int().min(0, 'Kilometraje inválido'),
  priceList: z.coerce.number().positive('Precio debe ser positivo'),
  priceSale: z.coerce.number().positive().optional().nullable(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'IN_TRANSIT', 'RECONDITIONING']),
  locationId: z.string().cuid('Ubicación requerida'),
  imageUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
