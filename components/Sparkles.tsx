interface SparklesProps {
  className?: string;
  color?: string;
}

/** Decorative four-petal sparkle used as an inline SVG (zero image weight). */
export function Sparkle({ className = "", color = "#F2558E" }: SparklesProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 0c1.2 6.2 5.8 10.8 12 12-6.2 1.2-10.8 5.8-12 12-1.2-6.2-5.8-10.8-12-12C6.2 10.8 10.8 1.2 12 0z"
        fill={color}
      />
    </svg>
  );
}

export function Blob({ className = "", color = "#F2558E" }: SparklesProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
      <path
        fill={color}
        d="M43.7-66.6C55.4-57.3 62.8-42.7 68.6-27.3 74.4-11.9 78.6 4.4 73.6 17.6 68.6 30.8 54.4 40.8 40.4 49.6 26.4 58.4 12.7 66-1.4 68c-14.1 2-29.6-1.6-42.8-10.4-13.2-8.8-24.1-22.8-28.8-38.7-4.7-15.9-3.3-33.7 5.2-47.3C-59.3-42-43.7-51.4-28.7-60c15-8.6 29.8-16.6 43.7-13.4 13.9 3.2 17.8-.5 28.7 6.8z"
        transform="translate(100 100)"
      />
    </svg>
  );
}
