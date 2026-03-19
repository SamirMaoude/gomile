"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { login, logout } from "@/lib/auth-client";

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

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-6 w-6"
    >
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      <path d="M12 14.5v3" />
    </svg>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-6 w-6"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="h-6 w-6"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.7a2.2 2.2 0 0 0 2.7 2.7" />
      <path d="M9.9 5.3A11.5 11.5 0 0 1 12 5c6.5 0 10 7 10 7a16.3 16.3 0 0 1-4 4.8" />
      <path d="M6.2 6.3C3.6 8 2 12 2 12s3.5 7 10 7c1.5 0 2.8-.3 4-.8" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.7 14.6 3 12 3a9 9 0 1 0 0 18c5.2 0 8.7-3.7 8.7-8.9 0-.6-.1-1.1-.2-1.9H12Z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.7 7 10c.8-2.3 2.9-4 5-4 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.7 14.6 3 12 3 8.5 3 5.4 5 3.9 7.7Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21c2.5 0 4.6-.8 6.1-2.3l-2.8-2.2c-.8.5-1.8.9-3.3.9-3.7 0-5-2.6-5.3-3.8l-3 .2A9 9 0 0 0 12 21Z"
      />
      <path
        fill="#4285F4"
        d="M3.7 13.8a9 9 0 0 1 .2-6.1L7 10c-.2.6-.3 1.2-.3 2s.1 1.4.3 2l-3.1 2.4A8.8 8.8 0 0 1 3.7 13.8Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.3 20v-6h2l.3-2.4h-2.3V10c0-.7.2-1.2 1.2-1.2H16V6.6c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2v1.8H9.1V14h2.1v6h2.1Z"
      />
    </svg>
  );
}

function CustomerField({
  id,
  name,
  type,
  placeholder,
  icon,
  trailing,
}: {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-700">
        {icon}
      </div>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-[3.75rem] w-full rounded-[1.4rem] border-2 border-slate-700/85 bg-white pl-16 pr-16 text-[1.05rem] text-slate-950 outline-none transition placeholder:text-slate-700 focus:border-primary-light focus:ring-4 focus:ring-emerald-100 lg:h-[4.35rem] lg:text-[1.2rem]"
      />
      {trailing ? (
        <div className="absolute inset-y-0 right-4 flex items-center text-slate-700">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

export default function ClientLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function buildUsername(email: string) {
    const base = email.split("@")[0]?.trim() ?? "";

    const formatted = base
      .replace(/[._-]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return formatted || email;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Renseignez votre adresse e-mail et votre mot de passe.");
      return;
    }

    try {
      const session = await login({ email, password });

      if (session.user.role !== "MERCHANT" && session.user.role !== "ADMIN" ) {
        await logout();
        setError("Ce compte n'est pas un compte client.");
        return;
      }

      window.localStorage.setItem("username", buildUsername(email));

      setSuccess("Connexion reussie. Redirection vers votre dashboard...");

      startTransition(() => {
        router.replace("/client/dashboard");
        router.refresh();
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Connexion impossible pour le moment.",
      );
    }
  }

  return (
    <main
      className="relative isolate h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(191,217,229,0.14),rgba(255,255,255,0.16))]" />

      <div className="relative z-10 flex h-full items-center justify-center px-4 py-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/70 bg-white/45 px-4 py-2 text-sm font-medium text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur hover:bg-white/60 sm:left-6 sm:top-6"
        >
          Retour a l'accueil
        </Link>

        <div
          className="w-full max-w-[24rem] rounded-[2rem] border border-white/80 bg-white/24 p-3 shadow-[0_30px_120px_rgba(15,23,42,0.18)] backdrop-blur-md sm:max-w-[35rem] sm:p-4 lg:max-w-[50rem] lg:p-5"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08)), url('/images/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex min-h-[calc(100vh-2rem)] max-h-[54rem] flex-col items-center justify-center rounded-[1.9rem] border border-white/70 bg-white/10 px-4 py-5 sm:min-h-[calc(100vh-2.5rem)] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            <div className="w-full max-w-[21rem] rounded-[1.8rem] bg-white/96 px-5 py-6 shadow-[0_26px_90px_rgba(24,58,92,0.18)] sm:max-w-[29rem] sm:px-7 sm:py-7 lg:max-w-[39rem] lg:px-10 lg:py-8">
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

                <h1 className="mt-5 text-center font-display text-[2rem] font-bold leading-[1.08] text-slate-950 sm:text-[2.55rem] lg:mt-6 lg:text-[3rem]">
                  Connectez-vous
                  <span className="block">a GoMile</span>
                </h1>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4 lg:mt-7 lg:space-y-5"
              >
                <CustomerField
                  id="client-email"
                  name="email"
                  type="email"
                  placeholder="Adresse e-mail"
                  icon={<MailIcon />}
                />

                <CustomerField
                  id="client-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  icon={<LockIcon />}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="rounded-full p-2 transition hover:bg-slate-100"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  }
                />

                <div className="pt-1 text-right">
                  <Link
                    href="/client/forgot-password"
                    className="text-[1rem] font-medium text-sky-800 transition hover:text-sky-950 lg:text-[1.1rem]"
                  >
                    Mot de passe oublie?
                  </Link>
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
                  {isPending ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-4 text-sm text-slate-500 sm:text-base lg:mt-7">
                <span className="h-px flex-1 bg-slate-200" />
                <span>Ou connectez-vous avec</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-4 lg:mt-6">
                <button
                  type="button"
                  className="flex h-[3.75rem] items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
                  aria-label="Continuer avec Google"
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  className="flex h-[3.75rem] items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300"
                  aria-label="Continuer avec Facebook"
                >
                  <FacebookIcon />
                </button>
              </div>

              <p className="mt-6 text-center text-[1rem] text-slate-800 lg:mt-7 lg:text-[1.12rem]">
                Pas encore de compte?{" "}
                <a
                  href="#"
                  className="font-semibold text-sky-800 transition hover:text-sky-950"
                >
                  S'inscrire
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
