<template>
  <section class="forbidden">
    <div class="card">
      <h1>{{ t('forbidden.title') }}</h1>
      <p v-if="reason === 'auth'">
        {{ t('forbidden.login_prompt') }}
        <strong v-if="expectedRole">({{ labelFor(expectedRole) }})</strong>.
      </p>
      <p v-else-if="reason === 'role'">
        {{ t('forbidden.role_message') }}
        <span v-if="expectedRole">{{ t('forbidden.role_reserved') }} {{ labelFor(expectedRole) }}.</span>
        <span v-if="actualRole"> {{ t('forbidden.your_role') }} {{ labelFor(actualRole) }}.</span>
      </p>
      <p v-else>
        {{ t('forbidden.default_message') }}
      </p>

      <div class="actions">
        <button class="btn" @click="goHome">{{ t('forbidden.go_home') }}</button>
        <button v-if="myAreaPath" class="btn outline" @click="goMyArea">{{ t('forbidden.my_area_button') }}</button>
      </div>

      <small v-if="redirectPath" class="hint">
        {{ t('forbidden.requested_page') }} <code>{{ redirectPath }}</code>
      </small>
    </div>
  </section>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/login.js'
import { useI18n } from '@/composables/useI18n.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const reason = computed(() => route.query.reason || 'role')
const expectedRole = computed(() => route.query.expected || null)
const actualRole = computed(() => route.query.actual || auth.user?.role || null)
const redirectPath = computed(() => route.query.redirect || null)

const myAreaPath = computed(() => {
  const role = auth.user?.role
  if (role === 'user') return '/user/home'
  if (role === 'provider') return '/provider/home'
  if (role === 'organizer') return '/admin/home'
  return null
})

function goHome() {
  router.push({ name: 'home' })
}
function goMyArea() {
  if (myAreaPath.value) router.push(myAreaPath.value)
}

function labelFor(role) {
  return t(`forbidden.role_${role}`) || role
}
</script>

<style scoped>
/* conteneur */
.forbidden {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: #ffffff;
  transition: background-color 0.2s ease;
}

/* carte */
.card {
  max-width: 580px;
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 1.5rem 1.75rem;
  border: 1px solid rgba(231,45,85,0.12);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card::before {
  /* accent rouge décoratif */
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #E72D55, transparent);
  opacity: 0.5;
}

.card h1 {
  margin: 0 0 0.4rem;
  font-size: 1.4rem;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.card p { 
  margin: 0.3rem 0 0.8rem;
  color: #555555;
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
}

.actions { 
  display: flex; 
  gap: 0.6rem; 
  flex-wrap: wrap; 
  margin-top: 1rem;
}

/* boutons avec le même style que home */
.btn {
  cursor: pointer;
  border: none;
  background: #be123c;
  color: #ffffff;
  padding: 0.65rem 1.4rem;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(231,45,85,0.3);
}

.btn:hover { 
  background: #9f1239;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231,45,85,0.5);
}

.btn:active { transform: translateY(0); }

.btn:focus { 
  outline: 2px solid #E72D55;
  outline-offset: 2px;
}

.btn.outline {
  background: #ffffff;
  color: #be123c;
  border: 2px solid #be123c;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.btn.outline:hover {
  background: #fce7ef;
  border-color: #9f1239;
  color: #9f1239;
}
.hint { 
  display: block; 
  margin-top: 0.75rem; 
  color: #999999;
  font-size: 0.8rem;
  font-family: 'Inter', sans-serif;
}

code { 
  background: #f8f9fa;
  color: #000000;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.85rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace;
  border: 1px solid rgba(0,0,0,0.05);
}

/* mode sombre cohérent avec home */
html.dark-mode .forbidden { 
  background: #0a0a0a;
}

html.dark-mode .card {
  background: #1a1a1a;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  border: 1px solid rgba(231,45,85,0.25);
}

html.dark-mode .card::before { 
  background: linear-gradient(90deg, transparent, #E72D55, transparent);
  opacity: 0.8;
}

html.dark-mode .card h1 { 
  color: #ffffff;
}

html.dark-mode .card p { 
  color: #b0b0b0;
}

html.dark-mode .btn { 
  background: #be123c;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(231,45,85,0.4);
}

html.dark-mode .btn:hover {
  background: #9f1239;
  box-shadow: 0 4px 12px rgba(231,45,85,0.6);
}

html.dark-mode .btn.outline { 
  background: transparent;
  color: #E72D55;
  border-color: #E72D55;
}

html.dark-mode .btn.outline:hover {
  background: rgba(159, 18, 57, 0.78);
  border-color: #fda4af;
  color: #fff1f2;
}

html.dark-mode .hint { 
  color: #666666;
}

html.dark-mode code { 
  background: #111827;
  color: #e5e7eb;
  border-color: #374151;
}

/* responsive */
@media (max-width: 768px) {
  .card { 
    padding: 1.25rem 1.5rem;
    border-radius: 10px;
  }
  
  .card h1 { 
    font-size: 1.3rem;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .card { 
    padding: 1rem;
    border-radius: 8px;
  }
  
  .card h1 { 
    font-size: 1.2rem;
  }
  
  .card p {
    font-size: 0.9rem;
  }
  
  .actions { 
    justify-content: flex-start;
  }
  
  .btn { 
    padding: 0.55rem 1rem;
    font-size: 0.75rem;
  }
  
  .hint {
    font-size: 0.75rem;
  }
}

</style>
