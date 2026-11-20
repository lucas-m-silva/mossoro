import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import simuladosData from '../data/simulados_idecan.json';
import {
  X,
  Shuffle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Sparkles,
  AlertTriangle,
  ListChecks,
  Eye,
  Filter
} from 'lucide-react';

const DISCIPLINE_ORDER = [
  'lingua_portuguesa_superior',
  'informatica_geral',
  'legislacao',
  'especifica_analista_ti'
];

const DISCIPLINE_SHORT = {
  lingua_portuguesa_superior: 'Português',
  informatica_geral: 'Informática',
  legislacao: 'Legislação/Ética',
  especifica_analista_ti: 'Específicos TI'
};

const STORAGE_KEY = 'petrolina_simulado_state_v1';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Gera uma prova embaralhada de 40 questões misturando todas as provas do banco
 * na proporção exata do Edital nº 01/2026 (10 LP + 5 Info + 5 Leg + 20 TI).
 */
function buildShuffledExam() {
  const allQuestions = simuladosData.provas.flatMap(p => p.questoes);
  const dist = simuladosData.meta.distribuicao;

  const picked = [];
  DISCIPLINE_ORDER.forEach(discId => {
    const pool = shuffleArray(allQuestions.filter(q => q.disciplinaId === discId));
    const needed = dist[discId].questoes;
    picked.push(...pool.slice(0, needed));
  });

  const renumbered = picked.map((q, idx) => ({
    ...q,
    numero: idx + 1
  }));

  return {
    id: `embaralhada_${Date.now()}`,
    titulo: 'Prova Embaralhada (Mistura das 3 Provas IDECAN)',
    subtitulo: '40 questões sorteadas e misturadas entre todo o banco oficial (10 LP + 5 Info + 5 Leg + 20 TI)',
    isShuffled: true,
    questoes: renumbered
  };
}

export function SimuladoModal({ initialMode = 'caderno_1', onClose }) {
  const provasFixas = simuladosData.provas;
  const distMeta = simuladosData.meta.distribuicao;

  const [activeExam, setActiveExam] = useState(() => {
    if (initialMode === 'embaralhada') {
      return buildShuffledExam();
    }
    return provasFixas.find(p => p.id === initialMode) || provasFixas[0];
  });

  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.answers || {};
      }
    } catch (e) {}
    return {};
  });

  const [viewMode, setViewMode] = useState('single'); // 'single' | 'list' | 'report'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [discFilter, setDiscFilter] = useState('all');
  const [reportFilter, setReportFilter] = useState('all'); // 'all' | 'wrong' | 'correct'
  const [showTextoBase, setShowTextoBase] = useState(true);

  const examAnswers = answers[activeExam.id] || {};

  // Persist answers locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers }));
    } catch (e) {}
  }, [answers]);

  // Close with Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const questions = activeExam.questoes;

  const filteredQuestions = useMemo(() => {
    if (discFilter === 'all') return questions;
    return questions.filter(q => q.disciplinaId === discFilter);
  }, [questions, discFilter]);

  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0];

  // Metrics & Official Scoring (Item 11.1.1 & 11.3 of Edital)
  const stats = useMemo(() => {
    let answered = 0;
    let correct = 0;
    let wrong = 0;
    let points = 0;

    const byDisc = {};
    DISCIPLINE_ORDER.forEach(d => {
      byDisc[d] = {
        id: d,
        nome: distMeta[d].nome,
        peso: distMeta[d].peso,
        minimoPontos: distMeta[d].minimoPontos,
        total: 0,
        answered: 0,
        correct: 0,
        wrong: 0,
        points: 0,
        maxPoints: distMeta[d].questoes * distMeta[d].peso
      };
    });

    const correctList = [];
    const wrongList = [];

    questions.forEach(q => {
      const d = byDisc[q.disciplinaId];
      if (d) d.total += 1;
      const userAns = examAnswers[q.id];
      if (userAns) {
        answered += 1;
        if (d) d.answered += 1;
        const isRight = userAns.toUpperCase() === q.gabarito.toUpperCase();
        if (isRight) {
          correct += 1;
          points += q.peso;
          if (d) {
            d.correct += 1;
            d.points += q.peso;
          }
          correctList.push({ ...q, userAnswer: userAns });
        } else {
          wrong += 1;
          if (d) d.wrong += 1;
          wrongList.push({ ...q, userAnswer: userAns });
        }
      }
    });

    const meetsTotalMin = points >= 30.0;
    const meetsDiscMins = DISCIPLINE_ORDER.every(d => byDisc[d].points >= byDisc[d].minimoPontos);
    const approved = answered === 40 && meetsTotalMin && meetsDiscMins;

    return {
      total: questions.length,
      answered,
      correct,
      wrong,
      points,
      maxPoints: 60.0,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      byDisc,
      correctList,
      wrongList,
      meetsTotalMin,
      meetsDiscMins,
      approved
    };
  }, [questions, examAnswers, distMeta]);

  const handleSelectExam = (examObj) => {
    setActiveExam(examObj);
    setDiscFilter('all');
    setCurrentIdx(0);
    setViewMode('single');
  };

  const handleShuffleExam = () => {
    const shuffled = buildShuffledExam();
    setActiveExam(shuffled);
    setDiscFilter('all');
    setCurrentIdx(0);
    setViewMode('single');
  };

  const handleSelectOption = (questionId, letter) => {
    // Immediate check: record answer (once answered, keeps the choice locked until Refazer)
    if (examAnswers[questionId]) return;
    setAnswers(prev => ({
      ...prev,
      [activeExam.id]: {
        ...(prev[activeExam.id] || {}),
        [questionId]: letter
      }
    }));
  };

  const handleResetExam = () => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[activeExam.id];
      return next;
    });
    setCurrentIdx(0);
    setViewMode('single');
  };

  const handleFilterChange = (nextDisc) => {
    setDiscFilter(nextDisc);
    setCurrentIdx(0);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="sim-modal-backdrop fade-in" onClick={onClose}>
      <div className="sim-modal-shell" onClick={(e) => e.stopPropagation()}>
        {/* TOP HEADER */}
        <header className="sim-header">
          <div className="sim-header-left">
            <div className="sim-title-row">
              <Award size={22} className="text-brand" />
              <div>
                <h3>Testar Conhecimento — Simulado Oficial IDECAN</h3>
                <p>Analista Legislativo / Tecnologia da Informação (40 questões • 60 pontos)</p>
              </div>
            </div>
          </div>

          <div className="sim-header-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleShuffleExam}
              title="Misturar questões entre todas as provas e gerar um novo caderno de 40 questões"
            >
              <Shuffle size={15} />
              <span>Embaralhar Provas</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'report' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode(viewMode === 'report' ? 'single' : 'report')}
              title="Ver resumo de acertos, erros e pontuação"
            >
              <BarChart3 size={15} />
              <span>Resultado ({stats.answered}/40)</span>
            </button>

            {stats.answered > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleResetExam}
                title="Limpar todas as respostas desta prova e refazer"
              >
                <RotateCcw size={14} />
                <span>Refazer</span>
              </button>
            )}

            <button
              type="button"
              className="sim-close-btn"
              onClick={onClose}
              title="Fechar simulado (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* EXAM SELECTOR BAR */}
        <div className="sim-exam-bar">
          <div className="sim-exam-tabs">
            {provasFixas.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`sim-exam-tab ${activeExam.id === p.id ? 'active' : ''}`}
                onClick={() => handleSelectExam(p)}
              >
                <span>Caderno {i + 1}</span>
                <small>{p.id === 'caderno_1' ? 'MPA 2024' : p.id === 'caderno_2' ? 'IFPA 2025' : 'Misto 2025/19'}</small>
              </button>
            ))}

            {activeExam.isShuffled && (
              <button type="button" className="sim-exam-tab active shuffled">
                <Shuffle size={13} />
                <span>Prova Embaralhada</span>
              </button>
            )}
          </div>

          <div className="sim-score-pills">
            <div className="sim-pill">
              <span>Respondidas:</span>
              <strong>{stats.answered}/40</strong>
            </div>
            <div className="sim-pill success">
              <span>Acertos:</span>
              <strong>{stats.correct}</strong>
            </div>
            <div className="sim-pill danger">
              <span>Erros:</span>
              <strong>{stats.wrong}</strong>
            </div>
            <div className="sim-pill brand">
              <span>Nota:</span>
              <strong>{stats.points.toFixed(1)} / 60,0</strong>
            </div>
          </div>
        </div>

        {/* COMPLETION BANNER WHEN 40/40 ANSWERED */}
        {stats.answered === 40 && viewMode !== 'report' && (
          <div className="sim-complete-banner fade-in">
            <div className="sim-complete-text">
              <Sparkles size={18} />
              <span>
                Você completou todas as <strong>40 questões</strong>! Nota: <strong>{stats.points.toFixed(1)} / 60,0 pts</strong> ({stats.correct} acertos e {stats.wrong} erros).
              </span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setViewMode('report')}
            >
              <BarChart3 size={15} />
              <span>Ver Relatório Final (Acertos e Erros)</span>
            </button>
          </div>
        )}

        {/* MAIN BODY */}
        <div className="sim-body">
          {/* REPORT VIEW */}
          {viewMode === 'report' ? (
            <div className="sim-report-view fade-in">
              <div className="sim-report-hero card">
                <div className="sim-report-main">
                  <span className={`badge ${stats.approved ? 'badge-success' : stats.answered < 40 ? 'badge-info' : 'badge-warning'}`}>
                    {stats.answered < 40
                      ? `Parcial (${stats.answered}/40 respondidas)`
                      : stats.approved
                      ? 'APROVADO nos critérios do Edital (Item 11.3)'
                      : 'Abaixo do mínimo exigido no Edital (Item 11.3)'}
                  </span>
                  <h2>{activeExam.titulo}</h2>
                  <p className="sim-report-sub">
                    Critério oficial: mínimo de 30,0 pts (50%), mínimo de 1,0 pt em cada Conhecimento Geral e 2,0 pts em Específicos.
                  </p>
                </div>

                <div className="sim-report-score-box">
                  <span className="score-big">{stats.points.toFixed(1)}</span>
                  <span className="score-den">de 60,0 pts</span>
                  <span className="score-acc">{stats.correct} acertos • {stats.wrong} erros ({stats.accuracy}%)</span>
                </div>
              </div>

              {/* Per Discipline Breakdown */}
              <div className="sim-disc-grid">
                {DISCIPLINE_ORDER.map(dId => {
                  const d = stats.byDisc[dId];
                  const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                  const metMin = d.points >= d.minimoPontos;
                  return (
                    <div key={dId} className="sim-disc-card card">
                      <div className="sim-disc-top">
                        <strong>{d.nome}</strong>
                        <span className={`badge ${metMin ? 'badge-success' : 'badge-secondary'}`}>
                          Peso {d.peso.toFixed(1)}
                        </span>
                      </div>
                      <div className="sim-disc-nums">
                        <span className="pts">{d.points.toFixed(1)} / {d.maxPoints.toFixed(1)} pts</span>
                        <span className="acc">{d.correct}✓ / {d.wrong}× ({pct}%)</span>
                      </div>
                      <div className="sim-disc-bar">
                        <div className="sim-disc-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <small className="sim-disc-min">
                        Mínimo edital: {d.minimoPontos.toFixed(1)} pt {d.answered > 0 && (metMin ? '• Atingido ✓' : '• Não atingido')}
                      </small>
                    </div>
                  );
                })}
              </div>

              {/* Actions inside Report */}
              <div className="sim-report-toolbar">
                <div className="sim-report-filters">
                  <button
                    type="button"
                    className={`filter-btn ${reportFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setReportFilter('all')}
                  >
                    Todas ({stats.answered})
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${reportFilter === 'wrong' ? 'active' : ''}`}
                    onClick={() => setReportFilter('wrong')}
                  >
                    ❌ Questões que Errei ({stats.wrong})
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${reportFilter === 'correct' ? 'active' : ''}`}
                    onClick={() => setReportFilter('correct')}
                  >
                    ✅ Questões que Acertei ({stats.correct})
                  </button>
                </div>

                <div className="sim-report-cta">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewMode('single')}>
                    Voltar às Questões
                  </button>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleShuffleExam}>
                    <Shuffle size={15} />
                    <span>Embaralhar e Fazer Nova Prova</span>
                  </button>
                </div>
              </div>

              {/* Detailed List of Correct & Wrong Questions */}
              <div className="sim-report-list">
                {(() => {
                  const list = questions
                    .filter(q => {
                      const ans = examAnswers[q.id];
                      if (!ans) return reportFilter === 'all';
                      const isRight = ans.toUpperCase() === q.gabarito.toUpperCase();
                      if (reportFilter === 'wrong') return !isRight;
                      if (reportFilter === 'correct') return isRight;
                      return true;
                    });

                  if (list.length === 0) {
                    return (
                      <div className="sim-empty-report card">
                        Nenhuma questão encontrada neste filtro.
                      </div>
                    );
                  }

                  return list.map(q => {
                    const userAns = examAnswers[q.id];
                    const isRight = userAns && userAns.toUpperCase() === q.gabarito.toUpperCase();
                    return (
                      <div key={q.id} className={`sim-review-card card ${userAns ? (isRight ? 'right' : 'wrong') : 'pending'}`}>
                        <div className="sim-review-head">
                          <div className="sim-review-badges">
                            <span className="q-num-pill">Questão {String(q.numero).padStart(2, '0')}</span>
                            <span className="badge badge-info">{DISCIPLINE_SHORT[q.disciplinaId]}</span>
                            <span className="sim-origin-tag">{q.origem}</span>
                          </div>
                          <span className={`sim-status-pill ${userAns ? (isRight ? 'right' : 'wrong') : 'pending'}`}>
                            {!userAns
                              ? 'Não respondida'
                              : isRight
                              ? `✓ Acertou (${userAns})`
                              : `× Errou (Marcou ${userAns} • Correta: ${q.gabarito})`}
                          </span>
                        </div>

                        <p className="sim-review-enunciado">{q.enunciado}</p>

                        <div className="sim-review-ans-summary">
                          {userAns && !isRight && (
                            <div className="ans-line wrong">
                              <strong>Sua resposta ({userAns}):</strong> {q.alternativas[userAns]}
                            </div>
                          )}
                          <div className="ans-line right">
                            <strong>Gabarito Oficial ({q.gabarito}):</strong> {q.alternativas[q.gabarito]}
                          </div>
                        </div>

                        <div className="sim-review-just">
                          <strong>💡 Justificativa:</strong> {q.explicacao}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            /* EXAM TAKING VIEW */
            <div className="sim-take-view">
              {/* Toolbar: Discipline filter + View mode toggle */}
              <div className="sim-take-toolbar">
                <div className="sim-disc-pills">
                  <button
                    type="button"
                    className={`filter-btn ${discFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('all')}
                  >
                    Todas (40)
                  </button>
                  {DISCIPLINE_ORDER.map(dId => (
                    <button
                      key={dId}
                      type="button"
                      className={`filter-btn ${discFilter === dId ? 'active' : ''}`}
                      onClick={() => handleFilterChange(dId)}
                    >
                      {DISCIPLINE_SHORT[dId]} ({distMeta[dId].questoes})
                    </button>
                  ))}
                </div>

                <div className="mode-toggle-group">
                  <button
                    type="button"
                    className={`btn-mode-toggle ${viewMode === 'single' ? 'active' : ''}`}
                    onClick={() => setViewMode('single')}
                  >
                    Uma por Vez
                  </button>
                  <button
                    type="button"
                    className={`btn-mode-toggle ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    Lista ({filteredQuestions.length})
                  </button>
                </div>
              </div>

              {/* 1..40 Question Grid Navigator */}
              <div className="sim-nav-grid">
                {filteredQuestions.map((q, idx) => {
                  const ans = examAnswers[q.id];
                  const isRight = ans && ans.toUpperCase() === q.gabarito.toUpperCase();
                  const isCurrent = viewMode === 'single' && currentIdx === idx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`sim-nav-pill ${isCurrent ? 'current' : ''} ${ans ? (isRight ? 'correct' : 'incorrect') : ''}`}
                      onClick={() => {
                        setCurrentIdx(idx);
                        if (viewMode === 'list') {
                          const el = document.getElementById(`sim-q-${q.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      title={`Questão ${q.numero} (${DISCIPLINE_SHORT[q.disciplinaId]})`}
                    >
                      {String(q.numero).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>

              {/* SINGLE QUESTION VIEW */}
              {viewMode === 'single' && currentQ && (
                <div className="sim-single-wrap fade-in">
                  <SimuladoQuestionCard
                    question={currentQ}
                    userAnswer={examAnswers[currentQ.id]}
                    onSelectOption={handleSelectOption}
                    showTextoBase={showTextoBase}
                    onToggleTextoBase={() => setShowTextoBase(v => !v)}
                  />

                  <div className="sim-single-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={currentIdx === 0}
                      onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                    >
                      <ChevronLeft size={16} />
                      <span>Anterior</span>
                    </button>

                    <span className="sim-counter">
                      Questão {currentIdx + 1} de {filteredQuestions.length}
                    </span>

                    {currentIdx < filteredQuestions.length - 1 ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setCurrentIdx(i => Math.min(filteredQuestions.length - 1, i + 1))}
                      >
                        <span>Próxima</span>
                        <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setViewMode('report')}
                      >
                        <BarChart3 size={16} />
                        <span>Finalizar & Ver Resultado</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* FULL LIST VIEW */}
              {viewMode === 'list' && (
                <div className="sim-list-wrap">
                  {filteredQuestions.map(q => (
                    <div key={q.id} id={`sim-q-${q.id}`}>
                      <SimuladoQuestionCard
                        question={q}
                        userAnswer={examAnswers[q.id]}
                        onSelectOption={handleSelectOption}
                        showTextoBase={showTextoBase}
                        onToggleTextoBase={() => setShowTextoBase(v => !v)}
                      />
                    </div>
                  ))}
                  <div className="sim-list-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setViewMode('report')}
                    >
                      <BarChart3 size={18} />
                      <span>Ver Resultado Final (Acertos, Erros e Nota)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sim-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .sim-modal-shell {
          width: 100%;
          max-width: 1120px;
          height: 92vh;
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sim-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap;
        }

        .sim-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sim-title-row h3 {
          font-size: 1.1rem;
          margin: 0;
          color: var(--text-primary);
        }

        .sim-title-row p {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }

        .sim-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .sim-close-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-tertiary);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .sim-close-btn:hover {
          color: var(--danger);
          border-color: var(--danger);
        }

        .sim-exam-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.7rem 1.25rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap;
        }

        .sim-exam-tabs {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .sim-exam-tab {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .sim-exam-tab small {
          font-weight: 500;
          opacity: 0.75;
          font-size: 0.72rem;
        }

        .sim-exam-tab.active {
          background: var(--brand-primary);
          border-color: var(--brand-primary);
          color: #fff;
        }

        .sim-exam-tab.shuffled {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border-color: transparent;
        }

        .sim-score-pills {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .sim-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-full);
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .sim-pill.success strong { color: #10b981; }
        .sim-pill.danger strong { color: #ef4444; }
        .sim-pill.brand strong { color: var(--brand-primary); }

        .sim-complete-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.7rem 1.25rem;
          background: rgba(16, 185, 129, 0.12);
          border-bottom: 1px solid rgba(16, 185, 129, 0.35);
          flex-wrap: wrap;
        }

        .sim-complete-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .sim-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sim-take-view {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sim-take-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .sim-disc-pills {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .sim-nav-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
        }

        .sim-nav-pill {
          width: 34px;
          height: 30px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sim-nav-pill:hover {
          border-color: var(--brand-primary);
        }

        .sim-nav-pill.current {
          outline: 2px solid var(--brand-primary);
          outline-offset: 1px;
        }

        .sim-nav-pill.correct {
          background: rgba(16, 185, 129, 0.18);
          border-color: #10b981;
          color: #10b981;
        }

        .sim-nav-pill.incorrect {
          background: rgba(239, 68, 68, 0.18);
          border-color: #ef4444;
          color: #ef4444;
        }

        .sim-q-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .sim-q-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
        }

        .sim-q-meta {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .q-num-pill {
          background: var(--brand-primary);
          color: #fff;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .sim-origin-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          padding: 0.18rem 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .sim-assunto-line {
          font-size: 0.8rem;
          color: var(--brand-primary);
          font-weight: 600;
        }

        .sim-texto-base-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-left: 3px solid var(--brand-primary);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .sim-texto-base-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.85rem;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.84rem;
          cursor: pointer;
        }

        .sim-texto-base-content {
          padding: 0 0.85rem 0.85rem;
          max-height: 230px;
          overflow-y: auto;
          font-size: 0.87rem;
          line-height: 1.6;
          color: var(--text-secondary);
          white-space: pre-line;
        }

        .sim-q-enunciado {
          font-size: 0.96rem;
          line-height: 1.65;
          color: var(--text-primary);
          white-space: pre-line;
        }

        .sim-alts-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .sim-alt-btn {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          width: 100%;
          text-align: left;
          padding: 0.8rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-size: 0.9rem;
          line-height: 1.5;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .sim-alt-btn:hover:not(.locked) {
          border-color: var(--brand-primary);
          background: var(--bg-secondary);
        }

        .sim-alt-btn.locked {
          cursor: default;
        }

        .sim-alt-letter {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.82rem;
          flex-shrink: 0;
        }

        .sim-alt-btn.correct-choice {
          background: rgba(16, 185, 129, 0.14);
          border-color: #10b981;
        }
        .sim-alt-btn.correct-choice .sim-alt-letter {
          background: #10b981;
          border-color: #10b981;
          color: #fff;
        }

        .sim-alt-btn.incorrect-choice {
          background: rgba(239, 68, 68, 0.14);
          border-color: #ef4444;
        }
        .sim-alt-btn.incorrect-choice .sim-alt-letter {
          background: #ef4444;
          border-color: #ef4444;
          color: #fff;
        }

        .sim-alt-btn.reveal-correct {
          border-color: #10b981;
          border-style: dashed;
          background: rgba(16, 185, 129, 0.08);
        }
        .sim-alt-btn.reveal-correct .sim-alt-letter {
          border-color: #10b981;
          color: #10b981;
        }

        .sim-feedback-box {
          padding: 0.95rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          line-height: 1.55;
        }
        .sim-feedback-box.correct {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
        }
        .sim-feedback-box.incorrect {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
        }
        .sim-feedback-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }
        .sim-feedback-box.correct .sim-feedback-title { color: #10b981; }
        .sim-feedback-box.incorrect .sim-feedback-title { color: #ef4444; }
        .sim-feedback-just {
          color: var(--text-primary);
          padding-top: 0.4rem;
          border-top: 1px solid var(--border-light);
        }

        .sim-single-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.75rem;
        }
        .sim-counter {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sim-list-wrap {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sim-list-end {
          display: flex;
          justify-content: center;
          padding: 1rem 0;
        }

        /* REPORT STYLES */
        .sim-report-view {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .sim-report-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .sim-report-main h2 {
          font-size: 1.3rem;
          margin: 0.45rem 0 0.25rem;
        }
        .sim-report-sub {
          font-size: 0.83rem;
          color: var(--text-muted);
        }
        .sim-report-score-box {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          background: var(--bg-tertiary);
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
        }
        .score-big {
          font-size: 2rem;
          font-weight: 800;
          color: var(--brand-primary);
          line-height: 1;
        }
        .score-den {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .score-acc {
          font-size: 0.82rem;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .sim-disc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.85rem;
        }
        .sim-disc-card {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          padding: 1rem;
        }
        .sim-disc-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.86rem;
        }
        .sim-disc-nums {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .sim-disc-nums .pts { color: var(--brand-primary); }
        .sim-disc-bar {
          height: 7px;
          border-radius: var(--radius-full);
          background: var(--bg-tertiary);
          overflow: hidden;
        }
        .sim-disc-fill {
          height: 100%;
          background: var(--brand-gradient);
        }
        .sim-disc-min {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .sim-report-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .sim-report-filters, .sim-report-cta {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .sim-report-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .sim-review-card {
          padding: 1rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          border-left: 4px solid var(--border-light);
        }
        .sim-review-card.right { border-left-color: #10b981; }
        .sim-review-card.wrong { border-left-color: #ef4444; }
        .sim-review-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .sim-review-badges {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .sim-status-pill {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
        }
        .sim-status-pill.right { background: rgba(16, 185, 129, 0.14); color: #10b981; }
        .sim-status-pill.wrong { background: rgba(239, 68, 68, 0.14); color: #ef4444; }
        .sim-status-pill.pending { background: var(--bg-tertiary); color: var(--text-muted); }

        .sim-review-enunciado {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-primary);
        }
        .sim-review-ans-summary {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.84rem;
        }
        .ans-line.wrong { color: #ef4444; }
        .ans-line.right { color: #10b981; }
        .sim-review-just {
          font-size: 0.84rem;
          background: var(--bg-tertiary);
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>,
    document.body
  );
}

function SimuladoQuestionCard({
  question,
  userAnswer,
  onSelectOption,
  showTextoBase,
  onToggleTextoBase
}) {
  const isAnswered = !!userAnswer;
  const isCorrect = isAnswered && userAnswer.toUpperCase() === question.gabarito.toUpperCase();
  const options = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="sim-q-card card">
      <div className="sim-q-top">
        <div className="sim-q-meta">
          <span className="q-num-pill">Questão {String(question.numero).padStart(2, '0')}</span>
          <span className="badge badge-info">{DISCIPLINE_SHORT[question.disciplinaId]}</span>
          <span className="badge badge-secondary">Peso {question.peso.toFixed(1)}</span>
          <span className="sim-origin-tag">{question.origem}</span>
        </div>

        <span className={`sim-status-pill ${isAnswered ? (isCorrect ? 'right' : 'wrong') : 'pending'}`}>
          {isAnswered ? (isCorrect ? '✓ Resposta Correta' : '× Resposta Incorreta') : 'Aguardando resposta'}
        </span>
      </div>

      <div className="sim-assunto-line">{question.assunto}</div>

      {question.textoBase && (
        <div className="sim-texto-base-box">
          <button type="button" className="sim-texto-base-toggle" onClick={onToggleTextoBase}>
            <span>📖 Texto de apoio da prova ({showTextoBase ? 'clique para recolher' : 'clique para ler'})</span>
            <span>{showTextoBase ? '▲' : '▼'}</span>
          </button>
          {showTextoBase && (
            <div className="sim-texto-base-content">{question.textoBase}</div>
          )}
        </div>
      )}

      <div className="sim-q-enunciado">{question.enunciado}</div>

      <div className="sim-alts-list">
        {options.map(letter => {
          const text = question.alternativas?.[letter];
          if (!text) return null;

          const isSelected = userAnswer?.toUpperCase() === letter;
          const isGabarito = question.gabarito?.toUpperCase() === letter;

          let cls = 'sim-alt-btn';
          if (isAnswered) {
            cls += ' locked';
            if (isSelected && isCorrect) cls += ' correct-choice';
            else if (isSelected && !isCorrect) cls += ' incorrect-choice';
            else if (!isSelected && isGabarito && !isCorrect) cls += ' reveal-correct';
          }

          return (
            <button
              key={letter}
              type="button"
              className={cls}
              onClick={() => onSelectOption(question.id, letter)}
            >
              <span className="sim-alt-letter">{letter}</span>
              <span className="sim-alt-text">{text}</span>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className={`sim-feedback-box ${isCorrect ? 'correct' : 'incorrect'} fade-in`}>
          <div className="sim-feedback-title">
            {isCorrect ? (
              <>
                <CheckCircle2 size={17} />
                <span>Correto! Você acertou. Gabarito Oficial: Letra {question.gabarito}</span>
              </>
            ) : (
              <>
                <XCircle size={17} />
                <span>Incorreto! Você marcou {userAnswer}, mas o Gabarito Oficial é a Letra {question.gabarito}</span>
              </>
            )}
          </div>
          {question.explicacao && (
            <div className="sim-feedback-just">
              <strong>💡 Justificativa:</strong> {question.explicacao}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
