"use client";

import Link from "next/link";
import "react-international-phone/style.css";

import Background from "@/components/ui/auth/background";
import Button from "@/components/ui/design-system/button/button";
import Form from "@/components/ui/design-system/forms/form";
import ErrorMessage from "@/components/ui/design-system/messages/errorMessage";
import Typography from "@/components/ui/design-system/typography";
import { Logo } from "@/components/Logo/Logo";
import DeliveryStep from "./delivery-step";
import DocumentsStep from "./documents-step";
import IdentityStep from "./identity-step";
import ProfileStep from "./profile-step";
import StepIndicator from "./step-indicator";
import { styles } from "./styles";
import { useRegister } from "./use-register";

export default function DriverRegisterPage() {
  const {
    addDocumentSelection,
    avatarFileName,
    currentStep,
    errors,
    formData,
    formError,
    goToNextStep,
    goToPreviousStep,
    handleAvatarFileChange,
    handleDocumentFileChange,
    handleSubmit,
    isFirstStep,
    isPending,
    removeDocumentSelection,
    removeUpload,
    selectedDocumentFields,
    selectedFileNames,
    showPassword,
    steps,
    toggleShowPassword,
    updateField,
  } = useRegister();
  const isFinalStep = currentStep.id === 4;

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
                Rejoignez GoMile

                <Typography
                  variant="h5"
                  Component="span"
                  theme="white"
                  className={styles.brandTitleBreak}
                >
                  Section livreur
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
                Inscription livreur
              </Typography>
            </div>

            <StepIndicator currentStepId={currentStep.id} steps={steps} />

            <Form onSubmit={handleSubmit} className={styles.form}>
              {currentStep.id === 1 ? (
                <IdentityStep
                  avatarFileName={avatarFileName}
                  errors={errors}
                  formData={formData}
                  onAvatarFileChange={handleAvatarFileChange}
                  onRemoveAvatar={() => removeUpload("avatarUrl")}
                  onFieldChange={updateField}
                  onToggleShowPassword={toggleShowPassword}
                  showPassword={showPassword}
                />
              ) : null}

              {currentStep.id === 2 ? (
                <ProfileStep
                  errors={errors}
                  formData={formData}
                  onFieldChange={updateField}
                />
              ) : null}

              {currentStep.id === 3 ? (
                <DeliveryStep
                  errors={errors}
                  formData={formData}
                  onFieldChange={updateField}
                />
              ) : null}

              {currentStep.id === 4 ? (
                <DocumentsStep
                  addDocumentSelection={addDocumentSelection}
                  errors={errors}
                  formData={formData}
                  onDocumentFileChange={handleDocumentFileChange}
                  onFieldChange={updateField}
                  removeDocumentSelection={removeDocumentSelection}
                  selectedDocumentFields={selectedDocumentFields}
                  selectedFileNames={selectedFileNames}
                />
              ) : null}


              {formError ? (
                <ErrorMessage className={styles.message}>{formError}</ErrorMessage>
              ) : null}

              <div className={styles.stepActions}>
                {!isFirstStep ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    className={styles.secondaryActionButton}
                  >
                    Etape precedente
                  </Button>
                ) : (
                  <div />
                )}

                {isFinalStep ? (
                  <Button
                    type="submit"
                    disabled={isPending}
                    className={`${styles.submitButton} ${styles.primaryActionButton}`}
                  >
                    {isPending ? "Creation..." : "Creer mon compte"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      goToNextStep();
                    }}
                    disabled={isPending}
                    className={`${styles.submitButton} ${styles.primaryActionButton}`}
                  >
                    Etape suivante
                  </Button>
                )}
              </div>
            </Form>

            <div className={styles.footer}>
              <Typography
                variant="p"
                Component="p"
                className={styles.footerText}
              >
                Vous avez deja fini votre dossier?{" "}
                <Link href="/" className={styles.footerLink}>
                  Retour a l&apos;accueil
                </Link>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
}
