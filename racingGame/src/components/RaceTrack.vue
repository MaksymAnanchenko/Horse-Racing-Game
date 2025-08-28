<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import type { Horse } from "@/types";

const store = useStore();
const currentRound = computed(() => store.getters.currentRound);
const horsesMap = computed<Map<number, Horse>>(
  () => new Map<number, Horse>(store.state.horses.map((h: Horse) => [h.id, h]))
);
const anim = computed(() => store.state.currentAnimation);
const noTransition = ref(true);
let rafId: number | null = null;

// positions: horseId -> percent (0..100)
const positions = ref<Record<number, number>>({});

function resetPositions() {
  const round = currentRound.value;
  if (!round) return;
  const pos: Record<number, number> = {};
  round.horses.forEach((id: number) => (pos[id] = 0));
  positions.value = pos;
  // disable transitions so reset to 0% is instant
  noTransition.value = true;
}

watch(currentRound, () => {
  // whenever round changes, reset positions to 0
  resetPositions();
});

watch(anim, (a) => {
  // when animation payload arrives, drive transitions to 100%
  if (!a || !currentRound.value || a.roundIndex !== currentRound.value.index)
    return;
  // kick next tick to let styles apply
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  rafId = requestAnimationFrame(() => {
    // re-enable transitions only for the run forward
    noTransition.value = false;
    const next: Record<number, number> = { ...positions.value };
    currentRound.value!.horses.forEach((id: number) => {
      next[id] = 100;
    });
    positions.value = next;
    rafId = null;
  });
});

onMounted(() => resetPositions());

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
});

function laneStyle(horseId: number) {
  const duration = anim.value?.perHorseDisplayMs[horseId] ?? 1500;
  return {
    transition: noTransition.value ? "none" : `left ${duration}ms linear`,
    left: `${positions.value[horseId] || 0}%`
  };
}

function horseLabel(horseId: number) {
  const h = horsesMap.value.get(horseId) as Horse;
  return `${h.name}`;
}
</script>

<template>
  <div>
    <h3>Race Track</h3>
    <div v-if="!currentRound" class="placeholder">
      Generate and press Start to race.
    </div>
    <div v-else class="track" :data-distance="currentRound.distance">
      <div
        class="lane"
        v-for="hid in currentRound.horses"
        :key="`${currentRound.index}-${hid}`"
      >
        <div
          class="horse"
          :style="{ backgroundColor: horsesMap.get(hid)?.color }"
        >
          <img
            class="sprite"
            :style="laneStyle(hid)"
            src="/imgs/horse.svg"
            alt="horse"
          />
        </div>
        <span class="label">{{ horseLabel(hid) }}</span>
      </div>
      <div class="finish">Finish ({{ currentRound.distance }}m)</div>
    </div>
  </div>
</template>

<style scoped>
.placeholder {
  color: #777;
  font-style: italic;
}
.track {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: repeating-linear-gradient(
    0deg,
    #f8f8f8,
    #f8f8f8 24px,
    #f1f1f1 24px,
    #f1f1f1 48px
  );
  padding: 16px;
  overflow: hidden;
}
.lane {
  display: grid;
  /* Fix label column width so track length is constant and not affected by name length */
  grid-template-columns: 1fr 140px;
  align-items: center;
  gap: 8px;
  height: 48px;
}
.horse {
  height: 24px;
  border-radius: 12px;
  position: relative;
  background-clip: padding-box;
  padding: 2px;
}
.horse .sprite {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: auto;
  aspect-ratio: 1 / 1;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
}
.label {
  font-size: 0.85rem;
  color: #333;
  justify-self: end;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.finish {
  position: absolute;
  right: 8px;
  top: 8px;
  font-size: 0.8rem;
  color: #555;
}
</style>
