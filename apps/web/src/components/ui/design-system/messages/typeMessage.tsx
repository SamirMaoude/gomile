import React from "react";
import clsx from "clsx";
import Typography from "../typography";

type TypeMessage = "error" | "success";

interface TypeMessageProps {
  children: React.ReactNode;
  variant: TypeMessage;
  className?: string;
}

const variantClassName: Record<TypeMessage, string> = {
  error: "rounded-2xl border border-danger-border bg-danger-soft px-4 py-3",
  success: "rounded-2xl border border-success-border bg-success-soft px-4 py-3",
};

const variantTheme: Record<TypeMessage, "danger" | "success"> = {
  error: "danger",
  success: "success",
};

export default function TypeMessage({
  children,
  variant,
  className,
}: TypeMessageProps) {
  return (
    <Typography
      variant="p"
      Component="p"
      theme={variantTheme[variant]}
      className={clsx(
        variantClassName[variant],
        "text-sm leading-6",
        className,
      )}
    >
      {children}
    </Typography>
  );
}