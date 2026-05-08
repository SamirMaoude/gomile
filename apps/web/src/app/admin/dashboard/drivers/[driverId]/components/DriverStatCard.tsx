import type { ReactNode } from "react";

import type { AdminDriverDetail } from "@/lib/api-admin";

type DriverStatCardProps = {
  title: string;
  driver: AdminDriverDetail;
  getValue: (driver: AdminDriverDetail) => ReactNode;
};

export default function DriverStatCard({
  title,
  driver,
  getValue,
}: DriverStatCardProps) {
  return (
    <article className="admin-driver-detail-stat">
      <span className="admin-driver-detail-stat-label">{title}</span>
      <strong>{getValue(driver)}</strong>
    </article>
  );
}
