const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || `Server error: ${response.status}`);
    }
    return response.json();
  },

  post: async (endpoint: string, body: any, token?: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || `Server error: ${response.status}`);
    }
    return response.json();
  },

  delete: async (endpoint: string, token?: string) => {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.error || `Server error: ${response.status}`);
    }
    
    if (response.status === 204) return null;
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return null;
    }
  }
};
