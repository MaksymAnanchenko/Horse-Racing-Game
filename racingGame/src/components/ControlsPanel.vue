<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();
const status = computed(() => store.state.status);
const canGenerate = computed(
  () => status.value === "idle" || status.value === "finished"
);
const canStart = computed(
  () =>
    store.state.rounds.length > 0 &&
    (status.value === "generated" || status.value === "idle") &&
    store.state.currentRoundIndex < store.state.rounds.length
);
const currentRound = computed(() => store.state.currentRoundIndex + 1);
const participantCount = ref<number>(store.state.participantCount);
const anim = computed(() => store.state.currentAnimation);
const audioRef = ref<HTMLAudioElement | null>(null);

// sync local input when store changes from elsewhere
watch(
  () => store.state.participantCount,
  (n: number) => {
    participantCount.value = n;
  }
);

function updateCount() {
  store.commit("SET_PARTICIPANT_COUNT", participantCount.value);
}
function generate() {
  store.dispatch("generate");
}
function start() {
  // Start audio track on user click and keep playing until round ends
  const audio = audioRef.value;
  if (audio) {
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {
        /* ignore play rejections in non-user envs */
      });
    } catch {}
  }
  store.dispatch("start");
}

// Stop audio when animation payload clears (round completed) or when finished
watch(anim, (a) => {
  if (!a) {
    const audio = audioRef.value;
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    }
  }
});
</script>

<template>
  <div class="panel">
    <div class="row">
      <label class="label">Participants:</label>
      <input
        class="input"
        type="number"
        min="1"
        max="20"
        :disabled="!canGenerate"
        v-model.number="participantCount"
        @change="updateCount"
      />
      <small class="hint">Same horses run all 6 rounds</small>
    </div>
    <div class="meta">
      <span
        >Status: <strong>{{ status }}</strong></span
      >
      <span v-if="status !== 'idle'"
        >Round: <strong>{{ Math.min(currentRound, 6) }}/6</strong></span
      >
    </div>
    <div class="row start-row">
      <button class="btn btn-large" :disabled="!canGenerate" @click="generate">
        Generate
      </button>
      <button
        class="btn primary btn-large"
        :disabled="!canStart"
        @click="start"
      >
        Start
      </button>
    </div>
    <!-- Hidden audio element for race sound -->
    <audio
      ref="audioRef"
      src="/media/Horse.mp3"
      preload="auto"
      loop
      hidden
    ></audio>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.start-row {
  margin-top: 0.25rem;
}
.btn {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: white;
}
.btn.primary {
  background: #2b7cff;
  color: white;
  border-color: #2b7cff;
}
.btn-large {
  font-size: 1.1rem;
  padding: 0.75rem 1.25rem;
  font-weight: 700;
  border-width: 2px;
}
.btn.primary.btn-large {
  box-shadow: 0 2px 8px rgba(43, 124, 255, 0.4);
}
.btn-large:not(:disabled):hover {
  filter: brightness(1.03);
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.label {
  font-size: 0.9rem;
  color: #444;
}
.input {
  width: 80px;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.hint {
  color: #777;
}
.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #555;
}
</style>
