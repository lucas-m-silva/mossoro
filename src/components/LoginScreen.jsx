import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Sparkles, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';

export function LoginScreen({ isDark, onToggleTheme }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message);
        setLoading(false);
      }
    }, 250);
  };

  const handleQuickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
    setLoading(true);
    setTimeout(() => {
      login(user, pass);
    }, 150);
  };

  return (
    <div className="login-page">
      <div className="login-top-bar">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={isDark ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="login-wrapper fade-in">
        <div className="login-brand-header">
          <div className="login-logo-circle">
            <ShieldCheck size={32} />
          </div>
          <h2>Câmara de Mossoró</h2>
          <p className="login-sub">Gestor de Estudos & Finanças de Viagem</p>
          <span className="badge badge-primary">Edital nº 001/2026 • COMPERVE</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form card">
          <h3>Entrar na Plataforma</h3>
          <p className="form-sub">Acesse seus editais, checklist de estudos e calculadora</p>

          {error && <div className="error-alert">{error}</div>}

          <div className="input-group">
            <label htmlFor="login-username">Usuário</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="login-username"
                type="text"
                placeholder="Ex: lucas ou ana"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="login-password">Senha</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type="password"
                placeholder="•••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entrando...' : (
              <>
                <span>Acessar Painel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="login-divider">
            <span>Acesso Rápido para Testes</span>
          </div>

          <div className="quick-access-grid">
            <button
              type="button"
              className="quick-card-btn lucas"
              onClick={() => handleQuickLogin('lucas', '12345')}
            >
              <div className="quick-avatar">LS</div>
              <div className="quick-info">
                <strong>Lucas (TI)</strong>
                <span>Técnico & Analista de TI</span>
              </div>
            </button>

            <button
              type="button"
              className="quick-card-btn ana"
              onClick={() => handleQuickLogin('ana', '12345')}
            >
              <div className="quick-avatar">AD</div>
              <div className="quick-info">
                <strong>Ana Dias (Adm)</strong>
                <span>Agente Administrativo</span>
              </div>
            </button>
          </div>
        </form>

        <div className="login-footer-info">
          <p>Credenciais mock pré-definidas no sistema: senha <code>12345</code></p>
          <div className="login-status-tags">
            <span>Prova: 06/12/2026</span>
            <span>•</span>
            <span>Banca COMPERVE</span>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.08) 0%, transparent 60%);
          position: relative;
        }

        .login-top-bar {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
        }

        .login-wrapper {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .login-brand-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        .login-logo-circle {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: var(--brand-gradient);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-glow);
          margin-bottom: 0.5rem;
        }

        .login-sub {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }

        .login-form h3 {
          font-size: 1.25rem;
        }

        .form-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: -0.75rem;
          margin-bottom: 0.5rem;
        }

        .error-alert {
          background-color: var(--danger-bg);
          color: var(--danger);
          padding: 0.6rem 0.8rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .input-group label {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon input {
          width: 100%;
          padding-left: 2.5rem;
        }

        .btn-block {
          width: 100%;
          margin-top: 0.5rem;
        }

        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0.75rem 0 0.25rem;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-light);
        }

        .login-divider span {
          padding: 0 0.75rem;
        }

        .quick-access-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .quick-card-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          text-align: left;
          transition: all var(--transition-fast);
        }

        .quick-card-btn:hover {
          transform: translateY(-2px);
          border-color: var(--brand-primary);
          background-color: var(--bg-elevated);
          box-shadow: var(--shadow-md);
        }

        .quick-avatar {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .quick-card-btn.lucas .quick-avatar {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
        }

        .quick-card-btn.ana .quick-avatar {
          background: linear-gradient(135deg, #059669, #10b981);
        }

        .quick-info {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
          overflow: hidden;
        }

        .quick-info strong {
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .quick-info span {
          font-size: 0.68rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .login-footer-info {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .login-footer-info code {
          background-color: var(--bg-tertiary);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          color: var(--brand-primary);
          font-weight: 600;
        }

        .login-status-tags {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}
