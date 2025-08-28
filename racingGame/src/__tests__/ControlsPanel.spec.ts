import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ControlsPanel from "@/components/ControlsPanel.vue";
import store from "@/store";

describe("ControlsPanel", () => {
  it("shows status/round and has Generate/Start buttons with proper disabled state", async () => {
    store.commit("RESET");
    const wrapper = mount(ControlsPanel, { global: { plugins: [store] } });

    // Initially idle -> only Generate enabled, Start disabled
    let [generateBtn, startBtn] = wrapper.findAll("button");
    expect(generateBtn.text()).toMatch(/Generate/i);
    expect(startBtn.text()).toMatch(/Start/i);
    expect(generateBtn.attributes("disabled")).toBeUndefined();
    expect(startBtn.attributes("disabled")).toBeDefined();

    // After generate -> status generated, start enabled
    await store.dispatch("generate");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    [generateBtn, startBtn] = wrapper.findAll("button");
    expect(wrapper.text()).toMatch(/Status:\s*generated/i);
    expect(startBtn.attributes("disabled")).toBeUndefined();

    // After one start -> status generated again (until finished)
    const p = store.dispatch("start");
    // rely on fake timers to avoid long wait in unit env
    await p;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(/Status:\s*(generated|finished)/i.test(wrapper.text())).toBe(true);
  }, 15000);
});
