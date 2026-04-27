import type { VerifyEmailStatus } from "./use-verify-email";

export const verifyEmailDescriptionByStatus: Record<
  VerifyEmailStatus,
  string
> = {
  loading: "Patientez pendant la verification de votre compte.",
  success: "Votre lien a ete traite et votre compte peut maintenant etre utilise.",
  error: "Le lien n'a pas pu etre valide.",
};
