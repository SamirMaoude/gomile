import type { Metadata } from "next";

import ClientForgotPasswordForm from "@/components/auth/client-forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublie | GoMile",
  description: "Interface client de reinitialisation du mot de passe.",
};

export default function ClientForgotPasswordPage() {
  return <ClientForgotPasswordForm />;
}
