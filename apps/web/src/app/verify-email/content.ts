import type { VerifyEmailStatus } from "./use-verify-email";

export const verifyEmailDescriptionByStatus: Record<
  VerifyEmailStatus,
  string
> = {
  loading: "Patientez pendant la vérification de votre compte.",
  success: "Votre lien a été traité et votre compte peut maintenant être utilisé.",
  error: "Le lien n'a pas pu être validé.",
};
