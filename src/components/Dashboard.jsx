import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadFinancePlan, saveFinancePlan } from '../services/db';
import {
  Calendar,
  Clock,
  DollarSign,
  Fuel,
  Hotel,
  Utensils,
  CreditCard,
  ExternalLink,
  Car,
  Bike,
  Save,
  CheckCircle2,
  Sparkles,
  MapPin,
  TrendingUp,
  AlertCircle,
  DoorOpen,
  DoorClosed,
  PenTool,
  ShieldAlert,
  Plus,
  Minus
} from 'lucide-react';

export function Dashboard({ onNavigateToTracker, onNavigateToDocs }) {
  const { user } = useAuth();

  // Target exam date: 06/12/2026 08:00
  const examDate = new Date('2026-12-06T08:00:00');

  // Real-time countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  });

  useEffect(() => {
    function calculateCountdown() {
      const now = new Date();
      const diff = examDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: Math.floor(diff / 1000)
      });
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Financial Calculator State
  const defaultFee = user?.login === 'lucas' ? 100 : 100;
  const [finance, setFinance] = useState({
    registrationFee: defaultFee,
    vehicleType: 'fox', // 'fox' | 'mt03' | 'custom'
    roundTripDistanceKm: 560, // Natal <-> Mossoró
    fuelPricePerLiter: 6.29,
    vehicleConsumptionKmPerL: 11.5, // 11.5 km/l for Fox, 22 km/l for MT-03
    fuelCostManual: 0,
    useManualFuel: false,
    nights: 1,
    costPerNight: 180,
    daysEating: 2,
    foodPerDay: 75,
    extraEmergency: 80,
    notes: 'Orçamento previsto para a viagem de prova em Mossoró/RN'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load user's saved finance plan
  useEffect(() => {
    if (user?.login) {
      loadFinancePlan(user.login).then((saved) => {
        if (saved) {
          setFinance(saved);
        } else {
          setFinance(prev => ({
            ...prev,
            registrationFee: user.login === 'ana' ? 100 : 100
          }));
        }
      });
    }
  }, [user]);

  // Handle vehicle preset change
  const handleVehicleChange = (type) => {
    if (type === 'fox') {
      setFinance(prev => ({
        ...prev,
        vehicleType: 'fox',
        vehicleConsumptionKmPerL: 11.5,
        useManualFuel: false
      }));
    } else if (type === 'mt03') {
      setFinance(prev => ({
        ...prev,
        vehicleType: 'mt03',
        vehicleConsumptionKmPerL: 22.0,
        useManualFuel: false
      }));
    } else {
      setFinance(prev => ({
        ...prev,
        vehicleType: 'custom',
        useManualFuel: true
      }));
    }
  };

  // Helper stepper function
  const stepValue = (field, delta, min = 0) => {
    setFinance(prev => {
      const current = Number(prev[field]) || 0;
      const next = Math.max(min, Number((current + delta).toFixed(2)));
      return { ...prev, [field]: next };
    });
  };

  // Fuel calculation
  const calculatedFuelCost = finance.useManualFuel
    ? Number(finance.fuelCostManual) || 0
    : Number(
        (
          (Number(finance.roundTripDistanceKm || 0) /
            (Number(finance.vehicleConsumptionKmPerL) || 1)) *
          Number(finance.fuelPricePerLiter || 0)
        ).toFixed(2)
      );

  const fuelLiters = !finance.useManualFuel && finance.vehicleConsumptionKmPerL > 0
    ? (Number(finance.roundTripDistanceKm || 0) / Number(finance.vehicleConsumptionKmPerL)).toFixed(1)
    : 0;

  // Lodging calculation
  const lodgingTotal = Number(finance.nights || 0) * Number(finance.costPerNight || 0);

  // Food calculation
  const foodTotal = Number(finance.daysEating || 0) * Number(finance.foodPerDay || 0);

  // Grand Total
  const grandTotal =
    Number(finance.registrationFee || 0) +
    calculatedFuelCost +
    lodgingTotal +
    foodTotal +
    Number(finance.extraEmergency || 0);

  const handleSaveFinance = () => {
    if (user?.login) {
      saveFinancePlan(user.login, finance);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="dashboard-view fade-in">
      {/* Hero Welcome Header */}
      <section className="dashboard-hero card">
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-primary">Concurso Câmara de Mossoró/RN</span>
            <span className="badge badge-success">Banca COMPERVE</span>
            <span className="badge badge-info">
              {user?.login === 'lucas' ? 'Perfil: Lucas Silva (TI)' : 'Perfil: Ana Dias (Administrativo)'}
            </span>
          </div>
          <h2>
            Bem-vindo(a), <span className="highlight-name">{user?.name}</span>!
          </h2>
          <p className="hero-description">
            Acompanhe a contagem regressiva para o dia da prova, os horários oficiais de abertura e fechamento
            dos portões, planeje seus custos de viagem e monitore seu progresso no edital oficial.
          </p>

          <div className="hero-action-buttons">
            <button className="btn btn-primary" onClick={onNavigateToTracker}>
              <span>Acessar Checklist de Estudos</span>
            </button>
            <button className="btn btn-secondary" onClick={onNavigateToDocs}>
              <span>Ver Editais em PDF</span>
            </button>
            <a
              href="https://www.comperve.ufrn.br/conteudo/concursos/mossoro_202601/informacoes.php"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <span>Site Oficial COMPERVE</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="hero-official-card">
          <div className="official-card-header">
            <MapPin size={18} className="text-brand" />
            <strong>Cidade da Prova: Mossoró / RN</strong>
          </div>
          <div className="official-stat-grid">
            <div className="official-stat-item">
              <span className="stat-label">Data da Prova</span>
              <strong className="stat-val text-brand">06/12/2026</strong>
            </div>
            <div className="official-stat-item">
              <span className="stat-label">Duração</span>
              <strong className="stat-val">4 Horas</strong>
            </div>
            <div className="official-stat-item">
              <span className="stat-label">Total de Questões</span>
              <strong className="stat-val">60 Questões</strong>
            </div>
            <div className="official-stat-item">
              <span className="stat-label">Remuneração Base</span>
              <strong className="stat-val text-success">
                {user?.login === 'lucas' ? 'R$ 4.921 a R$ 6.624' : 'R$ 4.921,08'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Official Gate Times & Exam Shifts (Item 11.4 a 11.10 do Edital) */}
      <section className="card gate-times-section">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <Clock size={22} />
            </div>
            <div>
              <h3 className="card-title">Horários Oficiais de Prova & Fechamento dos Portões</h3>
              <p className="card-subtitle">
                Regras oficiais do Edital nº 001/2026 (Itens 11.4, 11.8, 11.9 e 11.10)
              </p>
            </div>
          </div>
          <span className="badge badge-warning">Mossoró/RN • Horário Local</span>
        </div>

        <div className="gate-shifts-grid">
          {/* Turno Matutino (Manhã) */}
          <div className={`shift-card ${user?.login === 'ana' ? 'highlight-user-shift' : ''}`}>
            <div className="shift-card-header">
              <div className="shift-title-group">
                <span className="badge badge-info">Turno Matutino (Manhã)</span>
                <h4>Nível Médio & Técnico</h4>
              </div>
              <span className="shift-cargos-tag">
                Agente Administrativo (101) & Técnico em Informática (102)
              </span>
            </div>

            <div className="shift-times-row">
              <div className="time-box open">
                <div className="time-icon">
                  <DoorOpen size={20} />
                </div>
                <div className="time-info">
                  <span className="time-label">Abertura dos Portões</span>
                  <strong className="time-val">07h20</strong>
                  <span className="time-sub">Acesso das 7h20 às 7h59</span>
                </div>
              </div>

              <div className="time-arrow">➜</div>

              <div className="time-box close">
                <div className="time-icon">
                  <DoorClosed size={20} />
                </div>
                <div className="time-info">
                  <span className="time-label">Fechamento Rigoroso</span>
                  <strong className="time-val text-danger">08h00</strong>
                  <span className="time-sub">Portões trancados pontualmente</span>
                </div>
              </div>

              <div className="time-arrow">➜</div>

              <div className="time-box exam">
                <div className="time-icon">
                  <Clock size={20} />
                </div>
                <div className="time-info">
                  <span className="time-label">Realização da Prova</span>
                  <strong className="time-val text-brand">08h00 às 12h00</strong>
                  <span className="time-sub">Duração máxima: 4 horas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Turno Vespertino (Tarde) */}
          <div className={`shift-card ${user?.login === 'lucas' ? 'highlight-user-shift' : ''}`}>
            <div className="shift-card-header">
              <div className="shift-title-group">
                <span className="badge badge-primary">Turno Vespertino (Tarde)</span>
                <h4>Nível Superior</h4>
              </div>
              <span className="shift-cargos-tag">
                Analista de Tecnologia da Informação (205)
              </span>
            </div>

            <div className="shift-times-row">
              <div className="time-box open">
                <div className="time-icon">
                  <DoorOpen size={20} />
                </div>
                <div className="time-info">
                  <span className="time-label">Abertura dos Portões</span>
                  <strong className="time-val">13h20</strong>
                  <span className="time-sub">Acesso das 13h20 às 13h59</span>
                </div>
              </div>

              <div className="time-arrow">➜</div>

              <div className="time-box close">
                <div className="time-icon">
                  <DoorClosed size={20} />
                </div>
                <div className="time-info">
                  <span className="time-label">Fechamento Rigoroso</span>
                  <strong className="time-val text-danger">14h00</strong>
                  <span className="time-sub">Portões trancados pontualmente</span>
                </div>
              </div>

              <div className="time-arrow">➜</div>

              <div className="time-box exam">
                <div className="time-icon">
                  <Clock size={20} />
                </div>
                <div className="time-info">
                  <span className="time-label">Realização da Prova</span>
                  <strong className="time-val text-brand">14h00 às 18h00</strong>
                  <span className="time-sub">Duração máxima: 4 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gate-rules-banner">
          <div className="rule-item">
            <ShieldAlert size={18} className="text-warning" />
            <span>
              <strong>Item 11.9 / 11.10:</strong> Quem chegar após às <strong>7h59</strong> (manhã) ou após às <strong>13h59</strong> (tarde) não terá acesso e estará <strong>eliminado</strong>. Chegue com no mínimo <strong>30 minutos de antecedência</strong>!
            </span>
          </div>
          <div className="rule-item">
            <PenTool size={18} className="text-brand" />
            <span>
              <strong>Item 11.14:</strong> Obrigatório uso de caneta esferográfica de <strong>tinta preta</strong>, fabricada em <strong>material transparente</strong>.
            </span>
          </div>
        </div>
      </section>

      {/* Row 1: Countdown Timer & Deadlines Timeline */}
      <div className="dashboard-grid-2">
        {/* Real-time Countdown Timer Card */}
        <div className="card countdown-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="card-title">Contagem Regressiva para a Prova</h3>
                <p className="card-subtitle">Aplicação em Mossoró/RN • 06 de Dezembro de 2026</p>
              </div>
            </div>
            <span className="badge badge-warning">06/12/2026</span>
          </div>

          <div className="timer-display">
            <div className="timer-block">
              <div className="timer-number">{timeLeft.days}</div>
              <span className="timer-label">Dias</span>
            </div>
            <div className="timer-separator">:</div>
            <div className="timer-block">
              <div className="timer-number">{String(timeLeft.hours).padStart(2, '0')}</div>
              <span className="timer-label">Horas</span>
            </div>
            <div className="timer-separator">:</div>
            <div className="timer-block">
              <div className="timer-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <span className="timer-label">Minutos</span>
            </div>
            <div className="timer-separator">:</div>
            <div className="timer-block highlight">
              <div className="timer-number">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <span className="timer-label">Segundos</span>
            </div>
          </div>

          <div className="countdown-footer-msg">
            <Sparkles size={16} />
            <span>
              Mantenha a consistência! Cada bloco de estudo concluído te aproxima da posse.
            </span>
          </div>
        </div>

        {/* Timeline of Deadlines */}
        <div className="card deadlines-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="card-title">Prazos & Cronograma Oficial</h3>
                <p className="card-subtitle">Retificado em 22 de outubro de 2026</p>
              </div>
            </div>
          </div>

          <div className="timeline-list">
            <div className="timeline-item active">
              <div className="timeline-bullet active"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>Período de Inscrições</strong>
                  <span className="badge badge-success">Abertas</span>
                </div>
                <p className="timeline-date">13/10/2026 a 12/11/2026</p>
                <span className="timeline-note">Exclusivamente no sítio oficial da COMPERVE</span>
              </div>
            </div>

            <div className="timeline-item active">
              <div className="timeline-bullet active"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>Pagamento da Taxa de Inscrição</strong>
                  <span className="badge badge-info">1ª Retificação</span>
                </div>
                <p className="timeline-date">27/10/2026 a 13/11/2026</p>
                <span className="timeline-note">R$ 100 (Médio/Técnico) ou R$ 150 (Superior)</span>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-bullet"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>Divulgação dos Locais de Prova</strong>
                  <span className="badge badge-warning">Previsto</span>
                </div>
                <p className="timeline-date">Data provável: 01/12/2026</p>
                <span className="timeline-note">Cartão de Inscrição no site da COMPERVE</span>
              </div>
            </div>

            <div className="timeline-item important">
              <div className="timeline-bullet target"></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <strong>Aplicação das Provas Objetivas</strong>
                  <span className="badge badge-primary">Grande Dia</span>
                </div>
                <p className="timeline-date">06/12/2026 (Domingo)</p>
                <span className="timeline-note">Mossoró/RN • Duração de 4 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Comprehensive Reactive Travel Financial Calculator */}
      <section className="card finance-calculator-section">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <h3 className="card-title">Calculadora Financeira de Viagem para Mossoró</h3>
              <p className="card-subtitle">
                Simule e gerencie com precisão todos os custos de inscrição, transporte, hospedagem e alimentação
              </p>
            </div>
          </div>

          <div className="finance-header-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSaveFinance}
              title="Salvar custos para o usuário atual"
            >
              {savedSuccess ? <CheckCircle2 size={16} color="var(--success)" /> : <Save size={16} />}
              <span>{savedSuccess ? 'Orçamento Salvo!' : 'Salvar Orçamento'}</span>
            </button>
          </div>
        </div>

        <div className="calculator-layout">
          {/* Inputs Column */}
          <div className="calculator-inputs">
            {/* 1. Taxa de Inscrição */}
            <div className="calc-group">
              <label className="calc-label">
                <CreditCard size={16} />
                <span>Taxa de Inscrição no Concurso</span>
              </label>
              <div className="fee-preset-buttons">
                <button
                  type="button"
                  className={`preset-pill ${finance.registrationFee === 100 ? 'active' : ''}`}
                  onClick={() => setFinance(p => ({ ...p, registrationFee: 100 }))}
                >
                  R$ 100 (Médio/Técnico)
                </button>
                <button
                  type="button"
                  className={`preset-pill ${finance.registrationFee === 150 ? 'active' : ''}`}
                  onClick={() => setFinance(p => ({ ...p, registrationFee: 150 }))}
                >
                  R$ 150 (Superior)
                </button>
                <button
                  type="button"
                  className={`preset-pill ${finance.registrationFee === 0 ? 'active' : ''}`}
                  onClick={() => setFinance(p => ({ ...p, registrationFee: 0 }))}
                >
                  R$ 0 (Isento)
                </button>
              </div>
              <div className="custom-stepper-input">
                <span className="currency-prefix">R$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={finance.registrationFee}
                  onChange={(e) => setFinance(p => ({ ...p, registrationFee: Number(e.target.value) }))}
                />
                <div className="stepper-controls">
                  <button type="button" onClick={() => stepValue('registrationFee', 10)}>
                    <Plus size={12} />
                  </button>
                  <button type="button" onClick={() => stepValue('registrationFee', -10)}>
                    <Minus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Combustível e Transporte */}
            <div className="calc-group">
              <div className="calc-header-row">
                <label className="calc-label">
                  <Fuel size={16} />
                  <span>Transporte & Combustível até Mossoró</span>
                </label>
                <div className="vehicle-pills">
                  <button
                    type="button"
                    className={`vehicle-btn ${finance.vehicleType === 'fox' ? 'active' : ''}`}
                    onClick={() => handleVehicleChange('fox')}
                    title="Volkswagen Fox (~11.5 km/l)"
                  >
                    <Car size={14} />
                    <span>Carro Fox</span>
                  </button>
                  <button
                    type="button"
                    className={`vehicle-btn ${finance.vehicleType === 'mt03' ? 'active' : ''}`}
                    onClick={() => handleVehicleChange('mt03')}
                    title="Yamaha MT-03 (~22.0 km/l)"
                  >
                    <Bike size={14} />
                    <span>Moto MT-03</span>
                  </button>
                  <button
                    type="button"
                    className={`vehicle-btn ${finance.vehicleType === 'custom' ? 'active' : ''}`}
                    onClick={() => handleVehicleChange('custom')}
                    title="Inserir valor manual ou outro meio"
                  >
                    <span>Manual</span>
                  </button>
                </div>
              </div>

              {!finance.useManualFuel ? (
                <div className="vehicle-calc-grid">
                  <div className="mini-input-group">
                    <span className="mini-label">Distância Ida + Volta (km)</span>
                    <div className="custom-stepper-input">
                      <input
                        type="number"
                        value={finance.roundTripDistanceKm}
                        onChange={(e) => setFinance(p => ({ ...p, roundTripDistanceKm: Number(e.target.value) }))}
                      />
                      <div className="stepper-controls">
                        <button type="button" onClick={() => stepValue('roundTripDistanceKm', 20)}>
                          <Plus size={12} />
                        </button>
                        <button type="button" onClick={() => stepValue('roundTripDistanceKm', -20)}>
                          <Minus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="quick-distances">
                      <span onClick={() => setFinance(p => ({ ...p, roundTripDistanceKm: 560 }))}>
                        Natal: 560km
                      </span>
                      <span onClick={() => setFinance(p => ({ ...p, roundTripDistanceKm: 480 }))}>
                        Fortaleza: 480km
                      </span>
                    </div>
                  </div>

                  <div className="mini-input-group">
                    <span className="mini-label">Consumo do Veículo (km/L)</span>
                    <div className="custom-stepper-input">
                      <input
                        type="number"
                        step="0.5"
                        value={finance.vehicleConsumptionKmPerL}
                        onChange={(e) => setFinance(p => ({ ...p, vehicleConsumptionKmPerL: Number(e.target.value) }))}
                      />
                      <div className="stepper-controls">
                        <button type="button" onClick={() => stepValue('vehicleConsumptionKmPerL', 0.5)}>
                          <Plus size={12} />
                        </button>
                        <button type="button" onClick={() => stepValue('vehicleConsumptionKmPerL', -0.5, 1)}>
                          <Minus size={12} />
                        </button>
                      </div>
                    </div>
                    <span className="mini-hint">
                      {finance.vehicleType === 'fox' ? 'Fox: ~11 a 13 km/L' : 'MT-03: ~20 a 24 km/L'}
                    </span>
                  </div>

                  <div className="mini-input-group">
                    <span className="mini-label">Preço da Gasolina (R$/L)</span>
                    <div className="custom-stepper-input">
                      <input
                        type="number"
                        step="0.05"
                        value={finance.fuelPricePerLiter}
                        onChange={(e) => setFinance(p => ({ ...p, fuelPricePerLiter: Number(e.target.value) }))}
                      />
                      <div className="stepper-controls">
                        <button type="button" onClick={() => stepValue('fuelPricePerLiter', 0.1)}>
                          <Plus size={12} />
                        </button>
                        <button type="button" onClick={() => stepValue('fuelPricePerLiter', -0.1, 1)}>
                          <Minus size={12} />
                        </button>
                      </div>
                    </div>
                    <span className="mini-hint">~{fuelLiters} Litros necessários</span>
                  </div>
                </div>
              ) : (
                <div className="custom-stepper-input">
                  <span className="currency-prefix">R$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Valor total estimado do combustível ou passagem"
                    value={finance.fuelCostManual}
                    onChange={(e) => setFinance(p => ({ ...p, fuelCostManual: Number(e.target.value) }))}
                  />
                </div>
              )}
            </div>

            {/* 3. Hospedagem */}
            <div className="calc-group">
              <label className="calc-label">
                <Hotel size={16} />
                <span>Hospedagem em Mossoró (Diárias)</span>
              </label>
              <div className="dual-inputs-grid">
                <div className="mini-input-group">
                  <span className="mini-label">Número de Diárias / Noites</span>
                  <div className="custom-stepper-input">
                    <input
                      type="number"
                      min="0"
                      value={finance.nights}
                      onChange={(e) => setFinance(p => ({ ...p, nights: Number(e.target.value) }))}
                    />
                    <div className="stepper-controls">
                      <button type="button" onClick={() => stepValue('nights', 1)}>
                        <Plus size={12} />
                      </button>
                      <button type="button" onClick={() => stepValue('nights', -1)}>
                        <Minus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mini-input-group">
                  <span className="mini-label">Valor por Diária (R$)</span>
                  <div className="custom-stepper-input">
                    <span className="currency-prefix">R$</span>
                    <input
                      type="number"
                      min="0"
                      value={finance.costPerNight}
                      onChange={(e) => setFinance(p => ({ ...p, costPerNight: Number(e.target.value) }))}
                    />
                    <div className="stepper-controls">
                      <button type="button" onClick={() => stepValue('costPerNight', 10)}>
                        <Plus size={12} />
                      </button>
                      <button type="button" onClick={() => stepValue('costPerNight', -10)}>
                        <Minus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Alimentação */}
            <div className="calc-group">
              <label className="calc-label">
                <Utensils size={16} />
                <span>Alimentação Durante a Viagem</span>
              </label>
              <div className="dual-inputs-grid">
                <div className="mini-input-group">
                  <span className="mini-label">Dias de Permanência</span>
                  <div className="custom-stepper-input">
                    <input
                      type="number"
                      min="1"
                      value={finance.daysEating}
                      onChange={(e) => setFinance(p => ({ ...p, daysEating: Number(e.target.value) }))}
                    />
                    <div className="stepper-controls">
                      <button type="button" onClick={() => stepValue('daysEating', 1, 1)}>
                        <Plus size={12} />
                      </button>
                      <button type="button" onClick={() => stepValue('daysEating', -1, 1)}>
                        <Minus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mini-input-group">
                  <span className="mini-label">Gasto Médio por Dia (R$)</span>
                  <div className="custom-stepper-input">
                    <span className="currency-prefix">R$</span>
                    <input
                      type="number"
                      min="0"
                      value={finance.foodPerDay}
                      onChange={(e) => setFinance(p => ({ ...p, foodPerDay: Number(e.target.value) }))}
                    />
                    <div className="stepper-controls">
                      <button type="button" onClick={() => stepValue('foodPerDay', 10)}>
                        <Plus size={12} />
                      </button>
                      <button type="button" onClick={() => stepValue('foodPerDay', -10)}>
                        <Minus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Extras / Reserva de Emergência */}
            <div className="calc-group">
              <label className="calc-label">
                <TrendingUp size={16} />
                <span>Reserva de Emergência / Pedágio / Diversos</span>
              </label>
              <div className="custom-stepper-input">
                <span className="currency-prefix">R$</span>
                <input
                  type="number"
                  min="0"
                  value={finance.extraEmergency}
                  onChange={(e) => setFinance(p => ({ ...p, extraEmergency: Number(e.target.value) }))}
                />
                <div className="stepper-controls">
                  <button type="button" onClick={() => stepValue('extraEmergency', 20)}>
                    <Plus size={12} />
                  </button>
                  <button type="button" onClick={() => stepValue('extraEmergency', -20)}>
                    <Minus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Result & Summary Column */}
          <div className="calculator-summary-card">
            <div className="summary-header">
              <span>Custo Total Estimado</span>
              <h4>Investimento da Viagem</h4>
            </div>

            <div className="summary-big-total">
              <span className="currency">R$</span>
              <span className="amount">
                {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="cost-breakdown-list">
              <div className="cost-item">
                <span className="cost-name">
                  <CreditCard size={15} /> Inscrição Oficial:
                </span>
                <strong className="cost-val">R$ {Number(finance.registrationFee).toFixed(2)}</strong>
              </div>

              <div className="cost-item">
                <span className="cost-name">
                  <Fuel size={15} />
                  Gasolina ({finance.vehicleType === 'fox' ? 'Fox' : finance.vehicleType === 'mt03' ? 'MT-03' : 'Transporte'}):
                </span>
                <strong className="cost-val">R$ {calculatedFuelCost.toFixed(2)}</strong>
              </div>

              <div className="cost-item">
                <span className="cost-name">
                  <Hotel size={15} /> Hospedagem ({finance.nights} noite{finance.nights > 1 ? 's' : ''}):
                </span>
                <strong className="cost-val">R$ {lodgingTotal.toFixed(2)}</strong>
              </div>

              <div className="cost-item">
                <span className="cost-name">
                  <Utensils size={15} /> Alimentação ({finance.daysEating} dia{finance.daysEating > 1 ? 's' : ''}):
                </span>
                <strong className="cost-val">R$ {foodTotal.toFixed(2)}</strong>
              </div>

              <div className="cost-item">
                <span className="cost-name">
                  <TrendingUp size={15} /> Reserva / Emergências:
                </span>
                <strong className="cost-val">R$ {Number(finance.extraEmergency).toFixed(2)}</strong>
              </div>
            </div>

            <div className="summary-comparison-pill">
              <AlertCircle size={15} />
              <span>
                Custo de {((grandTotal / 4921.08) * 100).toFixed(1)}% do 1º salário do cargo (R$ 4.921,08)
              </span>
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={handleSaveFinance}
            >
              <Save size={18} />
              <span>{savedSuccess ? 'Orçamento Gravado!' : 'Salvar no Meu Perfil'}</span>
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .dashboard-hero {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          border-left: 5px solid var(--brand-primary);
        }

        .hero-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .hero-content h2 {
          font-size: 1.85rem;
          margin-bottom: 0.5rem;
        }

        .highlight-name {
          color: var(--brand-primary);
        }

        .hero-description {
          color: var(--text-secondary);
          font-size: 0.95rem;
          max-width: 650px;
          margin-bottom: 1.5rem;
        }

        .hero-action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .hero-official-card {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
        }

        .official-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.95rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
        }

        .text-brand {
          color: var(--brand-primary);
        }

        .text-success {
          color: var(--success);
        }

        .text-danger {
          color: var(--danger);
        }

        .text-warning {
          color: var(--warning);
        }

        .official-stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-top: 0.75rem;
        }

        .official-stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.725rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-val {
          font-size: 1.05rem;
          font-weight: 700;
        }

        /* Gate Times Section */
        .gate-times-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
        }

        .gate-shifts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .shift-card {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all var(--transition-fast);
        }

        .shift-card.highlight-user-shift {
          border-color: var(--brand-primary);
          box-shadow: var(--shadow-glow);
        }

        .shift-card-header {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.75rem;
        }

        .shift-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .shift-title-group h4 {
          font-size: 1.15rem;
        }

        .shift-cargos-tag {
          font-size: 0.775rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .shift-times-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .time-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex: 1;
          min-width: 140px;
        }

        .time-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .time-box.open .time-icon {
          color: var(--success);
          background-color: var(--success-bg);
        }

        .time-box.close .time-icon {
          color: var(--danger);
          background-color: var(--danger-bg);
        }

        .time-box.exam .time-icon {
          color: var(--brand-primary);
          background-color: var(--info-bg);
        }

        .time-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .time-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .time-val {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .time-sub {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .time-arrow {
          color: var(--text-muted);
          font-size: 1rem;
        }

        .gate-rules-banner {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-light);
          padding: 0.85rem 1.1rem;
          border-radius: var(--radius-sm);
          font-size: 0.825rem;
        }

        .rule-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        /* Custom Stepper Input */
        .custom-stepper-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .custom-stepper-input input {
          width: 100%;
          padding-right: 2.5rem;
        }

        .currency-prefix {
          position: absolute;
          left: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .custom-stepper-input:has(.currency-prefix) input {
          padding-left: 2.4rem;
        }

        .stepper-controls {
          position: absolute;
          right: 0.35rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stepper-controls button {
          width: 22px;
          height: 14px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .stepper-controls button:hover {
          background-color: var(--brand-primary);
          color: white;
          border-color: var(--brand-primary);
        }

        /* Countdown & Deadlines Row */
        .dashboard-grid-2 {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 1.75rem;
        }

        .countdown-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .timer-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 2rem 1rem;
        }

        .timer-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          min-width: 82px;
          box-shadow: var(--shadow-sm);
        }

        .timer-block.highlight {
          border-color: var(--brand-primary);
          background-color: rgba(37, 99, 235, 0.08);
        }

        .timer-number {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--brand-primary);
          line-height: 1;
        }

        .timer-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-top: 0.35rem;
        }

        .timer-separator {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-muted);
          margin-top: -1rem;
        }

        .countdown-footer-msg {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          background-color: var(--bg-tertiary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
        }

        /* Timeline */
        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          padding-left: 0.5rem;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }

        .timeline-bullet {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: var(--border-subtle);
          margin-top: 0.25rem;
          flex-shrink: 0;
          border: 2px solid var(--bg-secondary);
        }

        .timeline-bullet.active {
          background-color: var(--success);
          box-shadow: 0 0 0 3px var(--success-bg);
        }

        .timeline-bullet.target {
          background-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex: 1;
        }

        .timeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.95rem;
        }

        .timeline-date {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brand-primary);
        }

        .timeline-note {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Financial Calculator Layout */
        .calculator-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
          margin-top: 1rem;
        }

        .calculator-inputs {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .calc-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .calc-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .calc-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .fee-preset-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .preset-pill {
          padding: 0.35rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
        }

        .preset-pill.active {
          background-color: var(--brand-primary);
          color: white;
          border-color: var(--brand-primary);
        }

        .vehicle-pills {
          display: flex;
          gap: 0.4rem;
        }

        .vehicle-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
        }

        .vehicle-btn.active {
          background-color: var(--brand-primary);
          color: white;
          border-color: var(--brand-primary);
        }

        .vehicle-calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem;
        }

        .dual-inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .mini-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mini-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .mini-hint {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .quick-distances {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.2rem;
        }

        .quick-distances span {
          font-size: 0.68rem;
          color: var(--brand-primary);
          cursor: pointer;
          text-decoration: underline;
        }

        /* Summary Card */
        .calculator-summary-card {
          background-color: var(--bg-elevated);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: var(--shadow-md);
          height: fit-content;
        }

        .summary-header span {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
        }

        .summary-header h4 {
          font-size: 1.25rem;
        }

        .summary-big-total {
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
          padding: 0.5rem 0;
          border-bottom: 2px dashed var(--border-light);
        }

        .summary-big-total .currency {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--success);
        }

        .summary-big-total .amount {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .cost-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .cost-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .cost-name {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
        }

        .cost-val {
          color: var(--text-primary);
        }

        .summary-comparison-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          background-color: var(--info-bg);
          color: var(--info);
          font-size: 0.775rem;
          font-weight: 500;
        }

        @media (max-width: 950px) {
          .dashboard-hero {
            grid-template-columns: 1fr;
          }
          .gate-shifts-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-grid-2 {
            grid-template-columns: 1fr;
          }
          .calculator-layout {
            grid-template-columns: 1fr;
          }
          .vehicle-calc-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
