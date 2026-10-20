import type { Metadata } from "next";
import { PlannerApp } from "@/components/planner/PlannerApp";

export const metadata: Metadata = {
  title: "Planner · EventCraft AI",
};

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string }>;
}) {
  const params = await searchParams;
  return (
    <main id="main-content" className="min-h-screen">
      <PlannerApp prefillSample={params.sample === "1"} />
    </main>
  );
}
