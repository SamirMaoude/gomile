import type { Driver, DriverStatus, KycStatus } from "../admin";

type DriverChartData = {
  kycStatus: KycStatus;
  transportType?: string | null;
  activeVehicle?: string | null;
};

type RuntimeDriverStatus = DriverStatus | "AVAILABLE" | "BUSY" | "OFFLINE";
type RuntimeKycStatus = KycStatus | "ACCEPTED" | "NOT_SUBMITTED";

export type Order = {
  id: string;
  createdAt: string;
};

export type ChartDataItem = {
  name: string;
  value: number;
};

export type DriverWithOptionalListFields = Driver & {
  createdAt?: string;
  deliveryCity?: string | null;
  transportType?: string | null;
  activeVehicle?: string | null;
  rating?: number | null;
};

export type StatusOption = "all" | RuntimeDriverStatus;
export type KycOption = "all" | RuntimeKycStatus;
export type VehicleOption = "all" | "bike" | "scooter" | "car" | "truck" | "unknown";

type DriverFilters = {
  searchQuery: string;
  statusFilter: StatusOption;
  kycFilter: KycOption;
  vehicleFilter: VehicleOption;
};

const driverStatusLabels: Record<string, string> = {
  approved: "Actif",
  pending: "En attente",
  denied: "Inactif",
  AVAILABLE: "Disponible",
  BUSY: "Occupe",
  OFFLINE: "Hors ligne",
};

const driverKycStatusLabels: Record<string, string> = {
  APPROVED: "Valide",
  ACCEPTED: "Valide",
  PENDING: "En attente",
  REJECTED: "Refuse",
  NONE: "Non verifie",
  NOT_SUBMITTED: "Non verifie",
};

const vehicleLabels: Record<string, string> = {
  BIKE: "Velo",
  SCOOTER: "Scooter",
  CAR: "Voiture",
  TRUCK: "Camion",
};

export function getDriverStatusLabel(status: RuntimeDriverStatus) {
  return driverStatusLabels[status] ?? status;
}

export function getDriverKycStatusLabel(status: RuntimeKycStatus) {
  return driverKycStatusLabels[status] ?? status;
}

export function isDriverKycApproved(status: RuntimeKycStatus) {
  return status === "APPROVED" || status === "ACCEPTED";
}

export function isDriverKycPending(status: RuntimeKycStatus) {
  return status === "PENDING";
}

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isSameMonth(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth()
  );
}

function parseValidDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value?: string) {
  if (!value) {
    return "Non renseigne";
  }

  const date = parseValidDate(value);

  return date ? new Intl.DateTimeFormat("fr-FR").format(date) : value;
}

export function getDriverName(driver: Driver) {
  return `${driver.firstName} ${driver.lastName}`.trim();
}

export function getDriverEmail(driver: Driver) {
  return driver.user.email;
}

export function getDriverPhone(driver: Driver) {
  return driver.user.phone ?? "Non renseigne";
}

export function getDriverVehicle(driver: DriverWithOptionalListFields) {
  const vehicle = driver.activeVehicle ?? driver.transportType;

  return vehicle ? vehicleLabels[vehicle] ?? vehicle : "Non renseigne";
}

export function getDriverZone(driver: DriverWithOptionalListFields) {
  return driver.deliveryCity ?? driver.address ?? "Non renseignee";
}

export function getDriverRegistrationDate(driver: DriverWithOptionalListFields) {
  const kycDate = driver.kycSubmissions[0]?.createdAt;

  return formatDate(driver.createdAt ?? kycDate);
}

export function getVehicleOption(driver: DriverWithOptionalListFields): VehicleOption {
  const vehicle = (driver.activeVehicle ?? driver.transportType ?? "").toLowerCase();

  if (vehicle.includes("bike") || vehicle.includes("velo")) return "bike";
  if (vehicle.includes("scooter")) return "scooter";
  if (vehicle.includes("car") || vehicle.includes("voiture")) return "car";
  if (vehicle.includes("truck") || vehicle.includes("camion")) return "truck";

  return "unknown";
}

export function getFilteredDrivers(
  drivers: Driver[],
  { searchQuery, statusFilter, kycFilter, vehicleFilter }: DriverFilters,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return drivers.filter((driver) => {
    const currentDriver = driver as DriverWithOptionalListFields;
    const searchableText = [
      getDriverName(currentDriver),
      getDriverEmail(currentDriver),
      getDriverPhone(currentDriver),
      getDriverVehicle(currentDriver),
      getDriverZone(currentDriver),
    ].join(" ").toLowerCase();

    return (
      (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
      (statusFilter === "all" || currentDriver.status === statusFilter) &&
      (kycFilter === "all" || currentDriver.kycStatus === kycFilter) &&
      (vehicleFilter === "all" || getVehicleOption(currentDriver) === vehicleFilter)
    );
  });
}

export function getDeliveriesCountByDay(orders: Order[], day: string | Date) {
  const targetDate = typeof day === "string" ? parseValidDate(day) : day;

  if (!targetDate || Number.isNaN(targetDate.getTime())) {
    return 0;
  }

  return orders.filter((order) => {
    const orderDate = parseValidDate(order.createdAt);

    return orderDate ? isSameDay(orderDate, targetDate) : false;
  }).length;
}

export function getDeliveriesCountByMonth(orders: Order[], month: string | Date) {
  const targetDate = typeof month === "string" ? parseValidDate(month) : month;

  if (!targetDate || Number.isNaN(targetDate.getTime())) {
    return 0;
  }

  return orders.filter((order) => {
    const orderDate = parseValidDate(order.createdAt);

    return orderDate ? isSameMonth(orderDate, targetDate) : false;
  }).length;
}

export function getTransportChartData(drivers: DriverChartData[]): ChartDataItem[] {
  const counts = drivers.reduce<Record<string, number>>((countDict, driver) => {
    const vehicle = driver.activeVehicle ?? driver.transportType;
    const label = vehicle ? vehicleLabels[vehicle] ?? vehicle : "Non renseigne";
    countDict[label] = (countDict[label] ?? 0) + 1;
    return countDict;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getKycStatusChartData(drivers: DriverChartData[]): ChartDataItem[] {
  const counts = drivers.reduce<Record<string, number>>((countDict, driver) => {
    const label = driver.kycStatus ? getDriverKycStatusLabel(driver.kycStatus) : "Non verifie";
    countDict[label] = (countDict[label] ?? 0) + 1;
    return countDict;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
