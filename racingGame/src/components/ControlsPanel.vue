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
  gap: 0.875rem;
}
.row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.start-row {
  margin-top: 0.25rem;
  gap: 0.75rem;
}
.btn {
  padding: 0.5rem 0.875rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-family: inherit;
  font-weight: 500;
  font-size: 0.9rem;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.28);
}
.btn.primary {
  background: linear-gradient(135deg, #f5a623 0%, #e94560 100%);
  color: white;
  border: none;
}
.btn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
.btn-large {
  font-size: 1rem;
  padding: 0.625rem 1.5rem;
  font-weight: 700;
  border-radius: 10px;
}
.btn.primary.btn-large {
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.45);
}
.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.label {
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 500;
}
.input {
  width: 80px;
  padding: 5px 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  border-color: #f5a623;
  box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.2);
}
.hint {
  color: #64748b;
  font-size: 0.8rem;
}
.meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #94a3b8;
}
.meta strong {
  color: #f5a623;
}
</style>
