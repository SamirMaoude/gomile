"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AdminEntityTable from "@/components/admin/dashboard/admin-entity-table";
import Avatar from "@/components/ui/design-system/avatar";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";

import type { Driver } from "../admin";
import {
  getDriverEmail,
  getDriverName,
  getDriverPhone,
  getDriverRegistrationDate,
  getDriverKycStatusLabel,
  getDriverStatusLabel,
  getDriverVehicle,
  getDriverZone,
  getFilteredDrivers,
  type DriverWithOptionalListFields,
  type KycOption,
  type StatusOption,
  type VehicleOption,
} from "./AdminFunctions";

type DriversTableProps = {
  drivers: Driver[];
  error?: string | null;
  isLoading?: boolean;
};

export default function DriversTable({
  drivers,
  error = null,
  isLoading = false,
}: DriversTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusOption>("all");
  const [kycFilter, setKycFilter] = useState<KycOption>("all");
  const [vehicleFilter, setVehicleFilter] = useState<VehicleOption>("all");
  const router = useRouter();

  const filteredDrivers = useMemo(() => {
    return getFilteredDrivers(drivers, {
      searchQuery,
      statusFilter,
      kycFilter,
      vehicleFilter,
    });
  }, [drivers, kycFilter, searchQuery, statusFilter, vehicleFilter]);

  const columns: DynamicTableColumn<Driver>[] = [
    {
      key: "driver",
      header: "Livreur",
      cellClassName: "admin-data-table-identity-cell",
      render: (driver) => {
        const currentDriver = driver as DriverWithOptionalListFields;
        const name = getDriverName(currentDriver);

        return (
          <>
            <Avatar name={name} size="sm" />
            <div className="admin-data-table-identity-text">
              <Typography
                variant="span"
                Component="span"
                weight="semibold"
                className="admin-data-table-identity-name"
              >
                {name}
              </Typography>
              <Typography
                variant="span"
                Component="span"
                className="admin-data-table-identity-meta"
              >
                Inscrit le {getDriverRegistrationDate(currentDriver)}
              </Typography>
            </div>
          </>
        );
      },
    },
    {
      key: "contact",
      header: "Contact",
      render: (driver) => (
        <div className="admin-data-table-stack">
          <span className="admin-data-table-icon-text">
            <Mail className="admin-data-table-cell-icon" />
            {getDriverEmail(driver)}
          </span>
          <span className="admin-data-table-icon-text">
            <Phone className="admin-data-table-cell-icon" />
            {getDriverPhone(driver)}
          </span>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicule",
      render: (driver) => (
        <span className="admin-data-table-primary-cell">
          {getDriverVehicle(driver as DriverWithOptionalListFields)}
        </span>
      ),
    },
    {
      key: "zone",
      header: "Zone",
      render: (driver) => (
        <span className="admin-data-table-icon-text">
          <MapPin className="admin-data-table-cell-icon" />
          {getDriverZone(driver as DriverWithOptionalListFields)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut activite",
      render: (driver) => (
        <span className="admin-data-table-status-text">
          {getDriverStatusLabel(driver.status)}
        </span>
      ),
    },
    {
      key: "kyc",
      header: "Statut KYC",
      render: (driver) => (
        <span className="admin-data-table-status-text">
          {getDriverKycStatusLabel(driver.kycStatus)}
        </span>
      ),
    },
    {
      key: "deliveries",
      header: "Livraisons",
      render: (driver) => (
        <span className="admin-data-table-metric">{driver.totalTrips}</span>
      ),
    },
    {
      key: "rating",
      header: "Note",
      render: (driver) => {
        const rating = (driver as DriverWithOptionalListFields).rating;

        return (
          <span className="admin-data-table-rating">
            <Star className="admin-data-table-star-icon" />
            {rating ? rating.toFixed(1) : "--"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "admin-data-table-actions-header",
      cellClassName: "admin-data-table-actions-cell",
      render: (driver) => {
        return (
          <button
            type="button"
            className="admin-data-table-details-button"
            onClick={() => router.push(`/admin/dashboard/drivers/${driver.userId}`)}
          >
            <Eye className="admin-data-table-details-icon" />
            Details
          </button>
        );
      },
    },
  ];

  return (
    <AdminEntityTable
      title="Liste des livreurs"
      rows={filteredDrivers}
      columns={columns}
      rowKey={(driver) => driver.userId}
      gridTemplateColumns="1.5fr 1.9fr 1.1fr 1.05fr 1fr 1.05fr 0.8fr 0.7fr 0.9fr"
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchAriaLabel="Rechercher un livreur"
      error={error}
      isLoading={isLoading}
      loadingMessage="Chargement des livreurs..."
      emptyMessage="Aucun livreur ne correspond aux filtres."
      filters={
        <>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusOption)}
            className="admin-data-table-select"
            aria-label="Filtrer par statut d'activite"
          >
            <option value="all">Tous les statuts activite</option>
            <option value="AVAILABLE">Disponibles</option>
            <option value="BUSY">Occupes</option>
            <option value="OFFLINE">Hors ligne</option>
          </select>

          <select
            value={kycFilter}
            onChange={(event) => setKycFilter(event.target.value as KycOption)}
            className="admin-data-table-select"
            aria-label="Filtrer par statut KYC"
          >
            <option value="all">Tous les statuts KYC</option>
            <option value="ACCEPTED">Validees</option>
            <option value="PENDING">En attente</option>
            <option value="REJECTED">Refusees</option>
            <option value="NOT_SUBMITTED">Non verifiees</option>
          </select>

          <select
            value={vehicleFilter}
            onChange={(event) => setVehicleFilter(event.target.value as VehicleOption)}
            className="admin-data-table-select"
            aria-label="Filtrer par vehicule"
          >
            <option value="all">Tous les vehicules</option>
            <option value="bike">Velos</option>
            <option value="scooter">Scooters</option>
            <option value="car">Voitures</option>
            <option value="truck">Camions</option>
            <option value="unknown">Non renseignes</option>
          </select>
        </>
      }
    />
  );
}
