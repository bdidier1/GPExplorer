/* suit les visites prestataires via l'api backend */

import { get, post } from '@/services/apiClient.js'

/* enregistre une visite sur la page d'un prestataire */
export async function trackProviderVisit(visitData) {
  if (!visitData.providerId) return null
  try {
    const json = await post(`/api/providers/${visitData.providerId}/visitors`, {})
    return json.data || null
  } catch (e) {
    console.warn('Erreur enregistrement visite:', e)
    return null
  }
}

/* récupère les stats de visites par prestataire */
export async function getVisitCountByProvider() {
  try {
    const json = await get('/api/admin/stats/visitors')
    if (json.error === 0 && json.data) {
      const stats = {}
      for (const item of json.data) {
        const name = item.providerName || item.provider?.name || item.Provider?.name || `Provider ${item.providerId}`
        stats[name] = Number(item.totalVisitors || item.totalCount || item.count || 0)
      }
      return stats
    }
    return {}
  } catch (e) {
    console.warn('Erreur récupération stats visiteurs:', e)
    return {}
  }
}

/* retourne le top des prestataires les plus visités */
export async function getTopProviders(n = 5) {
  const byProvider = await getVisitCountByProvider()
  return Object.entries(byProvider)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

/* récupère un résumé global des stats */
export async function getGlobalStats() {
  try {
    const [dashboardJson, visitorsJson] = await Promise.all([
      get('/api/admin/stats/dashboard'),
      get('/api/admin/stats/visitors')
    ])

    if (dashboardJson.error === 0 && dashboardJson.data) {
      const sales = dashboardJson.data.sales || {}
      const visitors = Array.isArray(visitorsJson?.data) ? visitorsJson.data : []
      const totalVisits = visitors.reduce((sum, item) => sum + Number(item.totalVisitors || item.totalCount || item.count || 0), 0)
      const uniqueProviders = visitors.length

      return {
        totalVisits,
        uniqueProviders,
        averagePerProvider: uniqueProviders > 0 ? totalVisits / uniqueProviders : 0,
        totalTicketsSold: Number(sales.totalTicketsSold) || 0,
        totalObjectsSold: Number(sales.totalObjectsSold) || 0,
        totalItemsSold: Number(sales.totalItemsSold) || 0,
        totalSales: Number(sales.totalSales) || 0,
        totalOrders: Number(sales.totalOrders) || 0,
        averageOrderValue: Number(sales.averageOrderValue) || 0,
        dailyRevenue: Array.isArray(dashboardJson.data.dailyRevenue)
          ? dashboardJson.data.dailyRevenue
          : [],
        purchasesByCategory: Array.isArray(dashboardJson.data.purchasesByCategory)
          ? dashboardJson.data.purchasesByCategory
          : []
      }
    }
    return {
      totalVisits: 0,
      uniqueProviders: 0,
      averagePerProvider: 0,
      totalTicketsSold: 0,
      totalObjectsSold: 0,
      totalItemsSold: 0,
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      dailyRevenue: [],
      purchasesByCategory: []
    }
  } catch (e) {
    console.warn('Erreur récupération stats globales:', e)
    return {
      totalVisits: 0,
      uniqueProviders: 0,
      averagePerProvider: 0,
      totalTicketsSold: 0,
      totalObjectsSold: 0,
      totalItemsSold: 0,
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      dailyRevenue: [],
      purchasesByCategory: []
    }
  }
}

/* récupère les stats visiteurs d'un prestataire précis */
export async function getProviderVisitorSummary(providerId) {
  if (!providerId) {
    return {
      totalVisits: 0,
      todayVisits: 0,
      weekVisits: 0,
      daily: [],
      shop: { totalProductsSold: 0, totalRevenue: 0, weekProductsSold: 0, weekRevenue: 0, daily: [] }
    }
  }
  try {
    const json = await get(`/api/providers/${providerId}/visitors/stats`)
    if (json.error === 0 && json.data) {
      return json.data
    }
    return {
      totalVisits: 0,
      todayVisits: 0,
      weekVisits: 0,
      daily: [],
      shop: { totalProductsSold: 0, totalRevenue: 0, weekProductsSold: 0, weekRevenue: 0, daily: [] }
    }
  } catch (e) {
    console.warn('Erreur récupération stats prestataire:', e)
    return {
      totalVisits: 0,
      todayVisits: 0,
      weekVisits: 0,
      daily: [],
      shop: { totalProductsSold: 0, totalRevenue: 0, weekProductsSold: 0, weekRevenue: 0, daily: [] }
    }
  }
}
