"use client";

import PieChartWithCustomizedLabel from "@/components/ui/charts/piechart";

import { getMerchantSubscriptionChartData, type MerchantWithOptionalListFields } from "./AdminFunctions";

type SubscriptionChartProps = {
  merchants: MerchantWithOptionalListFields[];
};

export default function SubscriptionChart({ merchants }: SubscriptionChartProps) {
  const data = getMerchantSubscriptionChartData(merchants);

  return <PieChartWithCustomizedLabel data={data} />;
}
