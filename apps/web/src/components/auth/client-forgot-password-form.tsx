"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-6 w-6"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function ClientForgotPasswordForm() {
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
      className="relative isolate h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(191,217,229,0.14),rgba(255,255,255,0.16))]" />

      <div className="relative z-10 flex h-full items-center justify-center px-4 py-4 sm:px-6 lg:px-10">
        <Link
          href="/client/login"
          className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/70 bg-white/45 px-4 py-2 text-sm font-medium text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur hover:bg-white/60 sm:left-6 sm:top-6"
        >
          Retour a la connexion
        </Link>

        <div
          className="w-full max-w-[24rem] rounded-[2rem] border border-white/80 bg-white/24 p-3 shadow-[0_30px_120px_rgba(15,23,42,0.18)] backdrop-blur-md sm:max-w-[35rem] sm:p-4 lg:max-w-[46rem] lg:p-5"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08)), url('/images/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex min-h-[calc(100vh-2rem)] max-h-[52rem] flex-col items-center justify-center rounded-[1.9rem] border border-white/70 bg-white/10 px-4 py-5 sm:min-h-[calc(100vh-2.5rem)] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            <div className="w-full max-w-[21rem] rounded-[1.8rem] bg-white/96 px-5 py-6 shadow-[0_26px_90px_rgba(24,58,92,0.18)] sm:max-w-[29rem] sm:px-7 sm:py-7 lg:max-w-[34rem] lg:px-10 lg:py-8">
              <div className="flex flex-col items-center">
                <div className="rounded-[1.3rem] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
                  <Image
                    src="/svg/Logo2.svg"
                    alt="Logo GoMile"
                    width={220}
                    height={160}
                    className="h-auto w-[9.8rem] sm:w-[11.5rem] lg:w-[13rem]"
                    priority
                  />
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
                    <MailIcon />
                  </div>
                  <input
                    id="forgot-password-email"
                    name="email"
                    type="email"
                    placeholder="Adresse e-mail"
                    className="h-[3.75rem] w-full rounded-[1.4rem] border-2 border-slate-700/85 bg-white pl-16 pr-5 text-[1.05rem] text-slate-950 outline-none transition placeholder:text-slate-700 focus:border-primary-light focus:ring-4 focus:ring-emerald-100 lg:h-[4.35rem] lg:text-[1.2rem]"
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

                <button
                  type="submit"
                  disabled={isPending}
                  className="h-[3.75rem] w-full rounded-[1.25rem] bg-[linear-gradient(180deg,#a7d84e_0%,#7ebb2b_100%)] px-6 text-[1rem] font-bold uppercase tracking-[0.08em] text-white shadow-[0_18px_40px_rgba(126,187,43,0.34)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_50px_rgba(126,187,43,0.42)] disabled:cursor-not-allowed disabled:opacity-70 lg:h-[4.4rem] lg:text-[1.28rem]"
                >
                  {isPending ? "Envoi..." : "Envoyer le lien"}
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-3 lg:mt-7">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      router.push("/client/login");
                    })
                  }
                  className="inline-flex h-[3.4rem] items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white px-6 text-[0.98rem] font-semibold text-slate-800 shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  Retourner a la connexion
                </button>

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
          </div>
        </div>
      </div>
    </main>
  );
}
