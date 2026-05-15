import type { ReactNode } from "react";

import Typography from "@/components/ui/design-system/typography";

type AdminDashboardChartCardProps = {
  title: string;
  children: ReactNode;
};

export function AdminDashboardChartCard({
  title,
  children,
}: AdminDashboardChartCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <Typography variant="h3" Component="h3" className="mb-4 !text-lg !text-slate-950">
        {title}
      </Typography>
      {children}
    </section>
  );
}

export function AdminDashboardChartPlaceholder() {
  return (
    <div className="grid min-h-[18rem] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
      <Typography variant="span" Component="span" className="!text-sm !font-semibold !text-slate-500">
        A venir
      </Typography>
    </div>
  );
}
