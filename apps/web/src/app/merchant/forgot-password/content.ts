import type { ForgotPasswordStep } from "./use-forgot-password";

export const forgotPasswordTitleByStep: Record<ForgotPasswordStep, string> = {
  email: "Mot de passe oublié",
  otp: "Vérification OTP",
  reset: "Nouveau mot de passe",
  done: "Mot de passe mis à jour",
};

export const forgotPasswordDescriptionByStep: Record<
  ForgotPasswordStep,
  string
> = {
  email: "Saisissez votre adresse e-mail.",
  otp: "Entrez le code OTP reçu par e-mail.",
  reset: "Choisissez votre nouveau mot de passe.",
  done: "Votre mot de passe a été réinitialisé. Vous pouvez vous reconnecter.",
};

export const forgotPasswordSubmitLabelByStep: Record<
  Exclude<ForgotPasswordStep, "done">,
  string
> = {
  email: "Envoyer le code",
  otp: "Vérifier l'OTP",
  reset: "Réinitialiser",
};
