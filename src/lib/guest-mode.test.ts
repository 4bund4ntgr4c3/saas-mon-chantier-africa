import { beforeEach, describe, expect, it } from "vitest";
import { enterGuestMode, exitGuestMode, isGuestMode } from "./guest-mode";

describe("guest-mode.ts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("est désactivé par défaut", () => {
    expect(isGuestMode()).toBe(false);
  });

  it("entre en mode invité et le mémorise", () => {
    enterGuestMode();
    expect(isGuestMode()).toBe(true);
    expect(localStorage.getItem("batibenin.guest")).toBe("1");
  });

  it("quitte le mode invité et réinitialise", () => {
    enterGuestMode();
    exitGuestMode();
    expect(isGuestMode()).toBe(false);
    expect(localStorage.getItem("batibenin.guest")).toBeNull();
  });
});
