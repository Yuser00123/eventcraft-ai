import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-10 rounded-t-[2.25rem] bg-night px-6 py-12 text-[#FFD9C7]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <Logo variant="light" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
          <Link href="/planner" className="hover:text-white">Planner</Link>
          <Link href="/#features" className="hover:text-white">Features</Link>
          <Link href="/#faq" className="hover:text-white">FAQ</Link>
        </nav>
        <p className="text-xs text-[#FFD9C7]/70">
          GenAI planning assistant · estimates are planning ranges, not vendor quotes
        </p>
      </div>
    </footer>
  );
}
