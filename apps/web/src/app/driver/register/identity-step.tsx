import type { ChangeEvent } from "react";

import Input from "@/components/ui/design-system/input/input";
import Typography from "@/components/ui/design-system/typography";
import ButtonIcon from "@/components/ui/icons/ButtonIcon";
import DeadEyeIcon from "@/components/ui/icons/DeadEyeIcon";
import DocumentIcon from "@/components/ui/icons/DocumentIcon";
import MailIcon from "@/components/ui/icons/MailIcon";
import PasswordKeyIcon from "@/components/ui/icons/passwordKeyIcon";
import UserIcon from "@/components/ui/icons/UserIcon";
import { PhoneInput } from "react-international-phone";
import FileUploadField from "./file-upload-field";
import { styles } from "./styles";
import type {
  DriverRegisterErrors,
  DriverRegisterField,
  DriverRegisterFormData,
} from "./steps";

type IdentityStepProps = {
  errors: DriverRegisterErrors;
  formData: DriverRegisterFormData;
  onAvatarFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
  onFieldChange: (field: DriverRegisterField, value: string) => void;
  onToggleShowPassword: () => void;
  showPassword: boolean;
  avatarFileName?: string;
};

export default function IdentityStep({
  avatarFileName,
  errors,
  formData,
  onAvatarFileChange,
  onRemoveAvatar,
  onFieldChange,
  onToggleShowPassword,
  showPassword,
}: IdentityStepProps) {
  return (
    <section className={styles.stepSection}>
      <Typography variant="h4" Component="h4" className={styles.stepHeading}>
        Identité et contact
      </Typography>

      <div className={styles.stepGrid}>
        <Input
          id="driver-first-name"
          name="firstName"
          type="text"
          placeholder="Prénom"
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
            placeholder="Numéro de téléphone"
            inputProps={{
              id: "driver-phone",
              autoComplete: "tel",
              "aria-label": "Numéro de téléphone",
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

        <FileUploadField
          id="driver-avatar-file"
          label="Avatar"
          icon={<DocumentIcon className={styles.fieldIcon} />}
          accept="image/*"
          fileName={avatarFileName}
          error={errors.avatarUrl}
          onRemove={onRemoveAvatar}
          placeholder="Choisir un avatar"
          onChange={onAvatarFileChange}
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
