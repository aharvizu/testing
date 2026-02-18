'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { leadSchema, type LeadFormData } from '@/lib/validations/lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, CUSTOMER_TYPE_LABELS, t } from '@/lib/constants';
import { createLeadAction, updateLeadAction } from '../actions';

interface LeadFormProps {
  locations: { id: string; name: string }[];
  salesUsers: { id: string; name: string | null }[];
  defaultValues?: Partial<LeadFormData> & { id?: string };
}

export function LeadForm({ locations, salesUsers, defaultValues }: LeadFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      source: 'OTHER',
      status: 'NEW',
      customerType: 'MENUDEO',
      assignedToId: null,
      vehicleId: null,
      locationId: '',
      ...defaultValues,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      if (isEdit) {
        await updateLeadAction(defaultValues!.id!, data);
        toast.success('Lead actualizado');
      } else {
        await createLeadAction(data);
        toast.success('Lead creado');
      }
      router.push('/leads');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.lead_name} error={form.formState.errors.name} required>
          <Input {...form.register('name')} />
        </FormField>
        <FormField label={t.lead_phone} error={form.formState.errors.phone} required>
          <Input {...form.register('phone')} placeholder="+52 81 1234 5678" />
        </FormField>
      </div>

      <FormField label={t.email} error={form.formState.errors.email}>
        <Input type="email" {...form.register('email')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label={t.lead_source} error={form.formState.errors.source} required>
          <Select value={form.watch('source')} onValueChange={(v) => form.setValue('source', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.status} error={form.formState.errors.status} required>
          <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.customer_type} error={form.formState.errors.customerType} required>
          <Select value={form.watch('customerType')} onValueChange={(v) => form.setValue('customerType', v as any)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {Object.entries(CUSTOMER_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.lead_assigned} error={form.formState.errors.assignedToId}>
          <Select
            value={form.watch('assignedToId') || 'NONE'}
            onValueChange={(v) => form.setValue('assignedToId', v === 'NONE' ? null : v)}
          >
            <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Sin asignar</SelectItem>
              {salesUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name || u.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.location} error={form.formState.errors.locationId} required>
          <Select value={form.watch('locationId')} onValueChange={(v) => form.setValue('locationId', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
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
