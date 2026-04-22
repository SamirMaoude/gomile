import type { ForgotPasswordStep } from "./use-forgot-password";

export const forgotPasswordTitleByStep: Record<ForgotPasswordStep, string> = {
  email: "Mot de passe oublie",
  otp: "Verification OTP",
  reset: "Nouveau mot de passe",
  done: "Mot de passe mis a jour",
};

export const forgotPasswordDescriptionByStep: Record<
  ForgotPasswordStep,
  string
> = {
  email: "Saisissez votre adresse email pour recevoir un code OTP.",
  otp: "Entrez le code OTP recu par email pour obtenir le jeton de reinitialisation.",
  reset: "Choisissez votre nouveau mot de passe avec le jeton valide renvoye par Swagger.",
  done: "Votre mot de passe a ete reinitialise. Vous pouvez vous reconnecter.",
};

export const forgotPasswordSubmitLabelByStep: Record<
  Exclude<ForgotPasswordStep, "done">,
  string
> = {
  email: "Envoyer le code",
  otp: "Verifier l'OTP",
  reset: "Reinitialiser",
};
