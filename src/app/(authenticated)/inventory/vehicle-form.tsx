'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { vehicleSchema, type VehicleFormData } from '@/lib/validations/vehicle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { VEHICLE_STATUS_LABELS, t } from '@/lib/constants';
import { createVehicleAction, updateVehicleAction } from '../actions';

interface VehicleFormProps {
  locations: { id: string; name: string }[];
  defaultValues?: Partial<VehicleFormData> & { id?: string };
}

export function VehicleForm({ locations, defaultValues }: VehicleFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vin: '',
      stockNumber: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      trim: '',
      color: '',
      mileage: 0,
      priceList: 0,
      priceSale: null,
      status: 'AVAILABLE',
      locationId: '',
      notes: '',
      ...defaultValues,
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    try {
      if (isEdit) {
        await updateVehicleAction(defaultValues!.id!, data);
        toast.success('Vehículo actualizado');
      } else {
        await createVehicleAction(data);
        toast.success('Vehículo creado');
      }
      router.push('/inventory');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.vin} error={form.formState.errors.vin} required>
          <Input {...form.register('vin')} placeholder="1HGCM82633A004352" />
        </FormField>
        <FormField label={t.stock_number} error={form.formState.errors.stockNumber} required>
          <Input {...form.register('stockNumber')} placeholder="STK-1001" />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label={t.make} error={form.formState.errors.make} required>
          <Input {...form.register('make')} placeholder="Toyota" />
        </FormField>
        <FormField label={t.model} error={form.formState.errors.model} required>
          <Input {...form.register('model')} placeholder="Camry" />
        </FormField>
        <FormField label={t.year} error={form.formState.errors.year} required>
          <Input type="number" {...form.register('year')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label={t.trim} error={form.formState.errors.trim}>
          <Input {...form.register('trim')} placeholder="Sport" />
        </FormField>
        <FormField label={t.color} error={form.formState.errors.color}>
          <Input {...form.register('color')} placeholder="Blanco" />
        </FormField>
        <FormField label={t.mileage} error={form.formState.errors.mileage} required>
          <Input type="number" {...form.register('mileage')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.price_list} error={form.formState.errors.priceList} required>
          <Input type="number" step="0.01" {...form.register('priceList')} />
        </FormField>
        <FormField label={t.price_sale} error={form.formState.errors.priceSale}>
          <Input type="number" step="0.01" {...form.register('priceSale')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.status} error={form.formState.errors.status} required>
          <Select
            value={form.watch('status')}
            onValueChange={(v) => form.setValue('status', v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VEHICLE_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.location} error={form.formState.errors.locationId} required>
          <Select
            value={form.watch('locationId')}
            onValueChange={(v) => form.setValue('locationId', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label="Notas" error={form.formState.errors.notes}>
        <Textarea {...form.register('notes')} rows={3} />
      </FormField>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? t.save : t.create}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t.cancel}
        </Button>
      </div>
    </form>
  );
}
