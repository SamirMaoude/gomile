import Button from "@/components/ui/design-system/button/button";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import SuccessMessage from "@/components/ui/design-system/messages/successMessage";
import Typography from "@/components/ui/design-system/typography";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import CloseIcon from "@/components/ui/icons/CloseIcon";
import DocumentIcon from "@/components/ui/icons/DocumentIcon";
import type { AdminDriverDetail } from "@/lib/api-admin";

import { formatDate } from "../../AdminFunctions";

export type DocumentDecision = "pending" | "accepted" | "rejected";

type DriverKycDocumentsProps = {
  documents: AdminDriverDetail["driverDocuments"];
  documentDecisions: Record<string, DocumentDecision>;
  finalDecision: boolean;
  finalDecisionError: string | null;
  finalDecisionMessage: string | null;
  isSubmittingFinalDecision: boolean;
  rejectionReason: string;
  onDocumentDecisionChange: (documentId: string, decision: DocumentDecision) => void;
  onFinalKycDecision: (decision: "accepted" | "rejected") => void;
  onRejectionReasonChange: (reason: string) => void;
};

export function getInitialDocumentDecision(
  document: AdminDriverDetail["driverDocuments"][number],
): DocumentDecision {
  if (document.verified) return "accepted";
  if (document.rejectionReason) return "rejected";
  return "pending";
}

function getDecisionLabel(decision: DocumentDecision) {
  if (decision === "accepted") return "Accepte";
  if (decision === "rejected") return "Refuse";
  return "A verifier";
}

export default function DriverKycDocuments({
  documents,
  documentDecisions,
  finalDecision,
  finalDecisionError,
  finalDecisionMessage,
  isSubmittingFinalDecision,
  rejectionReason,
  onDocumentDecisionChange,
  onFinalKycDecision,
  onRejectionReasonChange,
}: DriverKycDocumentsProps) {
  const hasRejectedDocument = Object.values(documentDecisions).some(
    (decision) => decision === "rejected",
  );

  return (
    <section className="admin-driver-detail-panel">
      <div className="admin-driver-detail-section-header">
        <Typography
          variant="h3"
          Component="h2"
          className="admin-driver-detail-panel-title"
        >
          Documents KYC
        </Typography>
        <Typography
          variant="span"
          Component="span"
          weight="bold"
          className="admin-driver-detail-muted"
        >
          Decisions par document non persistees pour l'instant.
        </Typography>
      </div>

      <div className="admin-driver-detail-documents">
        {documents.length > 0 ? (
          documents.map((document) => {
            const decision = documentDecisions[document.id] ?? "pending";

            return (
              <article key={document.id} className="admin-driver-detail-document">
                <div className="admin-driver-detail-document-main">
                  <DocumentIcon className="admin-driver-detail-document-icon" />
                  <div>
                    <Typography
                      variant="span"
                      Component="span"
                      weight="bold"
                      className="admin-driver-detail-document-title"
                    >
                      {document.type}
                    </Typography>
                    <Typography
                      variant="span"
                      Component="span"
                      weight="semibold"
                      className="admin-driver-detail-document-meta"
                    >
                      Ajoute le {formatDate(document.createdAt)}
                    </Typography>
                    {document.rejectionReason ? (
                      <Typography
                        variant="p"
                        Component="p"
                        weight="semibold"
                        className="admin-driver-detail-document-note"
                      >
                        {document.rejectionReason}
                      </Typography>
                    ) : null}
                  </div>
                </div>

                <div className="admin-driver-detail-document-actions">
                  <Typography
                    variant="span"
                    Component="span"
                    weight="bold"
                    className={`admin-driver-detail-decision admin-driver-detail-decision-${decision}`}
                  >
                    {getDecisionLabel(decision)}
                  </Typography>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<DocumentIcon className="admin-driver-detail-button-icon" />}
                    className="admin-driver-detail-review-button admin-driver-detail-review-open"
                    disabled={!document.url}
                    onClick={() =>
                      window.open(document.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    <Typography
                      variant="span"
                      Component="span"
                      weight="bold"
                      className="admin-driver-detail-button-label"
                    >
                      Ouvrir
                    </Typography>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<CheckIcon className="admin-driver-detail-button-icon" />}
                    className="admin-driver-detail-review-button admin-driver-detail-review-accept"
                    onClick={() => onDocumentDecisionChange(document.id, "accepted")}
                  >
                    <Typography
                      variant="span"
                      Component="span"
                      weight="bold"
                      className="admin-driver-detail-button-label"
                    >
                      Accepter
                    </Typography>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<CloseIcon className="admin-driver-detail-button-icon" />}
                    className="admin-driver-detail-review-button admin-driver-detail-review-reject"
                    onClick={() => onDocumentDecisionChange(document.id, "rejected")}
                  >
                    <Typography
                      variant="span"
                      Component="span"
                      weight="bold"
                      className="admin-driver-detail-button-label"
                    >
                      Refuser
                    </Typography>
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <Typography
            variant="p"
            Component="p"
            weight="bold"
            className="admin-driver-detail-muted"
          >
            Aucun document KYC.
          </Typography>
        )}
      </div>

      {documents.length > 0 ? (
        <>
          {hasRejectedDocument ? (
            <label className="admin-driver-detail-rejection-field">
              <Typography
                variant="span"
                Component="span"
                weight="bold"
                className="admin-driver-detail-muted"
              >
                Motif de refus
              </Typography>
              <textarea
                className="admin-driver-detail-rejection-input"
                value={rejectionReason}
                rows={3}
                disabled={isSubmittingFinalDecision}
                placeholder="Precisez le motif de refus du KYC"
                onChange={(event) => onRejectionReasonChange(event.target.value)}
              />
            </label>
          ) : null}

          <div className="admin-driver-detail-final-decision">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<CheckIcon className="admin-driver-detail-button-icon" />}
              className="admin-driver-detail-review-button admin-driver-detail-review-accept"
              disabled={!finalDecision || isSubmittingFinalDecision}
              onClick={() => onFinalKycDecision("accepted")}
            >
              <Typography
                variant="span"
                Component="span"
                weight="bold"
                className="admin-driver-detail-button-label"
              >
                Accept
              </Typography>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<CloseIcon className="admin-driver-detail-button-icon" />}
              className="admin-driver-detail-review-button admin-driver-detail-review-reject"
              disabled={finalDecision || isSubmittingFinalDecision || !hasRejectedDocument}
              onClick={() => onFinalKycDecision("rejected")}
            >
              <Typography
                variant="span"
                Component="span"
                weight="bold"
                className="admin-driver-detail-button-label"
              >
                Reject
              </Typography>
            </Button>
          </div>
        </>
      ) : null}

      {finalDecisionMessage ? (
        <SuccessMessage className="admin-driver-detail-message">
          {finalDecisionMessage}
        </SuccessMessage>
      ) : null}

      {finalDecisionError ? (
        <ErrorMessage className="admin-driver-detail-message">
          {finalDecisionError}
        </ErrorMessage>
      ) : null}
    </section>
  );
}
