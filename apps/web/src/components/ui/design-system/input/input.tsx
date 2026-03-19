import React, { forwardRef, useId } from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  wrapperClassName?: string;
  inputClassName?: string;
}

const styleP = "mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
const styleIconLeft = "pointer-events-none absolute inset-y-0 left-5 flex items-center text-slate-700"
const styleInput ="h-[3.75rem] w-full rounded-[1.4rem] border-2 border-slate-700/85 bg-white pr-5 text-[1.05rem] text-slate-950 outline-none transition placeholder:text-slate-700 focus:border-primary-light focus:ring-4 focus:ring-emerald-100 lg:h-[4.35rem] lg:text-[1.2rem]"

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      id,
      className,
      wrapperClassName,
      inputClassName,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `input-${generatedId}`;
    return (
      <div className={clsx("relative", wrapperClassName)}>
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>

        {leftIcon ? (
          <div className= {styleIconLeft}>
            {leftIcon}
          </div>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          className={clsx(
            styleInput,
            leftIcon ? "pl-16" : "pl-5",
            inputClassName,
            className,
          )}
          {...props}
        />

        {error ? (
          <p className="">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
