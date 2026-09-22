import {
  ApiResponse,
  PaginatedResponse,
  User,
  Center,
  Location,
  Event,
  EventType,
  EventSchedule,
  Team,
  TeamMembership,
  Mahatma,
  EventTeamAssignment,
  EventMahatmaAssignment,
  Attendance,
  Expense,
  ExpenseCategory,
  ExpenseHistory,
  Notification,
  AuditLog,
} from '../../shared/types/index.ts';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('surat_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // If unauthorized, token might be invalid or expired
      if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('surat_token');
        localStorage.removeItem('surat_user');
      }
    }

    const data = await response.json();
    if (!response.ok || data.success === false) {
      const error = new Error(data.message || 'API request failed');
      (error as any).status = response.status;
      (error as any).errorCode = data.errorCode;
      throw error;
    }

    return data;
  }

  // Auth API
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<ApiResponse<{ token: string; user: User }>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData: any) =>
      this.request<ApiResponse<{ token: string; user: User }>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    me: () => this.request<ApiResponse<User>>('/auth/me'),
    refresh: () => this.request<ApiResponse<{ token: string; user: User }>>('/auth/refresh', { method: 'POST' }),
    logout: () => this.request<ApiResponse<null>>('/auth/logout', { method: 'POST' }),
  };

  // Dashboard API
  dashboard = {
    getSummary: () => this.request<ApiResponse<any>>('/dashboard/summary'),
  };

  // Events API
  events = {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      eventType?: string;
      locationId?: string;
      coordinatorId?: string;
      search?: string;
      year?: string;
      month?: string;
    } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
      return this.request<PaginatedResponse<Event & { locationName: string; coordinatorName: string }>>(
        `/events?${query.toString()}`
      );
    },
    get: (id: string) => this.request<ApiResponse<any>>(`/events/${id}`),
    create: (data: any) =>
      this.request<ApiResponse<Event>>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<ApiResponse<Event>>(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<ApiResponse<null>>(`/events/${id}`, {
        method: 'DELETE',
      }),
    publish: (id: string) =>
      this.request<ApiResponse<Event>>(`/events/${id}/publish`, {
        method: 'POST',
      }),
    cancel: (id: string) =>
      this.request<ApiResponse<Event>>(`/events/${id}/cancel`, {
        method: 'POST',
      }),
    complete: (id: string) =>
      this.request<ApiResponse<Event>>(`/events/${id}/complete`, {
        method: 'POST',
      }),

    // Schedules
    getSchedules: (id: string) => this.request<ApiResponse<EventSchedule[]>>(`/events/${id}/schedules`),
    createSchedule: (id: string, data: any) =>
      this.request<ApiResponse<EventSchedule>>(`/events/${id}/schedules`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteSchedule: (id: string, scheduleId: string) =>
      this.request<ApiResponse<null>>(`/events/${id}/schedules/${scheduleId}`, {
        method: 'DELETE',
      }),

    // Teams
    getTeams: (id: string) => this.request<ApiResponse<any[]>>(`/events/${id}/teams`),
    addTeam: (id: string, data: any) =>
      this.request<ApiResponse<EventTeamAssignment>>(`/events/${id}/teams`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Attendance
    getAttendance: (id: string) => this.request<ApiResponse<any[]>>(`/events/${id}/attendance`),
    recordAttendance: (id: string, data: { mahatmaId: string; status: 'REGISTERED' | 'PRESENT' | 'ABSENT' }) =>
      this.request<ApiResponse<Attendance>>(`/events/${id}/attendance`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Expenses for event
    getExpenses: (id: string) => this.request<ApiResponse<Expense[]>>(`/events/${id}/expenses`),
  };

  // Teams API
  teams = {
    list: (params: { page?: number; limit?: number; search?: string; active?: boolean } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) query.append(k, String(v));
      });
      return this.request<PaginatedResponse<Team & { primaryCoordinatorName: string }>>(
        `/teams?${query.toString()}`
      );
    },
    get: (id: string) => this.request<ApiResponse<any>>(`/teams/${id}`),
    create: (data: any) =>
      this.request<ApiResponse<Team>>('/teams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<ApiResponse<Team>>(`/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<ApiResponse<null>>(`/teams/${id}`, {
        method: 'DELETE',
      }),
    addMember: (id: string, data: { mahatmaId: string; role?: string }) =>
      this.request<ApiResponse<TeamMembership>>(`/teams/${id}/members`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    removeMember: (id: string, mahatmaId: string) =>
      this.request<ApiResponse<null>>(`/teams/${id}/members/${mahatmaId}`, {
        method: 'DELETE',
      }),
  };

  // Mahatmas API
  mahatmas = {
    list: (params: { page?: number; limit?: number; search?: string; teamId?: string; status?: string } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
      return this.request<PaginatedResponse<Mahatma & { teams: any[] }>>(`/mahatmas?${query.toString()}`);
    },
    get: (id: string) => this.request<ApiResponse<any>>(`/mahatmas/${id}`),
    create: (data: any) =>
      this.request<ApiResponse<Mahatma>>('/mahatmas', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<ApiResponse<Mahatma>>(`/mahatmas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<ApiResponse<null>>(`/mahatmas/${id}`, {
        method: 'DELETE',
      }),
  };

  // Locations API
  locations = {
    list: (params: { active?: boolean } = {}) => {
      const query = params.active !== undefined ? `?active=${params.active}` : '';
      return this.request<ApiResponse<Array<Location & { upcomingEventsCount: number }>>>(`/locations${query}`);
    },
    get: (id: string) => this.request<ApiResponse<any>>(`/locations/${id}`),
    create: (data: any) =>
      this.request<ApiResponse<Location>>('/locations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<ApiResponse<Location>>(`/locations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<ApiResponse<null>>(`/locations/${id}`, {
        method: 'DELETE',
      }),
  };

  // Expenses API
  expenses = {
    list: (params: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      eventId?: string;
      teamId?: string;
      search?: string;
    } = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
      return this.request<{
        success: boolean;
        data: Array<Expense & { eventName: string; teamName: string; submittedByName: string }>;
        summary: {
          totalAmount: number;
          pendingAmount: number;
          approvedAmount: number;
          paidAmount: number;
          totalCount: number;
        };
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/expenses?${query.toString()}`);
    },
    get: (id: string) => this.request<ApiResponse<any>>(`/expenses/${id}`),
    create: (data: any) =>
      this.request<ApiResponse<Expense>>('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      this.request<ApiResponse<Expense>>(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    submit: (id: string) =>
      this.request<ApiResponse<Expense>>(`/expenses/${id}/submit`, {
        method: 'POST',
      }),
    approve: (id: string) =>
      this.request<ApiResponse<Expense>>(`/expenses/${id}/approve`, {
        method: 'POST',
      }),
    reject: (id: string, rejectionReason: string) =>
      this.request<ApiResponse<Expense>>(`/expenses/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason }),
      }),
    markPaid: (id: string) =>
      this.request<ApiResponse<Expense>>(`/expenses/${id}/mark-paid`, {
        method: 'POST',
      }),
    getHistory: (id: string) => this.request<ApiResponse<ExpenseHistory[]>>(`/expenses/${id}/history`),
  };

  // Reports API
  reports = {
    getExpenses: (params: { year?: string; month?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.year) query.append('year', params.year);
      if (params.month) query.append('month', params.month);
      return this.request<ApiResponse<any>>(`/reports/expenses?${query.toString()}`);
    },
    getAttendance: () => this.request<ApiResponse<any>>('/reports/attendance'),
  };

  // Notifications API
  notifications = {
    list: () => this.request<{ success: boolean; data: Notification[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) => this.request<ApiResponse<null>>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => this.request<ApiResponse<null>>('/notifications/read-all', { method: 'PUT' }),
  };

  // Search API
  search = {
    global: (query: string) => this.request<ApiResponse<any>>(`/search?q=${encodeURIComponent(query)}`),
  };

  // Settings & Admin API
  settings = {
    getCenter: () => this.request<ApiResponse<Center>>('/settings/center'),
    updateCenter: (data: any) =>
      this.request<ApiResponse<Center>>('/settings/center', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getEventTypes: () => this.request<ApiResponse<EventType[]>>('/settings/event-types'),
    createEventType: (data: any) =>
      this.request<ApiResponse<EventType>>('/settings/event-types', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getExpenseCategories: () => this.request<ApiResponse<ExpenseCategory[]>>('/settings/expense-categories'),
    createExpenseCategory: (data: any) =>
      this.request<ApiResponse<ExpenseCategory>>('/settings/expense-categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getUsers: () => this.request<ApiResponse<User[]>>('/settings/users'),
    updateUserRole: (id: string, data: { role: string; active?: boolean }) =>
      this.request<ApiResponse<User>>(`/settings/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getAuditLogs: (params: { page?: number; limit?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));
      return this.request<PaginatedResponse<any>>(`/settings/audit-logs?${query.toString()}`);
    },
  };

  // Upload API
  uploads = {
    uploadReceipt: (fileData: string, filename: string) =>
      this.request<ApiResponse<{ url: string; filename: string; provider: string }>>('/uploads/receipt', {
        method: 'POST',
        body: JSON.stringify({ fileData, filename }),
      }),
  };
}

export const api = new ApiClient();
