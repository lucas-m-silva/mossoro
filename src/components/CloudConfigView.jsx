import React, { useState } from 'react';
import { getCloudConfig, saveCloudConfig } from '../services/db';
import {
  Cloud,
  Database,
  Flame,
  CheckCircle2,
  HardDrive,
  Copy,
  ExternalLink,
  Save,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export function CloudConfigView() {
  const [config, setConfig] = useState(getCloudConfig);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const handleProviderSelect = (prov) => {
    setConfig(prev => ({
      ...prev,
      provider: prov
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const success = saveCloudConfig(config);
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  const supabaseSql = `-- Script SQL para criar a tabela no Supabase (Cole no SQL Editor do Supabase)
CREATE TABLE IF NOT EXISTS public.mossoro_study_progress (
  username text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar leitura e escrita pública para este projeto de estudos
ALTER TABLE public.mossoro_study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público ao progresso do concurso"
ON public.mossoro_study_progress
FOR ALL
USING (true)
WITH CHECK (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(supabaseSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="cloud-config-view fade-in">
      <div className="card cloud-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Cloud size={22} />
          </div>
          <div>
            <h3>Configuração de Banco de Dados Gratuito</h3>
            <p className="card-subtitle">
              Escolha onde persistir seu progresso e anotações: LocalStorage, Supabase (PostgreSQL) ou Firebase (Google Firestore)
            </p>
          </div>
        </div>
      </div>

      <div className="provider-selector-grid">
        {/* Local Storage Card */}
        <div
          className={`provider-card card ${config.provider === 'local' ? 'active' : ''}`}
          onClick={() => handleProviderSelect('local')}
        >
          <div className="provider-card-header">
            <div className="provider-icon-badge local">
              <HardDrive size={24} />
            </div>
            {config.provider === 'local' && (
              <span className="badge badge-success">Ativo Agora</span>
            )}
          </div>
          <h4>Armazenamento Local (Offline)</h4>
          <p>
            Funciona imediatamente sem necessidade de cadastro em nuvem. Salva diretamente no navegador (LocalStorage) com segurança e rapidez.
          </p>
          <span className="provider-status-text">
            {config.provider === 'local' ? '✔ Modo Padrão Ativo' : 'Clique para selecionar'}
          </span>
        </div>

        {/* Supabase Card */}
        <div
          className={`provider-card card ${config.provider === 'supabase' ? 'active' : ''}`}
          onClick={() => handleProviderSelect('supabase')}
        >
          <div className="provider-card-header">
            <div className="provider-icon-badge supabase">
              <Database size={24} />
            </div>
            {config.provider === 'supabase' && (
              <span className="badge badge-success">Ativo Agora</span>
            )}
          </div>
          <h4>Supabase (PostgreSQL Nuvem)</h4>
          <p>
            Banco de dados relacional gratuito na nuvem. Sincroniza seu progresso entre celular e computador em tempo real.
          </p>
          <span className="provider-status-text">
            {config.provider === 'supabase' ? '✔ Configuração Ativa' : 'Clique para configurar'}
          </span>
        </div>

        {/* Firebase Card */}
        <div
          className={`provider-card card ${config.provider === 'firebase' ? 'active' : ''}`}
          onClick={() => handleProviderSelect('firebase')}
        >
          <div className="provider-card-header">
            <div className="provider-icon-badge firebase">
              <Flame size={24} />
            </div>
            {config.provider === 'firebase' && (
              <span className="badge badge-success">Ativo Agora</span>
            )}
          </div>
          <h4>Google Firebase (Firestore)</h4>
          <p>
            Banco de dados NoSQL gratuito do Google. Persistência de documentos em tempo real e sincronização automática.
          </p>
          <span className="provider-status-text">
            {config.provider === 'firebase' ? '✔ Configuração Ativa' : 'Clique para configurar'}
          </span>
        </div>
      </div>

      {/* Supabase Configuration Form */}
      {config.provider === 'supabase' && (
        <form onSubmit={handleSave} className="card config-details-card fade-in">
          <div className="config-form-header">
            <Database size={20} className="text-brand" />
            <h4>Credenciais do Supabase</h4>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>Abrir Painel do Supabase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Project URL (URL do Projeto)</label>
              <input
                type="url"
                placeholder="https://exemplo.supabase.co"
                value={config.supabase.url}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    supabase: { ...p.supabase, url: e.target.value }
                  }))
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Anon Public Key (Chave Pública Anon)</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.supabase.anonKey}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    supabase: { ...p.supabase, anonKey: e.target.value }
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="sql-box-wrapper">
            <div className="sql-box-header">
              <span>Script de Criação de Tabela no Supabase</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copySql}
              >
                <Copy size={14} />
                <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <pre className="sql-code-block">{supabaseSql}</pre>
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            <span>Salvar Configuração do Supabase</span>
          </button>
        </form>
      )}

      {/* Firebase Configuration Form */}
      {config.provider === 'firebase' && (
        <form onSubmit={handleSave} className="card config-details-card fade-in">
          <div className="config-form-header">
            <Flame size={20} color="#f59e0b" />
            <h4>Credenciais do Firebase (Google Firestore)</h4>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>Console do Firebase</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="form-grid-3">
            <div className="input-group">
              <label>API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={config.firebase.apiKey}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    firebase: { ...p.firebase, apiKey: e.target.value }
                  }))
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Project ID</label>
              <input
                type="text"
                placeholder="mossoro-concurso-2026"
                value={config.firebase.projectId}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    firebase: { ...p.firebase, projectId: e.target.value }
                  }))
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Auth Domain</label>
              <input
                type="text"
                placeholder="seu-projeto.firebaseapp.com"
                value={config.firebase.authDomain}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    firebase: { ...p.firebase, authDomain: e.target.value }
                  }))
                }
              />
            </div>

            <div className="input-group">
              <label>Storage Bucket</label>
              <input
                type="text"
                placeholder="seu-projeto.appspot.com"
                value={config.firebase.storageBucket}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    firebase: { ...p.firebase, storageBucket: e.target.value }
                  }))
                }
              />
            </div>

            <div className="input-group">
              <label>Messaging Sender ID</label>
              <input
                type="text"
                placeholder="1234567890"
                value={config.firebase.messagingSenderId}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    firebase: { ...p.firebase, messagingSenderId: e.target.value }
                  }))
                }
              />
            </div>

            <div className="input-group">
              <label>App ID</label>
              <input
                type="text"
                placeholder="1:123456:web:abcd..."
                value={config.firebase.appId}
                onChange={(e) =>
                  setConfig(p => ({
                    ...p,
                    firebase: { ...p.firebase, appId: e.target.value }
                  }))
                }
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={18} />
            <span>Salvar Configuração do Firebase</span>
          </button>
        </form>
      )}

      {saveStatus === 'success' && (
        <div className="save-banner success fade-in">
          <CheckCircle2 size={18} />
          <span>Configuração salva com sucesso! Os dados agora sincronizarão com o provedor escolhido.</span>
        </div>
      )}

      <style>{`
        .cloud-config-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .provider-selector-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .provider-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all var(--transition-fast);
          position: relative;
        }

        .provider-card:hover {
          transform: translateY(-2px);
          border-color: var(--brand-primary);
        }

        .provider-card.active {
          border-color: var(--brand-primary);
          box-shadow: var(--shadow-glow);
          background-color: var(--bg-elevated);
        }

        .provider-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .provider-icon-badge {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .provider-icon-badge.local {
          background: linear-gradient(135deg, #0284c7, #38bdf8);
        }

        .provider-icon-badge.supabase {
          background: linear-gradient(135deg, #059669, #34d399);
        }

        .provider-icon-badge.firebase {
          background: linear-gradient(135deg, #ea580c, #f59e0b);
        }

        .provider-card h4 {
          font-size: 1.15rem;
        }

        .provider-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          flex: 1;
        }

        .provider-status-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--brand-primary);
        }

        /* Config Forms */
        .config-details-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .config-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .sql-box-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background-color: var(--bg-tertiary);
          padding: 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .sql-box-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .sql-code-block {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          padding: 0.85rem;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.8rem;
          overflow-x: auto;
          white-space: pre-wrap;
          line-height: 1.4;
        }

        .save-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .save-banner.success {
          background-color: var(--success-bg);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
