<template>
  <div class="tickets-view">
    <TicketCatalogue :show-listings="false" />
  </div>
  
</template>

<script setup>
import TicketCatalogue from '@/components/TicketCatalogue.vue'
</script>

<style scoped>
.tickets-view{
  max-width: 1100px;
  margin: 0 auto;
}

html.dark-mode .tickets-view {
  background: var(--surface-gradient-start);
}
</style>