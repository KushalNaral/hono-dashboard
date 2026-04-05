import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Input from "@/components/ui/input/Input.vue";

describe("Input", () => {
  it("renders with placeholder", () => {
    const wrapper = mount(Input, { props: { placeholder: "Enter text" } });
    expect(wrapper.attributes("placeholder")).toBe("Enter text");
  });

  it("binds modelValue", () => {
    const wrapper = mount(Input, { props: { modelValue: "hello" } });
    expect((wrapper.element as HTMLInputElement).value).toBe("hello");
  });

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(Input, { props: { modelValue: "" } });
    await wrapper.setValue("new value");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted("update:modelValue") as string[][];
    expect(emitted[emitted.length - 1][0]).toBe("new value");
  });

  it("can be disabled", () => {
    const wrapper = mount(Input, { props: { disabled: true } });
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("supports different types", () => {
    const wrapper = mount(Input, { props: { type: "password" } });
    expect(wrapper.attributes("type")).toBe("password");
  });
});
