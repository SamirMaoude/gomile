"use client";

import { useMemo, useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";

import { AdminDashboardChartCard } from "@/components/admin/dashboard/ChartContainer";
import AdminDashboardShell from "@/components/admin/dashboard/admin-dashboard-shell";
import Button from "@/components/ui/design-system/button/button";
import Input from "@/components/ui/design-system/input/input";
import Typography from "@/components/ui/design-system/typography";
import {
  APP_GENDERS,
  APP_VEHICLE_TYPES,
  type Gender,
  type VehicleType,
} from "@/lib/auth-client";

import {
  createAdminAccount,
  createDriverAccount,
  createMerchantAccount,
} from "../admin";

type MemberType = "merchant" | "driver" | "admin";
type FieldType = "date" | "email" | "number" | "password" | "tel" | "text" | "url";

type FieldConfig = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
};

const memberTypeLabels: Record<MemberType, string> = {
  merchant: "Commerçant",
  driver: "Livreur",
  admin: "Admin",
};

const baseCredentialsFields: FieldConfig[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "membre@gomile.fr",
    required: true,
  },
  {
    name: "password",
    label: "Mot de passe",
    type: "password",
    placeholder: "8 caractères minimum",
    required: true,
  },
];

const fieldsByMemberType: Record<MemberType, FieldConfig[]> = {
  merchant: [
    {
      name: "name",
      label: "Nom du commerce",
      placeholder: "Restaurant Soleil",
      required: true,
    },
    ...baseCredentialsFields,
    {
      name: "phone",
      label: "Téléphone",
      type: "tel",
      placeholder: "06 12 34 56 78",
    },
  ],
  driver: [
    { name: "firstName", label: "Prénom", placeholder: "Awa", required: true },
    { name: "lastName", label: "Nom", placeholder: "Diallo", required: true },
    ...baseCredentialsFields,
    {
      name: "phone",
      label: "Téléphone",
      type: "tel",
      placeholder: "06 12 34 56 78",
      required: true,
    },
    {
      name: "dateOfBirth",
      label: "Date de naissance",
      type: "date",
      placeholder: "1995-05-17",
      required: true,
    },
    {
      name: "address",
      label: "Adresse",
      placeholder: "22 boulevard Clemenceau, 38000 Grenoble",
      required: true,
    },
    {
      name: "deliveryCity",
      label: "Ville de livraison",
      placeholder: "Paris",
      required: true,
    },
    {
      name: "deliveryRadius",
      label: "Rayon de livraison (km)",
      type: "number",
      placeholder: "8",
      required: true,
    },
    {
      name: "avatarUrl",
      label: "URL avatar",
      type: "url",
      placeholder: "https://example.com/avatar.jpg",
      required: true,
    },
  ],
  admin: baseCredentialsFields,
};

function getFormValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function validatePassword(password: string) {
  return password.length >= 8;
}

export default function AdminDashboardAddMember() {
  const [memberType, setMemberType] = useState<MemberType>("merchant");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fields = useMemo(() => fieldsByMemberType[memberType], [memberType]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = getFormValue(formData, "email");
    const password = String(formData.get("password") ?? "");
    const missingField = fields.find((field) => {
      return field.required && !getFormValue(formData, field.name);
    });

    setError(null);
    setSuccessMessage(null);

    if (missingField) {
      setError(`Veuillez renseigner le champ "${missingField.label}".`);
      return;
    }

    if (!validatePassword(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    const deliveryRadius = Number(getFormValue(formData, "deliveryRadius"));

    if (memberType === "driver" && (!Number.isInteger(deliveryRadius) || deliveryRadius < 1)) {
      setError("Le rayon de livraison doit être un nombre entier supérieur ou égal à 1.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (memberType === "merchant") {
        const phone = getFormValue(formData, "phone");
        const response = await createMerchantAccount({
          email,
          password,
          name: getFormValue(formData, "name"),
          ...(phone ? { phone } : {}),
        });

        setSuccessMessage(response.message);
      }

      if (memberType === "driver") {
        const response = await createDriverAccount({
          email,
          password,
          firstName: getFormValue(formData, "firstName"),
          lastName: getFormValue(formData, "lastName"),
          phone: getFormValue(formData, "phone"),
          gender: getFormValue(formData, "gender") as Gender,
          dateOfBirth: getFormValue(formData, "dateOfBirth"),
          address: getFormValue(formData, "address"),
          deliveryCity: getFormValue(formData, "deliveryCity"),
          deliveryRadius,
          transportType: getFormValue(formData, "transportType") as VehicleType,
          avatarUrl: getFormValue(formData, "avatarUrl"),
        });

        setSuccessMessage(response.message);
      }

      if (memberType === "admin") {
        const response = await createAdminAccount({ email, password });

        setSuccessMessage(response.message);
      }

      form.reset();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminDashboardShell activeMenuLabel="Ajouter un membre">
      <div className="mb-6">
        <Typography variant="h1" Component="h1" className="!text-2xl !text-slate-950">
          Dashboard admin - ajouter un membre
        </Typography>
        <Typography variant="p" Component="p" className="mt-2 !text-slate-600">
          Créez un compte commerçant, livreur ou administrateur depuis un seul formulaire.
        </Typography>
      </div>

      <div className="max-w-3xl">
        <AdminDashboardChartCard title="Nouveau membre">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <Typography
                variant="span"
                Component="span"
                className="!text-sm !font-semibold !text-slate-700"
              >
                Type de membre
              </Typography>
              <select
                name="memberType"
                value={memberType}
                onChange={(event) => {
                  setMemberType(event.target.value as MemberType);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="admin-data-table-select h-12"
              >
                <option value="merchant">Commerçant</option>
                <option value="driver">Livreur</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <Input
                  key={`${memberType}-${field.name}`}
                  name={field.name}
                  label={field.label}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  required={field.required}
                  inputWrapperClassName="!rounded-xl !border-slate-300 focus-within:!border-[var(--color-primary-light)]"
                />
              ))}

              {memberType === "driver" ? (
                <>
                  <label className="grid gap-2">
                    <Typography
                      variant="span"
                      Component="span"
                      className="!text-sm !font-semibold !text-slate-700"
                    >
                      Genre
                    </Typography>
                    <select
                      name="gender"
                      defaultValue="UNDEFINED"
                      className="admin-data-table-select h-12"
                      required
                    >
                      {APP_GENDERS.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <Typography
                      variant="span"
                      Component="span"
                      className="!text-sm !font-semibold !text-slate-700"
                    >
                      Moyen de transport
                    </Typography>
                    <select
                      name="transportType"
                      defaultValue="BIKE"
                      className="admin-data-table-select h-12"
                      required
                    >
                      {APP_VEHICLE_TYPES.map((vehicleType) => (
                        <option key={vehicleType} value={vehicleType}>
                          {vehicleType}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              ) : null}
            </div>

            {error ? (
              <Typography variant="p" Component="p" className="!text-sm !font-semibold !text-rose-600">
                {error}
              </Typography>
            ) : null}

            {successMessage ? (
              <Typography variant="p" Component="p" className="!text-sm !font-semibold !text-emerald-700">
                {successMessage}
              </Typography>
            ) : null}

            <Button
              type="submit"
              size="md"
              icon={<UserPlus size={18} />}
              disabled={isSubmitting}
              className="w-full sm:w-fit"
            >
              {isSubmitting
                ? "Création..."
                : `Ajouter ${memberTypeLabels[memberType].toLowerCase()}`}
            </Button>
          </form>
        </AdminDashboardChartCard>
      </div>
    </AdminDashboardShell>
  );
}
