import { createContext, useState, useContext } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user,  setUser]  = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook
export function useAuth() {
  return useContext(AuthContext);
}
