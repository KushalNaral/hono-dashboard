import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Button from "@/components/ui/button/Button.vue";

describe("Button", () => {
  it("renders slot content", () => {
    const wrapper = mount(Button, { slots: { default: "Click me" } });
    expect(wrapper.text()).toBe("Click me");
  });

  it("applies default variant classes", () => {
    const wrapper = mount(Button, { slots: { default: "Test" } });
    expect(wrapper.classes()).toContain("bg-primary");
  });

  it("applies destructive variant", () => {
    const wrapper = mount(Button, {
      props: { variant: "destructive" },
      slots: { default: "Delete" },
    });
    expect(wrapper.classes()).toContain("bg-destructive");
  });

  it("applies outline variant", () => {
    const wrapper = mount(Button, {
      props: { variant: "outline" },
      slots: { default: "Outline" },
    });
    expect(wrapper.html()).toContain("border");
  });

  it("renders as disabled", () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: "Disabled" },
    });
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("applies size classes", () => {
    const wrapper = mount(Button, {
      props: { size: "sm" },
      slots: { default: "Small" },
    });
    expect(wrapper.classes()).toContain("h-8");
  });

  it("emits click event", async () => {
    const wrapper = mount(Button, { slots: { default: "Click" } });
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("sets correct button type", () => {
    const wrapper = mount(Button, {
      props: { type: "submit" },
      slots: { default: "Submit" },
    });
    expect(wrapper.attributes("type")).toBe("submit");
  });
});
