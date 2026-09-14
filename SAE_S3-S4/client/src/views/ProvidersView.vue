<template>
  <OfficialPartnersSection
    section-id="providers-page"
    :highlight-provider="highlightedProvider"
    :full-page="true"
  />
</template>

<script setup>
import { computed } from 'vue'
import OfficialPartnersSection from '@/components/OfficialPartnersSection.vue'
import { useAuthStore } from '@/stores/login.js'
import { useProvidersStore } from '@/stores/providers.js'

const authStore = useAuthStore()
const providersStore = useProvidersStore()

const highlightedProvider = computed(() => {
  const user = authStore.user
  if (!user || user.role !== 'provider') {
    return null
  }
  const provider = providersStore.getProviderByUsername(user.username)
  return provider?.username || null
})
</script>