import type { ReactNode } from "react";

import Typography from "@/components/ui/design-system/typography";

type AdminDashboardChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
};

export function AdminDashboardChartCard({
  title,
  description,
  children,
  className = "",
  contentClassName = "",
  headerClassName = "mb-4",
}: AdminDashboardChartCardProps) {
  return (
    <section
      className={[
        "rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]",
        className,
      ].filter(Boolean).join(" ")}
    >
      <div className={headerClassName}>
        <Typography variant="h3" Component="h3" className="!text-lg !text-slate-950">
          {title}
        </Typography>
        {description ? (
          <Typography variant="p" Component="p" className="mt-1 !text-sm !text-slate-600">
            {description}
          </Typography>
        ) : null}
      </div>
      <div className={contentClassName}>{children}</div>
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
