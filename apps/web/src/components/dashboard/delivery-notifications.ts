import type { MerchantNotificationItem } from "@/components/dashboard/dashboard-overview.model";

export type DeliveryNotificationGroup = {
  items: MerchantNotificationItem[];
  title: string;
};

const GROUP_TITLES = [
  "Aujourd'hui",
  "Hier",
  "Semaine dernière",
  "Mois dernier",
  "Plus ancien",
] as const;

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysSinceEvent(timestamp: string, now: Date) {
  const eventDate = getStartOfDay(new Date(timestamp));
  const today = getStartOfDay(now);

  return Math.floor((today.getTime() - eventDate.getTime()) / 86_400_000);
}

function getGroupTitle(timestamp: string, now: Date) {
  const daysSinceEvent = getDaysSinceEvent(timestamp, now);

  if (daysSinceEvent <= 0) {
    return "Aujourd'hui";
  }

  if (daysSinceEvent === 1) {
    return "Hier";
  }

  if (daysSinceEvent <= 7) {
    return "Semaine dernière";
  }

  if (daysSinceEvent <= 30) {
    return "Mois dernier";
  }

  return "Plus ancien";
}

export function groupDeliveryNotifications(
  notifications: MerchantNotificationItem[],
  now = new Date(),
): DeliveryNotificationGroup[] {
  const groups = new Map<string, MerchantNotificationItem[]>(
    GROUP_TITLES.map((title) => [title, []]),
  );

  notifications.forEach((notification) => {
    const title = getGroupTitle(notification.timestamp, now);
    groups.get(title)?.push(notification);
  });

  return GROUP_TITLES.map((title) => ({
    title,
    items: groups.get(title) ?? [],
  })).filter((group) => group.items.length > 0);
}
