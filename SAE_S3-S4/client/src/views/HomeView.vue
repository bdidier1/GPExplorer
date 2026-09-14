<template>
  <section id="home">
    <div class="checkered-flag">
      <div v-for="row in 3" :key="`home-row-${row}`" class="checkered-row">
        <div
          v-for="col in numberOfColumns"
          :key="`home-col-${row}-${col}`"
          class="checkered-square"
          :class="{ black: (row + col) % 2 === 1, white: (row + col) % 2 === 0 }"
        ></div>
      </div>
    </div>

    <video class="background-video" autoplay muted loop>
      <source src="/img/GP Explorer - la bande-annonce officielle.mp4" type="video/mp4" />
    </video>

    <div class="video-overlay"></div>

    <div class="main-content">
      <div class="left-section">
        <div class="title-block">
          <h1 class="main-title">{{ t('home.title') }}</h1>
          <div class="subtitle-block">
            <span class="subtitle">{{ t('home.subtitle') }}</span>
          </div>
        </div>

        <div class="event-info">
          <div class="event-dates">{{ t('home.dates') }}</div>
          <div class="location">{{ t('home.location') }}</div>
          <div class="city">{{ t('home.city') }}</div>
          <button class="billetterie-btn-left" @click="goToBilletterie">
            {{ t('home.tickets_btn') }}
          </button>
        </div>
      </div>

      <div class="right-section">
        <div class="countdown-container">
          <h2 class="countdown-title">{{ t('home.countdown_title') }}</h2>
          <div class="f1-timer-container">
            <div class="timer-screen">
              <div class="timer-display">
                <div class="time-group">
                  <span class="time-value">{{ days.toString().padStart(2, '0') }}</span>
                  <span class="time-label">{{ t('home.countdown.days') }}</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-group">
                  <span class="time-value">{{ hours.toString().padStart(2, '0') }}</span>
                  <span class="time-label">{{ t('home.countdown.hours') }}</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-group">
                  <span class="time-value">{{ minutes.toString().padStart(2, '0') }}</span>
                  <span class="time-label">{{ t('home.countdown.minutes') }}</span>
                </div>
                <span class="time-separator">:</span>
                <div class="time-group">
                  <span class="time-value">{{ seconds.toString().padStart(2, '0') }}</span>
                  <span class="time-label">{{ t('home.countdown.seconds') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="scrolling-text-bar">
      <div class="scrolling-content">
        <span class="scrolling-item">{{ t('home.scrolling_text.event_date') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.tickets_available') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.food_drinks') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.concerts') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.activities') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.limited_seats') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.event_date') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.tickets_available') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.food_drinks') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.concerts') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.activities') }}</span>
        <span class="scrolling-item">{{ t('home.scrolling_text.limited_seats') }}</span>
      </div>
    </div>
  </section>

  <section id="home-about">
    <div class="checkered-flag">
      <div v-for="row in 3" :key="`about-row-${row}`" class="checkered-row">
        <div
          v-for="col in numberOfColumns"
          :key="`about-col-${row}-${col}`"
          class="checkered-square"
          :class="{ black: (row + col) % 2 === 1, white: (row + col) % 2 === 0 }"
        ></div>
      </div>
    </div>

    <div class="about-content">
      <div class="about-text">
        <h2>{{ aboutContent.title }}</h2>
        <div v-html="aboutContent.htmlContent"></div>
      </div>
      <div class="about-image">
        <img :src="aboutContent.imageUrl" :alt="aboutContent.title" />
      </div>
    </div>
  </section>

  <OfficialPartnersSection
    section-id="home-prestataires"
    :title="t('partners.title')"
    :subtitle="t('partners.subtitle')"
    :intro="t('partners.intro')"
    :searchPlaceholder="t('partners.search_placeholder')"
    :allCategories="t('partners.all_categories')"
    :clearSearch="t('partners.clear_search')"
    :resultsFound="t('partners.results_found')"
    :noResults="t('partners.no_results')"
    :categoryLabels="{
      organizer: t('partners.categories.organizer'),
      gaming: t('partners.categories.gaming'),
      beverages: t('partners.categories.beverages'),
      karting: t('partners.categories.karting'),
      camping: t('partners.categories.camping'),
      food: t('partners.categories.food'),
      music: t('partners.categories.music')
    }"
  />

  <section id="home-carte">
    <h1>{{ t('home.map_title') }}</h1>
    <div class="map-container">
      <CircuitMap />
    </div>
  </section>
</template>

<script>
// doc i18n utile pour garder la logique de traduction
// https://vue-i18n.intlify.dev/guide/introduction.html
// https://vue-i18n.intlify.dev/guide/essentials/started.html
// https://vue-i18n.intlify.dev/guide/advanced/lazy.html
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
import CircuitMap from '@/components/CircuitMap.vue';
import OfficialPartnersSection from '@/components/OfficialPartnersSection.vue';
import { useHomeContentStore } from '@/stores/homeContent';
import { useI18n } from '@/composables/useI18n.js';
import { useLanguage } from '@/composables/useLanguage.js';

export default {
  name: 'HomeView',
  components: {
    CircuitMap,
    OfficialPartnersSection
  },
  setup() {
    const { t } = useI18n();
    const { currentLanguage } = useLanguage();
    return { t, currentLanguage };
  },
  data() {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      timer: null,
      numberOfColumns: 100,
      languageChangeHandler: null,
    }
  },
  computed: {
    homeContentStore() {
      return useHomeContentStore()
    },
    aboutContent() {
      return this.homeContentStore.getContent(this.currentLanguage)
    }
  },
  async mounted() {
    await this.homeContentStore.loadContent()
    this.startCountdown();
    this.calculateColumns();
    window.addEventListener('resize', this.calculateColumns);
    
    // on ecoute les changements de langue
    this.languageChangeHandler = (event) => {
      this.currentLanguage = event.detail.language;
    };
    globalThis.addEventListener('languageChanged', this.languageChangeHandler);
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    window.removeEventListener('resize', this.calculateColumns);
    if (this.languageChangeHandler) {
      globalThis.removeEventListener('languageChanged', this.languageChangeHandler);
    }
  },
  methods: {
    startCountdown() {
      const targetDate = new Date('2026-10-08T00:00:00').getTime();
      
      this.timer = setInterval(() => {
        const now = Date.now();
        const distance = targetDate - now;
        
        if (distance > 0) {
          this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
          this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
        } else {
          this.days = 0;
          this.hours = 0;
          this.minutes = 0;
          this.seconds = 0;
          clearInterval(this.timer);
        }
      }, 1000);
    },
    goToBilletterie() {
      // on redirige vers la billetterie
      try {
        this.$router.push({ name: 'tickets' });
      } catch (err) {
        // si la route nommee echoue on passe par le chemin
        console.error('Navigation vers la billetterie échouée:', err);
        this.$router.push('/tickets');
      }
    },
    calculateColumns() {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 480) {
        this.numberOfColumns = Math.floor(screenWidth / 12);
      } else if (screenWidth <= 768) {
        this.numberOfColumns = Math.floor(screenWidth / 15);
      } else {
        this.numberOfColumns = Math.floor(screenWidth / 20);
      }
      
      // on garde une plage stable pour eviter les valeurs extremes
      this.numberOfColumns = Math.max(10, Math.min(150, this.numberOfColumns));
    }
  }
}
</script>

<style scoped>
/* styles de la page importes depuis le fichier dedie */
@import '@/assets/HomeView.css';

</style>