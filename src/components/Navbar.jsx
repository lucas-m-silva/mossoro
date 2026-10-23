import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Cloud,
  LogOut,
  Sun,
  Moon,
  Shield,
  ArrowRightLeft,
  GraduationCap
} from 'lucide-react';

export function Navbar({ activeTab, onTabChange, isDark, onToggleTheme }) {
  const { user, logout, switchUser } = useAuth();

  const otherUser = user?.login === 'lucas' ? 'ana' : 'lucas';
  const otherUserName = user?.login === 'lucas' ? 'Ana Dias (Adm)' : 'Lucas (TI)';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-wrapper">
          <div className="brand-logo-badge">
            <GraduationCap size={24} />
          </div>
          <div className="brand-title-group">
            <h1>Câmara de Mossoró</h1>
            <p>Concurso 2026 • COMPERVE</p>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard & Finanças</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => onTabChange('tracker')}
          >
            <CheckSquare size={18} />
            <span>Tracker de Estudos</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => onTabChange('docs')}
          >
            <FileText size={18} />
            <span>Central de Editais & PDFs</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => onTabChange('cloud')}
          >
            <Cloud size={18} />
            <span>Nuvem (BD)</span>
          </button>
        </nav>

        <div className="nav-actions">
          {user && (
            <div className="user-badge-container">
              <div className="user-badge" title={`Logado como ${user.name}`}>
                <div className="user-avatar" style={{ backgroundColor: user.badgeColor }}>
                  {user.avatarText}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                  <span className="user-role" style={{ color: user.badgeColor }}>
                    {user.profile}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm switch-user-btn"
                onClick={() => switchUser(otherUser)}
                title={`Alternar para ${otherUserName}`}
              >
                <ArrowRightLeft size={14} />
                <span>{otherUserName}</span>
              </button>
            </div>
          )}

          <button
            className="icon-btn theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="icon-btn logout-btn"
            onClick={logout}
            title="Sair da Plataforma"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .user-badge-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .switch-user-btn {
          font-size: 0.75rem;
          padding: 0.35rem 0.6rem;
          gap: 0.35rem;
        }

        .logout-btn:hover {
          color: var(--danger);
          border-color: var(--danger);
        }

        @media (max-width: 900px) {
          .brand-title-group p {
            display: none;
          }
          .switch-user-btn span {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
