'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { expenseSchema, type ExpenseFormData } from '@/lib/validations/expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { EXPENSE_CATEGORY_LABELS, t } from '@/lib/constants';
import { createExpenseAction, updateExpenseAction } from '../actions';

interface Props {
  locations: { id: string; name: string }[];
  suppliers: { id: string; name: string }[];
  defaultValues?: Partial<ExpenseFormData> & { id?: string };
}

export function ExpenseForm({ locations, suppliers, defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      supplierId: null,
      category: 'OTHER',
      description: '',
      amount: 0,
      date: new Date(),
      locationId: '',
      notes: '',
      ...defaultValues,
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (isEdit) {
        await updateExpenseAction(defaultValues!.id!, data);
        toast.success('Gasto actualizado');
      } else {
        await createExpenseAction(data);
        toast.success('Gasto creado');
      }
      router.push('/expenses');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <FormField label={t.description} error={form.formState.errors.description} required>
        <Input {...form.register('description')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label={t.amount} error={form.formState.errors.amount} required>
          <Input type="number" step="0.01" {...form.register('amount')} />
        </FormField>
        <FormField label={t.category} error={form.formState.errors.category} required>
          <Select value={form.watch('category')} onValueChange={(v) => form.setValue('category', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.date} error={form.formState.errors.date} required>
          <Input type="date" {...form.register('date')} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.supplier} error={form.formState.errors.supplierId}>
          <Select
            value={form.watch('supplierId') || 'NONE'}
            onValueChange={(v) => form.setValue('supplierId', v === 'NONE' ? null : v)}
          >
            <SelectTrigger><SelectValue placeholder="Sin proveedor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Sin proveedor</SelectItem>
              {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.location} error={form.formState.errors.locationId} required>
          <Select value={form.watch('locationId')} onValueChange={(v) => form.setValue('locationId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
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
        <Button type="button" variant="outline" onClick={() => router.back()}>{t.cancel}</Button>
      </div>
    </form>
  );
}
