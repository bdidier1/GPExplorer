<template>
  <div class="provider-container">
    <ProviderSidebar />

    <main class="main-content">
      <div class="provider-stats-container">
        <div class="stats-header">
          <h1>{{ t('provider.stats.title') }}</h1>
          <p class="stats-subtitle">{{ t('provider.stats.subtitle') }}</p>
        </div>

        <div class="stats-display">
          <div class="stat-block">
            <div class="stat-accent" style="background: #e72d55;"></div>
            <div class="stat-main">
              <div class="stat-number">{{ providerStats.totalVisits }}</div>
              <div class="stat-desc">{{ t('provider.stats.total_visits') }}</div>
            </div>
          </div>
          <div class="stat-block">
            <div class="stat-accent" style="background: #FF6B8A;"></div>
            <div class="stat-main">
              <div class="stat-number">{{ providerStats.todayVisits }}</div>
              <div class="stat-desc">{{ t('provider.stats.today_visits') }}</div>
            </div>
          </div>
          <div class="stat-block">
            <div class="stat-accent" style="background: #FF8FA3;"></div>
            <div class="stat-main">
              <div class="stat-number">{{ providerStats.weekVisits }}</div>
              <div class="stat-desc">{{ t('provider.stats.week_visits') }}</div>
            </div>
          </div>
          <div class="stat-block">
            <div class="stat-accent" style="background: #22c55e;"></div>
            <div class="stat-main">
              <div class="stat-number">{{ providerStats.totalProductsSold }}</div>
              <div class="stat-desc">{{ t('provider.stats.total_products_sold') }}</div>
            </div>
          </div>
          <div class="stat-block">
            <div class="stat-accent" style="background: #0ea5e9;"></div>
            <div class="stat-main">
              <div class="stat-number">{{ formatCurrency(providerStats.totalRevenue) }}</div>
              <div class="stat-desc">{{ t('provider.stats.total_revenue') }}</div>
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">{{ t('provider.stats.visits_chart_title') }}</h3>
          <div class="chart-container">
            <canvas ref="visitsChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ t('provider.stats.sales_chart_title') }}</h3>
            <div class="range-filter">
              <button
                v-for="option in rangeOptions"
                :key="option.value"
                type="button"
                :class="['range-btn', { active: salesRange === option.value }]"
                @click="salesRange = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="salesChart"></canvas>
          </div>
        </div>

        <div class="actions-section">
          <button class="action-btn back-btn" @click="goBack">
            {{ t('provider.stats.back_btn') }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/login.js';
import ProviderSidebar from '@/components/Provider/ProviderSidebar.vue'
import { getProviderVisitorSummary } from '@/services/analytics.service.js';
import Chart from 'chart.js/auto';
import { useI18n } from '@/composables/useI18n.js';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// refs
const visitsChart = ref(null);
const salesChart = ref(null);
let visitsChartInstance = null;
let salesChartInstance = null;

// stats prestataire
const providerStats = ref({
  totalVisits: 0,
  todayVisits: 0,
  weekVisits: 0,
  totalProductsSold: 0,
  totalRevenue: 0
});

const providerDaily = ref([])
const providerSalesDaily = ref([])
const salesRange = ref('7d')

const rangeOptions = computed(() => ([
  { value: '7d', label: t('provider.stats.range_7d') },
  { value: '15d', label: t('provider.stats.range_15d') },
  { value: '30d', label: t('provider.stats.range_30d') }
]))

function resolveRangeDays(rangeValue) {
  if (rangeValue === '15d') return 15
  if (rangeValue === '30d') return 30
  return 7
}

const filteredSalesDaily = computed(() => {
  const days = resolveRangeDays(salesRange.value)
  return providerSalesDaily.value.slice(-days)
})

async function loadProviderStats() {
  const providerId = authStore.user?.providerId || authStore.user?.id
  const summary = await getProviderVisitorSummary(providerId)
  providerStats.value = {
    totalVisits: Number(summary.totalVisits) || 0,
    todayVisits: Number(summary.todayVisits) || 0,
    weekVisits: Number(summary.weekVisits) || 0,
    totalProductsSold: Number(summary.shop?.totalProductsSold) || 0,
    totalRevenue: Number(summary.shop?.totalRevenue) || 0
  }
  providerDaily.value = Array.isArray(summary.daily) ? summary.daily : []
  providerSalesDaily.value = Array.isArray(summary.shop?.daily) ? summary.shop.daily : []
}

function destroyChart() {
  if (visitsChartInstance) {
    visitsChartInstance.destroy();
    visitsChartInstance = null;
  }
  if (salesChartInstance) {
    salesChartInstance.destroy();
    salesChartInstance = null;
  }
}

function createVisitsChart() {
  const ctx = visitsChart.value?.getContext('2d');
  if (!ctx) return;

  destroyChart()

  const labels = providerDaily.value.map(d => d.date?.slice(5) || d.date)
  const values = providerDaily.value.map(d => Number(d.count) || 0)

  if (!labels.length) {
    return
  }

  visitsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: t('provider.stats.week_visits'),
        data: values,
        backgroundColor: '#e72d55',
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#666' },
          grid: { color: 'rgba(0, 0, 0, 0.08)' }
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#666' },
          grid: { color: 'rgba(0, 0, 0, 0.04)' }
        }
      }
    }
  });
}

function createSalesChart() {
  const ctx = salesChart.value?.getContext('2d');
  if (!ctx) return;

  if (salesChartInstance) {
    salesChartInstance.destroy()
    salesChartInstance = null
  }

  const labels = filteredSalesDaily.value.map(d => d.date?.slice(5) || d.date)
  const revenueValues = filteredSalesDaily.value.map(d => Number(d.revenue) || 0)

  if (!labels.length) {
    return
  }

  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: t('provider.stats.week_revenue'),
        data: revenueValues,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        tension: 0.35,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#666' },
          grid: { color: 'rgba(0, 0, 0, 0.08)' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#0ea5e9',
            callback: value => `${value} EUR`
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        }
      }
    }
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(Number(value) || 0)
}

function goBack() {
  const username = authStore.user?.username;
  if (username) {
    router.push(`/providers/${username}`);
  } else {
    router.push('/provider/home');
  }
}

onMounted(async () => {
  await loadProviderStats();
  createVisitsChart();
  createSalesChart();
});

watch(salesRange, () => {
  createSalesChart()
})

onUnmounted(() => {
  destroyChart();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.provider-stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

.provider-container {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding-top: 72px;
}

.stats-header {
  margin-bottom: 2rem;
}

.stats-header h1 {
  font-size: 2rem;
  font-weight: 900;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 0.5rem;
}

.stats-subtitle {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
}

/* affichage des stats */
.stats-display {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-block {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
  min-width: 0;
  flex: 1;
}

.stat-accent {
  width: 8px;
  height: 48px;
  border-radius: 6px;
  margin-right: 12px;
}

.stat-main {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 900;
  color: #1a1a1a;
}

.stat-desc {
  font-size: 0.85rem;
  color: #666;
}

/* carte graphe */
.chart-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(231, 45, 85, 0.25);
  margin-bottom: 2rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.range-filter {
  display: inline-flex;
  gap: 0.5rem;
}

.range-btn {
  background: #f0f0f0;
  color: #666;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.range-btn.active {
  background: #0369a1;
  color: #ffffff;
  border-color: #0369a1;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* actions */
.actions-section {
  display: flex;
  gap: 1rem;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 220px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
  }

  .provider-stats-container {
    padding: 1rem;
  }
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.back-btn {
  background: #be123c;
  color: white;
}

.back-btn:hover {
  background: #9f1239;
}

/* mode sombre */
html.dark-mode .provider-container {
  background: #0a0a0a;
}

html.dark-mode .provider-stats-container {
  background: #0a0a0a;
}

html.dark-mode .stats-header h1 {
  color: #ffffff;
}

html.dark-mode .stats-subtitle {
  color: #999999;
}

html.dark-mode .stat-block {
  background: #0b0b0b;
  border-color: rgba(255,255,255,0.06);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

html.dark-mode .stat-number {
  color: #ffffff;
}

html.dark-mode .stat-desc {
  color: #cfcfcf;
}

html.dark-mode .chart-card {
  background: #1a1a1a;
  border-color: rgba(231, 45, 85, 0.2);
}

html.dark-mode .chart-title {
  color: #ffffff;
}

html.dark-mode .range-btn {
  background: #0b0b0b;
  color: #cfcfcf;
  border-color: rgba(255,255,255,0.12);
}

/* responsive */
@media (max-width: 768px) {
  .provider-stats-container {
    padding: 3rem 1rem 2rem;
  }
  
  .stats-display {
    flex-direction: column;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
