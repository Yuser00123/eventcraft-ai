import { Hero } from "@/components/landing/Hero";
import {
  CtaSection,
  EventTypesSection,
  FaqSection,
  FeaturesSection,
  HowItWorksSection,
} from "@/components/landing/sections";
import { SiteFooter } from "@/components/SiteFooter";

export default function LandingPage() {
  return (
    <>
      <main id="main-content">
        <Hero />
        <div id="features">
          <EventTypesSection />
          <FeaturesSection />
        </div>
        <HowItWorksSection />
        <div id="faq">
          <FaqSection />
        </div>
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
