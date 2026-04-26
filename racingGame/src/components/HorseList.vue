<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import type { Horse } from "@/types";

const store = useStore();
// Live-sorted by condition desc, then by id asc for stability
const horsesSorted = computed<Horse[]>(() => {
  return [...store.state.horses].sort((a, b) => {
    if (b.condition !== a.condition) return b.condition - a.condition;
    return a.id - b.id;
  });
});
</script>

<template>
  <div>
    <h3>Horses ({{ horsesSorted.length }}/20)</h3>
    <ul class="list">
      <li v-for="(h, idx) in horsesSorted" :key="h.id">
        <span class="rank">{{ idx + 1 }}.</span>
        <span class="swatch" :style="{ backgroundColor: h.color }"></span>
        <span class="name">{{ h.name }}</span>
        <span class="cond">Condition: {{ h.condition }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
h3 {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  margin-bottom: 0.625rem;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;
  max-height: 422px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}
li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  transition:
    background 0.15s,
    border-color 0.15s;
}
li:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
}
.rank {
  width: 2ch;
  text-align: right;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
}
.swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}
.name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #e2e8f0;
}
.cond {
  margin-left: auto;
  color: #64748b;
  font-size: 0.8rem;
}
</style>
