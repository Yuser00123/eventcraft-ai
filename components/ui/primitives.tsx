import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "ghost" | "outline";
type ButtonSize = "md" | "sm";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-coral-600 text-white hover:bg-coral-500 shadow-soft",
  dark: "bg-ink text-cream hover:bg-night",
  ghost: "bg-white text-ink shadow-soft hover:bg-coral-100",
  outline: "border-2 border-coral-100 text-ink hover:border-coral-500",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-6 py-3 text-sm",
  sm: "px-4 py-2 text-xs",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tint?: "white" | "coral" | "pink" | "amber" | "dark" | "green" | "red";
}

const TINT_CLASSES = {
  white: "bg-white",
  coral: "bg-coral-100",
  pink: "bg-pink-100",
  amber: "bg-amber-300",
  dark: "bg-ink text-cream",
  green: "bg-green-100",
  red: "bg-red-100",
};

export function Card({ tint = "white", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl p-6 shadow-soft transition-transform duration-200 ${TINT_CLASSES[tint]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  tone?: "coral" | "pink" | "green" | "red" | "neutral";
}

const BADGE_TONES = {
  coral: "bg-coral-100 text-coral-600",
  pink: "bg-pink-100 text-pink-500",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  neutral: "bg-white text-muted shadow-soft",
};

export function Badge({ children, tone = "coral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="grid place-items-center gap-3 rounded-3xl border-2 border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <span className="text-4xl" aria-hidden="true">
        {emoji}
      </span>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="max-w-md text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-coral-600">
      {children}
    </p>
  );
}
