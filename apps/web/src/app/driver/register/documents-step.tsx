import Input from "@/components/ui/design-system/input/input";
import Typography from "@/components/ui/design-system/typography";
import DocumentIcon from "@/components/ui/icons/DocumentIcon";
import { styles } from "./styles";
import type {
  DriverRegisterErrors,
  DriverRegisterField,
  DriverRegisterFormData,
} from "./steps";

type DocumentsStepProps = {
  errors: DriverRegisterErrors;
  formData: DriverRegisterFormData;
  onFieldChange: (field: DriverRegisterField, value: string) => void;
};

export default function DocumentsStep({
  errors,
  formData,
  onFieldChange,
}: DocumentsStepProps) {
  const needsVehicleDocuments =
    formData.transportType !== "" && formData.transportType !== "BIKE";

  return (
    <section className={styles.stepSection}>
      <Typography variant="h4" Component="h4" className={styles.stepHeading}>
        Documents
      </Typography>

      {needsVehicleDocuments ? (
        <p className={styles.stepNote}>
          Pour le transport motorise, le permis et la carte grise sont requis.
        </p>
      ) : null}

      <div className={styles.stepGrid}>
        <Input
          id="driver-cni-file"
          name="cniFile"
          type="url"
          placeholder="URL CNI"
          leftIcon={<DocumentIcon className={styles.fieldIcon} />}
          error={errors.cniFile}
          value={formData.cniFile}
          onChange={(event) => onFieldChange("cniFile", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-justificatif-file"
          name="justificatifFile"
          type="url"
          placeholder="URL justificatif de domicile"
          leftIcon={<DocumentIcon className={styles.fieldIcon} />}
          error={errors.justificatifFile}
          value={formData.justificatifFile}
          onChange={(event) =>
            onFieldChange("justificatifFile", event.target.value)
          }
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-permis-file"
          name="permisFile"
          type="url"
          placeholder="URL permis"
          leftIcon={<DocumentIcon className={styles.fieldIcon} />}
          error={errors.permisFile}
          value={formData.permisFile}
          onChange={(event) => onFieldChange("permisFile", event.target.value)}
          helperText={
            needsVehicleDocuments ? "Requis hors velo." : "Optionnel pour velo."
          }
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-carte-grise-file"
          name="carteGriseFile"
          type="url"
          placeholder="URL carte grise"
          leftIcon={<DocumentIcon className={styles.fieldIcon} />}
          error={errors.carteGriseFile}
          value={formData.carteGriseFile}
          onChange={(event) =>
            onFieldChange("carteGriseFile", event.target.value)
          }
          helperText={
            needsVehicleDocuments ? "Requise hors velo." : "Optionnelle pour velo."
          }
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-siret"
          name="siret"
          type="text"
          placeholder="SIRET"
          value={formData.siret}
          onChange={(event) => onFieldChange("siret", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-kbis-file"
          name="kbisFile"
          type="url"
          placeholder="URL KBIS"
          leftIcon={<DocumentIcon className={styles.fieldIcon} />}
          error={errors.kbisFile}
          value={formData.kbisFile}
          onChange={(event) => onFieldChange("kbisFile", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />

        <Input
          id="driver-rib-file"
          name="ribFile"
          type="url"
          placeholder="URL RIB"
          leftIcon={<DocumentIcon className={styles.fieldIcon} />}
          error={errors.ribFile}
          value={formData.ribFile}
          onChange={(event) => onFieldChange("ribFile", event.target.value)}
          containerClassName={styles.fieldContainer}
          inputWrapperClassName={styles.fieldWrapper}
          className={styles.fieldInput}
        />
      </div>
    </section>
  );
}
