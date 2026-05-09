import { Star, Wallet } from "lucide-react";

import type { AdminDriverDetail } from "@/lib/api-admin";

import { getDriverVehicle } from "../../AdminFunctions";
import DriverStatCard from "./DriverStatCard";

type DriverStatsGridProps = {
  driver: AdminDriverDetail;
};

function formatMoney(value?: number | null) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value ?? 0);
}

export default function DriverStatsGrid({ driver }: DriverStatsGridProps) {
  return (
    <section className="admin-driver-detail-stats-grid">
      <DriverStatCard
        title="Livraisons"
        driver={driver}
        getValue={(currentDriver) => currentDriver.totalTrips}
      />
      <DriverStatCard
        title="Note"
        driver={driver}
        getValue={(currentDriver) => (
          <span className="admin-driver-detail-rating">
            <Star className="admin-driver-detail-star" />
            {currentDriver.rating !== null ? currentDriver.rating.toFixed(1) : "--"}
          </span>
        )}
      />
      <DriverStatCard
        title="Solde wallet"
        driver={driver}
        getValue={(currentDriver) => (
          <span className="admin-driver-detail-rating">
            <Wallet className="admin-driver-detail-wallet" />
            {formatMoney(currentDriver.wallet?.balance)}
          </span>
        )}
      />
      <DriverStatCard
        title="Vehicule"
        driver={driver}
        getValue={(currentDriver) => getDriverVehicle(currentDriver)}
      />
    </section>
  );
}
