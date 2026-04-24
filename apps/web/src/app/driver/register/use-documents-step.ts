import { useState, type ChangeEvent } from "react";

import {
  driverRegisterDocumentOptions,
  type DriverRegisterDocumentField,
  type DriverRegisterFormData,
  type DriverRegisterUploadField,
} from "./steps";

type UseDocumentsStepParams = {
  addDocumentSelection: (field: DriverRegisterDocumentField) => void;
  formData: DriverRegisterFormData;
  selectedDocumentFields: DriverRegisterDocumentField[];
  selectedFileNames: Partial<Record<DriverRegisterUploadField, string>>;
};

export function useDocumentsStep({
  addDocumentSelection,
  formData,
  selectedDocumentFields,
  selectedFileNames,
}: UseDocumentsStepParams) {
  const [selectedOption, setSelectedOption] = useState("");
  const needsVehicleDocuments =
    formData.transportType !== "" && formData.transportType !== "BIKE";

  function isLocked(field: DriverRegisterDocumentField) {
    return (
      needsVehicleDocuments &&
      (field === "permisFile" || field === "carteGriseFile")
    );
  }

  const visibleDocumentFields = driverRegisterDocumentOptions
    .map((option) => option.field)
    .filter(
      (field) => selectedDocumentFields.includes(field) || isLocked(field),
    );

  const pendingUploadFields = visibleDocumentFields.filter(
    (field) => !selectedFileNames[field],
  );

  const selectedSummaryFields = visibleDocumentFields.filter(
    (field) => Boolean(selectedFileNames[field]),
  );

  const availableOptions = driverRegisterDocumentOptions.filter(
    (option) =>
      !selectedDocumentFields.includes(option.field) && !isLocked(option.field),
  );

  function handleOptionChange(event: ChangeEvent<HTMLSelectElement>) {
    const field = event.target.value as DriverRegisterDocumentField;

    if (!field) {
      return;
    }

    addDocumentSelection(field);
    setSelectedOption("");
  }

  function findDocumentOption(field: DriverRegisterDocumentField) {
    return driverRegisterDocumentOptions.find(
      (documentOption) => documentOption.field === field,
    );
  }

  return {
    availableOptions,
    findDocumentOption,
    handleOptionChange,
    isLocked,
    needsVehicleDocuments,
    pendingUploadFields,
    selectedOption,
    selectedSummaryFields,
  };
}
