import Input from "@/components/ui/design-system/input/input";
import Typography from "@/components/ui/design-system/typography";
import ButtonIcon from "@/components/ui/icons/ButtonIcon";
import DeadEyeIcon from "@/components/ui/icons/DeadEyeIcon";
import MailIcon from "@/components/ui/icons/MailIcon";
import PasswordKeyIcon from "@/components/ui/icons/passwordKeyIcon";
import UserIcon from "@/components/ui/icons/UserIcon";
import { PhoneInput } from "react-international-phone";
import { styles } from "./styles";
import type {
  DriverRegisterErrors,
  DriverRegisterField,
  DriverRegisterFormData,
} from "./steps";

type IdentityStepProps = {
  errors: DriverRegisterErrors;
  formData: DriverRegisterFormData;
  onFieldChange: (field: DriverRegisterField, value: string) => void;
  onToggleShowPassword: () => void;
  showPassword: boolean;
};

export default function IdentityStep({
  errors,
  formData,
  onFieldChange,
  onToggleShowPassword,
  showPassword,
}: IdentityStepProps) {
  return (
    <section className={styles.stepSection}>
      <Typography variant="h4" Component="h4" className={styles.stepHeading}>
        Identite et contact
      </Typography>

      <div className={styles.stepGrid}>
        <Input
          id="driver-first-name"
          name="firstName"
          type="text"
          placeholder="Prenom"
          autoComplete="given-name"
          leftIcon={<UserIcon className={styles.fieldIcon} />}
          error={errors.firstName}
          value={formData.firstName}
          onChange={(event) => onFieldChange("firstName", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-last-name"
          name="lastName"
          type="text"
          placeholder="Nom"
          autoComplete="family-name"
          leftIcon={<UserIcon className={styles.fieldIcon} />}
          error={errors.lastName}
          value={formData.lastName}
          onChange={(event) => onFieldChange("lastName", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-email"
          name="email"
          type="email"
          placeholder="Adresse e-mail"
          autoComplete="email"
          leftIcon={<MailIcon className={styles.fieldIcon} />}
          error={errors.email}
          value={formData.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <div className={styles.fieldContainer}>
          <PhoneInput
            defaultCountry="fr"
            value={formData.phone}
            onChange={(value) => onFieldChange("phone", value)}
            name="phone"
            placeholder="Numero de telephone"
            inputProps={{
              id: "driver-phone",
              autoComplete: "tel",
              "aria-label": "Numero de telephone",
            }}
            className={[
              styles.phoneInputRoot,
              errors.phone ? styles.phoneInputErrorRoot : "",
            ]
              .filter(Boolean)
              .join(" ")}
            inputClassName={styles.phoneInputField}
            countrySelectorStyleProps={{
              buttonClassName: styles.phoneCountryButton,
              dropdownArrowClassName: styles.phoneCountryArrow,
            }}
          />
          {errors.phone ? (
            <p className={styles.fieldError}>{errors.phone}</p>
          ) : null}
        </div>

        <Input
          id="driver-avatar-url"
          name="avatarUrl"
          type="url"
          placeholder="URL de l'avatar (optionnel)"
          autoComplete="url"
          leftIcon={<UserIcon className={styles.fieldIcon} />}
          error={errors.avatarUrl}
          value={formData.avatarUrl}
          onChange={(event) => onFieldChange("avatarUrl", event.target.value)}
          helperText="Optionnel, mais doit etre une URL valide si renseignee."
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Mot de passe"
          autoComplete="new-password"
          leftIcon={<PasswordKeyIcon className={styles.fieldIcon} />}
          error={errors.password}
          value={formData.password}
          onChange={(event) => onFieldChange("password", event.target.value)}
          rightElement={
            <ButtonIcon
              type="button"
              onClick={onToggleShowPassword}
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
      </div>
    </section>
  );
}
