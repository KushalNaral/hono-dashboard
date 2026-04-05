import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Badge from "@/components/ui/badge/Badge.vue";

describe("Badge", () => {
  it("renders slot content", () => {
    const wrapper = mount(Badge, { slots: { default: "admin" } });
    expect(wrapper.text()).toBe("admin");
  });

  it("applies default variant", () => {
    const wrapper = mount(Badge, { slots: { default: "test" } });
    expect(wrapper.classes()).toContain("bg-primary");
  });

  it("applies destructive variant", () => {
    const wrapper = mount(Badge, {
      props: { variant: "destructive" },
      slots: { default: "error" },
    });
    expect(wrapper.classes()).toContain("bg-destructive");
  });

  it("applies secondary variant", () => {
    const wrapper = mount(Badge, {
      props: { variant: "secondary" },
      slots: { default: "info" },
    });
    expect(wrapper.classes()).toContain("bg-secondary");
  });

  it("applies outline variant", () => {
    const wrapper = mount(Badge, {
      props: { variant: "outline" },
      slots: { default: "outline" },
    });
    expect(wrapper.classes()).toContain("text-foreground");
  });
});
