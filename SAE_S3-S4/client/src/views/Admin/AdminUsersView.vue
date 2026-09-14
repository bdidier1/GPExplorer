<template>
  <div class="admin-container">
    <AdminSidebar />
    
    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <h1>{{ t('admin.users.title') || 'Gestion des utilisateurs' }}</h1>
          <p class="section-subtitle">{{ t('admin.users.subtitle') || 'Gérez et consultez les comptes des utilisateurs' }}</p>
        </div>

        <div class="card">
          <div class="card-header filters-header">
            <div class="search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                v-model="filters.search" 
                @input="debounceFetchUsers"
                :placeholder="t('admin.users.search_placeholder') || 'Rechercher...'"
                class="filter-input search-input"
              />
            </div>
            
            <div class="filter-box">
              <select v-model="filters.role" @change="fetchUsers" class="filter-input filter-select">
                <option value="">{{ t('admin.users.role_all') || 'Tous les rôles' }}</option>
                <option value="organizer">{{ t('admin.users.role_organizer') || 'Organisateur' }}</option>
                <option value="provider">{{ t('admin.users.role_provider') || 'Prestataire' }}</option>
                <option value="user">{{ t('admin.users.role_user') || 'Utilisateur' }}</option>
              </select>
            </div>
          </div>

          <div class="card-body p-0">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>{{ t('common.loading') || 'Chargement...' }}</p>
            </div>
            
            <div v-else-if="users.length === 0" class="empty-state">
              <p>{{ t('admin.users.no_users') || 'Aucun utilisateur trouvé' }}</p>
            </div>
            
            <div v-else class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ t('admin.users.table_username') || 'Pseudo' }}</th>
                    <th>{{ t('admin.users.table_email') || 'Email' }}</th>
                    <th>{{ t('admin.users.table_role') || 'Rôle' }}</th>
                    <th>{{ t('admin.users.table_joined') || 'Inscrit le' }}</th>
                    <th class="text-right">{{ t('admin.users.table_actions') || 'Actions' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id || user._id">
                    <td :data-label="t('admin.users.table_username') || 'Pseudo'">
                      <div class="user-info">
                        <strong>{{ user.username }}</strong>
                        <span v-if="user.firstName || user.lastName" class="real-name">
                          {{ user.firstName }} {{ user.lastName }}
                        </span>
                      </div>
                    </td>
                    <td :data-label="t('admin.users.table_email') || 'Email'">{{ user.email }}</td>
                    <td :data-label="t('admin.users.table_role') || 'Rôle'">
                      <span :class="['badge', `role-${user.role}`]">
                        {{ formatRole(user.role) }}
                      </span>
                    </td>
                    <td :data-label="t('admin.users.table_joined') || 'Inscrit le'">{{ formatDate(user.createdAt) }}</td>
                    <td class="text-right" :data-label="t('admin.users.table_actions') || 'Actions'">
                      <button 
                        @click="viewOrders(user)"
                        class="btn-action"
                        :title="t('admin.users.view_orders') || 'Voir commandes'"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        <span>{{ t('admin.users.view_orders') || 'Commandes' }}</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- modale des commandes -->
    <div v-if="selectedUser" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ t('admin.users.orders_modal_title', { user: selectedUser.username }) || `Commandes de ${selectedUser.username}` }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="ordersLoading" class="loading-state">
            <div class="spinner"></div>
            <p>{{ t('common.loading') || 'Chargement...' }}</p>
          </div>
          
          <div v-else-if="orders.length === 0" class="empty-state">
            <p>{{ t('admin.users.orders_empty') || 'Aucune commande.' }}</p>
          </div>
          
          <div v-else class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
              <div class="order-header">
                <div>
                  <span class="order-id">{{ t('admin.users.order_id') || 'Commande' }} #{{ formatOrderId(order.id) }}</span>
                  <span class="order-date">{{ formatDateTime(order.orderDate || order.createdAt) }}</span>
                </div>
                <div>
                  <span :class="['badge', `status-${order.status}`]">
                    {{ formatOrderStatus(order.status) }}
                  </span>
                </div>
              </div>
              
              <div class="order-items" v-if="order.tickets && order.tickets.length > 0">
                <div v-for="(ticket, index) in order.tickets" :key="index" class="order-item">
                  <div class="item-name">{{ ticket.name || "Billet" }}</div>
                  <div class="item-qty">{{ t('admin.users.ticket_quantity', { quantity: ticket.quantity || 1 }) || `x${ticket.quantity || 1}` }}</div>
                  <div class="item-price">{{ ((ticket.price || 0) * (ticket.quantity || 1)).toFixed(2) }} €</div>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-total-label">{{ t('admin.users.order_amount') || 'Total' }}</div>
                <div class="order-amount">{{ typeof order.totalAmount === 'number' ? order.totalAmount.toFixed(2) : parseFloat(order.totalAmount || 0).toFixed(2) }} €</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/Admin/AdminSidebar.vue';
import { useI18n } from '@/composables/useI18n.js';
import { getAllUsersService } from '@/services/users.service.js';
import { getUserOrdersService } from '@/services/orders.service.js';

export default {
  name: 'AdminUsersView',
  components: {
    AdminSidebar
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      users: [],
      loading: true,
      filters: {
        search: '',
        role: ''
      },
      searchTimeout: null,
      
      // état de la modale
      selectedUser: null,
      orders: [],
      ordersLoading: false
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    debounceFetchUsers() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchUsers();
      }, 500);
    },
    
    async fetchUsers() {
      this.loading = true;
      try {
        const result = await getAllUsersService(this.filters);
        if (result.success) {
          this.users = result.users;
        } else {
          console.error('Failed to fetch users:', result.message);
        }
      } catch (error) {
        console.error('Error in fetchUsers:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async viewOrders(user) {
      this.selectedUser = user;
      this.ordersLoading = true;
      this.orders = [];
      
      try {
        const userId = user.id || user._id;
        if (!userId) {
          throw new Error('ID utilisateur manquant');
        }
        
        const result = await getUserOrdersService(userId);
        if (result.success) {
          this.orders = result.orders;
        } else {
          console.error('Failed to fetch orders:', result.message);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        this.ordersLoading = false;
      }
    },
    
    closeModal() {
      this.selectedUser = null;
      this.orders = [];
    },
    
    formatRole(role) {
      if (!role) return '';
      switch (role.toLowerCase()) {
        case 'organizer': return this.t('admin.users.role_organizer') || 'Organisateur';
        case 'provider': return this.t('admin.users.role_provider') || 'Prestataire';
        case 'user': return this.t('admin.users.role_user') || 'Utilisateur';
        default: return role;
      }
    },
    
    formatOrderStatus(status) {
      if (!status) return '';
      switch (status.toLowerCase()) {
        case 'confirmed': return this.t('admin.users.status_confirmed') || 'Confirmé';
        case 'pending': return this.t('admin.users.status_pending') || 'En attente';
        case 'cancelled': return this.t('admin.users.status_cancelled') || 'Annulé';
        case 'payed': return this.t('admin.users.status_confirmed') || 'Confirmé';
        default: return status;
      }
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '-';
      let d;
      if (typeof dateStr === 'object' && dateStr.$date) {
         d = new Date(dateStr.$date);
      } else {
         d = new Date(dateStr);
      }
      return new Intl.DateTimeFormat('fr-FR', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      }).format(d);
    },
    
    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(d);
    },
    
    formatOrderId(id) {
      if (!id) return '';
      return id.substring(0, 8).toUpperCase();
    }
  }
};
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: var(--surface-gradient-start);
  color: var(--text-strong);
}

.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 2rem 3rem;
  background: var(--surface-gradient-end);
}

.content-section {
  max-width: 1400px;
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

.card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--surface-chip);
  overflow: hidden;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.filter-input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-input {
  padding-left: 2.5rem;
}

.filter-input:focus {
  outline: none;
  border-color: rgba(231, 45, 85, 0.5);
  box-shadow: 0 0 0 3px rgba(231, 45, 85, 0.1);
}

.filter-box {
  min-width: 200px;
}

.p-0 {
  padding: 0 !important;
}

/* styles du tableau */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th, .data-table td {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.data-table th {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--surface-muted);
}

.data-table tbody tr {
  transition: background 0.2s ease;
}

.data-table tbody tr:hover {
  background: var(--surface-muted);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.real-name {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* rôles */
.badge {
  display: inline-block;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
.role-organizer {
  background: var(--surface-chip);
  color: #E72D55;
}
.role-provider {
  background: #1e3a8a;
  color: #f8fafc;
}
.role-user {
  background: var(--surface-muted);
  color: var(--text-soft);
}
.status-confirmed, .status-payed {
  background: #166534;
  color: #f8fafc;
}
.status-pending {
  background: #92400e;
  color: #f8fafc;
}
.status-cancelled {
  background: #991b1b;
  color: #f8fafc;
}

/* boutons personnalisés */
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--text-strong);
  border: 1px solid var(--control-border);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: var(--surface-chip);
  color: #E72D55;
  border-color: rgba(231, 45, 85, 0.3);
}

.loading-state, .empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-muted);
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid var(--surface-chip);
  border-radius: 50%;
  border-top-color: #E72D55;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* styles de la modale */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--surface-card-strong);
  color: var(--text-strong);
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover {
  color: var(--text-strong);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-panel);
}

.order-header {
  padding: 1rem;
  background: var(--surface-muted);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-weight: 600;
  display: block;
}

.order-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.order-items {
  padding: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--border-subtle);
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  font-weight: 500;
}

.item-qty {
  color: var(--text-muted);
  margin: 0 1rem;
}

.item-price {
  font-weight: 600;
}

.order-footer {
  padding: 1rem;
  background: var(--surface-muted);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total-label {
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 0.85rem;
}

.order-amount {
  font-weight: 800;
  font-size: 1.25rem;
  color: #E72D55;
}

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

  .section-header {
    margin-bottom: 1.25rem;
  }

  .section-header h1 {
    font-size: 1.45rem;
  }

  .section-subtitle {
    font-size: 0.9rem;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  
  .filter-box, .search-box {
    width: 100%;
    min-width: 0;
  }

  .table-responsive {
    overflow: visible;
  }

  .data-table {
    min-width: 0;
  }

  .data-table thead {
    display: none;
  }

  .data-table tbody {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 0.9rem;
  }

  .data-table tr {
    display: block;
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    background: var(--surface-card-strong);
    overflow: hidden;
  }

  .data-table td {
    display: grid;
    grid-template-columns: minmax(95px, 120px) 1fr;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem 0.9rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .data-table td:last-child {
    border-bottom: none;
  }

  .data-table td::before {
    content: attr(data-label);
    color: var(--text-muted);
    font-weight: 700;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .text-right {
    text-align: left;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }

  .modal-content {
    width: calc(100% - 1.2rem);
    max-height: 90vh;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }

  .modal-header h2 {
    font-size: 1.05rem;
    padding-right: 0.6rem;
  }

  .order-header,
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .order-item {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "name name"
      "qty price";
    row-gap: 0.3rem;
  }

  .item-name {
    grid-area: name;
  }

  .item-qty {
    grid-area: qty;
    margin: 0;
  }

  .item-price {
    grid-area: price;
    justify-self: end;
  }
}

@media (max-width: 420px) {
  .main-content {
    padding: 0.75rem;
  }

  .data-table tbody {
    padding: 0.65rem;
  }

  .data-table td {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }

  .data-table td::before {
    font-size: 0.72rem;
  }
}
</style>
