<script setup lang="ts">
import ControlsPanel from "./components/ControlsPanel.vue";
import HorseList from "./components/HorseList.vue";
import RaceTrack from "./components/RaceTrack.vue";
import ResultsPanel from "./components/ResultsPanel.vue";
</script>

<template>
  <div class="container">
    <header>
      <h1>Horse Racing Game</h1>
    </header>
    <main class="layout">
      <section class="left">
        <ControlsPanel />
        <HorseList />
      </section>
      <section class="center">
        <RaceTrack />
      </section>
      <section class="right">
        <ResultsPanel />
      </section>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}
header {
  margin-bottom: 1.75rem;
  text-align: center;
}
header h1 {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f5a623 0%, #e94560 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.layout {
  display: grid;
  gap: 1.25rem;
  align-items: start;
  grid-template-columns: 1fr;
  grid-template-areas:
    "left"
    "center"
    "right";
}
.left,
.right,
.center {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}
.left {
  grid-area: left;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.center { grid-area: center; }
.right { grid-area: right; }

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "left center"
      "right right";
  }
}
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 2.5fr 1fr;
    grid-template-areas: "left center right";
  }
}
</style>
