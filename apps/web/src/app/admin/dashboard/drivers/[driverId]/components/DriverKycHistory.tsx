import Typography from "@/components/ui/design-system/typography";
import Badge from "@/components/ui/design-system/cards/badge";
import type { AdminDriverDetail } from "@/lib/api-admin";

import {
  formatDate,
  getDriverKycStatusLabel,
} from "../../AdminFunctions";

type DriverKycHistoryProps = {
  submissions: AdminDriverDetail["kycSubmissions"];
};

export default function DriverKycHistory({ submissions }: DriverKycHistoryProps) {
  return (
    <article className="admin-driver-detail-panel">
      <Typography
        variant="h3"
        Component="h2"
        className="admin-driver-detail-panel-title"
      >
        Historique KYC
      </Typography>
      <div className="admin-driver-detail-kyc-history">
        {submissions.length > 0 ? (
          submissions.map((submission) => (
            <div key={submission.id} className="admin-driver-detail-kyc-submission">
              <Badge
                label={getDriverKycStatusLabel(submission.status)}
                variant={
                  getDriverKycStatusLabel(submission.status) === "Valide"
                    ? "green"
                    : "muted"
                }
                className="admin-driver-detail-kyc-badge"
              />
              <Typography
                variant="span"
                Component="span"
                weight="semibold"
                className="admin-driver-detail-kyc-submission-date"
              >
                {formatDate(submission.createdAt)}
              </Typography>
              {submission.rejectionReason ? (
                <Typography
                  variant="p"
                  Component="p"
                  weight="semibold"
                >
                  {submission.rejectionReason}
                </Typography>
              ) : null}
            </div>
          ))
        ) : (
          <Typography
            variant="p"
            Component="p"
            weight="bold"
            className="admin-driver-detail-muted"
          >
            Aucune soumission KYC.
          </Typography>
        )}
      </div>
    </article>
  );
}
