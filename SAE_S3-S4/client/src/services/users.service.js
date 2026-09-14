import { get } from '@/services/apiClient.js'

export async function getAllUsersService(filters = {}) {
    try {
        const params = new URLSearchParams();
        if (filters.role) params.append('role', filters.role);
        if (filters.search) params.append('search', filters.search);

        const data = await get(`/api/users?${params.toString()}`);
        if (data.error === 0 || data.data) {
            return { success: true, users: data.data || data };
        }
        return { success: false, message: data.message || 'Erreur serveur' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
