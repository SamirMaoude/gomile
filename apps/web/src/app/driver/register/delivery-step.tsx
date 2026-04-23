import { APP_VEHICLE_TYPES, type VehicleType } from "@/lib/auth-client";
import Input from "@/components/ui/design-system/input/input";
import Typography from "@/components/ui/design-system/typography";
import AddressIcon from "@/components/ui/icons/AddressIcon";
import PhoneIcon from "@/components/ui/icons/PhoneIcon";
import { styles } from "./styles";
import type {
  DriverRegisterErrors,
  DriverRegisterField,
  DriverRegisterFormData,
} from "./steps";

const transportLabels: Record<VehicleType, string> = {
  BIKE: "Velo",
  CAR: "Voiture",
  SCOOTER: "Scooter",
  TRUCK: "Camion",
};

type DeliveryStepProps = {
  errors: DriverRegisterErrors;
  formData: DriverRegisterFormData;
  onFieldChange: (field: DriverRegisterField, value: string) => void;
};

export default function DeliveryStep({
  errors,
  formData,
  onFieldChange,
}: DeliveryStepProps) {
  function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <section className={styles.stepSection}>
      <Typography variant="h4" Component="h4" className={styles.stepHeading}>
        Livraison
      </Typography>

      <div className={styles.stepGrid}>
        <Input
          id="driver-delivery-city"
          name="deliveryCity"
          type="text"
          placeholder="Ville de livraison"
          leftIcon={<AddressIcon className={styles.fieldIcon} />}
          error={errors.deliveryCity}
          value={formData.deliveryCity}
          onChange={(event) => onFieldChange("deliveryCity", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-delivery-radius"
          name="deliveryRadius"
          type="number"
          min="1"
          step="1"
          placeholder="Rayon de livraison (km)"
          leftIcon={<PhoneIcon className={styles.fieldIcon} />}
          error={errors.deliveryRadius}
          value={formData.deliveryRadius}
          onChange={(event) => onFieldChange("deliveryRadius", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <div className={styles.selectContainer}>
          <div
            className={cn(
              styles.selectWrapper,
              errors.transportType && styles.selectWrapperError,
            )}
          >
            <span className={styles.selectIcon}>
              <PhoneIcon className={styles.fieldIcon} />
            </span>
            <select
              id="driver-transport-type"
              name="transportType"
              value={formData.transportType}
              onChange={(event) =>
                onFieldChange("transportType", event.target.value)
              }
              className={styles.selectField}
            >
              <option value="">Type de transport</option>
              {APP_VEHICLE_TYPES.map((vehicleType) => (
                <option key={vehicleType} value={vehicleType}>
                  {transportLabels[vehicleType]}
                </option>
              ))}
            </select>
          </div>
          {errors.transportType ? (
            <p className={styles.selectError}>{errors.transportType}</p>
          ) : null}
        </div>

        <Input
          id="driver-equipments"
          name="equipments"
          type="text"
          placeholder="Equipements (casque, isotherme, gants)"
          helperText="Separez les equipements par des virgules."
          value={formData.equipments}
          onChange={(event) => onFieldChange("equipments", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />
      </div>
    </section>
  );
}
