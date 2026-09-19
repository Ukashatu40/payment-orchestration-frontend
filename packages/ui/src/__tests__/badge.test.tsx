import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies the danger variant's classes", () => {
    render(<Badge variant="danger">Failed</Badge>);
    expect(screen.getByText("Failed")).toHaveClass("bg-danger");
  });

  it("defaults to the neutral variant", () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText("Neutral")).toHaveClass("bg-muted");
  });
});
