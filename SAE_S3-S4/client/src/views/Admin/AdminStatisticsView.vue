<template>
  <div class="admin-container">
    <AdminSidebar v-if="!isProvider" />
    
    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('admin_stats.title') }}</h1>
          <p class="section-subtitle">{{ t('admin_stats.subtitle') }}</p>
        </div>

        <!-- rendu stats en gros chiffres sans émojis -->
        <div class="stats-display">
          <div class="stat-block" v-for="s in statsArray" :key="s.label">
            <div class="stat-accent" :style="{ background: s.color }"></div>
            <div class="stat-main">
              <div class="stat-number">{{ s.value }}</div>
              <div class="stat-desc">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- graphe top prestataires -->
        <div class="chart-card">
          <h3 class="chart-title">{{ t('admin_stats.top_providers_title') }}</h3>
          <div class="chart-container">
            <canvas ref="topProvidersChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <h3 class="chart-title">{{ t('admin_stats.purchases_by_category_title') }}</h3>
          <div class="chart-container">
            <canvas ref="purchasesByCategoryChart"></canvas>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">{{ t('admin_stats.daily_revenue_title') }}</h3>
            <div class="range-filter">
              <button
                v-for="option in rangeOptions"
                :key="option.value"
                type="button"
                :class="['range-btn', { active: revenueRange === option.value }]"
                @click="revenueRange = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="dailyRevenueChart"></canvas>
          </div>
        </div>

        <!-- graphe des notes du livre d'or -->
        <div class="chart-card">
          <h3 class="chart-title">{{ t('admin_stats.ratings_title') }}</h3>
          <div class="chart-container chart-container-large">
            <canvas ref="ratingsChart"></canvas>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import AdminSidebar from '@/components/Admin/AdminSidebar.vue';
import { useAuthStore } from '@/stores/login.js';
import { useProvidersStore } from '@/stores/providers.js';
import {
  getGlobalStats,
  getTopProviders
} from '@/services/analytics.service.js';
import { get } from '@/services/apiClient.js';
import Chart from 'chart.js/auto';
import { useI18n } from '@/composables/useI18n.js';

const { t } = useI18n();
const authStore = useAuthStore();
const providersStore = useProvidersStore();
const ratingsByProviderId = ref({});

// refs
const topProvidersChart = ref(null);
const ratingsChart = ref(null);
const purchasesByCategoryChart = ref(null);
const dailyRevenueChart = ref(null);
let chart = null;
let ratingsChartInstance = null;
let purchasesChartInstance = null;
let dailyRevenueChartInstance = null;

// données des stats
const globalStats = ref({
  totalVisits: 0,
  uniqueProviders: 0,
  averagePerProvider: 0,
  totalTicketsSold: 0,
  totalObjectsSold: 0,
  dailyRevenue: [],
  purchasesByCategory: []
});
const revenueRange = ref('7d');

const isProvider = computed(() => authStore.user?.role === 'provider');

const statsArray = computed(() => {
  return [
    { value: globalStats.value.totalTicketsSold ?? 0, label: t('admin_stats.tickets_sold'), color: '#be123c' },
    { value: globalStats.value.totalObjectsSold ?? 0, label: t('admin_stats.objects_sold'), color: '#d946ef' },
    { value: globalStats.value.totalVisits ?? 0, label: t('admin_stats.total_visits'), color: '#e72d55' },
    { value: globalStats.value.uniqueProviders ?? 0, label: t('admin_stats.providers_visited'), color: '#FF6B8A' },
    { value: (globalStats.value.averagePerProvider || 0).toFixed(1), label: t('admin_stats.avg_per_provider'), color: '#FF8FA3' }
  ];
});

const rangeOptions = computed(() => ([
  { value: '7d', label: t('admin_stats.range_7d') },
  { value: '15d', label: t('admin_stats.range_15d') },
  { value: '30d', label: t('admin_stats.range_30d') }
]));

function resolveRangeDays(rangeValue) {
  if (rangeValue === '15d') return 15;
  if (rangeValue === '30d') return 30;
  return 7;
}

const filteredDailyRevenue = computed(() => {
  const days = resolveRangeDays(revenueRange.value);
  const rows = Array.isArray(globalStats.value.dailyRevenue) ? globalStats.value.dailyRevenue : [];
  return rows.slice(-days);
});

// palette de couleurs
const colors = ['#e72d55', '#FF6B8A', '#FF8FA3', '#FFB3C1', '#FFD6DE', '#FFE5EA', '#FFF0F3', '#FF4D6D', '#FF85A1', '#FFC2D1'];

function destroyChart() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
  if (ratingsChartInstance) {
    ratingsChartInstance.destroy();
    ratingsChartInstance = null;
  }
  if (purchasesChartInstance) {
    purchasesChartInstance.destroy();
    purchasesChartInstance = null;
  }
  if (dailyRevenueChartInstance) {
    dailyRevenueChartInstance.destroy();
    dailyRevenueChartInstance = null;
  }
}

function formatPurchaseCategoryLabel(item) {
  const typeLabels = {
    ticket: t('admin_stats.item_type_ticket'),
    shop: t('admin_stats.item_type_product'),
    merch: t('admin_stats.item_type_merch')
  }
  const typeLabel = typeLabels[item.itemType] || t('admin_stats.item_type_other')

  const categoryLabels = {
    billet_non_categorise: t('admin_stats.ticket_uncategorized'),
    produit_non_categorise: t('admin_stats.product_uncategorized'),
    non_classe: t('admin_stats.category_other')
  }
  const normalizedCategory = categoryLabels[item.category] || item.category || t('admin_stats.category_other')

  return `${typeLabel} - ${normalizedCategory}`;
}

function createPurchasesByCategoryChart() {
  const ctx = purchasesByCategoryChart.value?.getContext('2d');
  if (!ctx) return;

  const rows = Array.isArray(globalStats.value.purchasesByCategory)
    ? globalStats.value.purchasesByCategory
    : [];

  const labels = rows.map(formatPurchaseCategoryLabel);
  const values = rows.map(item => Number(item.quantity) || 0);

  if (!labels.length) {
    purchasesChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [t('admin_stats.no_purchase_data')],
        datasets: [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderRadius: 6,
          borderWidth: 0
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
          x: { beginAtZero: true },
          y: { grid: { display: false } }
        }
      }
    });
    return;
  }

  purchasesChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: t('admin_stats.chart_category_quantity'),
        data: values,
        backgroundColor: labels.map((_, idx) => colors[idx % colors.length]),
        borderRadius: 8,
        borderSkipped: false,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const value = Number(ctx.raw) || 0;
              return `${ctx.label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

function createDailyRevenueChart() {
  const ctx = dailyRevenueChart.value?.getContext('2d');
  if (!ctx) return;

  if (dailyRevenueChartInstance) {
    dailyRevenueChartInstance.destroy();
    dailyRevenueChartInstance = null;
  }

  const rows = filteredDailyRevenue.value;

  const labels = rows.map(item => item.date?.slice(5) || item.date);
  const values = rows.map(item => Number(item.revenue) || 0);

  if (!labels.length) {
    return;
  }

  dailyRevenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: t('admin_stats.daily_revenue_label'),
        data: values,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        fill: false,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 4
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
          ticks: { color: '#6b7280' },
          grid: { color: 'rgba(0, 0, 0, 0.04)' }
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
  });
}

async function createTopProvidersChart() {
  // admins et prestataires voient le même graphe top prestataires
  const data = await getTopProviders(10);
  
  const ctx = topProvidersChart.value?.getContext('2d');
  if (!ctx) return;
  
  if (data.length === 0) {
    return;
  }
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: t('admin_stats.chart_visits'),
        data: data.map(d => d.count),
        backgroundColor: colors,
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
          beginAtZero: true
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

async function loadGuestbookRatings() {
  const providers = providersStore.activeProviders || [];
  const ratingsMap = {};

  await Promise.all(
    providers.map(async (provider) => {
      try {
        const json = await get(`/api/providers/${provider.id}/guestbook`);
        const entries = Array.isArray(json?.data) ? json.data : [];
        ratingsMap[provider.id] = entries
          .filter(e => e.rating && e.rating >= 1 && e.rating <= 5)
          .map(e => Number(e.rating));
      } catch {
        ratingsMap[provider.id] = [];
      }
    })
  );

  ratingsByProviderId.value = ratingsMap;
}

function computeRatingsData() {
  const providers = providersStore.activeProviders;
  const results = [];

  for (const provider of providers) {
    const ratings = ratingsByProviderId.value[provider.id] || [];
    const avg = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;
    results.push({
      name: provider.companyName || provider.username,
      average: Math.round(avg * 100) / 100,
      count: ratings.length
    });
  }

  // trie par nom
  results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}

function createRatingsChart() {
  const ctx = ratingsChart.value?.getContext('2d');
  if (!ctx) return;

  const data = computeRatingsData();

  if (data.length === 0) {
    ratingsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels: [t('admin_stats.chart_no_provider')], datasets: [{ data: [0], backgroundColor: '#ccc', borderRadius: 6 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { max: 5 } } }
    });
    return;
  }

  const barColors = data.map((d, i) => d.count === 0 ? '#cccccc' : colors[i % colors.length]);

  ratingsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: 'Moyenne',
        data: data.map(d => d.average),
        backgroundColor: barColors,
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 28
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              const d = data[ctx.dataIndex];
              return d.count === 0 ? t('admin_stats.chart_no_reviews') : `${d.average.toFixed(1)}/5 (${d.count} avis)`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 5,
          ticks: { stepSize: 1 },
          title: { display: true, text: t('admin_stats.chart_rating_axis') }
        },
        y: {
          grid: { display: false }
        }
      }
    },
    plugins: [{
      id: 'valueLabels',
      afterDatasetsDraw(chart) {
        const ctx2 = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((bar, i) => {
          const d = data[i];
          if (d.count === 0) return;
          ctx2.fillStyle = '#fff';
          ctx2.font = 'bold 12px Inter, sans-serif';
          ctx2.textAlign = 'left';
          ctx2.textBaseline = 'middle';
          ctx2.fillText(d.average.toFixed(1) + '/5', bar.x + 6, bar.y);
        });
      }
    }]
  });
}

async function loadGlobalStats() {
  const stats = await getGlobalStats();
  globalStats.value = stats;
}

async function loadAll() {
  destroyChart();
  await loadGlobalStats();
  await createTopProvidersChart();
  createPurchasesByCategoryChart();
  createDailyRevenueChart();
  
  await loadGuestbookRatings();
  await nextTick();
  createRatingsChart();
}

onMounted(() => {
  loadAll();
});

watch(revenueRange, () => {
  createDailyRevenueChart();
});

onUnmounted(() => {
  destroyChart();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.admin-container {
  display: flex;
  min-height: 100vh;
  background: var(--surface-gradient-start);
  font-family: 'Inter', sans-serif;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 5.5rem 3rem 2rem; /* augmenter le padding-top pour descendre le titre sous la navbar */
  background: var(--surface-gradient-end);
}

.admin-container:has(.main-content:only-child) .main-content {
  margin-left: 0;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h1 {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin: 0 0 0.5rem;
}

.section-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

/* affichage des nouvelles stats */
.stats-display {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat-block {
  display: flex;
  align-items: center;
  background: var(--surface-card-strong);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
  border: 1px solid var(--border-subtle);
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
  color: var(--text-strong);
}

.stat-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* carte graphe */
.chart-card {
  background: var(--surface-card-strong);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-subtle);
  margin-bottom: 2rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-strong);
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
  background: var(--surface-card-strong);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn.active {
  background: #0369a1;
  border-color: #0369a1;
  color: #ffffff;
}

.chart-container {
  height: 350px;
  position: relative;
}

.chart-container-large {
  height: 600px;
}

/* mode sombre */
html.dark-mode .admin-container {
  background: var(--surface-gradient-start);
}

html.dark-mode .main-content {
  background: var(--surface-gradient-end);
}

html.dark-mode .section-header h1 {
  color: #ffffff;
}

html.dark-mode .section-subtitle {
  color: var(--text-muted);
}

html.dark-mode .chart-card {
  background: #1a1a1a;
  border-color: rgba(231, 45, 85, 0.2);
}

html.dark-mode .chart-title {
  color: #ffffff;
}

/* mode sombre pour le nouvel affichage des stats */
html.dark-mode .stat-number {
  color: #ffffff;
}

html.dark-mode .stat-desc {
  color: #cfcfcf;
}

/* garde un contraste propre des blocs en light et dark */
html.dark-mode .stat-block {
  background: #000000;
  border-color: rgba(255,255,255,0.06);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 220px;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 70px;
    padding: 1rem;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
