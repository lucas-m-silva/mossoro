import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { StudyTracker } from './components/StudyTracker';
import { DocumentCentral } from './components/DocumentCentral';

function MainLayout() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('mossoro_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('mossoro_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mossoro_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginScreen isDark={isDark} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToTracker={() => setActiveTab('tracker')}
            onNavigateToDocs={() => setActiveTab('docs')}
          />
        )}

        {activeTab === 'tracker' && <StudyTracker />}

        {activeTab === 'docs' && <DocumentCentral />}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-left">
            <strong>Câmara Municipal de Mossoró / RN</strong>
            <span>Concurso Público • Edital nº 001/2026 • Realização: COMPERVE / UFRN</span>
          </div>
          <div className="footer-right">
            <span>Inscrições: 13/10 a 12/11/2026 • Prova Objetiva: 06/12/2026</span>
          </div>
        </div>
      </footer>

      <style>{`
        .app-footer {
          border-top: 1px solid var(--border-light);
          background-color: var(--bg-secondary);
          padding: 1.25rem 1.5rem;
          margin-top: auto;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .footer-content {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .footer-left strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
