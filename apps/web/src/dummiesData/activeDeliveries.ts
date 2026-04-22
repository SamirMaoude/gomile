export type DeliveryStatus = "En route" | "En retard";

export type DeliveryItem = {
  id: string;
  destination: string;
  status: DeliveryStatus;
  time: string;
  note?: string;
  initials: string;
  avatarClass: string;
};

export const activeDeliveries: DeliveryItem[] = [
  {
    id: "4101",
    destination: "14 rue de l'Opera",
    status: "En route",
    time: "11:30 h",
    initials: "AD",
    avatarClass: "bg-sky-100 text-sky-900",
  },
  {
    id: "4102",
    destination: "8 Pl. de la Bastille",
    status: "En retard",
    time: "11:46 h",
    note: "(etait 11:30)",
    initials: "SM",
    avatarClass: "bg-amber-100 text-amber-900",
  },
  {
    id: "4103",
    destination: "21 avenue Victor Hugo",
    status: "En route",
    time: "12:05 h",
    initials: "LN",
    avatarClass: "bg-emerald-100 text-emerald-900",
  },
];