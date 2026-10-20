import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { ProgressRing } from "@/components/ui/ProgressRing";

expect.extend(toHaveNoViolations);

describe("ProgressRing", () => {
  it("exposes an accessible percentage label", () => {
    render(<ProgressRing percent={72} label="budget used" />);
    expect(screen.getByRole("img", { name: /72 percent complete, budget used/i })).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("clamps out-of-range percentages", () => {
    render(<ProgressRing percent={140} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ProgressRing percent={50} label="tasks complete" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
