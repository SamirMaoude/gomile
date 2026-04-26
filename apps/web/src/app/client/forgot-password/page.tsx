"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Container from "@/components/ui/elements/container";
import MailIcon from "@/components/ui/icons/MailIcon";
import { Logo } from "@/components/Logo/Logo";
import Button from "@/components/ui/design-system/button/button";
import Input from "@/components/ui/design-system/input/input";


const backLinkClassName =
  "absolute left-4 top-4 inline-flex items-center rounded-full border border-white/70 bg-white/45 px-4 py-2 text-sm font-medium text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur hover:bg-white/60 sm:left-6 sm:top-6";
const styleMainForgotPassword = "relative isolate min-h-screen overflow-hidden bg-cover bg-center"
export default function ClientForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      setError("Renseignez votre adresse e-mail.");
      return;
    }
    setSuccess(
      "Si un compte existe avec cette adresse, un lien de reinitialisation sera envoye.",
    );
  }

  return (
    <main
      className = {styleMainForgotPassword}
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(191,217,229,0.14),rgba(255,255,255,0.16))]" />

      <Container
        fullwidth
        className="relative z-10 flex min-h-screen items-center justify-center py-4"
      >
        <Link href="/client/login" className={backLinkClassName}>
          Retour a la connexion
        </Link>

        <div className="w-full max-w-[21rem] rounded-[1.8rem] bg-white/96 px-5 py-6 shadow-[0_26px_90px_rgba(24,58,92,0.18)] sm:max-w-[29rem] sm:px-7 sm:py-7 lg:max-w-[34rem] lg:px-10 lg:py-8">
          <div className="flex flex-col items-center">
            <div className="rounded-[1.3rem] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
              <Logo size="lg" />
            </div>

            <h1 className="mt-5 text-center font-display text-[1.95rem] font-bold leading-[1.08] text-slate-950 sm:text-[2.45rem] lg:mt-6 lg:text-[2.9rem]">
              Mot de passe
              <span className="block">oublie ?</span>
            </h1>

            <p className="mt-4 max-w-md text-center text-[1rem] leading-7 text-slate-600 lg:text-[1.08rem]">
              Saisissez votre adresse e-mail pour recevoir un lien de
              reinitialisation.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-4 lg:mt-7 lg:space-y-5"
          >
            <div className="relative">
              <label htmlFor="forgot-password-email" className="sr-only">
                Adresse e-mail
              </label>

              <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-700">
                <MailIcon className="h-6 w-6" />
              </div>

              <Input
  label="Adresse e-mail"
  name="email"
  type="email"
  placeholder="Adresse e-mail"
  leftIcon={<MailIcon className="h-6 w-6" />}
/>
            </div>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isPending}
              fullWidth
              variant="ghost"
              className="h-[3.75rem] rounded-[1.25rem] border-0 bg-[linear-gradient(180deg,#a7d84e_0%,#7ebb2b_100%)] px-6 text-[1rem] font-bold uppercase tracking-[0.08em] text-white shadow-[0_18px_40px_rgba(126,187,43,0.34)] hover:-translate-y-[1px] hover:bg-[linear-gradient(180deg,#a7d84e_0%,#7ebb2b_100%)] hover:shadow-[0_22px_50px_rgba(126,187,43,0.42)] disabled:cursor-not-allowed disabled:opacity-70 lg:h-[4.4rem] lg:text-[1.28rem]"
            >
              {isPending ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 lg:mt-7">
            <Button
              type="button"
              onClick={() =>
                startTransition(() => {
                  router.push("/client/login");
                })
              }
              variant="ghost"
              className="h-[3.4rem] rounded-[1.2rem] border border-slate-200 bg-white px-6 font-sans text-[0.98rem] font-semibold normal-case tracking-normal text-slate-800 shadow-[0_12px_24px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            >
              Retourner a la connexion
            </Button>

            <p className="text-center text-[1rem] text-slate-700 lg:text-[1.08rem]">
              Vous vous souvenez de votre mot de passe ?{" "}
              <Link
                href="/client/login"
                className="font-semibold text-sky-800 transition hover:text-sky-950"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}