'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, t } from '@/lib/constants';

export function LeadsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (params: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value) current.set(key, value);
        else current.delete(key);
      }
      current.delete('page');
      router.push(`${pathname}?${current.toString()}`);
    },
    [router, pathname, searchParams],
  );

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
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t.status} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t.all}</SelectItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get('source') ?? 'ALL'}
        onValueChange={(v) => update({ source: v === 'ALL' ? '' : v })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={t.lead_source} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">{t.all}</SelectItem>
          {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
