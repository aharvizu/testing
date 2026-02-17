'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { dealSchema, type DealFormData } from '@/lib/validations/deal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { DEAL_STATUS_LABELS, PAYMENT_TYPE_LABELS, t } from '@/lib/constants';
import { createDealAction, updateDealAction } from '../actions';

interface DealFormProps {
  locations: { id: string; name: string }[];
  salesUsers: { id: string; name: string | null }[];
  leads: { id: string; name: string }[];
  vehicles: { id: string; label: string }[];
  defaultValues?: Partial<DealFormData> & { id?: string };
}

export function DealForm({ locations, salesUsers, leads, vehicles, defaultValues }: DealFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      leadId: '',
      vehicleId: '',
      locationId: '',
      salesUserId: '',
      salePrice: 0,
      paymentType: 'CASH',
      status: 'OPEN',
      closingDate: null,
      notes: '',
      ...defaultValues,
    },
  });

  const onSubmit = async (data: DealFormData) => {
    try {
      if (isEdit) {
        await updateDealAction(defaultValues!.id!, data);
        toast.success('Venta actualizada');
      } else {
        await createDealAction(data);
        toast.success('Venta creada');
      }
      router.push('/deals');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Lead / Cliente" error={form.formState.errors.leadId} required>
          <Select value={form.watch('leadId')} onValueChange={(v) => form.setValue('leadId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar lead" /></SelectTrigger>
            <SelectContent>
              {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.vehicle} error={form.formState.errors.vehicleId} required>
          <Select value={form.watch('vehicleId')} onValueChange={(v) => form.setValue('vehicleId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar vehículo" /></SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.location} error={form.formState.errors.locationId} required>
          <Select value={form.watch('locationId')} onValueChange={(v) => form.setValue('locationId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {locations.map((loc) => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Vendedor" error={form.formState.errors.salesUserId} required>
          <Select value={form.watch('salesUserId')} onValueChange={(v) => form.setValue('salesUserId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {salesUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name || u.id}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label={t.sale_price} error={form.formState.errors.salePrice} required>
          <Input type="number" step="0.01" {...form.register('salePrice')} />
        </FormField>
        <FormField label={t.payment_type} error={form.formState.errors.paymentType} required>
          <Select value={form.watch('paymentType')} onValueChange={(v) => form.setValue('paymentType', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.status} error={form.formState.errors.status} required>
          <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(DEAL_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
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
        <Button type="button" variant="outline" onClick={() => router.back()}>{t.cancel}</Button>
      </div>
    </form>
  );
}
