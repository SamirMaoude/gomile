"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import Avatar from "@/components/ui/design-system/avatar";
import Input from "@/components/ui/design-system/input/input";
import DynamicTable, {
  type DynamicTableColumn,
} from "@/components/ui/design-system/table/dynamic-table";
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
import "./DriversTable.css";

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
      cellClassName: "admin-drivers-driver-cell",
      render: (driver) => {
        const currentDriver = driver as DriverWithOptionalListFields;
        const name = getDriverName(currentDriver);

        return (
          <>
            <Avatar name={name} size="sm" />
            <div className="admin-drivers-driver-text">
              <Typography
                variant="span"
                Component="span"
                weight="semibold"
                className="admin-drivers-driver-name"
              >
                {name}
              </Typography>
              <Typography
                variant="span"
                Component="span"
                className="admin-drivers-driver-meta"
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
        <div className="admin-drivers-stack">
          <span className="admin-drivers-icon-text">
            <Mail className="admin-drivers-cell-icon" />
            {getDriverEmail(driver)}
          </span>
          <span className="admin-drivers-icon-text">
            <Phone className="admin-drivers-cell-icon" />
            {getDriverPhone(driver)}
          </span>
        </div>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicule",
      render: (driver) => (
        <span className="admin-drivers-primary-cell">
          {getDriverVehicle(driver as DriverWithOptionalListFields)}
        </span>
      ),
    },
    {
      key: "zone",
      header: "Zone",
      render: (driver) => (
        <span className="admin-drivers-icon-text">
          <MapPin className="admin-drivers-cell-icon" />
          {getDriverZone(driver as DriverWithOptionalListFields)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut activite",
      render: (driver) => (
        <span className="admin-drivers-status-text">
          {getDriverStatusLabel(driver.status)}
        </span>
      ),
    },
    {
      key: "kyc",
      header: "Statut KYC",
      render: (driver) => (
        <span className="admin-drivers-status-text">
          {getDriverKycStatusLabel(driver.kycStatus)}
        </span>
      ),
    },
    {
      key: "deliveries",
      header: "Livraisons",
      render: (driver) => (
        <span className="admin-drivers-metric">{driver.totalTrips}</span>
      ),
    },
    {
      key: "rating",
      header: "Note",
      render: (driver) => {
        const rating = (driver as DriverWithOptionalListFields).rating;

        return (
          <span className="admin-drivers-rating">
            <Star className="admin-drivers-star-icon" />
            {rating ? rating.toFixed(1) : "--"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "admin-drivers-actions-header",
      cellClassName: "admin-drivers-actions-cell",
      render: (driver) => {
        return (
          <button
            type="button"
            className="admin-drivers-details-button"
            onClick={() => router.push(`/admin/dashboard/drivers/${driver.userId}`)}
          >
            <Eye className="admin-drivers-details-icon" />
            Get details
          </button>
        );
      },
    },
  ];

  return (
    <section className="admin-drivers-card">
      <div className="admin-drivers-toolbar">
        <div className="admin-drivers-title-block">
          <Typography variant="h3" Component="h3" className="admin-drivers-title">
            Liste des livreurs
          </Typography>
          <Typography variant="span" Component="span" className="admin-drivers-count">
            ({filteredDrivers.length})
          </Typography>
        </div>

        <div className="admin-drivers-controls">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher..."
            aria-label="Rechercher un livreur"
            leftIcon={<Search className="admin-drivers-search-icon" />}
            containerClassName="admin-drivers-search-container"
            inputWrapperClassName="admin-drivers-search-wrapper"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusOption)}
            className="admin-drivers-select"
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
            className="admin-drivers-select"
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
            className="admin-drivers-select"
            aria-label="Filtrer par vehicule"
          >
            <option value="all">Tous les vehicules</option>
            <option value="bike">Velos</option>
            <option value="scooter">Scooters</option>
            <option value="car">Voitures</option>
            <option value="truck">Camions</option>
            <option value="unknown">Non renseignes</option>
          </select>
        </div>
      </div>

      <div className="admin-drivers-table-overflow">
        {isLoading ? (
          <p className="admin-drivers-feedback">Chargement des livreurs...</p>
        ) : error ? (
          <p className="admin-drivers-error">{error}</p>
        ) : filteredDrivers.length === 0 ? (
          <p className="admin-drivers-feedback">Aucun livreur ne correspond aux filtres.</p>
        ) : (
          <div className="admin-drivers-table-min">
            <DynamicTable
              columns={columns}
              rows={filteredDrivers}
              rowKey={(driver) => driver.userId}
              gridTemplateColumns="1.5fr 1.9fr 1.1fr 1.05fr 1fr 1.05fr 0.8fr 0.7fr 0.9fr"
              headerRowClassName="admin-drivers-table-head"
              bodyClassName="admin-drivers-table-body"
              rowClassName="admin-drivers-table-row"
              rowsPerPageOptions={[5, 10, 20]}
              defaultRowsPerPage={10}
            />
          </div>
        )}
      </div>
    </section>
  );
}
