"use client";

import Link from "next/link";
import { styles } from "./styles";
import Typography from "@/components/ui/design-system/typography";
import Input from "@/components/ui/design-system/input/input";
import Form from "@/components/ui/design-system/forms/form";
import Button from "@/components/ui/design-system/button/button";
import SuccessMessage from "@/components/ui/design-system/messages/successMessage";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import { CircleQuestionMark, KeyRound } from "lucide-react";
import { Logo } from "@/components/Logo/Logo";
import Background from "@/components/ui/auth/background";
import { useLogin } from "./use-login";
import SocialIcon from "@/components/ui/design-system/socialIcons";

export default function AdminLoginPage() {
  const { error, handleSubmit, isPending, showPassword, success, toggleShowPassword } =
    useLogin();

  return (
    <Background backHref="/">
      <div className={styles.card}>
        <div className={styles.splitCard}>
          <div className={styles.brandPanel}>
            <div className={styles.brandContent}>
              <div className={styles.brandLogoWrapper}>
                <Logo size="lg" />
              </div>

              <Typography
                variant="h2"
                Component="h2"
                theme="white"
                className={styles.brandTitle}
              >
                Connectez-vous à votre espace administrateur GoMile
              </Typography>
            </div>
          </div>

          <div className={styles.formPanel}>
            <div className={styles.header}>
              <Typography
                variant="h1"
                Component="h1"
                className={styles.title}
              >
                Connexion
              </Typography>

              <Typography
                variant="p"
                Component="p"
                theme="black"
                className={styles.loginDescription}
              >
                Accédez a votre espace administrateur.
              </Typography>
            </div>

            <Form onSubmit={handleSubmit} className={styles.form}>
              <Input
                id="client-email"
                name="email"
                type="email"
                placeholder="Adresse e-mail"
                autoComplete="email"
                aria-label="Adresse e-mail"
                leftIcon={<SocialIcon href={""} name={"mail"} />}
                containerClassName={styles.fieldContainer}
                inputWrapperClassName={styles.fieldWrapper}
                className={styles.fieldInput}
              />

              <Input
                id="client-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                autoComplete="current-password"
                aria-label="Mot de passe"
                leftIcon={<KeyRound size={18} />}
                rightElement={
                  <Button
                    type="button"
                    onClick={toggleShowPassword}
                    className={styles.toggleButton}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }>
                    <CircleQuestionMark size={18}/>
                  </Button>
                }
                containerClassName={styles.fieldContainer}
                inputWrapperClassName={styles.fieldWrapper}
                className={styles.fieldInput}
              />

              <div className={styles.forgotRow}>
                <Link
                  href="/merchant/forgot-password"
                  className={styles.forgotLink}
                >
                  <Typography
                    variant="span"
                    Component="span"
                    weight="medium"
                    className={styles.forgotLinkText}
                  >
                    Mot de passe oublie?
                  </Typography>
                </Link>
              </div>

              {error ? (
                <ErrorMessage className={styles.message}>{error}</ErrorMessage>
              ) : null}

              {success ? (
                <SuccessMessage className={styles.message}>
                  {success}
                </SuccessMessage>
              ) : null}

              <Button
                type="submit"
                disabled={isPending}
                fullWidth
                className={styles.submitButton}
              >
                {isPending ? "Connexion..." : "Se connecter"}
              </Button>
            </Form>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <Typography
                variant="span"
                Component="span"
                className={styles.dividerText}
              >
                Ou connectez-vous avec
              </Typography>
              <span className={styles.dividerLine} />
            </div>

            <div className={styles.socialGrid}>
              <Button
                iconOnly={true}
                aria-label="Continuer avec Google"
                className={styles.socialButton}
                >
                <SocialIcon name="mail" href="#"/>
              </Button>

              <Button
                iconOnly={true}
                aria-label="Continuer avec Facebook"
                className={styles.socialButton}>
                <SocialIcon name="facebook" href="#"/>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
