import type { CSSProperties, ReactNode } from "react";

/**
 * Entrance motion built on plain CSS keyframes (see .reveal / .stagger-list
 * in globals.css) rather than IntersectionObserver-driven JS state. Content
 * therefore always ends visible — including headless renders, print and
 * no-JS contexts — while prefers-reduced-motion still disables animation.
 */

interface MotionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: MotionProps) {
  const style: CSSProperties | undefined = delay ? { animationDelay: `${delay}s` } : undefined;
  return (
    <div className={`reveal ${className ?? ""}`} style={style}>
      {children}
    </div>
  );
}

export function Stagger({ children, className }: MotionProps) {
  return <div className={`stagger-list ${className ?? ""}`}>{children}</div>;
}

export function StaggerItem({ children, className }: MotionProps) {
  return <div className={className}>{children}</div>;
}
