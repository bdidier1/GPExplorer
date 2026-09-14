<template>
  <div class="teams-page">
    <!-- section hero -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="section-header">
          <div class="title-with-lines">
            <div class="header-stripe left"></div>
            <h1 class="main-title">{{ t('teams.page_title') }}</h1>
            <div class="header-stripe right"></div>
          </div>
          <h2 class="subtitle-red">{{ t('teams.subtitle') }}</h2>
          <p class="description">{{ t('teams.intro') }}</p>
        </div>
      </div>
    </section>

    <!-- grille des equipes -->
    <section class="teams-list">
      <div class="container">
        <div class="teams-grid">
          <article v-for="team in teams" :key="team.id" class="team-card">
            <div class="team-header">
              <div class="team-logo">
                  <img :src="team.logo" :alt="team.name" class="team-logo-img" />
              </div>
              <div class="team-info">
                <h3 class="team-name">{{ team.name }}</h3>
                <span class="team-base">{{ t(team.description) }}</span>
              </div>
            </div>
            <div class="team-color-bar" :style="{ background: team.color }"></div>
            <div class="drivers">
              <div v-for="driver in team.drivers" :key="driver.number" class="driver-item">
                <span class="driver-number">{{ driver.number }}</span>
                <span class="driver-name">{{ driver.name }}</span>
                <span class="driver-country">{{ driver.country }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n.js'
import teamsData from '@/data/teams.json'

const { t } = useI18n()
const teams = ref(teamsData)
</script>

<style scoped>
.teams-page {
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

/* liste des equipes */
.teams-list {
  background: var(--surface-gradient-start);
  padding: 4rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

/* carte equipe */
.team-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 1.2rem;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--card-shadow);
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px var(--accent-shadow);
}

.team-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface-panel);
}

.team-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-muted);
  border-radius: 12px;
  padding: 0.5rem;
}

.team-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-strong);
  margin: 0 0 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.team-base {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.team-color-bar {
  height: 6px;
  width: 100%;
}

.drivers {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.driver-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-muted);
  border-radius: 0.8rem;
  transition: all 0.2s ease;
}

.driver-item:hover {
  background: var(--surface-chip);
  transform: translateX(5px);
}

.driver-number {
  font-size: 1.5rem;
  font-weight: 900;
  color: #E72D55;
  min-width: 40px;
  text-align: center;
}

.driver-name {
  flex: 1;
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-strong);
}

.driver-country {
  font-size: 1.5rem;
}

/* mode sombre */
html:not(.dark-mode) .hero-section {
  background: var(--surface-gradient-start);
}

html.dark-mode .teams-page {
  background: var(--surface-gradient-start);
}

html.dark-mode .hero-section {
  background: var(--surface-gradient-start);
}

html.dark-mode .teams-list {
  background: var(--surface-gradient-start);
}

html.dark-mode .team-card {
  background: var(--surface-card);
  border-color: var(--border-subtle);
}

html.dark-mode .team-header {
  background: var(--surface-panel);
}

html.dark-mode .driver-item {
  background: var(--surface-muted);
}

html.dark-mode .driver-item:hover {
  background: rgba(231, 45, 85, 0.15);
}

/* responsive */
@media (max-width: 768px) {
  .title-with-lines {
    gap: 1rem;
  }

  .teams-grid {
    grid-template-columns: 1fr;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .teams-list {
    padding: 2rem 0;
  }
}
</style>