import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
  inputWrapperClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightElement,
      className = "",
      containerClassName = "",
      inputWrapperClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);

    return (
      <div className={containerClassName}>
        {label ? (
          <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium leading-5 text-[var(--foreground)]"
          >
            {label}
          </label>
        ) : null}

        <div
          className={[
            "flex h-12 items-center rounded-2xl border bg-white px-4 transition",
            hasError
              ? "border-[var(--error)]"
              : "border-[var(--input-border)] focus-within:border-[var(--primary)]",
            inputWrapperClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {leftIcon ? (
            <span className="mr-3 flex shrink-0 items-center justify-center text-[var(--icon-muted)]">
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={id}
            className={[
              "h-full w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightElement ? (
            <div className="ml-3 flex shrink-0 items-center justify-center">
              {rightElement}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="mt-2 text-sm font-medium leading-5 text-[var(--error)]">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-2 text-sm font-normal leading-5 text-[var(--muted-foreground)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
