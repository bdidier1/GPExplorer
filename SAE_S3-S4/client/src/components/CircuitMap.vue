<template>
  <div class="map-wrapper" ref="wrapperContainer">
    <div class="map-overlay" :class="{ hidden: isMapActive }">
      <span :key="currentLanguage">{{ overlayText }}</span>
    </div>
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { parkingZones, campingZones } from '@/data/mapData.js'
import { useMapStore } from '@/stores/map.js'
import { useLanguage } from '@/composables/useLanguage.js'

const CIRCUIT_COORDS = [
  [47.95793, 0.2185],
  [47.95296, 0.21256],
  [47.952708, 0.212605],
  [47.952466, 0.212884],
  [47.952245, 0.212975],
  [47.94952, 0.21177],
  [47.949437, 0.211562],
  [47.949434, 0.210918],
  [47.949843, 0.210119],
  [47.949865, 0.209641],
  [47.949739, 0.20932],
  [47.949599, 0.209159],
  [47.94809, 0.208467],
  [47.948212, 0.20749],
  [47.952858, 0.2077],
  [47.955257, 0.208665],
  [47.955638, 0.209051],
  [47.956536, 0.211036],
  [47.957014, 0.210913],
  [47.957161, 0.211036],
  [47.958203, 0.213279],
  [47.958933, 0.214105],
  [47.959119, 0.214735],
  [47.959069, 0.215202],
  [47.958726, 0.215631],
  [47.958311, 0.21562],
  [47.956335, 0.212549],
  [47.956069, 0.212409],
  [47.955796, 0.212554],
  [47.955653, 0.213026],
  [47.955847, 0.214115],
  [47.958327, 0.217683],
  [47.958379, 0.217975],
  [47.958351, 0.218104],
  [47.958105, 0.218477],
  [47.95793, 0.2185]
]

const props = defineProps({
  interactive: { type: Boolean, default: false },
  providerId: { type: String, default: null }
})

const emit = defineEmits(['spot-selected'])

const { currentLanguage } = useLanguage()

import { useI18n } from '@/composables/useI18n.js'
const { t: i18nT } = useI18n()

const overlayText = computed(() => i18nT('circuit_map.click_to_interact'))

const mapContainer = ref(null)
const wrapperContainer = ref(null)
const leafletMap = ref(null)
const selectedSpotId = ref(null)
const isMapActive = ref(false)
const vendorLayers = new Map()
let parkingIcon
let campingIcon

const mapStore = useMapStore()
mapStore.loadFromStorage()
const { vendorSpots } = storeToRefs(mapStore)

onMounted(() => {
  initMap()
  drawCircuit()
  drawParkings()
  drawCampings()
  renderVendorSpots(vendorSpots.value)
  globalThis.window?.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  if (leafletMap.value) {
    leafletMap.value.remove()
  }
  globalThis.window?.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (e) => {
  if (leafletMap.value && wrapperContainer.value) {
    if (wrapperContainer.value.contains(e.target)) {
      // clic dans la carte
      leafletMap.value.scrollWheelZoom.enable()
      isMapActive.value = true
    } else {
      // clic en dehors de la carte
      leafletMap.value.scrollWheelZoom.disable()
      isMapActive.value = false
    }
  }
}

watch(
  vendorSpots,
  spots => {
    renderVendorSpots(spots)
  },
  { deep: true }
)

function initMap() {
  const lat = 47.953
  const lon = 0.207

  leafletMap.value = L.map(mapContainer.value, {
    center: [lat, lon],
    zoom: 14,
    minZoom: 14,
    maxZoom: 18,
    maxBounds: [
      [47.93, 0.18],
      [47.98, 0.24]
    ],
    maxBoundsViscosity: 1,
    scrollWheelZoom: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 12,
    maxZoom: 18
  }).addTo(leafletMap.value)

  parkingIcon = L.icon({
    iconUrl: '/img/Parking_icon.svg.png',
    iconSize: [15, 15],
    iconAnchor: [5, 10],
    popupAnchor: [0, -40]
  })

  campingIcon = L.icon({
    iconUrl: '/img/camping.png',
    iconSize: [20, 20],
    iconAnchor: [0, 10],
    popupAnchor: [0, -40]
  })
}

function drawCircuit() {
  if (!leafletMap.value) return
  L.polyline(CIRCUIT_COORDS, {
    color: 'black',
    weight: 4
  })
    .addTo(leafletMap.value)
    .bindPopup(i18nT('circuit_map.circuit_name'))
}

function drawParkings() {
  parkingZones.forEach(zone => {
    L.polygon(zone.coords, {
      color: '#0066cc',
      fillColor: '#4da6ff',
      fillOpacity: 0.5,
      weight: 2
    })
      .addTo(leafletMap.value)
      .bindPopup(`<strong>${zone.label}</strong><br/><br/><a href="/faq" style="display:inline-block; padding:6px 12px; background-color:#E72D55; color:white; text-decoration:none; border-radius:4px; font-weight:600; font-size: 0.9em; text-align:center;">${i18nT('circuit_map.more_info')}</a>`)

    const center = getPolygonCenter(zone.coords)
    L.marker(center, { icon: parkingIcon })
      .addTo(leafletMap.value)
      .bindPopup(`<strong>${zone.label}</strong><br/><br/><a href="/faq" style="display:inline-block; padding:6px 12px; background-color:#E72D55; color:white; text-decoration:none; border-radius:4px; font-weight:600; font-size: 0.9em; text-align:center;">${i18nT('circuit_map.more_info')}</a>`)
  })
}

function drawCampings() {
  campingZones.forEach(zone => {
    L.polygon(zone.coords, {
      color: '#009900',
      fillColor: '#66cc66',
      fillOpacity: 0.5,
      weight: 2
    })
      .addTo(leafletMap.value)
      .bindPopup(`<strong>${zone.label}</strong><br/><br/><a href="/faq" style="display:inline-block; padding:6px 12px; background-color:#E72D55; color:white; text-decoration:none; border-radius:4px; font-weight:600; font-size: 0.9em; text-align:center;">${i18nT('circuit_map.more_info')}</a>`)

    const center = getPolygonCenter(zone.coords)
    L.marker(center, { icon: campingIcon })
      .addTo(leafletMap.value)
      .bindPopup(`<strong>${zone.label}</strong><br/><br/><a href="/faq" style="display:inline-block; padding:6px 12px; background-color:#E72D55; color:white; text-decoration:none; border-radius:4px; font-weight:600; font-size: 0.9em; text-align:center;">${i18nT('circuit_map.more_info')}</a>`)
  })
}

function renderVendorSpots(spots) {
  if (!leafletMap.value) return

  const latestIds = new Set(spots.map(spot => spot.id))
  // enlève les couches orphelines si un spot a disparu
  vendorLayers.forEach((entry, spotId) => {
    if (!latestIds.has(spotId)) {
      entry.polygon.remove()
      vendorLayers.delete(spotId)
    }
  })

  spots.forEach(spot => {
    const existing = vendorLayers.get(spot.id)
    if (existing) {
      updateVendorLayer(existing, spot)
      return
    }
    createVendorLayer(spot)
  })

  if (selectedSpotId.value) {
    const selected = spots.find(spot => spot.id === selectedSpotId.value)
    if (!selected || (selected.occupant && selected.occupant.providerId !== props.providerId)) {
      selectedSpotId.value = null
      emit('spot-selected', null)
    }
  }

  if (!selectedSpotId.value && props.providerId) {
    const mine = spots.find(spot => spot.occupant && spot.occupant.providerId === props.providerId)
    if (mine) {
      selectedSpotId.value = mine.id
    }
  }

  highlightSelection()
}

function createVendorLayer(spot) {
  const polygon = L.polygon(spot.coords, getSpotStyle(spot))
    .addTo(leafletMap.value)
    .bindPopup(buildSpotPopup(spot))

  polygon.on('click', () => handleSpotClick(spot.id))
  vendorLayers.set(spot.id, { polygon })
}

function updateVendorLayer(layerEntry, spot) {
  layerEntry.polygon.setStyle(getSpotStyle(spot))
  layerEntry.polygon.bindPopup(buildSpotPopup(spot))
}

function buildSpotPopup(spot) {
  if (spot.occupant) {
    const link = `<br/><br/><a href="/providers/${spot.occupant.username}" style="display:inline-block; padding:6px 12px; background-color:#E72D55; color:white; text-decoration:none; border-radius:4px; font-weight:600; font-size: 0.9em; text-align:center;">${i18nT('circuit_map.view_page')}</a>`
    return `<strong>${spot.label}</strong><br/>${i18nT('circuit_map.occupied_by')} ${spot.occupant.displayName}${link}`
  }
  return `<strong>${spot.label}</strong><br/>${i18nT('circuit_map.available')}`
}

function handleSpotClick(spotId) {
  const spot = vendorSpots.value.find(item => item.id === spotId)
  const layer = vendorLayers.get(spotId)
  if (!spot || !layer) return

  // mode lecture seule on affiche juste la popup
  if (!props.interactive) {
    if (!spot.occupant) return // rien à faire pour un emplacement vide
    layer.polygon.openPopup()
    return
  }

  // emplacement déjà pris par un autre prestataire
  if (spot.occupant && spot.occupant.providerId !== props.providerId) {
    layer.polygon.openPopup()
    return
  }

  selectedSpotId.value = spotId
  emit('spot-selected', spot)
  highlightSelection()
}

function highlightSelection() {
  vendorLayers.forEach((entry, spotId) => {
    const spot = vendorSpots.value.find(item => item.id === spotId)
    if (!spot) return
    const style = getSpotStyle(spot)
    if (spotId === selectedSpotId.value) {
      entry.polygon.setStyle({ ...style, weight: 4 })
    } else {
      entry.polygon.setStyle(style)
    }
  })
}

function getSpotStyle(spot) {
  const isMine = spot.occupant && spot.occupant.providerId === props.providerId
  const isFree = !spot.occupant
  let baseColor = '#f44336'
  let fillOpacity = 0.35

  if (isFree) {
    baseColor = '#ff9800'
    fillOpacity = 0.25
  } else if (isMine) {
    baseColor = '#4caf50'
    fillOpacity = 0.5
  }

  return {
    color: baseColor,
    fillColor: baseColor,
    fillOpacity,
    weight: 2
  }
}

function getPolygonCenter(coords) {
  let latSum = 0
  let lngSum = 0
  coords.forEach(coord => {
    latSum += coord[0]
    lngSum += coord[1]
  })
  return [latSum / coords.length, lngSum / coords.length]
}
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1; /* reste sous la navbar */
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.map-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

.map-overlay span {
  display: inline-block;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.2rem;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border: none;
  transform: translateZ(0); /* évite des artefacts de rendu gpu */
  will-change: transform;
}

#map {
  height: 100%;
  width: 100%;
}

@media (max-width: 768px) {
  .map-wrapper {
    height: 400px;
  }
}
</style>
