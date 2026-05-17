"use client";

import Typography from "@/components/ui/design-system/typography";
import Input from "@/components/ui/design-system/input/input";

type AdminChartDatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rangeLabel?: string;
};

export default function AdminChartDatePicker({
  label,
  value,
  onChange,
  rangeLabel,
}: AdminChartDatePickerProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label className="grid gap-1">
        <Typography
          variant="span"
          Component="span"
          className="!text-xs !font-semibold uppercase !text-slate-500"
        >
          {label}
        </Typography>
        <Input
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputWrapperClassName="!h-10 !rounded-xl !border-slate-300 !px-3 focus-within:!border-[var(--color-primary-light)] focus-within:!shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-primary-light)_10%,transparent)]"
          className="font-semibold !text-slate-800"
        />
      </label>

      {rangeLabel ? (
        <Typography
          variant="span"
          Component="span"
          className="!text-sm !font-semibold !text-slate-500"
        >
          {rangeLabel}
        </Typography>
      ) : null}
    </div>
  );
}
