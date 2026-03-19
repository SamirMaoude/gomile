import type { Metadata } from "next";

import ClientLoginForm from "@/components/auth/client-login-form";

export const metadata: Metadata = {
  title: "Connexion client | GoMile",
  description: "Interface de connexion dediee aux clients GoMile.",
};

export default function ClientLoginPage() {
  return <ClientLoginForm />;
}
