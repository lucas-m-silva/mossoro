import React, { useState } from 'react';
import syllabusData from '../data/conteudo_programatico.json';
import {
  FileText,
  Download,
  ExternalLink,
  Maximize2,
  FileCheck,
  Info,
  Calendar,
  Layers,
  Search
} from 'lucide-react';

export function DocumentCentral() {
  const documents = syllabusData.documentos_links;
  const [selectedDocId, setSelectedDocId] = useState(documents[0].id);

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  const getPdfUrl = (filePath) => {
    if (!filePath) return '';
    const clean = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const base = import.meta.env.BASE_URL || './';
    return `${base}${clean}`;
  };

  const pdfUrl = getPdfUrl(activeDoc.arquivo);

  return (
    <div className="doc-central-view fade-in">
      <div className="doc-central-header card">
        <div className="header-info">
          <h2>Central de Documentos & Editais Oficiais</h2>
          <p>
            Consulte editais, retificações e programas de estudo oficiais sem sair da plataforma.
            Todos os arquivos são carregados diretamente pelo visualizador integrado.
          </p>
        </div>
      </div>

      <div className="doc-layout">
        {/* Document Selector Sidebar */}
        <div className="doc-sidebar card">
          <div className="sidebar-header">
            <Layers size={18} />
            <span>Documentos Disponíveis ({documents.length})</span>
          </div>

          <div className="doc-list-nav">
            {documents.map(doc => {
              const isSelected = doc.id === activeDoc.id;
              return (
                <button
                  key={doc.id}
                  className={`doc-nav-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <div className="doc-nav-icon">
                    <FileText size={18} />
                  </div>
                  <div className="doc-nav-meta">
                    <span className="doc-nav-category">{doc.categoria}</span>
                    <strong className="doc-nav-title">{doc.titulo}</strong>
                    {doc.subtitulo && (
                      <span className="doc-nav-sub">{doc.subtitulo}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewer Main Area */}
        <div className="doc-viewer-area card">
          {/* Action & Info Bar */}
          <div className="doc-action-bar">
            <div className="active-doc-info">
              <span className="badge badge-primary">{activeDoc.categoria}</span>
              <h3>{activeDoc.titulo}</h3>
              {activeDoc.subtitulo && (
                <p className="active-doc-sub">{activeDoc.subtitulo}</p>
              )}
            </div>

            <div className="active-doc-buttons">
              {/* Explicit Download Button */}
              <a
                href={pdfUrl}
                download
                className="btn btn-primary"
                title="Salvar o arquivo PDF no seu computador"
              >
                <Download size={18} />
                <span>Download PDF</span>
              </a>

              {/* Open in New Tab */}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                title="Visualizar em tela inteira no navegador"
              >
                <Maximize2 size={16} />
                <span>Nova Aba</span>
              </a>

              {/* Official COMPERVE link */}
              {activeDoc.link_oficial && (
                <a
                  href={activeDoc.link_oficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  title="Acessar página oficial da COMPERVE"
                >
                  <ExternalLink size={16} />
                  <span>Portal COMPERVE</span>
                </a>
              )}
            </div>
          </div>

          {/* Embedded PDF Viewer */}
          <div className="pdf-frame-wrapper">
            <iframe
              key={pdfUrl}
              src={`${pdfUrl}#toolbar=1&navpanes=0`}
              title={activeDoc.titulo}
              className="pdf-iframe"
            />
          </div>

          <div className="doc-viewer-footer">
            <div className="footer-left">
              <Info size={16} className="text-brand" />
              <span>
                Caso o navegador bloqueie a visualização embutida, clique em <strong>Download PDF</strong> ou <strong>Nova Aba</strong>.
              </span>
            </div>
            <div className="footer-right">
              <span>Banca Oficial: COMPERVE / UFRN</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .doc-central-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .doc-central-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.35rem;
        }

        .doc-central-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .doc-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .doc-sidebar {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: calc(100vh - 180px);
          overflow-y: auto;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
        }

        .doc-list-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .doc-nav-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.85rem;
          border-radius: var(--radius-sm);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          text-align: left;
          transition: all var(--transition-fast);
        }

        .doc-nav-item:hover {
          background-color: var(--bg-elevated);
          border-color: var(--brand-primary);
          transform: translateX(2px);
        }

        .doc-nav-item.active {
          background-color: var(--bg-elevated);
          border-color: var(--brand-primary);
          box-shadow: var(--shadow-sm);
        }

        .doc-nav-icon {
          color: var(--brand-primary);
          padding-top: 0.1rem;
        }

        .doc-nav-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;
        }

        .doc-nav-category {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--brand-primary);
          text-transform: uppercase;
        }

        .doc-nav-title {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .doc-nav-sub {
          font-size: 0.725rem;
          color: var(--text-muted);
          line-height: 1.2;
        }

        /* Viewer Area */
        .doc-viewer-area {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 1.25rem;
        }

        .doc-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-light);
        }

        .active-doc-info {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .active-doc-info h3 {
          font-size: 1.25rem;
        }

        .active-doc-sub {
          font-size: 0.825rem;
          color: var(--text-muted);
        }

        .active-doc-buttons {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .pdf-frame-wrapper {
          width: 100%;
          height: 75vh;
          min-height: 600px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background-color: #525659;
          border: 1px solid var(--border-light);
        }

        .pdf-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .doc-viewer-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          padding-top: 0.5rem;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 950px) {
          .doc-layout {
            grid-template-columns: 1fr;
          }
          .pdf-frame-wrapper {
            height: 60vh;
            min-height: 450px;
          }
        }
      `}</style>
    </div>
  );
}
