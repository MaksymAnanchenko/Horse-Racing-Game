<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";
import type { RoundResult, Horse } from "@/types";

const store = useStore();
const results = computed<RoundResult[]>(() => store.state.results);
const horsesMap = computed(
  () => new Map(store.state.horses.map((h: Horse) => [h.id, h]))
);

function horseName(id: number) {
  const h = horsesMap.value.get(id) as Horse | undefined;
  return h ? h.name : `#${id}`;
}
</script>

<template>
  <div>
    <h3>Results</h3>
    <div v-if="results.length === 0" class="placeholder">No results yet.</div>
    <div v-for="r in results" :key="r.roundIndex" class="round">
      <div class="round-header">
        Round {{ r.roundIndex + 1 }} — {{ r.distance }}m
      </div>
      <ol class="rank">
        <li v-for="f in r.finishes" :key="f.horseId">
          <span class="position">{{ f.rank }}.</span>
          <span class="name">{{ horseName(f.horseId) }}</span>
          <span class="time">{{ (f.timeMs / 10000).toFixed(3) }}s</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}
.placeholder {
  color: #64748b;
  font-style: italic;
  text-align: center;
  padding: 1.5rem 0;
  font-size: 0.9rem;
}
.round {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  margin-bottom: 8px;
  transition: background 0.15s, border-color 0.15s;
}
.round:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.13);
}
.round-header {
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #f5a623;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.rank {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.rank li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}
.position {
  width: 2ch;
  display: inline-block;
  color: #475569;
  font-weight: 700;
  font-size: 0.8rem;
}
.name {
  font-weight: 600;
  color: #e2e8f0;
}
.time {
  margin-left: auto;
  color: #64748b;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
</style>
