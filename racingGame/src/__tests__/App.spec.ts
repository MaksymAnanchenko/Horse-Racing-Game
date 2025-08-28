import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import App from "../App.vue";
import store from "@/store";

describe("App", () => {
  it("renders header and controls", () => {
    const wrapper = mount(App, {
      global: { plugins: [store] }
    });
    expect(wrapper.find("h1").text()).toContain("Horse Racing Game");
    expect(wrapper.find("button").exists()).toBe(true);
  });
});
