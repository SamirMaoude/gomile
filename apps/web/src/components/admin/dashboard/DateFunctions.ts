export function formatDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

export function getCurrentWeekDays(referenceDate = new Date()) {
  const currentDay = referenceDate.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(referenceDate);

  monday.setHours(0, 0, 0, 0);
  monday.setDate(referenceDate.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

export function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatWeekRangeLabel(days: Date[]) {
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  if (!firstDay || !lastDay) {
    return "";
  }

  return `${formatShortDate(firstDay)} - ${formatShortDate(lastDay)}`;
}
