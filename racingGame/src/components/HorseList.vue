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
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  max-height: 420px;
  overflow: auto;
}
li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: white;
}
.rank {
  width: 2ch;
  text-align: right;
  color: #666;
}
.swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid #ddd;
}
.name {
  font-weight: 600;
}
.cond {
  margin-left: auto;
  color: #666;
  font-size: 0.85rem;
}
</style>
