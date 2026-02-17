'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { locationSchema, type LocationFormData } from '@/lib/validations/location';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/forms/form-field';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/constants';
import { createLocationAction, updateLocationAction } from '../actions';

interface Props {
  defaultValues?: Partial<LocationFormData> & { id?: string };
}

export function LocationForm({ defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: '', address: '', city: '', state: '', phone: '', isActive: true, ...defaultValues },
  });

  const onSubmit = async (data: LocationFormData) => {
    try {
      if (isEdit) {
        await updateLocationAction(defaultValues!.id!, data);
        toast.success('Ubicación actualizada');
      } else {
        await createLocationAction(data);
        toast.success('Ubicación creada');
      }
      router.push('/locations');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <FormField label={t.name} error={form.formState.errors.name} required>
        <Input {...form.register('name')} />
      </FormField>
      <FormField label="Dirección" error={form.formState.errors.address}>
        <Input {...form.register('address')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Ciudad" error={form.formState.errors.city}>
          <Input {...form.register('city')} />
        </FormField>
        <FormField label="Estado" error={form.formState.errors.state}>
          <Input {...form.register('state')} />
        </FormField>
        <FormField label="Teléfono" error={form.formState.errors.phone}>
          <Input {...form.register('phone')} />
        </FormField>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="isActive"
          checked={form.watch('isActive')}
          onCheckedChange={(checked) => form.setValue('isActive', !!checked)}
        />
        <Label htmlFor="isActive">{t.active}</Label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? t.save : t.create}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>{t.cancel}</Button>
      </div>
    </form>
  );
}
