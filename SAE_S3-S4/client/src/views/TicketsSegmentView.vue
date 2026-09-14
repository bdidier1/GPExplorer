<template>
  <div class="tickets-view">
    <TicketSegmentView :segment="segmentKey" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TicketSegmentView from '@/components/TicketSegmentView.vue'

const route = useRoute()
const allowedSegments = ['grand_prix', 'karting', 'playseat', 'food', 'beverage', 'decathlon']

const segmentKey = computed(() => {
  const raw = route.params.segment
  const value = Array.isArray(raw) ? raw[0] : raw
  return allowedSegments.includes(value) ? value : 'grand_prix'
})
</script>

<style scoped>
.tickets-view {
  /* le composant segment gere deja son style */
}

html.dark-mode .tickets-view {
  background: var(--surface-gradient-start);
}
</style>
