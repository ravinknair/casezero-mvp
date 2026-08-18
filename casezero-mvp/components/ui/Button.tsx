import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "cz-primary",
  secondary: "border cz-border bg-white text-gray-800 hover:bg-gray-50",
  danger: "bg-[var(--red)] text-white hover:bg-[#8f1d14]",
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`rounded px-4 py-2 text-sm font-semibold transition ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
