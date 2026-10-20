interface LogoProps {
  variant?: "light" | "dark";
}

/** Inline SVG brand mark — no image requests, scales crisply. */
export function Logo({ variant = "dark" }: LogoProps) {
  const foreground = variant === "light" ? "#FFF6EC" : "#241711";
  return (
    <span className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold">
      <span
        aria-hidden="true"
        className="grid h-10 w-10 place-items-center rounded-2xl bg-coral-500 shadow-soft"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l2.4 6.2L21 9l-5 4.3L17.8 20 12 16.3 6.2 20 8 13.3 3 9l6.6-.8L12 2z"
            fill="#FFF6EC"
          />
        </svg>
      </span>
      <span style={{ color: foreground }}>
        EventCraft <span className="text-coral-500">AI</span>
      </span>
    </span>
  );
}
