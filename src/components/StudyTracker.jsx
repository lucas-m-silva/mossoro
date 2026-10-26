import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { loadStudyProgress, saveStudyProgress } from '../services/db';
import syllabusData from '../data/conteudo_programatico.json';
import {
  CheckSquare,
  Square,
  Search,
  BookOpen,
  CheckCircle2,
  ListFilter,
  Layers,
  ChevronDown,
  ChevronRight,
  FileEdit,
  Save,
  Sparkles,
  BarChart3,
  CloudCheck,
  RotateCcw,
  X,
  Maximize2
} from 'lucide-react';

export function StudyTracker() {
  const { user, activeRole, setActiveRole } = useAuth();

  // Progress state: Set of completed topic IDs
  const [completedTopics, setCompletedTopics] = useState([]);
  const [notes, setNotes] = useState({});
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed'

  // Notes state
  const [expandedNoteId, setExpandedNoteId] = useState(null); // Inline expanded note
  const [activeNoteModal, setActiveNoteModal] = useState(null); // Fullscreen Portal Modal
  const [tempNoteText, setTempNoteText] = useState('');

  // Expand/collapse state for discipline groups
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Roles available for current user
  const allowedRoles = useMemo(() => {
    if (!user) return [];
    if (user.login === 'lucas') {
      return ['tecnico_informatica', 'analista_ti'];
    }
    if (user.login === 'ana') {
      return ['agente_administrativo'];
    }
    return [];
  }, [user]);

  // Current selected cargo
  const currentCargoKey = allowedRoles.includes(activeRole) ? activeRole : allowedRoles[0];
  const cargoInfo = syllabusData.cargos[currentCargoKey];

  // Load progress for logged user
  useEffect(() => {
    if (!user?.login) return;
    let isMounted = true;

    async function fetchProgress() {
      setSyncStatus('loading');
      try {
        const data = await loadStudyProgress(user.login);
        if (isMounted && data) {
          setCompletedTopics(data.completedTopics || []);
          setNotes(data.notes || {});
          setSyncStatus('idle');
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setSyncStatus('idle');
      }
    }

    fetchProgress();
    return () => { isMounted = false; };
  }, [user]);

  // Toggle single topic
  const toggleTopic = (topicId) => {
    const isCompleted = completedTopics.includes(topicId);
    let next;
    if (isCompleted) {
      next = completedTopics.filter(id => id !== topicId);
    } else {
      next = [...completedTopics, topicId];
    }
    setCompletedTopics(next);

    // Save with status indicator
    setSyncStatus('saving');
    saveStudyProgress(user.login, { completedTopics: next, notes }).then(() => {
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    });
  };

  // Toggle group collapse (disciplines start closed by default)
  const toggleCollapse = (groupId) => {
    setCollapsedGroups(prev => {
      const current = prev[groupId] !== undefined ? prev[groupId] : true;
      return {
        ...prev,
        [groupId]: !current
      };
    });
  };

  const expandAllGroups = () => {
    const next = {};
    disciplinesList.forEach(d => { next[d.id] = false; });
    setCollapsedGroups(next);
  };

  const collapseAllGroups = () => {
    const next = {};
    disciplinesList.forEach(d => { next[d.id] = true; });
    setCollapsedGroups(next);
  };

  // Structure disciplines and topics for current role
  const disciplinesList = useMemo(() => {
    if (!cargoInfo) return [];

    const list = [];

    // 1. Língua Portuguesa
    if (cargoInfo.disciplinas.includes('lingua_portuguesa')) {
      const lp = syllabusData.disciplinas_comuns.lingua_portuguesa;
      list.push({
        id: 'lingua_portuguesa',
        name: lp.nome,
        questoes: lp.questoes,
        category: 'Conhecimento Geral',
        items: lp.topicos.flatMap(t => {
          if (t.subtopicos && t.subtopicos.length > 0) {
            return t.subtopicos.map(st => ({
              id: st.id,
              titulo: st.texto,
              parentTitle: t.titulo,
              disciplineId: 'lingua_portuguesa'
            }));
          }
          return [{
            id: t.id,
            titulo: t.titulo,
            parentTitle: t.titulo,
            descricao: t.descricao,
            disciplineId: 'lingua_portuguesa'
          }];
        })
      });
    }

    // 2. Legislação
    if (cargoInfo.disciplinas.includes('legislacao')) {
      const leg = syllabusData.disciplinas_comuns.legislacao;
      list.push({
        id: 'legislacao',
        name: leg.nome,
        questoes: leg.questoes,
        category: 'Conhecimento Geral',
        items: leg.topicos.flatMap(t => {
          if (t.subtopicos && t.subtopicos.length > 0) {
            return t.subtopicos.map(st => ({
              id: st.id,
              titulo: st.texto,
              parentTitle: t.titulo,
              disciplineId: 'legislacao'
            }));
          }
          return [{
            id: t.id,
            titulo: t.titulo,
            descricao: t.descricao,
            disciplineId: 'legislacao'
          }];
        })
      });
    }

    // 3. Informática Geral (Agente Administrativo)
    if (cargoInfo.disciplinas.includes('informatica_geral')) {
      const inf = syllabusData.disciplinas_comuns.informatica_geral;
      list.push({
        id: 'informatica_geral',
        name: inf.nome,
        questoes: inf.questoes,
        category: 'Conhecimento Geral',
        items: inf.topicos.map(t => ({
          id: t.id,
          titulo: t.titulo,
          descricao: t.descricao,
          disciplineId: 'informatica_geral'
        }))
      });
    }

    // 4. Específica do Cargo
    if (cargoInfo.especifica) {
      const esp = cargoInfo.especifica;
      list.push({
        id: esp.id,
        name: esp.nome,
        questoes: esp.questoes,
        category: 'Conhecimento Específico',
        items: esp.topicos.flatMap(t => {
          if (t.subtopicos && t.subtopicos.length > 0) {
            return t.subtopicos.map(st => ({
              id: st.id,
              titulo: st.texto,
              parentTitle: t.titulo,
              disciplineId: esp.id
            }));
          }
          return [{
            id: t.id,
            titulo: t.titulo,
            descricao: t.descricao,
            disciplineId: esp.id
          }];
        })
      });
    }

    return list;
  }, [cargoInfo]);

  // Total topics calculation
  const allCurrentTopics = useMemo(() => {
    return disciplinesList.flatMap(d => d.items);
  }, [disciplinesList]);

  const totalTopicsCount = allCurrentTopics.length;
  const completedCount = allCurrentTopics.filter(t => completedTopics.includes(t.id)).length;
  const progressPercentage = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

  // Filtered topics based on search & filterMode
  const filteredDisciplines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return disciplinesList.map(disc => {
      const filteredItems = disc.items.filter(item => {
        const matchesQuery =
          !q ||
          item.titulo.toLowerCase().includes(q) ||
          (item.descricao && item.descricao.toLowerCase().includes(q)) ||
          (item.parentTitle && item.parentTitle.toLowerCase().includes(q));

        const isCompleted = completedTopics.includes(item.id);
        const matchesFilter =
          filterMode === 'all' ||
          (filterMode === 'completed' && isCompleted) ||
          (filterMode === 'pending' && !isCompleted);

        return matchesQuery && matchesFilter;
      });

      return {
        ...disc,
        items: filteredItems,
        totalItemsInDisc: disc.items.length,
        completedInDisc: disc.items.filter(it => completedTopics.includes(it.id)).length
      };
    });
  }, [disciplinesList, searchQuery, filterMode, completedTopics]);

  // Bulk actions for a discipline
  const handleBulkToggle = (disc, checkAll) => {
    const itemIds = disc.items.map(it => it.id);
    let next;
    if (checkAll) {
      next = Array.from(new Set([...completedTopics, ...itemIds]));
    } else {
      next = completedTopics.filter(id => !itemIds.includes(id));
    }
    setCompletedTopics(next);

    setSyncStatus('saving');
    saveStudyProgress(user.login, { completedTopics: next, notes }).then(() => {
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    });
  };

  // Toggle inline note box
  const toggleInlineNote = (topicId) => {
    if (expandedNoteId === topicId) {
      setExpandedNoteId(null);
    } else {
      setExpandedNoteId(topicId);
    }
  };

  // Handle inline note edit
  const handleInlineNoteChange = (topicId, text) => {
    const nextNotes = { ...notes, [topicId]: text };
    setNotes(nextNotes);

    setSyncStatus('saving');
    saveStudyProgress(user.login, { completedTopics, notes: nextNotes }).then(() => {
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 1500);
    });
  };

  // Open Fullscreen Modal via Portal
  const openModalNote = (item) => {
    setActiveNoteModal(item);
    setTempNoteText(notes[item.id] || '');
  };

  const saveModalNote = () => {
    if (!activeNoteModal) return;
    const nextNotes = { ...notes, [activeNoteModal.id]: tempNoteText };
    setNotes(nextNotes);
    setActiveNoteModal(null);

    setSyncStatus('saving');
    saveStudyProgress(user.login, { completedTopics, notes: nextNotes }).then(() => {
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    });
  };

  return (
    <div className="tracker-view fade-in">
      {/* Header with Title and User Filter Badge */}
      <div className="tracker-header card">
        <div className="tracker-title-area">
          <div className="title-with-badge">
            <h2>Tracker de Conteúdo Programático</h2>
            <span className="badge badge-primary">
              {user?.login === 'lucas' ? 'Perfil TI (Lucas Silva)' : 'Perfil Administrativo (Ana Dias)'}
            </span>
            {syncStatus === 'saving' && (
              <span className="badge badge-warning">Salvando no Supabase...</span>
            )}
            {syncStatus === 'saved' && (
              <span className="badge badge-success">Sincronizado (Supabase)</span>
            )}
          </div>
          <p className="tracker-sub">
            Conteúdo oficial extraído diretamente dos editais da COMPERVE.
            {user?.login === 'lucas'
              ? ' Acesso configurado para Técnico em Informática e Analista de TI.'
              : ' Acesso configurado para Agente Administrativo.'}
          </p>
        </div>

        {/* Role Selector Tabs (Only if user has more than 1 role, e.g. Lucas) */}
        {allowedRoles.length > 1 && (
          <div className="cargo-selector-tabs">
            <span className="cargo-label">Cargo em Visualização:</span>
            <div className="cargo-buttons">
              {allowedRoles.map(roleKey => {
                const c = syllabusData.cargos[roleKey];
                const isActive = (currentCargoKey === roleKey);
                return (
                  <button
                    key={roleKey}
                    className={`cargo-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveRole(roleKey)}
                  >
                    <span>{c.nome}</span>
                    <span className="cargo-sub-badge">
                      Cód. {c.codigo} • {c.nivel} {c.remuneracao ? `• ${c.remuneracao}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Progress Overview Bar */}
      <div className="card progress-overview-card">
        <div className="progress-top-row">
          <div className="progress-meta">
            <span className="progress-label">Progresso Geral de Estudos</span>
            <h3 className="progress-numbers">
              {completedCount} de {totalTopicsCount} tópicos concluídos
            </h3>
          </div>
          <div className="progress-percentage-bubble">
            <span>{progressPercentage}%</span>
          </div>
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Per Discipline Mini Progress Bars */}
        <div className="discipline-mini-bars">
          {filteredDisciplines.map(disc => {
            const pct = disc.totalItemsInDisc > 0
              ? Math.round((disc.completedInDisc / disc.totalItemsInDisc) * 100)
              : 0;
            return (
              <div key={disc.id} className="mini-disc-item">
                <div className="mini-disc-header">
                  <span className="mini-disc-name">{disc.name}</span>
                  <span className="mini-disc-val">{pct}%</span>
                </div>
                <div className="mini-bar-track">
                  <div className="mini-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="tracker-toolbar card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar por tópicos, leis, conceitos (ex: Scrum, LGPD, Licitações, Redação)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        <div className="filter-modes">
          <button
            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Todos ({totalTopicsCount})
          </button>
          <button
            className={`filter-btn ${filterMode === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterMode('pending')}
          >
            Pendentes ({totalTopicsCount - completedCount})
          </button>
          <button
            className={`filter-btn ${filterMode === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterMode('completed')}
          >
            Concluídos ({completedCount})
          </button>

          <span className="filter-divider">|</span>

          <button
            className="filter-btn text-btn"
            onClick={expandAllGroups}
            title="Abrir todas as disciplinas"
          >
            Expandir Todos
          </button>
          <button
            className="filter-btn text-btn"
            onClick={collapseAllGroups}
            title="Fechar todas as disciplinas"
          >
            Fechar Todos
          </button>
        </div>
      </div>

      {/* Disciplines & Checklist */}
      <div className="disciplines-container">
        {filteredDisciplines.map(disc => {
          const isCollapsed = searchQuery.trim()
            ? false
            : (collapsedGroups[disc.id] !== undefined ? !!collapsedGroups[disc.id] : true);
          const allChecked = disc.totalItemsInDisc > 0 && disc.completedInDisc === disc.totalItemsInDisc;

          return (
            <div key={disc.id} className="discipline-block card">
              <div className="discipline-header" onClick={() => toggleCollapse(disc.id)}>
                <div className="disc-title-group">
                  <button className="collapse-arrow" type="button">
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <div>
                    <div className="disc-title-row">
                      <h4>{disc.name}</h4>
                      <span className="badge badge-info">{disc.questoes} Questões</span>
                      <span className="badge badge-primary">{disc.category}</span>
                    </div>
                    <span className="disc-sub">
                      {disc.completedInDisc} de {disc.totalItemsInDisc} tópicos marcados
                    </span>
                  </div>
                </div>

                <div className="disc-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleBulkToggle(disc, !allChecked)}
                  >
                    {allChecked ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="topics-list">
                  {disc.items.length === 0 ? (
                    <div className="empty-topics-msg">
                      Nenhum tópico encontrado para os filtros atuais.
                    </div>
                  ) : (
                    disc.items.map(item => {
                      const isDone = completedTopics.includes(item.id);
                      const hasNote = !!notes[item.id];
                      const isInlineExpanded = expandedNoteId === item.id;

                      return (
                        <div key={item.id} className="topic-item-wrapper">
                          <div className={`topic-row ${isDone ? 'completed' : ''}`}>
                            <div
                              className="topic-checkbox"
                              onClick={() => toggleTopic(item.id)}
                            >
                              {isDone ? (
                                <CheckSquare size={20} className="check-icon checked" />
                              ) : (
                                <Square size={20} className="check-icon unchecked" />
                              )}
                            </div>

                            <div
                              className="topic-info"
                              onClick={() => toggleTopic(item.id)}
                            >
                              {item.parentTitle && (
                                <span className="parent-tag">{item.parentTitle}</span>
                              )}
                              <p className="topic-title">{item.titulo}</p>
                              {item.descricao && (
                                <p className="topic-desc">{item.descricao}</p>
                              )}
                              {hasNote && !isInlineExpanded && (
                                <div
                                  className="topic-note-preview"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleInlineNote(item.id);
                                  }}
                                  title="Clique para abrir e editar a anotação aqui"
                                >
                                  <FileEdit size={12} />
                                  <span>{notes[item.id]}</span>
                                </div>
                              )}
                            </div>

                            <button
                              className={`btn-topic-note ${hasNote ? 'has-note' : ''} ${isInlineExpanded ? 'active' : ''}`}
                              onClick={() => toggleInlineNote(item.id)}
                              title={isInlineExpanded ? 'Fechar anotação' : hasNote ? 'Editar anotação no local' : 'Adicionar anotação rápida'}
                            >
                              <FileEdit size={16} />
                            </button>
                          </div>

                          {/* INLINE NOTE EDITOR (Zero displacement, opens right here!) */}
                          {isInlineExpanded && (
                            <div className="inline-note-editor fade-in">
                              <div className="inline-note-header">
                                <div className="inline-note-title">
                                  <FileEdit size={15} className="text-brand" />
                                  <span>Anotação de Estudo</span>
                                </div>
                                <div className="inline-header-actions">
                                  <button
                                    type="button"
                                    className="btn-icon-subtle"
                                    onClick={() => openModalNote(item)}
                                    title="Expandir para tela cheia centralizada"
                                  >
                                    <Maximize2 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-close-inline"
                                    onClick={() => setExpandedNoteId(null)}
                                    title="Fechar anotação"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>

                              <textarea
                                rows={3}
                                className="inline-note-textarea"
                                placeholder="Digite seus resumos, artigos da lei ou macetes para este tópico..."
                                value={notes[item.id] || ''}
                                onChange={(e) => handleInlineNoteChange(item.id, e.target.value)}
                                autoFocus
                              />

                              <div className="inline-note-footer">
                                <span className="inline-hint">Salvo automaticamente</span>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => setExpandedNoteId(null)}
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Concluir</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FULLSCREEN PORTAL MODAL (Attached directly to document.body, ALWAYS Centered on Viewport) */}
      {activeNoteModal && typeof document !== 'undefined' && createPortal(
        <div
          className="modal-backdrop-fixed fade-in"
          onClick={() => setActiveNoteModal(null)}
        >
          <div
            className="modal-card card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <FileEdit size={22} className="text-brand" />
                <h4>Anotações de Estudo</h4>
              </div>
              <button
                className="close-btn"
                onClick={() => setActiveNoteModal(null)}
              >
                ×
              </button>
            </div>

            <p className="modal-topic-title">{activeNoteModal.titulo}</p>

            <div className="modal-body">
              <label htmlFor="note-textarea">
                Escreva seus resumos, macetes, artigos de lei ou pontos de atenção:
              </label>
              <textarea
                id="note-textarea"
                rows={6}
                placeholder="Ex: Lei 8.429/92 Art. 9º é enriquecimento ilícito (exige dolo). Lembrar do prazo prescricional de 8 anos..."
                value={tempNoteText}
                onChange={(e) => setTempNoteText(e.target.value)}
                autoFocus
              ></textarea>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setActiveNoteModal(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveModalNote}>
                <Save size={16} />
                <span>Salvar Anotação</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .tracker-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tracker-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .title-with-badge {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .tracker-sub {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .cargo-selector-tabs {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-light);
        }

        .cargo-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .cargo-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .cargo-tab-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 0.6rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }

        .cargo-tab-btn span:first-child {
          font-weight: 700;
          font-size: 0.875rem;
        }

        .cargo-sub-badge {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        .cargo-tab-btn.active {
          background-color: var(--brand-primary);
          border-color: var(--brand-primary);
          color: white;
        }

        .cargo-tab-btn.active .cargo-sub-badge {
          color: rgba(255, 255, 255, 0.85);
        }

        /* Progress Card */
        .progress-overview-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .progress-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .progress-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .progress-numbers {
          font-size: 1.35rem;
          color: var(--text-primary);
        }

        .progress-percentage-bubble {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--brand-primary);
        }

        .progress-bar-track {
          width: 100%;
          height: 12px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--brand-gradient);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .discipline-mini-bars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          padding-top: 0.5rem;
        }

        .mini-disc-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mini-disc-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .mini-disc-name {
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mini-disc-val {
          color: var(--brand-primary);
        }

        .mini-bar-track {
          width: 100%;
          height: 6px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .mini-bar-fill {
          height: 100%;
          background-color: var(--brand-primary);
          transition: width 0.3s ease;
        }

        /* Toolbar */
        .tracker-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 260px;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
        }

        .search-box input {
          width: 100%;
          padding-left: 2.5rem;
          padding-right: 2rem;
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          background: none;
          font-size: 1.25rem;
          color: var(--text-muted);
        }

        .filter-modes {
          display: flex;
          gap: 0.35rem;
          background-color: var(--bg-tertiary);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
        }

        .filter-btn {
          padding: 0.4rem 0.8rem;
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border-radius: 6px;
        }

        .filter-btn.active {
          background-color: var(--bg-secondary);
          color: var(--brand-primary);
          box-shadow: var(--shadow-sm);
        }

        .filter-divider {
          display: inline-flex;
          align-items: center;
          color: var(--text-muted);
          opacity: 0.5;
          margin: 0 0.15rem;
          user-select: none;
        }

        .filter-btn.text-btn:hover {
          color: var(--brand-primary);
          background-color: var(--bg-secondary);
        }

        /* Disciplines and Checklist */
        .disciplines-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .discipline-block {
          padding: 0;
          overflow: hidden;
        }

        .discipline-header {
          padding: 1.25rem 1.5rem;
          background-color: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          border-bottom: 1px solid var(--border-light);
        }

        .disc-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .collapse-arrow {
          background: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .disc-title-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .disc-title-row h4 {
          font-size: 1.15rem;
        }

        .disc-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .topics-list {
          display: flex;
          flex-direction: column;
        }

        .empty-topics-msg {
          padding: 1.5rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .topic-item-wrapper {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--border-light);
        }

        .topic-item-wrapper:last-child {
          border-bottom: none;
        }

        .topic-row {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.5rem;
          transition: background-color var(--transition-fast);
        }

        .topic-row:hover {
          background-color: var(--bg-tertiary);
        }

        .topic-row.completed {
          background-color: rgba(16, 185, 129, 0.04);
        }

        .topic-checkbox {
          cursor: pointer;
          padding-top: 0.15rem;
        }

        .check-icon.checked {
          color: var(--success);
        }

        .check-icon.unchecked {
          color: var(--text-muted);
        }

        .topic-info {
          flex: 1;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .parent-tag {
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--brand-primary);
          text-transform: uppercase;
        }

        .topic-title {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .topic-row.completed .topic-title {
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .topic-desc {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .topic-note-preview {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.775rem;
          color: var(--brand-accent);
          background-color: var(--info-bg);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          margin-top: 0.35rem;
          width: fit-content;
          cursor: pointer;
        }

        .btn-topic-note {
          background: none;
          color: var(--text-muted);
          padding: 0.45rem;
          border-radius: var(--radius-sm);
        }

        .btn-topic-note:hover {
          color: var(--brand-primary);
          background-color: var(--bg-tertiary);
        }

        .btn-topic-note.has-note {
          color: var(--brand-primary);
        }

        .btn-topic-note.active {
          color: white;
          background-color: var(--brand-primary);
        }

        /* INLINE NOTE EDITOR (Zero displacement, opens right under topic!) */
        .inline-note-editor {
          margin: 0 1.5rem 1rem 3.5rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-left: 3px solid var(--brand-primary);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .inline-note-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .inline-note-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .inline-header-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .btn-icon-subtle {
          background: none;
          color: var(--text-muted);
          padding: 0.2rem;
          border-radius: 4px;
        }

        .btn-icon-subtle:hover {
          color: var(--brand-primary);
        }

        .btn-close-inline {
          background: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-close-inline:hover {
          color: var(--text-primary);
        }

        .inline-note-textarea {
          width: 100%;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          resize: vertical;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }

        .inline-note-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .inline-hint {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        /* FULLSCREEN PORTAL MODAL (Attached to document.body, ALWAYS Viewport-Centered) */
        .modal-backdrop-fixed {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 999999 !important;
          background-color: rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(5px) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 1rem !important;
          margin: 0 !important;
        }

        .modal-card {
          width: 100%;
          max-width: 580px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: var(--shadow-lg);
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .close-btn {
          background: none;
          font-size: 1.5rem;
          color: var(--text-muted);
        }

        .modal-topic-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-left: 3px solid var(--brand-primary);
          padding-left: 0.75rem;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .modal-body label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .modal-body textarea {
          resize: vertical;
          min-height: 140px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        @media (max-width: 768px) {
          .inline-note-editor {
            margin-left: 1rem;
            margin-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
