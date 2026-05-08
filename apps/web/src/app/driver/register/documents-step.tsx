import type { ChangeEvent } from "react";

import ButtonIcon from "@/components/ui/icons/ButtonIcon";
import CloseIcon from "@/components/ui/icons/CloseIcon";
import Typography from "@/components/ui/design-system/typography";
import DocumentIcon from "@/components/ui/icons/DocumentIcon";
import FileUploadField from "./file-upload-field";
import { styles } from "./styles";
import { useDocumentsStep } from "./use-documents-step";
import type {
  DriverRegisterDocumentField,
  DriverRegisterErrors,
  DriverRegisterField,
  DriverRegisterFormData,
  DriverRegisterUploadField,
} from "./steps";
import { driverRegisterDocumentOptions } from "./steps";

type DocumentsStepProps = {
  errors: DriverRegisterErrors;
  formData: DriverRegisterFormData;
  addDocumentSelection: (field: DriverRegisterDocumentField) => void;
  onFieldChange: (field: DriverRegisterField, value: string) => void;
  onDocumentFileChange: (
    field: DriverRegisterUploadField,
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  removeDocumentSelection: (field: DriverRegisterDocumentField) => void;
  selectedDocumentFields: DriverRegisterDocumentField[];
  selectedFileNames: Partial<Record<DriverRegisterUploadField, string>>;
};

export default function DocumentsStep({
  addDocumentSelection,
  errors,
  formData,
  onFieldChange,
  onDocumentFileChange,
  removeDocumentSelection,
  selectedDocumentFields,
  selectedFileNames,
}: DocumentsStepProps) {
  const {
    availableOptions,
    findDocumentOption,
    handleOptionChange,
    pendingUploadFields,
    selectedOption,
    selectedSummaryFields,
  } = useDocumentsStep({
    addDocumentSelection,
    selectedDocumentFields,
    selectedFileNames,
  });

  function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <section className={styles.stepSection}>
      <Typography variant="h4" Component="h4" className={styles.stepHeading}>
        Documents
      </Typography>

      <div className={styles.documentToolbar}>
        <div className={styles.selectContainer}>
          <label htmlFor="driver-document-selector" className={styles.selectLabel}>
            Ajouter un document
          </label>
          <div className={cn(styles.selectWrapper)}>
            <span className={styles.selectIcon}>
              <DocumentIcon className={styles.fieldIcon} />
            </span>
            <select
              id="driver-document-selector"
              value={selectedOption}
              onChange={handleOptionChange}
              className={styles.selectField}
            >
              <option value="">Choisir un document</option>
              {availableOptions.map((option) => (
                <option key={option.field} value={option.field}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.fieldContainer}>
          <label htmlFor="driver-siret" className={styles.selectLabel}>
            SIRET
          </label>
          <input
            id="driver-siret"
            name="siret"
            type="text"
            value={formData.siret}
            onChange={(event) => onFieldChange("siret", event.target.value)}
            placeholder="Numéro SIRET (optionnel)"
            className={styles.nativeInput}
          />
        </div>
      </div>

      {selectedSummaryFields.length > 0 ? (
        <div className={styles.documentSelectedList}>
          {selectedSummaryFields.map((field) => {
            const option = findDocumentOption(field);

            if (!option) {
              return null;
            }

            return (
              <div key={field} className={styles.documentChip}>
                <span className={styles.documentChipName}>
                  {selectedFileNames[field]}
                </span>
                <ButtonIcon
                  type="button"
                  onClick={() => removeDocumentSelection(field)}
                  className={styles.documentChipRemove}
                  aria-label={`Supprimer ${option.label}`}
                  icon={<CloseIcon className="h-4 w-4" />}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      <div className={styles.documentUploadGrid}>
        {driverRegisterDocumentOptions
          .filter((option) => pendingUploadFields.includes(option.field))
          .map((option) => (
            <FileUploadField
              key={option.field}
              id={`driver-${option.field}`}
              label={option.label}
              icon={<DocumentIcon className={styles.fieldIcon} />}
              accept=".pdf,image/*"
              fileName={selectedFileNames[option.field]}
              error={errors[option.field]}
              placeholder={option.label}
              onChange={(event) => onDocumentFileChange(option.field, event)}
            />
          ))}
      </div>
    </section>
  );
}
