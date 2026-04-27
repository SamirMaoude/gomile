"use client";

import Link from "next/link";
import Background from "@/components/ui/auth/background";
import Typography from "@/components/ui/design-system/typography";
import Input from "@/components/ui/design-system/input/input";
import Form from "@/components/ui/design-system/forms/form";
import ButtonIcon from "@/components/ui/icons/ButtonIcon";
import MailIcon from "@/components/ui/icons/MailIcon";
import PasswordKeyIcon from "@/components/ui/icons/passwordKeyIcon";
import DeadEyeIcon from "@/components/ui/icons/DeadEyeIcon";
import UserIcon from "@/components/ui/icons/UserIcon";
import Button from "@/components/ui/design-system/button/button";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import { Logo } from "@/components/Logo/Logo";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { styles } from "../login/styles";
import { useRegister } from "./use-register";

export default function MerchantRegisterPage() {
  const {
    error,
    handlePhoneChange,
    handleSubmit,
    isPending,
    phone,
    showPassword,
    toggleShowPassword,
  } = useRegister();

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
                Creez votre espace

                <Typography
                  variant="h6"
                  Component="span"
                  theme="white"
                  className={styles.brandTitleBreak}
                >
                  marchand GoMile
                </Typography>
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
                Inscription
              </Typography>

              <Typography
                variant="p"
                Component="p"
                theme="body"
                className={styles.loginDescription}
              >
                Creez votre compte marchand.
              </Typography>
            </div>

            <Form onSubmit={handleSubmit} className={styles.form}>
              <Input
                id="merchant-name"
                name="name"
                type="text"
                placeholder="Nom du commerce"
                autoComplete="organization"
                aria-label="Nom du commerce"
                leftIcon={<UserIcon className={styles.fieldIcon} />}
                containerClassName={styles.fieldContainer}
                inputWrapperClassName={styles.fieldWrapper}
                className={styles.fieldInput}
              />

              <Input
                id="merchant-email"
                name="email"
                type="email"
                placeholder="Adresse e-mail"
                autoComplete="email"
                aria-label="Adresse e-mail"
                leftIcon={<MailIcon className={styles.fieldIcon} />}
                containerClassName={styles.fieldContainer}
                inputWrapperClassName={styles.fieldWrapper}
                className={styles.fieldInput}
              />

              <div className={styles.fieldContainer}>
                <PhoneInput
                  defaultCountry="fr"
                  value={phone}
                  onChange={handlePhoneChange}
                  name="phone"
                  placeholder="Numero de telephone"
                  inputProps={{
                    id: "merchant-phone",
                    autoComplete: "tel",
                    "aria-label": "Numero de telephone",
                  }}
                  className={styles.phoneInputRoot}
                  inputClassName={styles.phoneInputField}
                  countrySelectorStyleProps={{
                    buttonClassName: styles.phoneCountryButton,
                    dropdownArrowClassName: styles.phoneCountryArrow,
                  }}
                />
              </div>

              <Input
                id="merchant-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                autoComplete="new-password"
                aria-label="Mot de passe"
                leftIcon={<PasswordKeyIcon className={styles.fieldIcon} />}
                rightElement={
                  <ButtonIcon
                    type="button"
                    onClick={toggleShowPassword}
                    className={styles.toggleButton}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    icon={<DeadEyeIcon className={styles.fieldIcon} />}
                  />
                }
                containerClassName={styles.fieldContainer}
                inputWrapperClassName={styles.fieldWrapper}
                className={styles.fieldInput}
              />

              <div className={styles.forgotRow}>
                <Typography
                  variant="span"
                  Component="span"
                  className={styles.forgotLinkText}
                >
                  Minimum 8 caracteres.
                </Typography>
              </div>

              {error ? (
                <ErrorMessage className={styles.message}>{error}</ErrorMessage>
              ) : null}

              <Button
                type="submit"
                disabled={isPending}
                fullWidth
                className={styles.submitButton}
              >
                {isPending ? "Inscription..." : "Creer mon compte"}
              </Button>
            </Form>

            <div className={styles.footer}>
              <Typography
                variant="p"
                Component="p"
                className={styles.footerText}
              >
                Vous avez deja un compte?{" "}
                <Link href="/merchant/login" className={styles.registerLink}>
                  Se connecter
                </Link>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
