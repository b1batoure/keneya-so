/**
 * HospiGest - Service API
 * Gestion des appels au backend PHP/MySQL
 */

const API_BASE_URL = '/api';

// Récupérer le token stocké
const getToken = (): string | null => {
  return localStorage.getItem('hospigest_token');
};

// Headers par défaut
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Fonction générique pour les requêtes
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }
  
  return data;
}

// API Auth
export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await apiRequest<{
      success: boolean;
      token: string;
      user: { id: string; email: string; nom: string; role: string };
    }>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      localStorage.setItem('keneya-so_token', data.token);
    }
    
    return data;
  },
  
  register: async (userData: {
    email: string;
    password: string;
    nom: string;
    role?: string;
  }) => {
    return apiRequest('/auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  logout: async () => {
    try {
      await apiRequest('/auth.php?action=logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('keneya-s_token');
    }
  },
  
  me: async () => {
    return apiRequest<{ id: string; email: string; nom: string; role: string }>(
      '/auth.php?action=me'
    );
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth.php?action=change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },
};

// API Patients
export const patientsAPI = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.set('search', params.search);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    
    return apiRequest(`/patients.php?${queryParams}`);
  },
  
  getById: async (id: string) => {
    return apiRequest(`/patients.php?id=${id}`);
  },
  
  create: async (patientData: Record<string, unknown>) => {
    return apiRequest('/patients.php', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },
  
  update: async (id: string, patientData: Record<string, unknown>) => {
    return apiRequest(`/patients.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },
  
  delete: async (id: string) => {
    return apiRequest(`/patients.php?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// API Messages
export const messagesAPI = {
  getReceived: async (params?: { page?: number }) => {
    const queryParams = new URLSearchParams();
    queryParams.set('action', 'received');
    if (params?.page) queryParams.set('page', String(params.page));
    
    return apiRequest(`/messages.php?${queryParams}`);
  },
  
  getSent: async () => {
    return apiRequest('/messages.php?action=sent');
  },
  
  view: async (id: string) => {
    return apiRequest(`/messages.php?action=view&id=${id}`);
  },
  
  send: async (messageData: {
    destinataire_id: string;
    sujet: string;
    contenu: string;
    urgent?: boolean;
    reponse_a?: string;
  }) => {
    return apiRequest('/messages.php?action=send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },
  
  markAsRead: async (id: string) => {
    return apiRequest('/messages.php?action=mark-read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },
  
  delete: async (id: string) => {
    return apiRequest(`/messages.php?action=delete&id=${id}`, {
      method: 'DELETE',
    });
  },
  
  getUnreadCount: async () => {
    return apiRequest<{ count: number }>('/messages.php?action=unread-count');
  },
  
  getUsers: async () => {
    return apiRequest<{ data: Array<{ id: string; nom: string; role: string }> }>(
      '/messages.php?action=users'
    );
  },
};

// API Notifications
export const notificationsAPI = {
  getAll: async (params?: { limit?: number; unread_only?: boolean }) => {
    const queryParams = new URLSearchParams();
    queryParams.set('action', 'list');
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.unread_only) queryParams.set('unread_only', 'true');
    
    return apiRequest(`/notifications.php?${queryParams}`);
  },
  
  getUnreadCount: async () => {
    return apiRequest<{ count: number }>('/notifications.php?action=unread-count');
  },
  
  markAsRead: async (id: string) => {
    return apiRequest('/notifications.php?action=mark-read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },
  
  markAllAsRead: async () => {
    return apiRequest('/notifications.php?action=mark-all-read', {
      method: 'POST',
    });
  },
  
  delete: async (id: string) => {
    return apiRequest(`/notifications.php?action=delete&id=${id}`, {
      method: 'DELETE',
    });
  },
  
  // Connexion Server-Sent Events pour temps réel
  subscribeToUpdates: (onNotification: (notification: unknown) => void) => {
    const token = getToken();
    if (!token) return null;
    
    const eventSource = new EventSource(
      `${API_BASE_URL}/notifications.php?action=stream&token=${token}`
    );
    
    eventSource.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse(event.data);
        onNotification(notification);
      } catch (e) {
        console.error('Erreur parsing notification:', e);
      }
    });
    
    eventSource.addEventListener('heartbeat', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Heartbeat:', data);
      } catch (e) {
        // Ignore
      }
    });
    
    eventSource.onerror = () => {
      // Reconnexion automatique gérée par EventSource
      console.log('SSE connection error, will retry...');
    };
    
    return eventSource;
  },
};

// Polling pour les notifications (alternative à SSE)
export class NotificationPoller {
  private intervalId: NodeJS.Timeout | null = null;
  private lastCount = 0;
  
  start(onNewNotifications: (count: number) => void, intervalMs = 30000) {
    this.stop();
    
    const poll = async () => {
      try {
        const { count } = await notificationsAPI.getUnreadCount();
        if (count > this.lastCount) {
          onNewNotifications(count);
        }
        this.lastCount = count;
      } catch (e) {
        console.error('Polling error:', e);
      }
    };
    
    poll(); // Premier appel immédiat
    this.intervalId = setInterval(poll, intervalMs);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default {
  auth: authAPI,
  patients: patientsAPI,
  messages: messagesAPI,
  notifications: notificationsAPI,
};
