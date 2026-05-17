"use client";

import { useCallback } from "react";

import AdminWeeklyBarChart from "@/components/admin/dashboard/WeekleyBarChart";

import {
  getStoresAddedCountByDay,
  type MerchantWithOptionalListFields,
} from "./AdminFunctions";

type StoresAddedChartProps = {
  merchants: MerchantWithOptionalListFields[];
  referenceDate?: Date;
};

export default function StoresAddedChart({
  merchants,
  referenceDate,
}: StoresAddedChartProps) {
  const getValueForDay = useCallback((date: Date) => {
    return getStoresAddedCountByDay(merchants, date);
  }, [merchants]);

  return (
    <AdminWeeklyBarChart
      getValueForDay={getValueForDay}
      referenceDate={referenceDate}
      valueLabel="Commerces"
    />
  );
}
