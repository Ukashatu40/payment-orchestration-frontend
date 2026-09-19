import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TRANSACTION_STATES,
  TransactionStateBadge,
  transactionStateLabel,
} from "../transaction-state-badge";

// Mirrors src/common/enums/enums.ts's TransactionState on the backend.
// If this list and the frontend's TRANSACTION_STATES diverge, either a
// new backend state has no badge mapping (falls through to `undefined`
// and crashes at render) or a removed state left dead frontend code —
// this test is the tripwire until the API client is generated from the
// OpenAPI spec and this list can be derived from there instead.
const BACKEND_TRANSACTION_STATES = [
  "CREATED",
  "ROUTE_SELECTED",
  "AUTH_INITIATED",
  "AUTHORISED",
  "AUTH_FAILED",
  "AUTH_TIMEOUT",
  "AUTH_EXPIRED",
  "CAPTURE_INITIATED",
  "CAPTURED",
  "PARTIALLY_CAPTURED",
  "CAPTURE_FAILED",
  "VOID_INITIATED",
  "VOIDED",
  "REFUND_INITIATED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "REFUND_FAILED",
  "SETTLED",
  "DISPUTE_OPENED",
  "DISPUTE_RESOLVED",
  "ABANDONED",
  "ROUTE_FAILED",
  "FAILED",
];

describe("TransactionStateBadge", () => {
  it("covers every backend TransactionState value with a label", () => {
    expect([...TRANSACTION_STATES].sort()).toEqual([...BACKEND_TRANSACTION_STATES].sort());
  });

  it("renders a human label for a known state", () => {
    render(<TransactionStateBadge state="AUTH_INITIATED" />);
    expect(screen.getByText("Authorising…")).toBeInTheDocument();
  });

  it("has a non-empty label for every state", () => {
    for (const state of TRANSACTION_STATES) {
      expect(transactionStateLabel(state).length).toBeGreaterThan(0);
    }
  });
});
