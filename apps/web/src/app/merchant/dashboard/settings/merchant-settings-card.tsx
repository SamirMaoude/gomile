"use client";

import Button from "@/components/ui/design-system/button/button";
import Form from "@/components/ui/design-system/forms/form";
import Input from "@/components/ui/design-system/input/input";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import SuccessMessage from "@/components/ui/design-system/messages/successMessage";
import Typography from "@/components/ui/design-system/typography";
import MailIcon from "@/components/ui/icons/MailIcon";
import UserIcon from "@/components/ui/icons/UserIcon";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { cn, styles } from "../style";
import { useMerchantSettings } from "./use-merchant-settings";

type MerchantSettingsCardProps = {
  isDarkMode: boolean;
};

export default function MerchantSettingsCard({
  isDarkMode,
}: MerchantSettingsCardProps) {
  const {
    email,
    error,
    handleNameChange,
    handlePhoneChange,
    handleSubmit,
    isLoading,
    isSaving,
    name,
    phone,
    success,
  } = useMerchantSettings();

  const darkControlWrapperClass =
    "!border-slate-700 !bg-[#020617] focus-within:!border-emerald-500 focus-within:!ring-4 focus-within:!ring-emerald-500/10";
  const darkControlTextClass =
    "!text-slate-100 placeholder:!text-slate-500";
  const darkMutedTextClass = "!text-slate-300 placeholder:!text-slate-500";
  const controlIconClass = cn(
    "h-5 w-5",
    isDarkMode ? "text-slate-300" : "text-slate-700",
  );

  return (
    <section
      className={cn(
        styles.deliveriesSection,
        isDarkMode ? styles.deliveriesSectionDark : styles.deliveriesSectionLight,
      )}
    >
      <div
        className={cn(
          styles.deliveriesHeader,
          isDarkMode ? styles.deliveriesHeaderDark : styles.deliveriesHeaderLight,
        )}
      >
        <Typography
          variant="h3"
          Component="h3"
          theme={isDarkMode ? "white" : "heading"}
          className={styles.sectionTitle}
        >
          Paramètres du merchant
        </Typography>
      </div>

      <div className="px-5 py-6">
        {isLoading ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
          >
            Chargement de vos informations...
          </Typography>
        ) : (
          <Form onSubmit={handleSubmit} className="grid gap-5">
            <Input
              id="merchant-settings-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Nom du commerce"
              aria-label="Nom du commerce"
              leftIcon={<UserIcon className={controlIconClass} />}
              containerClassName="w-full"
              inputWrapperClassName={cn(
                "h-[3.75rem] rounded-[1.4rem] border-2 px-4 lg:h-[4.1rem]",
                isDarkMode
                  ? darkControlWrapperClass
                  : "border-slate-300 bg-white focus-within:!border-primary-light",
              )}
              className={cn(
                "text-[1rem] lg:text-[1.1rem]",
                isDarkMode
                  ? darkControlTextClass
                  : "!text-slate-950 placeholder:!text-slate-500",
              )}
            />

            <Input
              id="merchant-settings-email"
              name="email"
              type="email"
              value={email}
              disabled
              placeholder="Adresse e-mail"
              aria-label="Adresse e-mail"
              leftIcon={<MailIcon className={controlIconClass} />}
              containerClassName="w-full"
              inputWrapperClassName={cn(
                "h-[3.75rem] rounded-[1.4rem] border-2 px-4 opacity-80 lg:h-[4.1rem]",
                isDarkMode
                  ? "!border-slate-700 !bg-[#020617]"
                  : "border-slate-200 bg-slate-50",
              )}
              className={cn(
                "text-[1rem] lg:text-[1.1rem]",
                isDarkMode
                  ? darkMutedTextClass
                  : "!text-slate-700 placeholder:!text-slate-500",
              )}
            />

            <div className="w-full">
              <PhoneInput
                defaultCountry="fr"
                value={phone}
                onChange={handlePhoneChange}
                name="phone"
                placeholder="Numéro de téléphone"
                inputProps={{
                  id: "merchant-settings-phone",
                  autoComplete: "tel",
                  "aria-label": "Numéro de téléphone",
                }}
                className={cn(
                  "!flex !w-full [--react-international-phone-height:3.75rem] lg:[--react-international-phone-height:4.1rem] [--react-international-phone-border-radius:1.4rem] [--react-international-phone-dropdown-shadow:0_18px_50px_rgba(15,23,42,0.16)]",
                  isDarkMode
                    ? "[--react-international-phone-border-color:rgb(51_65_85)] [--react-international-phone-background-color:#020617] [--react-international-phone-text-color:#f8fafc] [--react-international-phone-country-selector-background-color:#020617] [--react-international-phone-country-selector-background-color-hover:#0f172a] [--react-international-phone-country-selector-border-color:rgb(51_65_85)] [--react-international-phone-input-border-color:rgb(51_65_85)] [--react-international-phone-dropdown-item-text-color:#e2e8f0] [--react-international-phone-dropdown-item-background-color:#0f172a] [--react-international-phone-dropdown-item-hover-background-color:#1e293b] [--react-international-phone-dropdown-item-dial-code-color:#94a3b8]"
                    : "[--react-international-phone-border-color:rgb(203_213_225)] [--react-international-phone-background-color:#ffffff] [--react-international-phone-text-color:#020617] [--react-international-phone-country-selector-background-color:#ffffff] [--react-international-phone-country-selector-background-color-hover:#f8fafc] [--react-international-phone-country-selector-border-color:rgb(203_213_225)] [--react-international-phone-input-border-color:rgb(203_213_225)] [--react-international-phone-dropdown-item-text-color:#0f172a] [--react-international-phone-dropdown-item-background-color:#ffffff] [--react-international-phone-dropdown-item-hover-background-color:#f8fafc] [--react-international-phone-dropdown-item-dial-code-color:#475569]",
                )}
                inputClassName={cn(
                  "!h-[3.75rem] !min-h-[3.75rem] !w-full !flex-1 !text-[1rem] lg:!h-[4.1rem] lg:!min-h-[4.1rem] lg:!text-[1.1rem]",
                  isDarkMode
                    ? "!text-slate-100 placeholder:!text-slate-500"
                    : "!text-slate-950 placeholder:!text-slate-500",
                )}
                countrySelectorStyleProps={{
                  buttonClassName: cn(
                    "!h-[3.75rem] !min-h-[3.75rem] !shrink-0 !border-2 lg:!h-[4.1rem] lg:!min-h-[4.1rem]",
                    isDarkMode
                      ? "!border-slate-700"
                      : "!border-slate-300",
                  ),
                  dropdownArrowClassName: cn(
                    isDarkMode ? "!text-slate-300" : "!text-slate-700",
                  ),
                }}
              />
            </div>

            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            {success ? <SuccessMessage>{success}</SuccessMessage> : null}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="filled"
                size="md"
                disabled={isSaving}
                className="min-w-[12rem]"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </section>
  );
}
