import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { playLevelUpSound, playXpSound } from '../utils/sound';
import { triggerLevelUpCelebration } from '../utils/confetti';

interface LevelUpInfo {
  isOpen: boolean;
  newLevel: number;
  newTitle: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  levelUpInfo: LevelUpInfo;
  toggleTheme: () => void;
  toggleSound: () => void;
  closeLevelUpModal: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  login: (email?: string, role?: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, role?: UserRole) => Promise<boolean>;
  updateUserXpLocally: (xpGained: number, leveledUp: boolean, newLevel: number) => void;
  refreshUser: () => Promise<void>;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Curious Novice',
  2: 'Eager Apprentice',
  3: 'Adventurous Explorer',
  4: 'Focused Scholar',
  5: 'Deep Thinker',
  6: 'Knowledge Sage',
  7: 'System Architect',
  8: 'Master Craftsman',
  9: 'Grandmaster',
  10: 'Legendary Pioneer',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('ql_sound') !== 'false';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('ql_theme') as 'dark' | 'light') || 'dark';
  });
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo>({
    isOpen: false,
    newLevel: 1,
    newTitle: '',
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ql_theme', theme);
  }, [theme]);

  // Initial fetch of current user
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('ql_sound', String(next));
      return next;
    });
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const login = async (email?: string, role?: UserRole): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const signup = async (name: string, email: string, role: UserRole = 'learner'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
    return false;
  };

  const updateUserXpLocally = (xpGained: number, leveledUp: boolean, newLevel: number) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        xp: prev.xp + xpGained,
        level: newLevel,
      };
    });

    if (leveledUp) {
      playLevelUpSound(soundEnabled);
      triggerLevelUpCelebration();
      setLevelUpInfo({
        isOpen: true,
        newLevel,
        newTitle: LEVEL_TITLES[newLevel] || `Level ${newLevel} Scholar`,
      });
    } else {
      playXpSound(soundEnabled);
    }
  };

  const closeLevelUpModal = () => {
    setLevelUpInfo(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        soundEnabled,
        levelUpInfo,
        toggleTheme,
        toggleSound,
        closeLevelUpModal,
        switchRole,
        login,
        signup,
        updateUserXpLocally,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
