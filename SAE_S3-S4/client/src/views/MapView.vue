<template>
  <div class="map-page">
    <!-- section hero -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="section-header">
          <div class="title-with-lines">
            <div class="header-stripe left"></div>
            <h1 class="main-title">{{ t.title }}</h1>
            <div class="header-stripe right"></div>
          </div>
          <h2 class="subtitle-red">{{ t.subtitle }}</h2>
          <p class="description">{{ t.description }}</p>
        </div>
      </div>
    </section>

    <!-- section carte -->
    <section class="map-content">
      <div class="container">
        <CircuitMap />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CircuitMap from '@/components/CircuitMap.vue'
import { useLanguage } from '@/composables/useLanguage.js'

const { currentLanguage } = useLanguage()

const translations = {
  fr: {
    title: "CARTE DU CIRCUIT BUGATTI",
    subtitle: "PLAN COMPLET DU CIRCUIT",
    description: "Découvrez le plan complet du Circuit Bugatti du Mans avec les zones de parking et de camping."
  },
  en: {
    title: "BUGATTI CIRCUIT MAP",
    subtitle: "COMPLETE CIRCUIT PLAN",
    description: "Discover the complete map of the Le Mans Bugatti Circuit including parking and camping zones."
  },
  es: {
    title: "MAPA DEL CIRCUITO BUGATTI",
    subtitle: "PLAN COMPLETO DEL CIRCUITO",
    description: "Descubre el mapa completo del Circuito Bugatti de Le Mans con las zonas de aparcamiento y camping."
  }
}

const t = computed(() => translations[currentLanguage.value] || translations.fr)
</script>

<style scoped>
.map-page {
  min-height: 100vh;
  background: var(--surface-gradient-start);
  color: var(--text-strong);
  font-family: 'Inter', sans-serif;
}

/* section hero */
.hero-section {
  margin-top: 70px;
  background: #0a0a0a;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.title-with-lines {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  width: 100%;
  max-width: 1000px;
}

.header-stripe {
  flex: 1;
  height: 3px;
  background: #E72D55;
}

.header-stripe.left {
  background: linear-gradient(to right, transparent, #E72D55);
}

.header-stripe.right {
  background: linear-gradient(to left, transparent, #E72D55);
}

.main-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  color: var(--text-strong);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
  flex-shrink: 0;
}

.subtitle-red {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 900;
  color: #E72D55;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.description {
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: #b0b0b0;
  margin: 0;
  max-width: 800px;
  line-height: 1.6;
}

/* contenu carte */
.map-content {
  background: var(--surface-gradient-start);
  padding: 4rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* mode sombre */
html:not(.dark-mode) .hero-section {
  background: var(--surface-gradient-start);
}

html.dark-mode .map-page {
  background: var(--surface-gradient-start);
}

html.dark-mode .hero-section {
  background: var(--surface-gradient-start);
}

html.dark-mode .map-content {
  background: var(--surface-gradient-start);
}

/* responsive */
@media (max-width: 768px) {
  .title-with-lines {
    gap: 1rem;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .map-content {
    padding: 2rem 0;
  }
}
</style>