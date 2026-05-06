"use client";

import Navbar from "@/components/dashboard/navbar";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import Typography from "@/components/ui/design-system/typography";
import { Navigation } from "@/components/ui/navigation/navigation";

import type { Order, DriverWithOptionalListFields } from "../drivers/AdminFunctions";
import { getAdminDashboardMenuItems } from "../admin-dashboard-menu";
import DeliveriesChart from "../drivers/deliveriesChart";
import DriversTable from "../drivers/DriversTable";
import KycChart from "../drivers/kycChart";
import VehiclesChart from "../drivers/VehiclesChart";

const referenceDate = new Date("2026-04-29T12:00:00");

function dateInCurrentWeek(dayOffset: number, hour: number) {
  const date = new Date("2026-04-27T00:00:00");
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const mockDrivers: DriverWithOptionalListFields[] = [
  {
    userId: "driver-1",
    firstName: "Pierre",
    lastName: "Dubois",
    dateOfBirth: "1992-05-14",
    gender: "MALE",
    address: "Paris Centre",
    status: "approved",
    kycStatus: "APPROVED",
    totalTrips: 342,
    gomileCode: "PD342",
    user: {
      email: "pierre.dubois@mail.com",
      phone: "06 12 34 56 78",
    },
    kycSubmissions: [{ id: "kyc-1", status: "APPROVED", createdAt: "2024-01-15" }],
    createdAt: "2024-01-15",
    deliveryCity: "Paris Centre",
    transportType: "BIKE",
    rating: 4.8,
  },
  {
    userId: "driver-2",
    firstName: "Marie",
    lastName: "Laurent",
    dateOfBirth: "1990-09-03",
    gender: "FEMALE",
    address: "Paris Nord",
    status: "approved",
    kycStatus: "APPROVED",
    totalTrips: 298,
    gomileCode: "ML298",
    user: {
      email: "marie.laurent@mail.com",
      phone: "06 23 45 67 89",
    },
    kycSubmissions: [{ id: "kyc-2", status: "APPROVED", createdAt: "2024-02-03" }],
    createdAt: "2024-02-03",
    deliveryCity: "Paris Nord",
    transportType: "SCOOTER",
    rating: 4.9,
  },
  {
    userId: "driver-3",
    firstName: "Jean",
    lastName: "Kabore",
    dateOfBirth: "1988-11-21",
    gender: "MALE",
    address: "Paris Sud",
    status: "pending",
    kycStatus: "PENDING",
    totalTrips: 128,
    gomileCode: "JK128",
    user: {
      email: "jean.kabore@mail.com",
      phone: "06 34 56 78 90",
    },
    kycSubmissions: [{ id: "kyc-3", status: "PENDING", createdAt: "2024-03-12" }],
    createdAt: "2024-03-12",
    deliveryCity: "Paris Sud",
    transportType: "CAR",
    rating: 4.6,
  },
  {
    userId: "driver-4",
    firstName: "Sophie",
    lastName: "Martin",
    dateOfBirth: "1995-07-08",
    gender: "FEMALE",
    address: "Paris Est",
    status: "denied",
    kycStatus: "REJECTED",
    totalTrips: 76,
    gomileCode: "SM076",
    user: {
      email: "sophie.martin@mail.com",
      phone: "06 45 67 89 01",
    },
    kycSubmissions: [{ id: "kyc-4", status: "REJECTED", createdAt: "2024-03-22" }],
    createdAt: "2024-03-22",
    deliveryCity: "Paris Est",
    transportType: "TRUCK",
    rating: 4.4,
  },
  {
    userId: "driver-5",
    firstName: "Amadou",
    lastName: "Diallo",
    dateOfBirth: "1993-01-18",
    gender: "MALE",
    address: "Boulogne",
    status: "approved",
    kycStatus: "NONE",
    totalTrips: 214,
    gomileCode: "AD214",
    user: {
      email: "amadou.diallo@mail.com",
      phone: "06 56 78 90 12",
    },
    kycSubmissions: [],
    createdAt: "2024-04-04",
    deliveryCity: "Boulogne",
    transportType: "BIKE",
    rating: 4.7,
  },
];

const mockOrders: Order[] = [
  { id: "order-1", createdAt: dateInCurrentWeek(0, 9) },
  { id: "order-2", createdAt: dateInCurrentWeek(0, 15) },
  { id: "order-3", createdAt: dateInCurrentWeek(1, 11) },
  { id: "order-4", createdAt: dateInCurrentWeek(2, 10) },
  { id: "order-5", createdAt: dateInCurrentWeek(2, 14) },
  { id: "order-6", createdAt: dateInCurrentWeek(2, 18) },
  { id: "order-7", createdAt: dateInCurrentWeek(3, 12) },
  { id: "order-8", createdAt: dateInCurrentWeek(4, 8) },
  { id: "order-9", createdAt: dateInCurrentWeek(4, 17) },
  { id: "order-10", createdAt: dateInCurrentWeek(5, 13) },
  { id: "order-11", createdAt: dateInCurrentWeek(6, 19) },
];

export default function AdminDashboardMockPage() {
  const adminMenuItems = getAdminDashboardMenuItems("Test mock");

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation theme="landingpage" />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[19rem] shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:flex lg:flex-col">
          <Navbar
            items={adminMenuItems}
            isDarkMode={false}
            className="grid gap-3"
          />
        </aside>
        <div className="min-w-0 flex-1 px-6 py-10">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6">
              <Typography variant="h1" Component="h1" className="!text-2xl !text-slate-950">
                Dashboard admin - donnees fictives
              </Typography>
              <Typography variant="p" Component="p" className="mt-2 !text-slate-600">
                Page de test sans appel API pour verifier les tableaux et graphiques.
              </Typography>
            </div>

            <div className="mb-8 grid gap-5 lg:grid-cols-3">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <Typography variant="h3" Component="h3" className="mb-4 !text-lg !text-slate-950">
                  Vehicules
                </Typography>
                <VehiclesChart drivers={mockDrivers} />
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <Typography variant="h3" Component="h3" className="mb-4 !text-lg !text-slate-950">
                  KYC
                </Typography>
                <KycChart drivers={mockDrivers} />
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <Typography variant="h3" Component="h3" className="mb-4 !text-lg !text-slate-950">
                  Livraisons semaine
                </Typography>
                <DeliveriesChart orders={mockOrders} referenceDate={referenceDate} />
              </section>
            </div>

            <DriversTable drivers={mockDrivers} />
          </div>
        </div>
      </div>

      <Footerlp />
    </main>
  );
}
