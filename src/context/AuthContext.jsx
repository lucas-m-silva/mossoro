import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Defined users as per requirements
export const PREDEFINED_USERS = {
  lucas: {
    login: 'lucas',
    password: '12345',
    name: 'Lucas Silva',
    profile: 'TI',
    roles: ['analista_ti'],
    roleNames: ['Analista Legislativo - TI (Cód. 04)'],
    badgeColor: '#2563eb',
    avatarText: 'LS'
  },
  ana: {
    login: 'ana',
    password: '12345',
    name: 'Ana Dias',
    profile: 'Administrativo',
    roles: ['tecnico_administrativa', 'tecnico_legislativa'],
    roleNames: ['Técnico Legislativo - Administrativa (Cód. 07)', 'Técnico Legislativo - Legislativa (Cód. 08)'],
    badgeColor: '#059669',
    avatarText: 'AD'
  }
};

const AUTH_STORAGE_KEY = 'petrolina_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (PREDEFINED_USERS[parsed.login]) {
          return PREDEFINED_USERS[parsed.login];
        }
      }
    } catch (e) {
      console.error('Failed to parse auth user:', e);
    }
    return null;
  });

  const [activeRole, setActiveRole] = useState(() => {
    if (user?.roles?.length > 0) return user.roles[0];
    return null;
  });

  useEffect(() => {
    if (user && user.roles.length > 0 && (!activeRole || !user.roles.includes(activeRole))) {
      setActiveRole(user.roles[0]);
    }
  }, [user]);

  const login = (username, password) => {
    const cleanUser = username.trim().toLowerCase();
    const target = PREDEFINED_USERS[cleanUser];

    if (target && target.password === password) {
      setUser(target);
      setActiveRole(target.roles[0]);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ login: target.login }));
      return { success: true };
    }

    return {
      success: false,
      message: 'Credenciais inválidas. Utilize lucas/12345 ou ana/12345.'
    };
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Quick switch between users for testing convenience
  const switchUser = (targetUsername) => {
    const target = PREDEFINED_USERS[targetUsername];
    if (target) {
      setUser(target);
      setActiveRole(target.roles[0]);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ login: target.login }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        setActiveRole,
        login,
        logout,
        switchUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
