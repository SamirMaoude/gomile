"use client";

import PieChartWithCustomizedLabel from "@/components/ui/charts/piechart";

import { getMerchantStoresCountChartData, type MerchantWithOptionalListFields } from "./AdminFunctions";

type StoresCountChartProps = {
  merchants: MerchantWithOptionalListFields[];
};

export default function StoresCountChart({ merchants }: StoresCountChartProps) {
  const data = getMerchantStoresCountChartData(merchants);

  return <PieChartWithCustomizedLabel data={data} />;
}
