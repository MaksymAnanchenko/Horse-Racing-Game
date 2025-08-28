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
.placeholder {
  color: #777;
  font-style: italic;
}
.round {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
  background: #fff;
  margin-bottom: 8px;
}
.round-header {
  font-weight: 700;
  margin-bottom: 4px;
}
.rank {
  margin: 0;
  padding-left: 1rem;
}
.position {
  width: 2ch;
  display: inline-block;
  color: #666;
}
.name {
  font-weight: 600;
  margin-left: 4px;
}
.time {
  margin-left: 8px;
  color: #555;
  font-variant-numeric: tabular-nums;
}
</style>
