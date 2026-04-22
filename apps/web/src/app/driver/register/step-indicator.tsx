import CheckIcon from "@/components/ui/icons/CheckIcon";
import { styles } from "./styles";
import type { DriverRegisterStep } from "./steps";

type StepIndicatorProps = {
  currentStepId: number;
  steps: DriverRegisterStep[];
};

export default function StepIndicator({
  currentStepId,
  steps,
}: StepIndicatorProps) {
  function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className={styles.stepper}>
      <div className={styles.stepperList}>
        {steps.map((step) => {
          const isActive = step.id === currentStepId;
          const isDone = step.id < currentStepId;

          return (
            <div
              key={step.id}
              className={cn(
                styles.stepperItem,
                isActive
                  ? styles.stepperItemActive
                  : isDone
                    ? styles.stepperItemDone
                    : styles.stepperItemPending,
              )}
            >
              <span
                className={cn(
                  styles.stepBadge,
                  isActive
                    ? styles.stepBadgeActive
                    : isDone
                      ? styles.stepBadgeDone
                      : styles.stepBadgePending,
                )}
              >
                {isDone ? <CheckIcon className="h-4 w-4" /> : step.id}
              </span>

              <div className={styles.stepCopy}>
                <p className={styles.stepTitle}>{step.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
