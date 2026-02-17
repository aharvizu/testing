'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { userSchema, type UserFormData } from '@/lib/validations/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms/form-field';
import { Label } from '@/components/ui/label';
import { ROLE_LABELS, t } from '@/lib/constants';
import { createUserAction, updateUserAction } from '../actions';

interface Props {
  locations: { id: string; name: string }[];
  defaultValues?: Partial<UserFormData> & { id?: string };
}

export function UserForm({ locations, defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'VIEWER',
      isActive: true,
      locationIds: [],
      password: '',
      ...defaultValues,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEdit) {
        await updateUserAction(defaultValues!.id!, data);
        toast.success('Usuario actualizado');
      } else {
        await createUserAction(data);
        toast.success('Usuario creado');
      }
      router.push('/users');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  const selectedLocations = form.watch('locationIds') || [];

  const toggleLocation = (locationId: string) => {
    const current = form.getValues('locationIds') || [];
    if (current.includes(locationId)) {
      form.setValue(
        'locationIds',
        current.filter((id) => id !== locationId),
      );
    } else {
      form.setValue('locationIds', [...current, locationId]);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.name} error={form.formState.errors.name} required>
          <Input {...form.register('name')} />
        </FormField>
        <FormField label={t.email} error={form.formState.errors.email} required>
          <Input type="email" {...form.register('email')} />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t.role} error={form.formState.errors.role} required>
          <Select value={form.watch('role')} onValueChange={(v) => form.setValue('role', v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t.password} error={form.formState.errors.password}>
          <Input type="password" {...form.register('password')} placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'} />
        </FormField>
      </div>

      <div className="space-y-2">
        <Label>
          Ubicaciones <span className="text-destructive">*</span>
        </Label>
        {form.formState.errors.locationIds && (
          <p className="text-xs text-destructive">{form.formState.errors.locationIds.message}</p>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <div key={loc.id} className="flex items-center gap-2">
              <Checkbox
                id={`loc-${loc.id}`}
                checked={selectedLocations.includes(loc.id)}
                onCheckedChange={() => toggleLocation(loc.id)}
              />
              <Label htmlFor={`loc-${loc.id}`} className="text-sm font-normal">
                {loc.name}
              </Label>
            </div>
          ))}
        </div>
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
