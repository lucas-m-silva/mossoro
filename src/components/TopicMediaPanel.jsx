import React, { useState } from 'react';
import {
  Play,
  PlayCircle,
  Video,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  AlertCircle,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

/**
 * Helper to generate YouTube embed URL for videos or playlists
 */
export function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('playlist?list=')) {
    const listId = url.split('playlist?list=')[1]?.split('&')[0];
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}`;
  }
  if (url.includes('watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  }
  return url;
}

export function TopicMediaPanel({
  topic,
  activeTab,
  onChangeTab,
  onClose,
  quizAnswers = {},
  onAnswer,
  onResetTopicQuiz
}) {
  const [activeEmbedUrl, setActiveEmbedUrl] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizDisplayMode, setQuizDisplayMode] = useState('single'); // 'single' | 'list'

  const videos = topic?.videos || [];
  const questoes = topic?.questoes || [];

  // Quiz statistics for this topic
  const totalQuestions = questoes.length;
  let answeredCount = 0;
  let correctCount = 0;

  questoes.forEach(q => {
    const userAns = quizAnswers[q.id];
    if (userAns) {
      answeredCount++;
      if (userAns.toUpperCase() === q.gabarito.toUpperCase()) {
        correctCount++;
      }
    }
  });

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const currentQ = questoes[currentQuestionIndex] || questoes[0];

  return (
    <div className="topic-media-panel fade-in">
      {/* Panel Header & Tabs */}
      <div className="media-panel-header">
        <div className="media-panel-tabs">
          {videos.length > 0 && (
            <button
              className={`media-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => {
                onChangeTab('videos');
                setActiveEmbedUrl(null);
              }}
            >
              <Video size={16} />
              <span>Videoaulas & Playlists</span>
              <span className="tab-count-badge">{videos.length}</span>
            </button>
          )}

          {questoes.length > 0 && (
            <button
              className={`media-tab-btn ${activeTab === 'questoes' ? 'active' : ''}`}
              onClick={() => onChangeTab('questoes')}
            >
              <HelpCircle size={16} />
              <span>Questões de Treino</span>
              <span className="tab-count-badge">{questoes.length}</span>
              {answeredCount > 0 && (
                <span className={`tab-score-badge ${accuracy >= 70 ? 'high' : 'low'}`}>
                  {correctCount}/{answeredCount}
                </span>
              )}
            </button>
          )}
        </div>

        <button
          className="btn-close-panel"
          onClick={onClose}
          title="Fechar painel"
        >
          <X size={18} />
        </button>
      </div>

      {/* ================= VIDEOS TAB ================= */}
      {activeTab === 'videos' && (
        <div className="media-tab-content videos-content">
          {/* Active Embedded Player */}
          {activeEmbedUrl && (
            <div className="embedded-player-container fade-in">
              <div className="player-top-bar">
                <span className="player-title">Reprodução Integrada</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveEmbedUrl(null)}
                >
                  <X size={14} />
                  <span>Fechar Player</span>
                </button>
              </div>
              <div className="video-responsive-wrapper">
                <iframe
                  src={activeEmbedUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="videos-list-grid">
            {videos.map((vid, idx) => {
              const embedUrl = getYoutubeEmbedUrl(vid.url);
              const isPlaying = activeEmbedUrl === embedUrl;
              const isPlaylist = vid.tipo === 'playlist';

              return (
                <div key={idx} className={`video-card ${isPlaying ? 'playing' : ''}`}>
                  <div className="video-card-header">
                    <div className="video-type-badges">
                      <span className={`badge ${isPlaylist ? 'badge-primary' : 'badge-info'}`}>
                        {isPlaylist ? 'Playlist no YouTube' : 'Vídeoaula'}
                      </span>
                      {vid.canal && (
                        <span className="badge badge-secondary">{vid.canal}</span>
                      )}
                    </div>
                  </div>

                  <h5 className="video-card-title">{vid.titulo}</h5>
                  {vid.descricao && (
                    <p className="video-card-desc">{vid.descricao}</p>
                  )}

                  <div className="video-card-actions">
                    <button
                      className={`btn btn-sm ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => setActiveEmbedUrl(isPlaying ? null : embedUrl)}
                      title="Assistir aqui no painel sem sair da página"
                    >
                      <PlayCircle size={15} />
                      <span>{isPlaying ? 'Fechar Player' : 'Assistir Aqui'}</span>
                    </button>

                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      title="Abrir no YouTube em nova aba"
                    >
                      <ExternalLink size={14} />
                      <span>Abrir no YouTube</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="videos-tip-footer">
            <BookOpen size={16} className="tip-icon" />
            <span>
              <strong>Dica de Estudo:</strong> Assista aos vídeos e playlists recomendados para consolidar a teoria deste assunto, e em seguida teste sua fixação respondendo às 15 questões inéditas elaboradas para este tópico!
            </span>
          </div>
        </div>
      )}

      {/* ================= QUESTÕES TAB ================= */}
      {activeTab === 'questoes' && (
        <div className="media-tab-content questoes-content">
          {/* Header with Stats & Display Mode */}
          <div className="quiz-top-stats">
            <div className="quiz-stats-group">
              <div className="stat-pill">
                <span className="stat-label">Respondidas:</span>
                <span className="stat-value">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Acertos:</span>
                <span className={`stat-value ${correctCount > 0 ? 'text-success' : ''}`}>
                  {correctCount} ({accuracy}%)
                </span>
              </div>
            </div>

            <div className="quiz-controls-group">
              <div className="mode-toggle-group">
                <button
                  className={`btn-mode-toggle ${quizDisplayMode === 'single' ? 'active' : ''}`}
                  onClick={() => setQuizDisplayMode('single')}
                  title="Responder uma questão por vez com foco"
                >
                  Passo a Passo
                </button>
                <button
                  className={`btn-mode-toggle ${quizDisplayMode === 'list' ? 'active' : ''}`}
                  onClick={() => setQuizDisplayMode('list')}
                  title="Ver todas as 15 questões em lista contínua"
                >
                  Ver Todas (15)
                </button>
              </div>

              {answeredCount > 0 && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onResetTopicQuiz(topic.id)}
                  title="Limpar respostas deste tópico e refazer"
                >
                  <RotateCcw size={13} />
                  <span>Refazer</span>
                </button>
              )}
            </div>
          </div>

          {/* Question Navigator Pills (1 to 15) */}
          <div className="question-nav-pills">
            {questoes.map((q, idx) => {
              const userAns = quizAnswers[q.id];
              const isAnswered = !!userAns;
              const isCorrect = isAnswered && userAns.toUpperCase() === q.gabarito.toUpperCase();
              const isCurrent = quizDisplayMode === 'single' && currentQuestionIndex === idx;

              return (
                <button
                  key={q.id}
                  className={`q-nav-pill ${isCurrent ? 'current' : ''} ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : 'unanswered'}`}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    if (quizDisplayMode === 'list') {
                      const el = document.getElementById(`question-card-${q.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  title={`Questão ${q.numero}: ${isAnswered ? (isCorrect ? 'Acertou' : 'Errou') : 'Pendente'}`}
                >
                  <span>{q.numero}</span>
                  {isAnswered && (
                    <span className="q-nav-status-icon">
                      {isCorrect ? '✓' : '×'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SINGLE QUESTION FOCUS MODE */}
          {quizDisplayMode === 'single' && currentQ && (
            <div className="single-question-view fade-in">
              <QuestionCard
                question={currentQ}
                userAnswer={quizAnswers[currentQ.id]}
                onSelectAnswer={(opt) => onAnswer(currentQ.id, opt)}
              />

              {/* Navigation buttons */}
              <div className="single-q-nav-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                >
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </button>

                <span className="q-footer-counter">
                  Questão {currentQuestionIndex + 1} de {totalQuestions}
                </span>

                <button
                  className="btn btn-primary btn-sm"
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                >
                  <span>Próxima</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ALL QUESTIONS LIST MODE */}
          {quizDisplayMode === 'list' && (
            <div className="all-questions-list">
              {questoes.map((q) => (
                <div key={q.id} id={`question-card-${q.id}`} className="q-card-wrapper">
                  <QuestionCard
                    question={q}
                    userAnswer={quizAnswers[q.id]}
                    onSelectAnswer={(opt) => onAnswer(q.id, opt)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel Styles */}
      <style>{`
        .topic-media-panel {
          margin-top: 0.75rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .media-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1rem;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .media-panel-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .media-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .media-tab-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .media-tab-btn.active {
          background-color: var(--brand-primary);
          color: var(--text-inverse);
          border-color: var(--brand-primary);
        }

        .tab-count-badge {
          font-size: 0.75rem;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-full);
          background-color: rgba(255, 255, 255, 0.2);
          line-height: 1;
        }

        .media-tab-btn:not(.active) .tab-count-badge {
          background-color: var(--border-light);
          color: var(--text-muted);
        }

        .tab-score-badge {
          font-size: 0.75rem;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        .tab-score-badge.high {
          background-color: #10b981;
          color: #ffffff;
        }

        .tab-score-badge.low {
          background-color: #f59e0b;
          color: #ffffff;
        }

        .btn-close-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-close-panel:hover {
          color: var(--danger);
          border-color: var(--danger);
          background-color: var(--danger-bg);
        }

        .media-tab-content {
          padding: 1rem;
        }

        /* Video Styles */
        .embedded-player-container {
          margin-bottom: 1.25rem;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #000;
          border: 1px solid var(--border-subtle);
        }

        .player-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background-color: #1e293b;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .video-responsive-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
          height: 0;
        }

        .video-responsive-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .videos-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .video-card {
          display: flex;
          flex-direction: column;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1rem;
          transition: var(--transition-normal);
        }

        .video-card:hover {
          border-color: var(--brand-primary);
          box-shadow: var(--shadow-md);
        }

        .video-card.playing {
          border-color: #ef4444;
          background-color: var(--danger-bg);
        }

        .video-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .video-type-badges {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .video-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
          line-height: 1.4;
        }

        .video-card-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          flex: 1;
          line-height: 1.5;
        }

        .video-card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: auto;
          flex-wrap: wrap;
        }

        .videos-tip-footer {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          margin-top: 1.25rem;
          background-color: var(--info-bg);
          border: 1px solid rgba(2, 132, 199, 0.2);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .tip-icon {
          color: var(--info);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        /* Quiz Styles */
        .quiz-top-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 0.85rem;
        }

        .quiz-stats-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.82rem;
          background-color: var(--bg-secondary);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .stat-label {
          color: var(--text-muted);
        }

        .stat-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .text-success {
          color: #10b981;
        }

        .quiz-controls-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mode-toggle-group {
          display: flex;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .btn-mode-toggle {
          padding: 0.3rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 500;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-mode-toggle.active {
          background-color: var(--brand-primary);
          color: var(--text-inverse);
        }

        /* Question Navigation Pills */
        .question-nav-pills {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          overflow-x: auto;
          padding: 0.35rem 0.2rem 0.85rem 0.2rem;
          margin-bottom: 0.85rem;
          scrollbar-width: thin;
        }

        .q-nav-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
          min-width: 32px;
          height: 32px;
          padding: 0 0.4rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          border: 1px solid var(--border-subtle);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .q-nav-pill:hover {
          border-color: var(--brand-primary);
          color: var(--brand-primary);
        }

        .q-nav-pill.current {
          box-shadow: 0 0 0 2px var(--brand-primary);
          border-color: var(--brand-primary);
        }

        .q-nav-pill.correct {
          background-color: #10b981;
          color: #ffffff;
          border-color: #10b981;
        }

        .q-nav-pill.incorrect {
          background-color: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
        }

        .q-nav-status-icon {
          font-size: 0.75rem;
          font-weight: bold;
        }

        /* Question Card */
        .q-card-wrapper {
          margin-bottom: 1.25rem;
        }

        .question-card-inner {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
        }

        .q-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }

        .q-number-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--brand-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .q-status-tag {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .q-status-tag.correct {
          background-color: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .q-status-tag.incorrect {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .q-status-tag.unanswered {
          background-color: var(--bg-tertiary);
          color: var(--text-muted);
          border: 1px solid var(--border-light);
        }

        .q-enunciado {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          white-space: pre-line;
        }

        .q-alternativas-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .q-alt-btn {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          width: 100%;
          text-align: left;
          padding: 0.85rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition-fast);
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .q-alt-btn:hover:not(.locked) {
          border-color: var(--brand-primary);
          background-color: var(--bg-secondary);
        }

        .q-alt-letter {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          font-weight: 700;
          font-size: 0.82rem;
          flex-shrink: 0;
          color: var(--text-secondary);
          transition: var(--transition-fast);
        }

        .q-alt-text {
          flex: 1;
        }

        /* Selected & Correct State */
        .q-alt-btn.correct-choice {
          background-color: rgba(16, 185, 129, 0.12);
          border-color: #10b981;
        }

        .q-alt-btn.correct-choice .q-alt-letter {
          background-color: #10b981;
          color: #ffffff;
          border-color: #10b981;
        }

        /* Selected & Incorrect State */
        .q-alt-btn.incorrect-choice {
          background-color: rgba(239, 68, 68, 0.12);
          border-color: #ef4444;
        }

        .q-alt-btn.incorrect-choice .q-alt-letter {
          background-color: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
        }

        /* Highlight Correct Answer When User Picked Wrong */
        .q-alt-btn.reveal-correct {
          border-color: #10b981;
          border-style: dashed;
          background-color: rgba(16, 185, 129, 0.06);
        }

        .q-alt-btn.reveal-correct .q-alt-letter {
          border-color: #10b981;
          color: #10b981;
        }

        /* Feedback / Gabarito Box */
        .q-feedback-box {
          margin-top: 1.25rem;
          padding: 0.85rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          line-height: 1.5;
        }

        .q-feedback-box.correct {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          color: #065f46;
        }

        .q-feedback-box.incorrect {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #991b1b;
        }

        .q-feedback-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }

        .q-explicacao {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Single Question Footer Navigation */
        .single-q-nav-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }

        .q-footer-counter {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

/**
 * Question Card Component
 */
function QuestionCard({ question, userAnswer, onSelectAnswer }) {
  const isAnswered = !!userAnswer;
  const isCorrect = isAnswered && userAnswer.toUpperCase() === question.gabarito.toUpperCase();

  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="question-card-inner">
      <div className="q-header-row">
        <span className="q-number-badge">
          Questão {question.numero}
        </span>
        <span className={`q-status-tag ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : 'unanswered'}`}>
          {isAnswered ? (isCorrect ? '✓ Resposta Correta' : '× Resposta Incorreta') : 'Pendente'}
        </span>
      </div>

      <div className="q-enunciado">
        {question.enunciado}
      </div>

      <div className="q-alternativas-list">
        {options.map(letter => {
          const text = question.alternativas[letter];
          if (!text) return null;

          const isSelected = userAnswer?.toUpperCase() === letter;
          const isGabarito = question.gabarito?.toUpperCase() === letter;

          let btnClass = 'q-alt-btn';
          if (isAnswered) {
            btnClass += ' locked';
            if (isSelected && isCorrect) {
              btnClass += ' correct-choice';
            } else if (isSelected && !isCorrect) {
              btnClass += ' incorrect-choice';
            } else if (!isSelected && isGabarito && !isCorrect) {
              btnClass += ' reveal-correct';
            }
          }

          return (
            <button
              key={letter}
              className={btnClass}
              onClick={() => onSelectAnswer(letter)}
              type="button"
            >
              <span className="q-alt-letter">{letter}</span>
              <span className="q-alt-text">{text}</span>
            </button>
          );
        })}
      </div>

      {/* Immediate Feedback */}
      {isAnswered && (
        <div className={`q-feedback-box ${isCorrect ? 'correct' : 'incorrect'} fade-in`}>
          <div className="q-feedback-title">
            {isCorrect ? (
              <>
                <CheckCircle2 size={16} />
                <span>Excelente! Você acertou. Gabarito Oficial: Letra {question.gabarito}</span>
              </>
            ) : (
              <>
                <XCircle size={16} />
                <span>Ops! Gabarito Oficial: Letra {question.gabarito}</span>
              </>
            )}
          </div>

          {question.explicacao && (
            <div className="q-explicacao">
              <strong>💡 Justificativa / Comentário:</strong> {question.explicacao}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
