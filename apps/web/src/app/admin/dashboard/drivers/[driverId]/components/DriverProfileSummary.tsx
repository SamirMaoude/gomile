import Avatar from "@/components/ui/design-system/avatar";
import Badge from "@/components/ui/design-system/cards/badge";
import Typography from "@/components/ui/design-system/typography";
import AddressIcon from "@/components/ui/icons/AddressIcon";
import MailIcon from "@/components/ui/icons/MailIcon";
import PhoneIcon from "@/components/ui/icons/PhoneIcon";
import type { AdminDriverDetail } from "@/lib/api-admin";

import {
  getDriverEmail,
  getDriverKycStatusLabel,
  getDriverName,
  getDriverPhone,
  getDriverStatusLabel,
  getDriverZone,
} from "../../AdminFunctions";

type DriverProfileSummaryProps = {
  driver: AdminDriverDetail;
};

export default function DriverProfileSummary({ driver }: DriverProfileSummaryProps) {
  const driverName = getDriverName(driver);
  const kycStatusLabel = getDriverKycStatusLabel(driver.kycStatus);

  return (
    <section className="admin-driver-detail-hero">
      <div className="admin-driver-detail-profile">
        <Avatar
          name={driverName}
          size="xl"
          className="admin-driver-detail-avatar"
        />
        <div>
          <Typography
            variant="h1"
            Component="h1"
            className="admin-driver-detail-title"
          >
            {driverName}
          </Typography>
          <div className="admin-driver-detail-meta-grid">
            <Typography
              variant="span"
              Component="span"
              weight="semibold"
              className="admin-driver-detail-icon-text"
            >
              <MailIcon className="admin-driver-detail-meta-icon" />
              {getDriverEmail(driver)}
            </Typography>
            <Typography
              variant="span"
              Component="span"
              weight="semibold"
              className="admin-driver-detail-icon-text"
            >
              <PhoneIcon className="admin-driver-detail-meta-icon" />
              {getDriverPhone(driver)}
            </Typography>
            <Typography
              variant="span"
              Component="span"
              weight="semibold"
              className="admin-driver-detail-icon-text"
            >
              <AddressIcon className="admin-driver-detail-meta-icon" />
              {getDriverZone(driver)}
            </Typography>
          </div>
        </div>
      </div>

      <div className="admin-driver-detail-statuses">
        <Badge
          label={getDriverStatusLabel(driver.status)}
          variant="blue"
          className="admin-driver-detail-chip"
        />
        <Badge
          label={`KYC ${kycStatusLabel}`}
          variant={kycStatusLabel === "Valide" ? "green" : "muted"}
          className="admin-driver-detail-chip"
        />
      </div>
    </section>
  );
}
