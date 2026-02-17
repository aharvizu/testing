'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supplierSchema, type SupplierFormData } from '@/lib/validations/supplier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/forms/form-field';
import { t } from '@/lib/constants';
import { createSupplierAction, updateSupplierAction } from '../actions';

interface Props {
  defaultValues?: Partial<SupplierFormData> & { id?: string };
}

export function SupplierForm({ defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', contact: '', phone: '', email: '', address: '', notes: '', ...defaultValues },
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (isEdit) {
        await updateSupplierAction(defaultValues!.id!, data);
        toast.success('Proveedor actualizado');
      } else {
        await createSupplierAction(data);
        toast.success('Proveedor creado');
      }
      router.push('/suppliers');
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Contacto" error={form.formState.errors.contact}>
          <Input {...form.register('contact')} />
        </FormField>
        <FormField label="Teléfono" error={form.formState.errors.phone}>
          <Input {...form.register('phone')} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.email} error={form.formState.errors.email}>
          <Input type="email" {...form.register('email')} />
        </FormField>
        <FormField label="Dirección" error={form.formState.errors.address}>
          <Input {...form.register('address')} />
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
        <Button type="button" variant="outline" onClick={() => router.back()}>{t.cancel}</Button>
      </div>
    </form>
  );
}
