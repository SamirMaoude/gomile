"use client";

import { useMemo, useState } from "react";

import SimpleBarChart from "@/components/ui/charts/barchart";

import AdminChartDatePicker from "./DateSelector";
import {
  formatDateInputValue,
  formatWeekRangeLabel,
  formatWeekday,
  getCurrentWeekDays,
  parseDateInputValue,
} from "./chart-date-helpers";

type AdminWeeklyBarChartProps = {
  getValueForDay: (date: Date) => number;
  referenceDate?: Date;
  valueLabel?: string;
};

export default function AdminWeeklyBarChart({
  getValueForDay,
  referenceDate,
  valueLabel,
}: AdminWeeklyBarChartProps) {
  const [selectedDate, setSelectedDate] = useState(
    formatDateInputValue(referenceDate),
  );
  const selectedReferenceDate = useMemo(
    () => parseDateInputValue(selectedDate),
    [selectedDate],
  );
  const weekDays = useMemo(
    () => getCurrentWeekDays(selectedReferenceDate),
    [selectedReferenceDate],
  );
  const data = useMemo(() => {
    return weekDays.map((date) => ({
      name: formatWeekday(date),
      value: getValueForDay(date),
    }));
  }, [getValueForDay, weekDays]);

  return (
    <>
      <AdminChartDatePicker
        label="Semaine affichée"
        value={selectedDate}
        onChange={setSelectedDate}
        rangeLabel={formatWeekRangeLabel(weekDays)}
      />
      <SimpleBarChart data={data} valueLabel={valueLabel} />
    </>
  );
}
