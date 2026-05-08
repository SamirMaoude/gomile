export type IncidentState = "EN COURS" | "ANNULE";

export type IncidentItem = {
  id: string;
  type: string;
  description: string;
  state: IncidentState;
};

export const incidents: IncidentItem[] = [
  {
    id: "4102",
    type: "Retard planifié",
    description: "Préparation plus longue que prévu côté commerçant.",
    state: "EN COURS",
  },
  {
    id: "4099",
    type: "Livraison annulée",
    description: "Produit indisponible avant récupération de la commande.",
    state: "ANNULE",
  },
];
