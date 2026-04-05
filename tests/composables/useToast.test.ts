import { describe, it, expect, vi, beforeEach } from "vitest";
import { useToast } from "@/composables/useToast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear existing toasts
    const { toasts } = useToast();
    toasts.value = [];
  });

  it("adds a toast", () => {
    const { toast, toasts } = useToast();
    toast({ title: "Hello" });
    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].title).toBe("Hello");
  });

  it("auto-dismisses after duration", () => {
    const { toast, toasts } = useToast();
    toast({ title: "Temp", duration: 1000 });
    expect(toasts.value).toHaveLength(1);

    vi.advanceTimersByTime(1000);
    expect(toasts.value).toHaveLength(0);
  });

  it("dismiss removes specific toast", () => {
    const { toast, dismiss, toasts } = useToast();
    const id = toast({ title: "One" });
    toast({ title: "Two" });
    expect(toasts.value).toHaveLength(2);

    dismiss(id);
    expect(toasts.value).toHaveLength(1);
    expect(toasts.value[0].title).toBe("Two");
  });

  it("uses default variant", () => {
    const { toast, toasts } = useToast();
    toast({ title: "Test" });
    expect(toasts.value[0].variant).toBe("default");
  });

  it("supports destructive variant", () => {
    const { toast, toasts } = useToast();
    toast({ title: "Error", variant: "destructive" });
    expect(toasts.value[0].variant).toBe("destructive");
  });
});
