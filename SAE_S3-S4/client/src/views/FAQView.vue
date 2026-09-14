<template>
  <section id="faq" class="page-section">
    <div class="about-content">
      <div class="about-text">
        <h1>{{ t('faq.title') }}</h1>

        <div class="faq-list">
          <div class="faq-item" v-for="(item, idx) in t('faq.items')" :key="idx">
            <h3 class="faq-question">{{ item.q }}</h3>
            <p class="faq-answer" v-html="item.a"></p>
          </div>
        </div>

        <div class="faq-highlight">
          <h2>{{ t('faq.camping.title') }}</h2>
          <p class="faq-highlight-text" v-html="t('faq.camping.text')"></p>
        </div>
      </div>
      <div class="about-image">
        <img src="/GP_EXPLORER_-LOGO.png" alt="GP Explorer" />
      </div>
    </div>
  </section>
</template>

<script>
import { useI18n } from '@/composables/useI18n.js'

export default {
  name: 'FAQView',
  setup() {
    const { t } = useI18n()
    return { t }
  }
}
</script>

<style scoped>
/* meme espacement que les autres pages sous la navbar fixe */
.page-section {
  padding: 5.5rem 2rem 2rem; /* decalage pour la navbar fixe */
  color: var(--text-strong);
  background: linear-gradient(180deg, var(--surface-gradient-start), var(--surface-gradient-end));
}
.about-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  max-width: 1100px;
  margin: 0 auto;
}
.about-text { flex: 1; }
.about-text h1 {
  color: var(--text-strong);
  margin-bottom: 8px;
}
.about-image { background: transparent; display: flex; align-items: center; justify-content: center; }
.about-image img { max-width: 260px; border-radius: 0; box-shadow: none; background: transparent; }
.faq-list { margin-top: 16px; }
.faq-item { margin-bottom: 18px; background: var(--surface-card); padding: 16px; border-radius: 10px; border: 1px solid var(--border-subtle); }
.faq-question { font-size: 1.1rem; margin: 0 0 6px; color: var(--text-strong); }
.faq-answer { margin: 0; color: var(--text-soft); }
.faq-highlight { margin-bottom: 18px; padding: 18px; border-radius: 12px; background: linear-gradient(180deg, var(--surface-card-strong), var(--surface-card)); border: 1px solid var(--border-accent); }
.faq-highlight h2 { margin: 0 0 8px; color: var(--text-strong); }
.faq-highlight-text { margin: 0; color: var(--text-soft); }
@media (max-width: 800px) {
  .about-content { flex-direction: column; align-items: center; }
  .about-image img { max-width: 180px; }
  .page-section { padding-top: 5.2rem; }
}
</style>

<style>
/* ajustements globaux mode sombre pour le faq */
html.dark-mode #faq {
  background-color: #000000 !important;
  background-image: none !important;
  color: var(--text-strong);
}
html.dark-mode #faq .faq-item {
  background: var(--surface-card);
  border-color: var(--border-subtle);
}
html.dark-mode #faq .faq-answer {
  color: var(--text-soft);
}
/* on retire toute ombre globale sur le logo en mode sombre */
html.dark-mode #faq .about-image img {
  box-shadow: none !important;
  background: transparent !important;
  /* logo force en blanc comme la navbar */
  filter: brightness(0) invert(1) !important;
}
</style>
