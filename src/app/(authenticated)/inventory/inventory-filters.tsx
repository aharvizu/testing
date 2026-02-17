'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VEHICLE_STATUS_LABELS, t } from '@/lib/constants';
import { useCallback } from 'react';

interface InventoryFiltersProps {
  makes: string[];
}

export function InventoryFilters({ makes }: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value) current.set(key, value);
        else current.delete(key);
      }
      current.delete('page');
      return current.toString();
    },
    [searchParams],
  );

  const update = (params: Record<string, string>) => {
    router.push(`${pathname}?${createQueryString(params)}`);
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input
        placeholder={t.search}
        defaultValue={searchParams.get('search') ?? ''}
        onChange={(e) => update({ search: e.target.value })}
        className="w-[250px]"
      />
      <Select
        value={searchParams.get('status') ?? 'ALL'}
        onValueChange={(v) => update({ status: v === 'ALL' ? '' : v })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t.status} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t.all}</SelectItem>
          {Object.entries(VEHICLE_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('make') ?? 'ALL'}
        onValueChange={(v) => update({ make: v === 'ALL' ? '' : v })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t.make} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t.all}</SelectItem>
          {makes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
