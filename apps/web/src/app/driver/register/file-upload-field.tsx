import type { ChangeEvent, ReactNode } from "react";

import ButtonIcon from "@/components/ui/icons/ButtonIcon";
import CloseIcon from "@/components/ui/icons/CloseIcon";
import Typography from "@/components/ui/design-system/typography";
import { styles } from "./styles";

type FileUploadFieldProps = {
  accept: string;
  error?: string;
  fileName?: string;
  helperText?: string;
  icon: ReactNode;
  id: string;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  placeholder?: string;
  required?: boolean;
};

export default function FileUploadField({
  accept,
  error,
  fileName,
  helperText,
  icon,
  id,
  label,
  onChange,
  onRemove,
  placeholder = "Choisir un fichier",
  required = false,
}: FileUploadFieldProps) {
  const valueLabel = fileName || placeholder;

  return (
    <div className={styles.uploadField}>
      <label htmlFor={id} className={styles.uploadTrigger}>
        <span className={styles.uploadIcon}>{icon}</span>

        <span className={styles.uploadCopy}>
          <Typography
            variant="span"
            Component="span"
            className={styles.uploadLabel}
          >
            {label}
            {required ? " *" : ""}
          </Typography>

          <Typography
            variant="p"
            Component="p"
            className={styles.uploadValue}
          >
            {valueLabel}
          </Typography>
        </span>
      </label>

      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onChange}
        className="sr-only"
      />

      {error ? (
        <p className={styles.fieldError}>{error}</p>
      ) : helperText ? (
        <p className={styles.uploadHelp}>{helperText}</p>
      ) : null}

      {onRemove && fileName ? (
        <ButtonIcon
          type="button"
          onClick={onRemove}
          className={styles.uploadRemoveButton}
          aria-label={`Supprimer ${label}`}
          icon={<CloseIcon className="h-4 w-4" />}
        />
      ) : null}
    </div>
  );
}
