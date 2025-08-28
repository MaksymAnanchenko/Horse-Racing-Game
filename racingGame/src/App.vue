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
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
header {
  margin-bottom: 1rem;
}
.layout {
  display: grid;
  gap: 1rem;
  align-items: start;
  /* Mobile-first: single column layout */
  grid-template-columns: 1fr;
  grid-template-areas:
    "left"
    "center"
    "right";
}
.left,
.right,
.center {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0.75rem;
}

/* Map grid areas */
.left {
  grid-area: left;
}
.center {
  grid-area: center;
}
.right {
  grid-area: right;
}

/* Medium screens: two columns, track gets its own column, results full-width below */
@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "left center"
      "right right";
  }
}

/* Large screens: original three-column layout */
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-areas: "left center right";
  }
}
</style>
