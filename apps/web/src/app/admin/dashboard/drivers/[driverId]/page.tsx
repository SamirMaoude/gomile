"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/dashboard/navbar";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import { Navigation } from "@/components/ui/navigation/navigation";
import {
  approveDriverKyc,
  rejectDriverKyc,
  type AdminDriverDetail,
} from "@/lib/api-admin";

import { getAdminDashboardMenuItems } from "../../admin-dashboard-menu";
import { getDriver } from "../../admin";
import DriverAdditionalInfo from "./components/DriverAdditionalInfo";
import DriverDeliveriesChart from "./components/DriverDeliveriesChart";
import DriverKycDocuments, {
  getInitialDocumentDecision,
  type DocumentDecision,
} from "./components/DriverKycDocuments";
import DriverKycHistory from "./components/DriverKycHistory";
import DriverProfileSummary from "./components/DriverProfileSummary";
import DriverStatsGrid from "./components/DriverStatsGrid";
import "../DriverDetail.css";

export default function AdminDriverDetailPage() {
  const params = useParams<{ driverId: string }>();
  const router = useRouter();
  const adminMenuItems = getAdminDashboardMenuItems("Livreurs");
  const [driver, setDriver] = useState<AdminDriverDetail | null>(null);
  const [documentDecisions, setDocumentDecisions] = useState<Record<string, DocumentDecision>>({});
  const [error, setError] = useState<string | null>(null);
  const [finalDecisionError, setFinalDecisionError] = useState<string | null>(null);
  const [finalDecisionMessage, setFinalDecisionMessage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingFinalDecision, setIsSubmittingFinalDecision] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const decisions = Object.values(documentDecisions);

  const finalDecision =
    decisions.length > 0 && decisions.every((decision) => decision === "accepted");

  useEffect(() => {
    getDriver(params.driverId)
      .then((driver) => {
        setDriver(driver);
        setDocumentDecisions(
          Object.fromEntries(
            driver.driverDocuments.map((document) => [
              document.id,
              getInitialDocumentDecision(document),
            ]),
          ),
        );
      })
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erreur");
      })
      .finally(() => setIsLoading(false));
  }, [params.driverId]);

  function handleDocumentDecisionChange(documentId: string, decision: DocumentDecision,){
    setFinalDecisionError(null);
    setFinalDecisionMessage(null);
    setDocumentDecisions((currentDecisions) => ({
      ...currentDecisions,
      [documentId]: decision,
    }))
  }

  async function handleFinalKycDecision(decision: "accepted" | "rejected") {
    if (!driver) return;

    if (decision === "rejected" && !rejectionReason.trim()) {
      setFinalDecisionError("Veuillez preciser le motif de refus.");
      return;
    }

    setIsSubmittingFinalDecision(true);
    setFinalDecisionError(null);
    setFinalDecisionMessage(null);

    try {
      const response =
        decision === "accepted"
          ? await approveDriverKyc(driver.userId)
          : await rejectDriverKyc(driver.userId, {
              rejectionReason: rejectionReason.trim(),
            });
      const refreshedDriver = await getDriver(driver.userId);

      setDriver(refreshedDriver);
      setDocumentDecisions(
        Object.fromEntries(
          refreshedDriver.driverDocuments.map((document) => [
            document.id,
            getInitialDocumentDecision(document),
          ]),
        ),
      );
      setRejectionReason("");
      setFinalDecisionMessage(response.message);
    } catch (submitError: unknown) {
      setFinalDecisionError(
        submitError instanceof Error ? submitError.message : "Erreur",
      );
    } finally {
      setIsSubmittingFinalDecision(false);
    }
  }

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
            <button
              type="button"
              className="admin-driver-detail-back-button"
              onClick={() => router.push("/admin/dashboard/drivers")}
            >
              <ArrowLeft className="admin-driver-detail-button-icon" />
              Retour aux livreurs
            </button>

            {isLoading ? (
              <p className="admin-driver-detail-feedback">Chargement du livreur...</p>
            ) : error ? (
              <p className="admin-driver-detail-error">{error}</p>
            ) : driver ? (
              <>
                <DriverProfileSummary driver={driver} />
                <DriverStatsGrid driver={driver} />

                <DriverDeliveriesChart driverId={driver.userId} />

                <section className="admin-driver-detail-info-grid">
                  <DriverAdditionalInfo driver={driver} />
                  <DriverKycHistory submissions={driver.kycSubmissions} />
                </section>


                <DriverKycDocuments
                  documents={driver.driverDocuments}
                  documentDecisions={documentDecisions}
                  finalDecision={finalDecision}
                  finalDecisionError={finalDecisionError}
                  finalDecisionMessage={finalDecisionMessage}
                  isSubmittingFinalDecision={isSubmittingFinalDecision}
                  rejectionReason={rejectionReason}
                  onDocumentDecisionChange={handleDocumentDecisionChange}
                  onFinalKycDecision={handleFinalKycDecision}
                  onRejectionReasonChange={setRejectionReason}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <Footerlp />
    </main>
  );
}
