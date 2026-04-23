import { APP_GENDERS, type Gender } from "@/lib/auth-client";
import Input from "@/components/ui/design-system/input/input";
import Typography from "@/components/ui/design-system/typography";
import AddressIcon from "@/components/ui/icons/AddressIcon";
import CalendarIcon from "@/components/ui/icons/CalendarIcon";
import PersonIcon from "@/components/ui/icons/PersonIcon";
import { styles } from "./styles";
import type {
  DriverRegisterErrors,
  DriverRegisterField,
  DriverRegisterFormData,
} from "./steps";

const genderLabels: Record<Gender, string> = {
  FEMALE: "Femme",
  MALE: "Homme",
  UNDEFINED: "Genre",
};

type ProfileStepProps = {
  errors: DriverRegisterErrors;
  formData: DriverRegisterFormData;
  onFieldChange: (field: DriverRegisterField, value: string) => void;
};

export default function ProfileStep({
  errors,
  formData,
  onFieldChange,
}: ProfileStepProps) {
  function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <section className={styles.stepSection}>
      <Typography variant="h4" Component="h4" className={styles.stepHeading}>
        Profil livreur
      </Typography>

      <div className={styles.stepGrid}>
        <Input
          id="driver-birth-date"
          name="dateOfBirth"
          type="date"
          placeholder="Date de naissance"
          leftIcon={<CalendarIcon className={styles.fieldIcon} />}
          error={errors.dateOfBirth}
          value={formData.dateOfBirth}
          onChange={(event) => onFieldChange("dateOfBirth", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <div className={styles.selectContainer}>
          <div
            className={cn(
              styles.selectWrapper,
              errors.gender && styles.selectWrapperError,
            )}
          >
            <span className={styles.selectIcon}>
              <PersonIcon className={styles.fieldIcon} />
            </span>
            <select
              id="driver-gender"
              name="gender"
              value={formData.gender}
              onChange={(event) => onFieldChange("gender", event.target.value)}
              className={styles.selectField}
            >
              <option value="UNDEFINED">{genderLabels.UNDEFINED}</option>
              {APP_GENDERS.filter((gender) => gender !== "UNDEFINED").map(
                (gender) => (
                  <option key={gender} value={gender}>
                    {genderLabels[gender]}
                  </option>
                ),
              )}
            </select>
          </div>
          {errors.gender ? (
            <p className={styles.selectError}>{errors.gender}</p>
          ) : null}
        </div>

        <Input
          id="driver-address"
          name="address"
          type="text"
          placeholder="Adresse complete"
          autoComplete="street-address"
          leftIcon={<AddressIcon className={styles.fieldIcon} />}
          error={errors.address}
          value={formData.address}
          onChange={(event) => onFieldChange("address", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-city"
          name="city"
          type="text"
          placeholder="Ville"
          autoComplete="address-level2"
          leftIcon={<AddressIcon className={styles.fieldIcon} />}
          value={formData.city}
          onChange={(event) => onFieldChange("city", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-zip-code"
          name="zipCode"
          type="text"
          placeholder="Code postal"
          autoComplete="postal-code"
          leftIcon={<AddressIcon className={styles.fieldIcon} />}
          value={formData.zipCode}
          onChange={(event) => onFieldChange("zipCode", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-street"
          name="street"
          type="text"
          placeholder="Rue"
          autoComplete="address-line1"
          leftIcon={<AddressIcon className={styles.fieldIcon} />}
          value={formData.street}
          onChange={(event) => onFieldChange("street", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />
      </div>
    </section>
  );
}
