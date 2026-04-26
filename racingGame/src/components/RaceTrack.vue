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
  padding: 2rem 1rem;
  font-size: 0.9rem;
}
.track {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: repeating-linear-gradient(
    0deg,
    #1a4a2e,
    #1a4a2e 24px,
    #15402a 24px,
    #15402a 48px
  );
  padding: 8px 16px 8px 8px;
  overflow: hidden;
  box-shadow:
    inset 0 2px 16px rgba(0, 0, 0, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.3);
}
.lane {
  display: grid;
  grid-template-columns: 1fr 140px;
  align-items: center;
  gap: 8px;
  height: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
.lane:last-child {
  border-bottom: none;
}
.horse {
  height: 26px;
  border-radius: 13px;
  position: relative;
  background-clip: padding-box;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}
.horse .sprite {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: auto;
  aspect-ratio: 1 / 1;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5)) brightness(1.1);
}
.label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  justify-self: end;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.finish {
  position: absolute;
  right: 8px;
  top: 6px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>
