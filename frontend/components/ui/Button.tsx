"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-[var(--sage)] text-white hover:bg-[var(--sage-dark)] active:scale-[0.97] shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-[var(--warm-brown)] border border-[var(--sage-light)] hover:bg-[var(--sage-light)]/20 active:scale-[0.97]",
    ghost:
      "text-[var(--warm-gray)] hover:text-[var(--warm-brown)] hover:bg-black/5 active:scale-[0.97]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-2.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
