"use client";

import { useState, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";

import { AdminDashboardChartCard } from "@/components/admin/dashboard/ChartContainer";
import AdminDashboardShell from "@/components/admin/dashboard/admin-dashboard-shell";
import Button from "@/components/ui/design-system/button/button";
import Input from "@/components/ui/design-system/input/input";
import Typography from "@/components/ui/design-system/typography";

import { resendApiKey } from "../admin";

export default function AdminDashboardConflicts() {
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedOrderId = orderId.trim();

    if (!trimmedOrderId) {
      setError("Veuillez renseigner un orderId.");
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await resendApiKey(trimmedOrderId);

      setSuccessMessage(response.message);
      setOrderId("");
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminDashboardShell activeMenuLabel="Conflits">
      <div className="mb-6">
        <Typography variant="h1" Component="h1" className="!text-2xl !text-slate-950">
          Dashboard admin - conflits
        </Typography>
        <Typography variant="p" Component="p" className="mt-2 !text-slate-600">
          Relancez la génération de clé API liée à une commande en conflit.
        </Typography>
      </div>

      <div className="max-w-2xl">
        <AdminDashboardChartCard title="Renvoyer la clé API">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Typography variant="p" Component="p" className="!text-sm !text-slate-600">
              Saisissez l’identifiant de commande concerné.
            </Typography>

            <Input
              id="conflict-order-id"
              label="OrderId"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Ex: order_..."
              autoComplete="off"
              inputWrapperClassName="!rounded-xl !border-slate-300 focus-within:!border-[var(--color-primary-light)]"
              error={error ?? undefined}
            />

            {successMessage ? (
              <Typography
                variant="p"
                Component="p"
                className="!text-sm !font-semibold !text-emerald-700"
              >
                {successMessage}
              </Typography>
            ) : null}

            <Button
              type="submit"
              size="md"
              icon={<RefreshCw size={18} />}
              disabled={isSubmitting}
              className="w-full sm:w-fit"
            >
              {isSubmitting ? "Envoi..." : "Renvoyer"}
            </Button>
          </form>
        </AdminDashboardChartCard>
      </div>
    </AdminDashboardShell>
  );
}
