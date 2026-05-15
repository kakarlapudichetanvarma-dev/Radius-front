const AUTH_KEY = 'chat_auth';

export const storage = {
  saveAuth: (data: unknown) => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify(data)
    );
  },

  getAuth: () => {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  getToken: (): string | null => {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed?.token || null;
  },

  clearAuth: () => {
    localStorage.removeItem(AUTH_KEY);
  }
};